const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if already subscribed
        let subscriber = await Newsletter.findOne({ email });

        if (subscriber) {
            if (!subscriber.isSubscribed) {
                // Re-subscribe
                subscriber.isSubscribed = true;
                await subscriber.save();
                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! You have successfully re-subscribed.',
                    coupon: 'AYOOSH20'
                });
            }
            return res.status(200).json({ // Return 200 even if already subscribed to avoid exposing user status essentially
                success: true,
                message: 'You are already subscribed!',
                coupon: 'AYOOSH20'
            });
        }

        // Create new subscriber
        subscriber = await Newsletter.create({ email });

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing!',
            coupon: 'AYOOSH20' // Hardcoded coupon code for now
        });
    } catch (error) {
        // Duplicate key error (race condition)
        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message: 'You are already subscribed!',
                coupon: 'AYOOSH20'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

module.exports = router;
