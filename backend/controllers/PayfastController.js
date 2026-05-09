// PayFast Controller - Fixed & Optimized for Production
const crypto = require('crypto');
const Order = require('../models/Order');
const { processAffiliateCommission } = require('../utils/affiliateCommission');

// PayFast URLs
const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
const PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process';

// Get PayFast URL based on environment
const getPayFastUrl = () => {
    return process.env.PAYFAST_SANDBOX === 'true' ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL;
};

// PayFast REQUIRED field order for OUTGOING signature generation
// DO NOT change this order - it must match PayFast's exact specification
const PAYFAST_FIELD_ORDER = [
    'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
    'name_first', 'name_last', 'email_address', 'cell_number',
    'm_payment_id', 'amount', 'item_name', 'item_description',
    'email_confirmation', 'confirmation_address', 'payment_method'
];

/**
 * Generate MD5 signature for OUTGOING PayFast payments
 * Uses PayFast specific field order
 */
const generateSignature = (data, passphrase = null) => {
    let pfOutput = '';

    for (const key of PAYFAST_FIELD_ORDER) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
                let value = String(data[key]).trim();
                value = encodeURIComponent(value).replace(/%20/g, '+');
                pfOutput += `${key}=${value}&`;
            }
        }
    }

    let getString = pfOutput.slice(0, -1); // Remove last &

    if (passphrase && passphrase.trim() !== '') {
        getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    return crypto.createHash('md5').update(getString).digest('hex');
};

/**
 * Build ITN param string from raw POST body (most reliable method).
 * Strips the signature param and returns the string ready for passphrase + hashing.
 */
const buildITNParamString = (rawBody) => {
    return rawBody
        .split('&')
        .filter(pair => !pair.startsWith('signature='))
        .join('&');
};

/**
 * Verify ITN signature from PayFast.
 * Uses the raw POST body to preserve exact field order and encoding.
 * Falls back to rebuilding from parsed data in insertion order (for...in).
 */
const verifyITNSignature = (receivedSignature, rawBody, pfData, passphrase = null) => {
    let pfParamString;

    if (rawBody) {
        // PRIMARY: Use raw body - preserves exact order & encoding from PayFast
        pfParamString = buildITNParamString(rawBody);
    } else {
        // FALLBACK: Rebuild from parsed data in insertion order (for...in)
        let pfOutput = '';
        for (const key in pfData) {
            if (key === 'signature') continue;
            if (Object.prototype.hasOwnProperty.call(pfData, key) && pfData[key] !== '') {
                pfOutput += `${key}=${encodeURIComponent(String(pfData[key]).trim()).replace(/%20/g, '+')}&`;
            }
        }
        pfParamString = pfOutput.slice(0, -1);
    }

    // Append passphrase
    if (passphrase && passphrase.trim() !== '') {
        pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    const expectedSignature = crypto.createHash('md5').update(pfParamString).digest('hex');

    if (receivedSignature !== expectedSignature) {
        console.error('ITN Signature Mismatch!');
        console.error(`Expected: ${expectedSignature}`);
        console.error(`Received: ${receivedSignature}`);
        return false;
    }

    return true;
};

// No price overrides — PayFast charges the same price as displayed
const PAYFAST_PRICE_OVERRIDES = {};

// @desc    Initiate PayFast payment
// @route   POST /api/payfast/initiate
const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('user', 'email firstName lastName phone');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Order is already paid' });
        }

        // --- STEP 1: PREPARE CUSTOMER DATA ---
        const firstName =
            order.shippingAddress?.firstName?.trim() ||
            order.customerDetails?.firstName?.trim() ||
            order.user?.firstName?.trim() ||
            'Guest';
        const lastName =
            order.shippingAddress?.lastName?.trim() ||
            order.customerDetails?.lastName?.trim() ||
            order.user?.lastName?.trim() ||
            'Customer';
        const email =
            order.customerDetails?.email?.trim() ||
            order.user?.email?.trim();

        if (!email) {
            return res.status(400).json({ success: false, message: 'Customer email is required' });
        }

        const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
        const backendUrl = process.env.BACKEND_URL || process.env.HOST_URL || 'http://localhost:8080';

        // --- STEP 2: BUILD PAYLOAD ---
        // Compute PayFast-specific total — NO tax is added.
        // Suncream items use PAYFAST_PRICE_OVERRIDES; all prices are treated as tax-inclusive finals.
        let payfastSubtotal = 0;
        for (const item of order.items) {
            const overridePrice = PAYFAST_PRICE_OVERRIDES[item.name?.toUpperCase().trim()];
            const unitPrice = overridePrice !== undefined ? overridePrice : item.price;
            payfastSubtotal += unitPrice * item.quantity;
        }
        const payfastTotal = payfastSubtotal + (order.shippingCost || 0) - (order.discount || 0);

        const paymentData = {
            merchant_id: process.env.PAYFAST_SANDBOX === 'true' ? process.env.PAYFAST_SANDBOX_MERCHANT_ID : process.env.PAYFAST_MERCHANT_ID,
            merchant_key: process.env.PAYFAST_SANDBOX === 'true' ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY : process.env.PAYFAST_MERCHANT_KEY,
            return_url: `${baseUrl}/order-confirmation?status=success&orderId=${order._id}`,
            cancel_url: `${baseUrl}/checkout?cancelled=true`,
            notify_url: `${backendUrl}/api/payfast/notify`,
            name_first: firstName,
            name_last: lastName,
            email_address: email,
            m_payment_id: order._id.toString(),
            amount: payfastTotal.toFixed(2),
            item_name: `Order ${order.orderNumber || order._id}`,
        };

        // Phone handling - PayFast requires 10 digits starting with 0
        const rawPhone = order.customerDetails?.phone || order.shippingAddress?.phone;
        if (rawPhone) {
            const digits = rawPhone.replace(/\D/g, '');
            let cellNumber = '';
            if (digits.startsWith('27') && digits.length === 11) {
                cellNumber = '0' + digits.substring(2);
            } else if (digits.startsWith('0') && digits.length === 10) {
                cellNumber = digits;
            } else if (digits.length === 9) {
                cellNumber = '0' + digits;
            }
            if (cellNumber.length === 10 && cellNumber.startsWith('0')) {
                paymentData.cell_number = cellNumber;
            }
        }

        // Sanitize (Remove empty keys)
        Object.keys(paymentData).forEach(key => {
            if (!paymentData[key]) delete paymentData[key];
        });

        // --- STEP 3: SIGN ---
        const passphrase = process.env.PAYFAST_SANDBOX === 'true'
            ? process.env.PAYFAST_SANDBOX_PASSPHRASE
            : process.env.PAYFAST_PASSPHRASE;

        paymentData.signature = generateSignature(paymentData, passphrase);

        // Update Order
        order.paymentMethod = 'payfast';
        await order.save();

        console.log(`Initiated PayFast for Order ${order.orderNumber}`);

        res.status(200).json({
            success: true,
            paymentData,
            payfastUrl: getPayFastUrl(),
        });

    } catch (error) {
        console.error('PayFast Init Error:', error);
        res.status(500).json({ success: false, message: 'Payment Init Failed' });
    }
};

