const crypto = require('crypto');
const Order = require('../models/Order');

// PayFast URLs
const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
const PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process';

// Get PayFast URL based on environment
const getPayFastUrl = () => {
    return process.env.PAYFAST_SANDBOX === 'true' ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;
};

// Generate MD5 signature for PayFast
// Generate MD5 signature for PayFast
const generateSignature = (data, passphrase = null) => {
    // Create parameter string - ORDER MATTERS for PayFast!
    // Must be in alphabetical order
    let pfOutput = '';

    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();

    for (let key of sortedKeys) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            // PayFast requires URL encoded values
            // Spaces must be replaced with '+' instead of '%20'
            const value = String(data[key]).trim();
            const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');

            pfOutput += `${key}=${encodedValue}&`;
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Add passphrase if provided and not empty
    if (passphrase && passphrase.trim() !== '') {
        // Passphrase must also be URL encoded
        const encodedPassphrase = encodeURIComponent(passphrase.trim()).replace(/%20/g, '+');
        getString += `&passphrase=${encodedPassphrase}`;
    }

    // Debug log
    console.log('==========================================');
    console.log('SIGNATURE DEBUG START');
    console.log('Passphrase used:', passphrase ? `"${passphrase}"` : 'NONE');
    console.log('Raw Data Keys:', sortedKeys);

    // Log each encoded pair to see exactly what's being added
    let tempDebugString = '';
    for (let key of sortedKeys) {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            const value = String(data[key]).trim();
            const encodedValue = encodeURIComponent(value).replace(/%20/g, '+');
            console.log(`Key: ${key}, Raw: "${value}", Encoded: "${encodedValue}"`);
            tempDebugString += `${key}=${encodedValue}&`;
        }
    }

    console.log('Pre-slice String:', tempDebugString);
    console.log('Final Signature String:', getString);
    console.log('==========================================');

    // Generate MD5 hash (must be lowercase)
    const hash = crypto.createHash('md5').update(getString).digest('hex');
    console.log('Generated Hash:', hash);
    return hash;
};

// @desc    Initiate PayFast payment
// @route   POST /api/payfast/initiate
// @access  Public
const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Find the order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Order is already paid' });
        }

        // Get URLs from environment
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        // Format phone number for PayFast (10 digits, SA format)
        let cellNumber = '';
        if (order.customerDetails?.phone) {
            const digits = order.customerDetails.phone.replace(/\D/g, '');
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

        // PayFast payment data - ORDER IS CRITICAL!
        // Must follow PayFast's exact field order for signature to work
        const paymentData = {
            // Merchant details (required)
            // Merchant details
            merchant_id: process.env.PAYFAST_SANDBOX === 'true'
                ? process.env.PAYFAST_SANDBOX_MERCHANT_ID?.trim()
                : process.env.PAYFAST_MERCHANT_ID?.trim(),
            merchant_key: process.env.PAYFAST_SANDBOX === 'true'
                ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY?.trim()
                : process.env.PAYFAST_MERCHANT_KEY?.trim(),

            // URLs
            return_url: `${baseUrl}/order-confirmation?orderId=${orderId}&status=success`,
            cancel_url: `${baseUrl}/checkout?cancelled=true&orderId=${orderId}`,
            notify_url: `${backendUrl}/api/payfast/notify`,

            // Buyer details (Simplified for debugging)
            name_first: order.customerDetails?.firstName || '',
            name_last: order.customerDetails?.lastName || '',
            email_address: order.customerDetails?.email || '',

            // Transaction details
            m_payment_id: order._id.toString(),
            amount: order.total.toFixed(2),
            item_name: `Order ${order.orderNumber}`,
            // item_description: `${order.items?.length || 0} item(s) from Ayoosh Online`, // Commented out for debug

            // Custom data -- Commented out to simplify signature
            // custom_str1: order._id.toString(),
            // custom_str2: order.orderNumber || '',
        };

        // Add optional cell_number if valid
        if (cellNumber) {
            paymentData.cell_number = cellNumber;
        }

        // Remove empty values (PayFast doesn't like empty fields)
        Object.keys(paymentData).forEach(key => {
            if (paymentData[key] === '' || paymentData[key] === null || paymentData[key] === undefined) {
                delete paymentData[key];
            }
        });

        // Generate signature
        const signature = generateSignature(paymentData, process.env.PAYFAST_PASSPHRASE);
        paymentData.signature = signature;

        // Debug: Log signature details
        console.log('=== PayFast Signature Debug ===');
        console.log('Fields (alphabetically):', Object.keys(paymentData).sort());
        console.log('Passphrase:', process.env.PAYFAST_PASSPHRASE ? 'SET' : 'EMPTY');
        console.log('Generated Signature:', signature);
        console.log('===============================');

        // Update order with payment method
        order.paymentMethod = 'payfast';
        order.paymentStatus = 'pending';
        await order.save();

        console.log('PayFast payment initiated for order:', order.orderNumber);

        res.status(200).json({
            success: true,
            paymentData,
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
        console.log('ITN Data:', JSON.stringify(pfData, null, 2));
        console.log('==========================================');

        // Verify signature
        const receivedSignature = pfData.signature;
        const dataWithoutSignature = { ...pfData };
        delete dataWithoutSignature.signature;

        const expectedSignature = generateSignature(dataWithoutSignature, process.env.PAYFAST_PASSPHRASE);

        if (receivedSignature !== expectedSignature) {
            console.error('PayFast ITN: Signature mismatch');
            console.error('Received:', receivedSignature);
            console.error('Expected:', expectedSignature);
            return res.status(400).send('Signature mismatch');
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

    } catch (error) {
        console.error('PayFast ITN Error:', error);
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
