const crypto = require('crypto');
const Order = require('../models/Order');

// PayFast URLs
const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
const PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process';

// Get PayFast URL based on environment
const getPayFastUrl = () => {
    return process.env.PAYFAST_SANDBOX === 'true' ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;
};

// PayFast REQUIRED field order for signature generation
// DO NOT change this order - it must match PayFast's exact specification
// Includes both outgoing payment fields AND ITN response fields
const PAYFAST_FIELD_ORDER = [
    // Merchant details
    'merchant_id',
    'merchant_key',
    // URLs
    'return_url',
    'cancel_url',
    'notify_url',
    // Buyer details
    'name_first',
    'name_last',
    'email_address',
    'cell_number',
    // Transaction details (outgoing)
    'm_payment_id',
    'amount',
    'item_name',
    'item_description',
    // ITN-specific fields (PayFast adds these in response)
    'pf_payment_id',
    'payment_status',
    'amount_gross',
    'amount_fee',
    'amount_net',
    // Custom fields
    'custom_int1',
    'custom_int2',
    'custom_int3',
    'custom_int4',
    'custom_int5',
    'custom_str1',
    'custom_str2',
    'custom_str3',
    'custom_str4',
    'custom_str5',
    // Additional options
    'email_confirmation',
    'confirmation_address',
    'payment_method',
];

