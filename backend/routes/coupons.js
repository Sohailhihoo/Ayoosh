const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Coupon = require('../models/Coupon');

const couponValidateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many coupon attempts. Please try again in an hour.' }
});

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Public
router.post('/validate', couponValidateLimiter, async (req, res) => {
    try {
        const { code, cartTotal } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code is required'
            });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        if (!coupon.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Coupon is expired or usage limit reached'
            });
        }

        if (cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order amount of R${coupon.minOrderAmount} required`
            });
        }

        res.json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                amount: coupon.amount,
                freeShipping: coupon.freeShipping
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
