const express = require('express');
const router = express.Router();
const { initiatePayment, handleNotify, verifyPayment } = require('../controllers/paygateController');
// const { protect } = require('../middleware/authMiddleware'); // Optional: Protect init route

// Route: POST /api/payments/initiate
// Desc: Start payment process
router.post('/initiate', initiatePayment);

// Route: POST /api/payments/notify
// Desc: Webhook for payment status updates
router.post('/notify', express.urlencoded({
    extended: true, verify: (req, res, buf) => {
        // Store raw body for signature verification if needed
        req.rawBody = buf.toString();
    }
}), handleNotify);

// Route: GET /api/payments/verify/:orderId
// Desc: Verify payment status - called from frontend to check payment status
router.get('/verify/:orderId', verifyPayment);

module.exports = router;
