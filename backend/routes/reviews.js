const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// Helper: recalculate and cache product rating
async function syncProductRating(productId) {
    if (!productId) return;
    const reviews = await Review.find({ productId, status: 'approved' });
    const count = reviews.length;
    const avg = count > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
        : 0;
    await Product.findByIdAndUpdate(productId, { averageRating: avg, reviewCount: count });
}

// POST /api/reviews — Submit a review (public)
router.post('/', async (req, res) => {
    try {
        const { name, email, rating, title, review, page, productId } = req.body;

        if (!name || !email || !rating || !review) {
            return res.status(400).json({ success: false, message: 'Name, email, rating, and review are required' });
        }

        if (productId) {
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const newReview = await Review.create({
            name, email, rating, title,
            review,
            page: page || null,
            productId: productId || null,
            status: 'pending'
        });

        res.status(201).json({ success: true, message: 'Thank you for your review! It will be visible after approval.', review: newReview });
    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit review. Please try again.' });
    }
});

// GET /api/reviews — Get approved reviews (public)
router.get('/', async (req, res) => {
    try {
        const { page, productId } = req.query;
        const filter = { status: 'approved' };
        if (page) {
            // Show page-specific reviews + general reviews (no page, no product)
            filter.$or = [
                { page },
                { page: 'general', productId: null },
                { page: null, productId: null }
            ];
        }
        if (productId) filter.productId = productId;

        const reviews = await Review.find(filter).sort({ createdAt: -1 }).select('-email');

        // Calculate aggregate rating
        const count = reviews.length;
        const averageRating = count > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
            : 0;

        res.json({ success: true, reviews, averageRating, reviewCount: count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// GET /api/reviews/all — Get all reviews (admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;

        const reviews = await Review.find(filter).sort({ createdAt: -1 }).populate('productId', 'name slug');
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
});

// PUT /api/reviews/:id/approve — Approve a review (admin)
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        await syncProductRating(review.productId);
        res.json({ success: true, message: 'Review approved', review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to approve review' });
    }
});

// PUT /api/reviews/:id/reject — Reject a review (admin)
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        await syncProductRating(review.productId);
        res.json({ success: true, message: 'Review rejected', review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reject review' });
    }
});

// DELETE /api/reviews/:id — Delete a review (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

        await syncProductRating(review.productId);
        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
});

module.exports = router;
