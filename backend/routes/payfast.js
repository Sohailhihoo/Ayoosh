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
router.post('/notify', handleITN);

// Verify payment status - called from frontend to check payment status
router.get('/verify/:orderId', verifyPayment);

module.exports = router;
