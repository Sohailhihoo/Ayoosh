const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');
const { processAffiliateCommission } = require('../utils/affiliateCommission');

// PayGate URLs
const PAYGATE_INITIATE_URL = 'https://secure.paygate.co.za/payweb3/initiate.trans';
const PAYGATE_QUERY_URL = 'https://secure.paygate.co.za/payweb3/query.trans';

// Generate MD5 checksum for PayGate
const generateChecksum = (data, encryptionKey) => {
    // Convert data object to sorted string
    const values = Object.keys(data)
        .sort()
        .map(key => data[key])
        .join('');

    // Append encryption key
    const checksumString = values + encryptionKey;

    // Generate MD5 hash
    return crypto.createHash('md5').update(checksumString).digest('hex');
};

// @desc    Initiate PayGate payment
// @route   POST /api/payments/initiate
// @access  Public
const initiatePayment = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Validate required environment variables
        if (!process.env.PAYGATE_ID || !process.env.PAYGATE_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'PayGate credentials not configured'
            });
        }

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

        // Prepare initiate request data
        const initiateData = {
            PAYGATE_ID: process.env.PAYGATE_ID,
            REFERENCE: order._id.toString(),
            AMOUNT: Math.round(order.total * 100), // Amount in cents
            CURRENCY: 'ZAR',
            RETURN_URL: `${baseUrl}/order-confirmation?orderId=${orderId}`,
            TRANSACTION_DATE: new Date().toISOString().slice(0, 19).replace('T', ' '),
            LOCALE: 'en-za',
            COUNTRY: 'ZAF',
            EMAIL: order.customerDetails?.email || '',
        };

        // Add optional fields if available
        if (order.customerDetails?.firstName && order.customerDetails?.lastName) {
            initiateData.USER3 = `${order.customerDetails.firstName} ${order.customerDetails.lastName}`;
        }

        // Generate checksum
        initiateData.CHECKSUM = generateChecksum(initiateData, process.env.PAYGATE_SECRET);

        console.log('PayGate Initiate Request:', {
            ...initiateData,
            CHECKSUM: '***HIDDEN***'
        });

        // Make request to PayGate
        const response = await axios.post(
            PAYGATE_INITIATE_URL,
            new URLSearchParams(initiateData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Parse response
        const responseData = {};
        response.data.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            responseData[key] = value;
        });

        console.log('PayGate Initiate Response:', responseData);

        // Check for errors
        if (responseData.ERROR) {
            console.error('PayGate Error:', responseData.ERROR);
            return res.status(400).json({
                success: false,
                message: 'PayGate payment initiation failed',
                error: responseData.ERROR
            });
        }

        // Verify response checksum
        const responseChecksum = responseData.CHECKSUM;
        delete responseData.CHECKSUM;
        const expectedChecksum = generateChecksum(responseData, process.env.PAYGATE_SECRET);

        if (responseChecksum !== expectedChecksum) {
            console.error('PayGate checksum verification failed');
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Store PAY_REQUEST_ID with order
        order.paymentMethod = 'paygate';
        order.paymentStatus = 'pending';
        order.paymentId = responseData.PAY_REQUEST_ID;
        await order.save();

        console.log('PayGate payment initiated for order:', order.orderNumber);

        // Return redirect URL
        res.status(200).json({
            success: true,
            payRequestId: responseData.PAY_REQUEST_ID,
            paygateId: responseData.PAYGATE_ID,
            redirectUrl: `https://secure.paygate.co.za/payweb3/process.trans`,
        });

    } catch (error) {
        console.error('PayGate Initiate Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate payment',
            error: error.message
        });
    }
};

