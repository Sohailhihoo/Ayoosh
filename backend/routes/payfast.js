const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    handleITN,
    verifyPayment,
} = require('../controllers/PayfastController');

// Initiate payment - called from frontend when user clicks "Pay with PayFast"
router.post('/initiate', initiatePayment);

// ITN webhook - called by PayFast servers after payment
// IMPORTANT: Must accept URL-encoded data
router.post('/notify', express.urlencoded({
    extended: true, verify: (req, res, buf) => {
        // Store raw body for signature verification if needed
        req.rawBody = buf.toString();
    }
}), handleITN);

// Verify payment status - called from frontend to check payment status
router.get('/verify/:orderId', verifyPayment);

module.exports = router;
