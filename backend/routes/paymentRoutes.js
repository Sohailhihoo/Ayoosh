const express = require('express');
const router = express.Router();
const { initiatePayment, handleNotify } = require('../controllers/paygateController');
// const { protect } = require('../middleware/authMiddleware'); // Optional: Protect init route

// Route: POST /api/payment/initiate
// Desc: Start payment process
router.post('/initiate', initiatePayment);

// Route: POST /api/payment/notify
// Desc: Webhook for payment status updates
router.post('/notify', handleNotify);

module.exports = router;