// @desc    Handle PayGate notification (webhook)
// @route   POST /api/payments/notify
// @access  Public
const handleNotify = async (req, res) => {
    try {
        const notifyData = req.body;

        console.log('==========================================');
        console.log('PayGate Notify Received:', new Date().toISOString());
        console.log('Notify Data:', JSON.stringify(notifyData, null, 2));
        console.log('==========================================');

        // Verify checksum
        const receivedChecksum = notifyData.CHECKSUM;
        const dataWithoutChecksum = { ...notifyData };
        delete dataWithoutChecksum.CHECKSUM;

        const expectedChecksum = generateChecksum(dataWithoutChecksum, process.env.PAYGATE_SECRET);

        if (receivedChecksum !== expectedChecksum) {
            console.error('PayGate Notify: Checksum mismatch');
            console.error('Received:', receivedChecksum);
            console.error('Expected:', expectedChecksum);
            return res.status(400).send('Checksum verification failed');
        }

        console.log('PayGate Notify: Checksum verified ✓');

        // Get the order
        const orderId = notifyData.REFERENCE;
        const order = await Order.findById(orderId);

        if (!order) {
            console.error('PayGate Notify: Order not found:', orderId);
            return res.status(404).send('Order not found');
        }

        // Query PayGate to verify transaction status
        const queryData = {
            PAYGATE_ID: process.env.PAYGATE_ID,
            PAY_REQUEST_ID: notifyData.PAY_REQUEST_ID,
            REFERENCE: orderId,
        };
        queryData.CHECKSUM = generateChecksum(queryData, process.env.PAYGATE_SECRET);

        const queryResponse = await axios.post(
            PAYGATE_QUERY_URL,
            new URLSearchParams(queryData).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Parse query response
        const queryResult = {};
        queryResponse.data.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            queryResult[key] = value;
        });

        console.log('PayGate Query Response:', queryResult);

        // Verify query response checksum
        const queryChecksum = queryResult.CHECKSUM;
        delete queryResult.CHECKSUM;
        const expectedQueryChecksum = generateChecksum(queryResult, process.env.PAYGATE_SECRET);

        if (queryChecksum !== expectedQueryChecksum) {
            console.error('PayGate Query: Checksum verification failed');
            return res.status(400).send('Query verification failed');
        }

        // Check transaction status
        // TRANSACTION_STATUS codes:
        // 1 = Approved
        // 2 = Declined
        // 4 = Cancelled
        const transactionStatus = parseInt(queryResult.TRANSACTION_STATUS);

        switch (transactionStatus) {
            case 1: // Approved
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                order.paymentId = queryResult.TRANSACTION_ID || notifyData.PAY_REQUEST_ID;
                order.paidAt = new Date();

                // Add to status history
                order.statusHistory.push({
                    status: 'confirmed',
                    note: `Payment completed via PayGate (Transaction ID: ${queryResult.TRANSACTION_ID})`,
                    timestamp: new Date()
                });
                console.log('PayGate: Payment approved ✓');

                // Process affiliate commission
                await processAffiliateCommission(order);
                break;

            case 2: // Declined
                order.paymentStatus = 'failed';
                order.statusHistory.push({
                    status: 'pending',
                    note: `Payment declined via PayGate (Result: ${queryResult.RESULT_DESC || 'Unknown'})`,
                    timestamp: new Date()
                });
                console.log('PayGate: Payment declined ✗');
                break;

            case 4: // Cancelled
                order.paymentStatus = 'cancelled';
                order.statusHistory.push({
                    status: 'pending',
                    note: 'Payment cancelled via PayGate',
                    timestamp: new Date()
                });
                console.log('PayGate: Payment cancelled');
                break;

            default:
                console.log('PayGate: Unknown transaction status:', transactionStatus);
        }

        await order.save();

        console.log('PayGate Notify: Order updated successfully', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            status: order.status,
        });

        // PayGate expects OK response
        res.status(200).send('OK');

    } catch (error) {
        console.error('PayGate Notify Error:', error);
        res.status(500).send('Server error');
    }
};

// @desc    Verify payment status after redirect
// @route   GET /api/payments/verify/:orderId
// @access  Public
const verifyPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // If payment is already confirmed, return success
        if (order.paymentStatus === 'paid') {
            return res.status(200).json({
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
        }

        // Query PayGate for latest status
        if (order.paymentId) {
            const queryData = {
                PAYGATE_ID: process.env.PAYGATE_ID,
                PAY_REQUEST_ID: order.paymentId,
                REFERENCE: orderId,
            };
            queryData.CHECKSUM = generateChecksum(queryData, process.env.PAYGATE_SECRET);

            const queryResponse = await axios.post(
                PAYGATE_QUERY_URL,
                new URLSearchParams(queryData).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            // Parse response
            const queryResult = {};
            queryResponse.data.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                queryResult[key] = value;
            });

            // Update order based on query result
            const transactionStatus = parseInt(queryResult.TRANSACTION_STATUS);
            if (transactionStatus === 1) {
                order.paymentStatus = 'paid';
                order.status = 'confirmed';
                order.paidAt = new Date();
                await order.save();
            }
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
        console.error('PayGate Verify Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify payment' });
    }
};

module.exports = {
    initiatePayment,
    handleNotify,
    verifyPayment,
};
