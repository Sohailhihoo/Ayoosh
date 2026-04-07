const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// @route   POST /api/reviews
// @desc    Submit a new review
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, rating, review, page } = req.body;

        if (!name || !email || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const newReview = await Review.create({
            name,
            email,
            rating,
            review,
            page: page || 'general'
        });

        res.status(201).json({
            success: true,
            message: 'Thank you for your review!',
            review: newReview
        });
    } catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit review. Please try again.'
        });
    }
});

// @route   GET /api/reviews
// @desc    Get all approved reviews
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page } = req.query;
        const filter = { approved: true };
        if (page) filter.page = page;

        const reviews = await Review.find(filter)
            .sort({ createdAt: -1 })
            .select('-email');

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});

// @route   GET /api/reviews/all
// @desc    Get all reviews (admin - includes unapproved)
// @access  Should be admin-protected in production
router.get('/all', async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
});

// @route   PUT /api/reviews/:id/approve
// @desc    Approve a review
// @access  Should be admin-protected in production
router.put('/:id/approve', async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { approved: true },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review approved',
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to approve review'
        });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Should be admin-protected in production
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.json({
            success: true,
            message: 'Review deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
});

module.exports = router;
