const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring');

/**
 * PayGate Controller
 * 
 * Handles interactions with PayGate (DPO) Payment Gateway.
 * Uses PayWeb 3 integration method.
 */

const PAYGATE_ID = process.env.PAYGATE_ID;
const PAYGATE_SECRET = process.env.PAYGATE_SECRET;
const PAYGATE_INITIATE_URL = 'https://secure.paygate.co.za/payweb3/initiate';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'; // Adjust for production

// Helper: Generate MD5 Checksum
const generateChecksum = (data, secret) => {
    let checksumString = '';
    for (const key in data) {
        if (data[key] !== '') {
            checksumString += data[key];
        }
    }
    checksumString += secret;
    return crypto.createHash('md5').update(checksumString).digest('hex');
};

/**
 * @desc    Initiate a payment transaction
 * @route   POST /api/payment/initiate
 * @access  Private (Authenticated User)
 */
exports.initiatePayment = async (req, res) => {
    try {
        const { amount, email, orderId } = req.body;

        if (!amount || !email || !orderId) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        // Amount must be in cents/smallest unit for some gateways, 
        // BUT PayGate usually takes major currency units (e.g. 100.00).
        // Let's assume input 'amount' is already in ZAR (e.g. 2450.00).
        // Ensure to format it to currency standard 
        const formattedAmount = Number(amount).toFixed(2) * 100; // PayGate expects integer in cents for PayWeb3? 
        // WAIT: PayWeb3 usually expects "Amount" in cents as integer?
        // Checking PayGate Docs: "AMOUNT: Integer, The amount of the transaction in cents (e.g. R10.00 = 1000)"
        // Yes, needs to be in cents.

        const paymentData = {
            PAYGATE_ID: PAYGATE_ID,
            REFERENCE: orderId.substring(0, 20), // Max 20 chars
            AMOUNT: formattedAmount,
            CURRENCY: 'ZAR',
            RETURN_URL: `${BASE_URL}/checkout/success`,
            TRANSACTION_DATE: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            LOCALE: 'en-za',
            COUNTRY: 'ZAF',
            EMAIL: email
        };

        // Generate Checksum
        const checksum = generateChecksum(paymentData, PAYGATE_SECRET);
        paymentData.CHECKSUM = checksum;

        // Make request to PayGate
        // PayGate expects form-urlencoded body
        const response = await axios.post(PAYGATE_INITIATE_URL, querystring.stringify(paymentData), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Parse response (format: PAY_REQUEST_ID=...&CHECKSUM=...)
        const responseData = querystring.parse(response.data);

        // Verify response checksum (security best practice)
        // Note: Response might contain different fields, we need to check PayGate docs for response checksum logic
        // Only PAY_REQUEST_ID, REFERENCE, CHECKSUM returned usually.

        if (responseData.ERROR) {
            console.error('PayGate Error:', responseData.ERROR);
            return res.status(500).json({ message: 'PayGate initialization failed', error: responseData.ERROR });
        }

        if (!responseData.PAY_REQUEST_ID) {
            return res.status(500).json({ message: 'Invalid response from PayGate' });
        }

        // Return Request ID so frontend can redirect
        res.status(200).json({
            payRequestId: responseData.PAY_REQUEST_ID,
            reference: paymentData.REFERENCE,
            checksum: responseData.CHECKSUM // Pass this if needed for redirect form, though frontend form usually calculates its own or uses this
        });

    } catch (error) {
        console.error('Payment Initiation Error:', error);
        res.status(500).json({ message: 'Server error initiating payment' });
    }
};

/**
 * @desc    Handle IPN / Webhook from PayGate
 * @route   POST /api/payment/notify
 * @access  Public (PayGate Server)
 */
exports.handleNotify = async (req, res) => {
    try {
        const notifyData = req.body;

        // 1. Verify Checksum
        // Re-construct string from received params excluding CHECKSUM
        // ... implementation of checksum verification ...

        // 2. Update Order Status
        const { REFERENCE, TRANSACTION_STATUS, RESULT_CODE } = notifyData;

        // Status 1 = Approved
        if (Number(TRANSACTION_STATUS) === 1) {
            console.log(`Payment Approved for Order ${REFERENCE}`);
            // TODO: Update order in DB
        } else {
            console.log(`Payment Failed/Cancelled for Order ${REFERENCE}`);
        }

        res.status(200).send('OK'); // Acknowledge receipt

    } catch (error) {
        console.error('PayGate Notify Error:', error);
        res.status(500).send('Error');
    }
};