// Generate MD5 signature for OUTGOING PayFast payments
// CRITICAL: Fields MUST be in PayFast's specific order, NOT alphabetical
const generateSignature = (data, passphrase = null) => {
    let pfOutput = '';

    // Iterate through fields in PayFast's EXACT required order
    for (const key of PAYFAST_FIELD_ORDER) {
        if (data.hasOwnProperty(key) && data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            // Trim value and URL encode, replace %20 with +
            let value = String(data[key]).trim();
            value = encodeURIComponent(value).replace(/%20/g, '+');
            pfOutput += `${key}=${value}&`;
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Add passphrase if provided (also encoded, trim whitespace)
    if (passphrase && passphrase.trim() !== '') {
        const pfPass = encodeURIComponent(passphrase.trim()).replace(/%20/g, '+');
        getString += `&passphrase=${pfPass}`;
    }

    // Debug log
    console.log('==========================================');
    console.log('SIGNATURE DEBUG (Outgoing Payment)');
    console.log('Passphrase:', passphrase ? 'SET (' + passphrase.length + ' chars)' : 'NONE');
    console.log('Signature String:', getString);
    console.log('==========================================');

    // Generate MD5 hash (lowercase)
    const hash = crypto.createHash('md5').update(getString).digest('hex');
    console.log('Generated Hash:', hash);
    return hash;
};

// Generate MD5 signature for ITN verification (INCOMING from PayFast)
// Uses ALPHABETICAL order as per PayFast's ITN documentation
const generateITNSignature = (data, passphrase = null) => {
    let pfOutput = '';

    // Sort keys alphabetically (PayFast ITN uses alphabetical order)
    const sortedKeys = Object.keys(data).sort();

    for (const key of sortedKeys) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            // Trim value and URL encode, replace %20 with +
            let value = String(data[key]).trim();
            value = encodeURIComponent(value).replace(/%20/g, '+');
            pfOutput += `${key}=${value}&`;
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Add passphrase if provided (also encoded, trim whitespace)
    if (passphrase && passphrase.trim() !== '') {
        const pfPass = encodeURIComponent(passphrase.trim()).replace(/%20/g, '+');
        getString += `&passphrase=${pfPass}`;
    }

    // Debug log
    console.log('==========================================');
    console.log('ITN SIGNATURE DEBUG (Alphabetical)');
    console.log('Passphrase:', passphrase ? 'SET (' + passphrase.length + ' chars)' : 'NONE');
    console.log('Signature String:', getString);
    console.log('==========================================');

    // Generate MD5 hash (lowercase)
    const hash = crypto.createHash('md5').update(getString).digest('hex');
    console.log('Generated ITN Hash:', hash);
    return hash;
};

// @desc    Initiate PayFast payment
// @route   POST /api/payfast/initiate
// @access  Public
const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Find the order (populate user if exists for logged-in customers)
        const order = await Order.findById(orderId).populate('user', 'email firstName lastName phone');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Order is already paid' });
        }

        // ============================================================
        // STEP 1: STANDARDIZE CUSTOMER DATA (Source of Truth)
        // Fallback logic: shippingAddress -> customerDetails -> user -> placeholder
        // ============================================================

        // Get first name (priority: shippingAddress > customerDetails > user > placeholder)
        const firstName =
            order.shippingAddress?.firstName?.trim() ||
            order.customerDetails?.firstName?.trim() ||
            order.user?.firstName?.trim() ||
            'Guest';

        // Get last name (priority: shippingAddress > customerDetails > user > placeholder)
        const lastName =
            order.shippingAddress?.lastName?.trim() ||
            order.customerDetails?.lastName?.trim() ||
            order.user?.lastName?.trim() ||
            'Customer';

        // Get email (priority: customerDetails > user) - REQUIRED by PayFast
        const email =
            order.customerDetails?.email?.trim() ||
            order.user?.email?.trim();

        // Email is REQUIRED - fail if missing
        if (!email) {
            console.error('PayFast Error: No email found for order', orderId);
            return res.status(400).json({
                success: false,
                message: 'Customer email is required for PayFast payment'
            });
        }

        // Get URLs from environment
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        // Format phone number for PayFast (10 digits, SA format)
        let cellNumber = '';
        const rawPhone = order.customerDetails?.phone || order.shippingAddress?.phone || order.user?.phone;
        if (rawPhone) {
            const digits = rawPhone.replace(/\D/g, '');
            // Handle different formats: +27821234567, 27821234567, 0821234567
            if (digits.startsWith('27') && digits.length === 11) {
                cellNumber = '0' + digits.substring(2); // Convert 27821234567 to 0821234567
            } else if (digits.startsWith('0') && digits.length === 10) {
                cellNumber = digits; // Already correct format
            } else if (digits.length === 9) {
                cellNumber = '0' + digits; // Add leading 0
            }
            // Only use if it's exactly 10 digits starting with 0
            if (cellNumber.length !== 10 || !cellNumber.startsWith('0')) {
                cellNumber = ''; // Invalid format, leave empty
            }
        }

        // ============================================================
        // STEP 2: BUILD PAYMENT DATA OBJECT IN PAYFAST'S EXACT ORDER
        // CRITICAL: The field order MUST match PayFast's specification
        // ============================================================
        const paymentData = {};

        // 1. Merchant details (required)
        paymentData.merchant_id = process.env.PAYFAST_SANDBOX === 'true'
            ? process.env.PAYFAST_SANDBOX_MERCHANT_ID?.trim()
            : process.env.PAYFAST_MERCHANT_ID?.trim();
        paymentData.merchant_key = process.env.PAYFAST_SANDBOX === 'true'
            ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY?.trim()
            : process.env.PAYFAST_MERCHANT_KEY?.trim();

        // 2. URLs
        paymentData.return_url = `${baseUrl}/order-confirmation?orderId=${orderId}&status=success`;
        paymentData.cancel_url = `${baseUrl}/checkout?cancelled=true&orderId=${orderId}`;
        paymentData.notify_url = `${backendUrl}/api/payfast/notify`;

        // 3. Buyer details (IN CORRECT ORDER: name_first, name_last, email_address, cell_number)
        paymentData.name_first = firstName;
        paymentData.name_last = lastName;
        paymentData.email_address = email;
        if (cellNumber) {
            paymentData.cell_number = cellNumber;  // Only add if valid (in correct position)
        }

        // 4. Transaction details
        paymentData.m_payment_id = order._id.toString();
        paymentData.amount = order.total.toFixed(2);
        paymentData.item_name = `Order ${order.orderNumber}`;

        // SAFETY CHECK: Prevent Localhost URLs in Production/Live Mode
        // PayFast CloudFront WAF blocks requests containing 'localhost'
        if (process.env.PAYFAST_SANDBOX !== 'true') {
            if (paymentData.return_url.includes('localhost') ||
                paymentData.cancel_url.includes('localhost') ||
                paymentData.notify_url.includes('localhost')) {

                const msg = 'CONFIGURATION ERROR: PayFast Live requires a real domain name. ' +
                    'You are sending "localhost". Please set FRONTEND_URL and BACKEND_URL variables in Railway.';

                console.error(msg);
                throw new Error(msg);
            }
        }

        // ============================================================
        // STEP 2b: SANITIZE - Remove any empty/null/undefined keys
        // This ensures signature matches exactly what PayFast calculates
        // ============================================================
        Object.keys(paymentData).forEach(key => {
            const value = paymentData[key];
            if (value === '' || value === null || value === undefined) {
                delete paymentData[key];
            }
        });

        // Determine Passphrase based on mode
        const passphrase = process.env.PAYFAST_SANDBOX === 'true'
            ? process.env.PAYFAST_SANDBOX_PASSPHRASE
            : process.env.PAYFAST_PASSPHRASE;

        // CRITICAL VALIDATION
        if (!paymentData.merchant_id || !paymentData.merchant_key) {
            console.error('PayFast Config Error: Missing Merchant ID or Key', {
                mode: process.env.PAYFAST_SANDBOX === 'true' ? 'SANDBOX' : 'LIVE',
                hasId: !!paymentData.merchant_id,
                hasKey: !!paymentData.merchant_key
            });
            throw new Error('PayFast configuration error: Missing Merchant Credentials');
        }

        // ============================================================
        // STEP 3: GENERATE SIGNATURE ON CLEAN DATA
        // The signature is generated from the sanitized object only
        // ============================================================
        const signature = generateSignature(paymentData, passphrase);
        paymentData.signature = signature;

        // Debug logging (safe data only)
        console.log('=== PAYFAST REQUEST DEBUG ===');
        console.log('Mode:', process.env.PAYFAST_SANDBOX === 'true' ? 'SANDBOX' : 'LIVE');
        console.log('Merchant ID:', paymentData.merchant_id);
        console.log('Customer:', `${paymentData.name_first} ${paymentData.name_last} <${paymentData.email_address}>`);
        console.log('Amount:', paymentData.amount);
        console.log('Fields in payload:', Object.keys(paymentData).join(', '));
        console.log('=============================');

        // Update order with payment method
        order.paymentMethod = 'payfast';
        order.paymentStatus = 'pending';
        await order.save();

        console.log('PayFast payment initiated for order:', order.orderNumber);

        // ============================================================
        // STEP 4: SEND EXACT CLEANED OBJECT TO FRONTEND
        // The frontend will loop through these exact keys to build the form
        // ============================================================
        res.status(200).json({
            success: true,
            paymentData,  // Contains only keys with values + signature
            payfastUrl: getPayFastUrl(),
        });

    } catch (error) {
        console.error('PayFast Initiate Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment',
            error: error.message
        });
    }
};

