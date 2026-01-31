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
const generateSignature = (data, passphrase = null) => {
    // Create parameter string - ORDER MATTERS for PayFast!
    let pfOutput = '';
    for (let key in data) {
        if (data.hasOwnProperty(key) && data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            pfOutput += `${key}=${encodeURIComponent(String(data[key]).trim()).replace(/%20/g, '+')}&`;
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Add passphrase if provided
    if (passphrase) {
        getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    // Generate MD5 hash
    return crypto.createHash('md5').update(getString).digest('hex');
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

        // PayFast payment data - ORDER IS CRITICAL!
        // Must follow PayFast's exact field order for signature to work
        const paymentData = {
            // Merchant details (required)
            merchant_id: process.env.PAYFAST_MERCHANT_ID,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY,

            // URLs
            return_url: `${baseUrl}/order-confirmation?orderId=${orderId}&status=success`,
            cancel_url: `${baseUrl}/checkout?cancelled=true&orderId=${orderId}`,
            notify_url: `${backendUrl}/api/payfast/notify`,

            // Buyer details
            name_first: order.customerDetails?.firstName || '',
            name_last: order.customerDetails?.lastName || '',
            email_address: order.customerDetails?.email || '',
            cell_number: order.customerDetails?.phone?.replace(/\D/g, '') || '',

            // Transaction details
            m_payment_id: order._id.toString(),
            amount: order.total.toFixed(2),
            item_name: `Order ${order.orderNumber}`,
            item_description: `${order.items?.length || 0} item(s) from Ayoosh Online`,

            // Custom data
            custom_str1: order._id.toString(),
            custom_str2: order.orderNumber || '',
        };

        // Remove empty values (PayFast doesn't like empty fields)
        Object.keys(paymentData).forEach(key => {
            if (paymentData[key] === '' || paymentData[key] === null || paymentData[key] === undefined) {
                delete paymentData[key];
            }
        });

        // Generate signature
        const signature = generateSignature(paymentData, process.env.PAYFAST_PASSPHRASE);
        paymentData.signature = signature;

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
