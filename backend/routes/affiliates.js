const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');
const User = require('../models/User');
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

// ==================== INFLUENCER SELF-SERVE ROUTES ====================

// @route   GET /api/affiliates/me
// @desc    Get the affiliate account linked to the logged-in user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const affiliate = await Affiliate.findOne({ user: req.user._id });
        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'No affiliate account linked to your profile' });
        }
        res.json({ success: true, data: affiliate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/affiliates/me/referrals
// @desc    Get referrals for the logged-in influencer
// @access  Private
router.get('/me/referrals', protect, async (req, res) => {
    try {
        const affiliate = await Affiliate.findOne({ user: req.user._id });
        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'No affiliate account found' });
        }

        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [referrals, total] = await Promise.all([
            Referral.find({ affiliate: affiliate._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('order', 'orderNumber total status createdAt'),
            Referral.countDocuments({ affiliate: affiliate._id }),
        ]);

        res.json({
            success: true,
            data: referrals,
            pagination: { page: Number(page), limit: Number(limit), total },
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

// @route   GET /api/affiliates/pending-payouts
// @desc    List affiliates with pending commission totals (admin)
// @access  Private/Admin
router.get('/pending-payouts', protect, authorize('admin'), async (req, res) => {
    try {
        const pending = await Referral.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$affiliate', pendingAmount: { $sum: '$commissionAmount' }, referralCount: { $sum: 1 } } },
            { $lookup: { from: 'affiliates', localField: '_id', foreignField: '_id', as: 'affiliate' } },
            { $unwind: '$affiliate' },
            { $project: { affiliateId: '$_id', pendingAmount: 1, referralCount: 1, firstName: '$affiliate.firstName', lastName: '$affiliate.lastName', email: '$affiliate.email', affiliateCode: '$affiliate.affiliateCode', minPayoutAmount: '$affiliate.minPayoutAmount' } },
            { $sort: { pendingAmount: -1 } },
        ]);
        res.json({ success: true, data: pending });
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

// @route   PUT /api/affiliates/:id/link-user
// @desc    Link a User account to an affiliate (admin) — lets influencer log in and see their portal
// @access  Private/Admin
router.put('/:id/link-user', protect, authorize('admin'), async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'A valid userId is required' });
        }

        const [userExists, alreadyLinked] = await Promise.all([
            User.exists({ _id: userId }),
            Affiliate.exists({ user: userId, _id: { $ne: req.params.id } }),
        ]);

        if (!userExists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (alreadyLinked) {
            return res.status(409).json({ success: false, message: 'This user is already linked to another affiliate' });
        }

        const affiliate = await Affiliate.findByIdAndUpdate(
            req.params.id,
            { user: userId },
            { new: true }
        );
        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }
        res.json({ success: true, data: affiliate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/affiliates/:id/payout
// @desc    Record a payout to affiliate (admin) — kept for backward compat, delegates to mark-paid
// @access  Private/Admin
router.put('/:id/payout', protect, authorize('admin'), async (req, res) => {
    try {
        const affiliate = await Affiliate.findById(req.params.id);
        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }

        // Compute amount server-side from approved referrals — never trust client body
        const [{ totalPending } = { totalPending: 0 }] = await Referral.aggregate([
            { $match: { affiliate: affiliate._id, status: 'approved' } },
            { $group: { _id: null, totalPending: { $sum: '$commissionAmount' } } },
        ]);

        if (!totalPending || totalPending <= 0) {
            return res.status(400).json({ success: false, message: 'No approved commission to pay out' });
        }

        const now = new Date();
        await Referral.updateMany(
            { affiliate: affiliate._id, status: 'approved' },
            { status: 'paid', paidAt: now }
        );

        const updated = await Affiliate.findByIdAndUpdate(
            affiliate._id,
            { $inc: { paidCommission: totalPending } },
            { new: true }
        );

        res.json({
            success: true,
            message: `Payout of R${totalPending.toFixed(2)} recorded`,
            data: {
                amount: totalPending,
                totalCommission: updated.totalCommission,
                paidCommission: updated.paidCommission,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/affiliates
// @desc    Create a new affiliate (admin)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, commissionRate = 5, payoutMethod, payoutDetails, minPayoutAmount } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ success: false, message: 'firstName, lastName, and email are required' });
        }

        const affiliate = await Affiliate.create({
            firstName,
            lastName,
            email: email.toLowerCase().trim(),
            phone,
            commissionRate,
            commissionType: 'percentage',
            payoutMethod: payoutMethod || 'manual',
            payoutDetails: payoutDetails || {},
            minPayoutAmount: minPayoutAmount || 200,
            status: 'approved',
            approvedAt: new Date(),
        });

        res.status(201).json({ success: true, data: affiliate });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'An affiliate with this email already exists' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/affiliates/:id/mark-paid
// @desc    Mark approved referrals as paid and record payout (admin)
// @access  Private/Admin
router.post('/:id/mark-paid', protect, authorize('admin'), async (req, res) => {
    try {
        const affiliate = await Affiliate.findById(req.params.id);
        if (!affiliate) {
            return res.status(404).json({ success: false, message: 'Affiliate not found' });
        }

        // Compute amount server-side — never trust client body for financial values
        const [{ totalPending } = { totalPending: 0 }] = await Referral.aggregate([
            { $match: { affiliate: affiliate._id, status: 'approved' } },
            { $group: { _id: null, totalPending: { $sum: '$commissionAmount' } } },
        ]);

        if (!totalPending || totalPending <= 0) {
            return res.status(400).json({ success: false, message: 'No approved commission to pay out' });
        }

        const now = new Date();
        const result = await Referral.updateMany(
            { affiliate: affiliate._id, status: 'approved' },
            { status: 'paid', paidAt: now }
        );

        const updated = await Affiliate.findByIdAndUpdate(
            affiliate._id,
            { $inc: { paidCommission: totalPending } },
            { new: true }
        );

        res.json({
            success: true,
            message: `Payout of R${totalPending.toFixed(2)} recorded for ${affiliate.affiliateCode}`,
            data: {
                amount: totalPending,
                referralsPaid: result.modifiedCount,
                totalCommission: updated.totalCommission,
                paidCommission: updated.paidCommission,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