// @desc    Handle PayFast ITN (Instant Transaction Notification)
// @route   POST /api/payfast/notify
// @access  Public (called by PayFast servers)
const handleITN = async (req, res) => {
    try {
        const pfData = req.body;

        console.log('==========================================');
        console.log('PayFast ITN Received:', new Date().toISOString());
        if (process.env.NODE_ENV !== 'production') {
            console.log('ITN Data:', JSON.stringify(pfData, null, 2));
        }
        console.log('==========================================');

        // Verify signature using ITN-specific function (alphabetical order)
        const receivedSignature = pfData.signature;
        const dataWithoutSignature = { ...pfData };
        delete dataWithoutSignature.signature;

        // Determine Passphrase based on mode
        const passphrase = process.env.PAYFAST_SANDBOX === 'true'
            ? (process.env.PAYFAST_SANDBOX_PASSPHRASE || process.env.PAYFAST_PASSPHRASE)
            : process.env.PAYFAST_PASSPHRASE;

        // Use ITN-specific signature function (alphabetical order)
        let expectedSignature = generateITNSignature(dataWithoutSignature, passphrase);

        if (receivedSignature !== expectedSignature) {
            // Fallback: If Sandbox, try validating WITHOUT passphrase (common misconfiguration)
            if (process.env.PAYFAST_SANDBOX === 'true') {
                console.log('PayFast ITN: Signature mismatch with passphrase. Retrying without passphrase...');
                const signatureNoPass = generateITNSignature(dataWithoutSignature, null);

                if (receivedSignature === signatureNoPass) {
                    console.log('PayFast ITN: Signature verified WITHOUT passphrase (Fallback) ✓');
                    expectedSignature = receivedSignature; // Match found
                } else {
                    console.error('PayFast ITN: Signature mismatch (Both attempts failed)');
                    console.error('Received:', receivedSignature);
                    console.error('Expected (With Pass):', expectedSignature);
                    console.error('Expected (No Pass):', signatureNoPass);

                    logITNError('Signature Mismatch (Both attempts failed)', {
                        received: receivedSignature,
                        expectedWithPass: expectedSignature,
                        expectedNoPass: signatureNoPass,
                        dataWithoutSignature,
                        passphraseUsed: passphrase
                    });

                    return res.status(400).send('Signature mismatch');
                }
            } else {
                console.error('PayFast ITN: Signature mismatch');
                console.error('Received:', receivedSignature);
                console.error('Expected:', expectedSignature);
                return res.status(400).send('Signature mismatch');
            }
        }

        console.log('PayFast ITN: Signature verified ✓');

        // Get the order
        const orderId = pfData.m_payment_id;
        const order = await Order.findById(orderId);

        if (!order) {
            console.error('PayFast ITN: Order not found:', orderId);
            return res.status(404).send('Order not found');
        }

        // Check payment amount matches
        const expectedAmount = parseFloat(order.total).toFixed(2);
        const receivedAmount = parseFloat(pfData.amount_gross).toFixed(2);

        if (expectedAmount !== receivedAmount) {
            console.error('PayFast ITN: Amount mismatch', {
                expected: expectedAmount,
                received: receivedAmount
            });
            return res.status(400).send('Amount mismatch');
        }

        console.log('PayFast ITN: Amount verified ✓');

        // Update order based on payment status
        const paymentStatus = pfData.payment_status;

        switch (paymentStatus) {
            case 'COMPLETE':
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                order.paymentId = pfData.pf_payment_id;
                order.paidAt = new Date();

                // Add to status history
                order.statusHistory.push({
                    status: 'confirmed',
                    note: `Payment completed via PayFast (ID: ${pfData.pf_payment_id})`,
                    timestamp: new Date()
                });
                break;

            case 'FAILED':
                order.paymentStatus = 'failed';
                order.statusHistory.push({
                    status: 'pending',
                    note: 'Payment failed via PayFast',
                    timestamp: new Date()
                });
                break;

            case 'PENDING':
                order.paymentStatus = 'pending';
                break;

            default:
                console.log('PayFast ITN: Unknown payment status:', paymentStatus);
        }

        await order.save();

        console.log('PayFast ITN: Order updated successfully', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            status: order.status,
        });

        // PayFast expects a 200 response
        res.status(200).send('OK');

        const fs = require('fs');
        const path = require('path');

        const logITNError = (message, data) => {
            const logPath = path.join(__dirname, '../itn-error.log');
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] ${message}\nData: ${JSON.stringify(data, null, 2)}\n\n`;
            fs.appendFileSync(logPath, logEntry);
        };

        // ... inside catch or error blocks ...
    } catch (error) {
        console.error('PayFast ITN Error:', error);
        logITNError('Server Error during ITN processing', { error: error.message, stack: error.stack });
        res.status(500).send('Server error');
    }
};

// @desc    Verify payment status
// @route   GET /api/payfast/verify/:orderId
// @access  Public
const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentStatus,
                status: order.status,
                paymentMethod: order.paymentMethod,
                total: order.total,
                paidAt: order.paidAt,
            },
        });

    } catch (error) {
        console.error('PayFast Verify Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
};

module.exports = {
    initiatePayment,
    handleITN,
    verifyPayment,
};
