const express = require('express');
const router = express.Router();
const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/affiliates/track/:code
// @desc    Track affiliate click and redirect to homepage
// @access  Public
router.get('/track/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const affiliate = await Affiliate.findOne({
            affiliateCode: code.toUpperCase(),
            status: 'approved'
        });

        if (!affiliate) {
            // Redirect to homepage even if code is invalid
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(frontendUrl);
        }

        // Record the click
        await Referral.create({
            affiliate: affiliate._id,
            affiliateCode: affiliate.affiliateCode,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            referrerUrl: req.headers['referer'] || '',
            landingPage: req.query.page || '/',
            status: 'clicked',
            expiresAt: new Date(Date.now() + affiliate.cookieDuration * 24 * 60 * 60 * 1000)
        });

        // Increment click count
        affiliate.totalClicks += 1;
        await affiliate.save();

        // Redirect to frontend with ref param (frontend stores the cookie)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const landingPage = req.query.page || '/';
        res.redirect(`${frontendUrl}${landingPage}?ref=${affiliate.affiliateCode}`);
    } catch (error) {
        console.error('Affiliate track error:', error.message);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(frontendUrl);
    }
});

// @route   POST /api/affiliates/click
// @desc    Record a click from frontend (called via JS when ?ref= is detected)
// @access  Public
router.post('/click', async (req, res) => {
    try {
        const { affiliateCode, landingPage } = req.body;

        if (!affiliateCode) {
            return res.status(400).json({ success: false, message: 'Affiliate code required' });
        }

        const affiliate = await Affiliate.findOne({
            affiliateCode: affiliateCode.toUpperCase(),
            status: 'approved'
        });

        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Invalid affiliate code' });
        }

        // Record click
        await Referral.create({
            affiliate: affiliate._id,
            affiliateCode: affiliate.affiliateCode,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            referrerUrl: req.headers['referer'] || '',
            landingPage: landingPage || '/',
            status: 'clicked',
            expiresAt: new Date(Date.now() + affiliate.cookieDuration * 24 * 60 * 60 * 1000)
        });

        affiliate.totalClicks += 1;
        await affiliate.save();

        res.json({
            success: true,
            cookieDuration: affiliate.cookieDuration
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/affiliates/validate/:code
// @desc    Validate an affiliate code (used by frontend before storing cookie)
// @access  Public
router.get('/validate/:code', async (req, res) => {
    try {
        const affiliate = await Affiliate.findOne({
            affiliateCode: req.params.code.toUpperCase(),
            status: 'approved'
        });

        res.json({
            success: true,
            valid: !!affiliate,
            cookieDuration: affiliate?.cookieDuration || 7
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/affiliates
// @desc    Get all affiliates (admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = status ? { status } : {};

        const affiliates = await Affiliate.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Affiliate.countDocuments(query);

        res.json({
            success: true,
            data: affiliates,
            pagination: { page: parseInt(page), limit: parseInt(limit), total }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/affiliates/:id
// @desc    Get single affiliate with referral stats (admin)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const affiliate = await Affiliate.findById(req.params.id);
        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }

        const referrals = await Referral.find({ affiliate: affiliate._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('order', 'orderNumber total status');

        res.json({
            success: true,
            data: { affiliate, referrals }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/affiliates/:id/status
// @desc    Approve/suspend/reject affiliate (admin)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, reason } = req.body;
        const affiliate = await Affiliate.findById(req.params.id);

        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }

        affiliate.status = status;
        if (status === 'approved') affiliate.approvedAt = new Date();
        if (status === 'suspended') {
            affiliate.suspendedAt = new Date();
            affiliate.suspendedReason = reason || '';
        }

        await affiliate.save();

        res.json({ success: true, data: affiliate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/affiliates/:id/payout
// @desc    Record a payout to affiliate (admin)
// @access  Private/Admin
router.put('/:id/payout', protect, authorize('admin'), async (req, res) => {
    try {
        const { amount } = req.body;
        const affiliate = await Affiliate.findById(req.params.id);

        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }

        if (amount > affiliate.unpaidCommission) {
            return res.status(400).json({ success: false, message: 'Amount exceeds unpaid commission' });
        }

        affiliate.paidCommission += amount;
        await affiliate.save();

        // Mark referral commissions as paid
        await Referral.updateMany(
            { affiliate: affiliate._id, commissionStatus: 'approved' },
            { commissionStatus: 'paid', paidAt: new Date() }
        );

        res.json({
            success: true,
            message: `Payout of R${amount} recorded`,
            data: {
                totalCommission: affiliate.totalCommission,
                paidCommission: affiliate.paidCommission,
                unpaidCommission: affiliate.unpaidCommission
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