// @desc    Handle PayFast ITN (Webhook)
// @route   POST /api/payfast/notify
const handleITN = async (req, res) => {
    try {
        const pfData = req.body;
        console.log('PayFast ITN Received:', pfData);

        // --- SECURITY CHECK 1: SIGNATURE ---
        const passphrase = process.env.PAYFAST_SANDBOX === 'true'
            ? process.env.PAYFAST_SANDBOX_PASSPHRASE
            : process.env.PAYFAST_PASSPHRASE;

        const signatureValid = verifyITNSignature(
            pfData.signature,
            req.rawBody,  // Raw POST body captured in route middleware
            pfData,
            passphrase
        );

        if (!signatureValid) {
            // Return 200 to stop retry loops on fraud attempts
            return res.status(200).send('');
        }

        // --- PROCESS ORDER ---
        if (pfData.payment_status === 'COMPLETE') {
            const orderId = pfData.m_payment_id;
            const order = await Order.findById(orderId);

            if (!order) {
                console.error(`Order not found: ${orderId}`);
                return res.status(200).send('');
            }

            if (order.paymentStatus === 'paid') {
                console.log(`Order ${orderId} already paid. Skipping.`);
                return res.status(200).send('');
            }

            // Security Check 2: Amount
            // Recompute expected PayFast total using same logic as initiatePayment
            const paidAmount = parseFloat(pfData.amount_gross).toFixed(2);
            // Recompute expected PayFast total — NO tax (matches initiatePayment logic)
            let expectedSubtotal = 0;
            for (const item of order.items) {
                const overridePrice = PAYFAST_PRICE_OVERRIDES[item.name?.toUpperCase().trim()];
                const unitPrice = overridePrice !== undefined ? overridePrice : item.price;
                expectedSubtotal += unitPrice * item.quantity;
            }
            const expectedPayfastTotal = expectedSubtotal + (order.shippingCost || 0) - (order.discount || 0);
            const orderAmount = parseFloat(expectedPayfastTotal).toFixed(2);

            if (Math.abs(paidAmount - orderAmount) > 0.01) {
                console.error(`Amount Mismatch: Paid ${paidAmount}, Expected ${orderAmount}`);
                return res.status(200).send('');
            }

            // Update DB
            order.paidAt = new Date();
            order.paymentStatus = 'paid';
            order.paymentId = pfData.pf_payment_id;
            order.status = 'confirmed';
            order.statusHistory.push({
                status: 'confirmed',
                note: `Payment completed via PayFast (ID: ${pfData.pf_payment_id})`,
                timestamp: new Date()
            });

            await order.save();

            // Process affiliate commission
            await processAffiliateCommission(order);

            console.log(`Order ${orderId} marked as PAID via ITN`);
        }

        res.status(200).send(''); // Acknowledge receipt

    } catch (error) {
        console.error('ITN System Error:', error);
        res.status(200).send(''); // Always return 200
    }
};

// @desc    Verify payment status (Used by Frontend Polling)
// @route   GET /api/payfast/verify/:orderId
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
                paymentMethod: order.paymentMethod,
                status: order.status,
                paidAt: order.paidAt,
                // Itemised breakdown
                items: order.items,
                subtotal: order.subtotal,
                shippingCost: order.shippingCost,
                shippingMethod: order.shippingMethod,
                tax: order.tax,
                discount: order.discount,
                couponCode: order.couponCode,
                total: order.total,
            }
        });
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, message: 'Verify failed' });
    }
};

module.exports = {
    initiatePayment,
    handleITN,
    verifyPayment,
};
