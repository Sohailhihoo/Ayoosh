# Unified Review System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified review system where all reviews (page-level and product-level) use one model with admin approval, displayed as carousels on category pages and as a list with modal form on product pages.

**Architecture:** Single Review model with `page` and `productId` tags. Backend handles CRUD with admin auth and rating cache sync to Product. Frontend has ReviewCarousel for category pages, ProductReviews for product detail, ReviewForm (modified for modal support), and an admin management page.

**Tech Stack:** MongoDB/Mongoose, Express, Next.js, Tailwind CSS, Framer Motion, react-hot-toast

---

## File Structure

**Backend (modify):**
- `backend/models/Review.js` — Rewrite schema: add productId, title, status enum
- `backend/models/Product.js` — Remove embedded reviewSchema/reviews array, keep cached rating fields
- `backend/routes/reviews.js` — Rewrite: unified endpoints, admin auth, rating cache sync
- `backend/routes/products.js` — Remove POST /:id/reviews endpoint

**Frontend (modify):**
- `frontend/components/ReviewForm.jsx` — Add productId prop, title field, modal mode
- `frontend/app/suncream/page.js` — Add ReviewCarousel component
- `frontend/app/sunglasses/page.js` — Add ReviewCarousel component
- `frontend/app/products/[slug]/page.js` — Replace reviews tab with ProductReviews
- `frontend/lib/api.js` — Expand reviewAPI with admin methods
- `frontend/components/admin/Sidebar.jsx` — Add Reviews nav item

**Frontend (new):**
- `frontend/components/ReviewCarousel.jsx` — Horizontal carousel for page reviews
- `frontend/components/ProductReviews.jsx` — Product review display + write-review modal
- `frontend/app/admin/reviews/page.js` — Admin review management

---

### Task 1: Update Review Model

**Files:**
- Modify: `backend/models/Review.js`

- [ ] **Step 1: Rewrite the Review schema**

Replace the entire contents of `backend/models/Review.js` with:

```javascript
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true
    },
    review: {
        type: String,
        required: [true, 'Review text is required'],
        trim: true
    },
    page: {
        type: String,
        enum: ['suncream', 'sunglasses', null],
        default: null
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

reviewSchema.index({ status: 1, page: 1 });
reviewSchema.index({ status: 1, productId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
```

- [ ] **Step 2: Commit**

```bash
git add backend/models/Review.js
git commit -m "feat: update Review model with unified schema (productId, status, title)"
```

---

### Task 2: Update Product Model

**Files:**
- Modify: `backend/models/Product.js`

- [ ] **Step 1: Remove embedded reviewSchema and reviews array**

In `backend/models/Product.js`, remove the embedded reviewSchema definition (lines 12-27):

```javascript
// DELETE THIS BLOCK:
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  isVerifiedPurchase: { type: Boolean, default: false }
}, { timestamps: true });
```

- [ ] **Step 2: Remove reviews array from productSchema**

Replace this line in the productSchema (line 110):

```javascript
  reviews: [reviewSchema],
```

with nothing (delete the line). Keep `averageRating` and `reviewCount` as they are.

- [ ] **Step 3: Remove calculateAverageRating method**

Delete the `calculateAverageRating` method (lines 154-165):

```javascript
// DELETE THIS BLOCK:
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
  return this.save();
};
```

- [ ] **Step 4: Commit**

```bash
git add backend/models/Product.js
git commit -m "feat: remove embedded reviews from Product model, keep cached rating fields"
```

---

### Task 3: Rewrite Review Routes

**Files:**
- Modify: `backend/routes/reviews.js`

- [ ] **Step 1: Rewrite the entire reviews route file**

Replace the entire contents of `backend/routes/reviews.js` with:

```javascript
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
        if (page) filter.page = page;
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/routes/reviews.js
git commit -m "feat: rewrite review routes with unified endpoints, admin auth, and rating sync"
```

---

### Task 4: Remove Product Reviews Endpoint

**Files:**
- Modify: `backend/routes/products.js`

- [ ] **Step 1: Remove POST /:id/reviews endpoint**

In `backend/routes/products.js`, find and delete the entire `POST /:id/reviews` route block (approximately lines 392-438). Search for `router.post('/:id/reviews'` to locate it.

- [ ] **Step 2: Commit**

```bash
git add backend/routes/products.js
git commit -m "feat: remove embedded product reviews endpoint (now handled by unified review routes)"
```

---

### Task 5: Update Frontend API

**Files:**
- Modify: `frontend/lib/api.js`

- [ ] **Step 1: Expand reviewAPI**

In `frontend/lib/api.js`, replace the existing `reviewAPI` block (lines 100-104):

```javascript
// Review APIs
export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getApproved: (page) => api.get('/reviews', { params: { page } }),
};
```

with:

```javascript
// Review APIs
export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getApproved: (params) => api.get('/reviews', { params }),
  getAll: (params) => api.get('/reviews/all', { params }),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  reject: (id) => api.put(`/reviews/${id}/reject`),
  delete: (id) => api.delete(`/reviews/${id}`),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/api.js
git commit -m "feat: expand reviewAPI with admin methods and flexible params"
```

---

### Task 6: Update ReviewForm Component

**Files:**
- Modify: `frontend/components/ReviewForm.jsx`

- [ ] **Step 1: Rewrite ReviewForm with modal support and productId/title**

Replace the entire contents of `frontend/components/ReviewForm.jsx` with:

```jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { reviewAPI } from '@/lib/api';

/**
 * ReviewForm - Submit reviews for pages or products
 * @param {string} page - Page tag: "suncream" or "sunglasses" (for page reviews)
 * @param {string} productId - Product ID (for product reviews)
 * @param {boolean} isModal - If true, renders without section wrapper
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSuccess - Callback after successful submission
 */
export default function ReviewForm({ page, productId, isModal = false, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        title: '',
        review: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = { ...formData };
            if (page) payload.page = page;
            if (productId) payload.productId = productId;

            await reviewAPI.submit(payload);
            setSubmitSuccess(true);

            setTimeout(() => {
                setFormData({ name: '', email: '', rating: 5, title: '', review: '' });
                setSubmitSuccess(false);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }, 2000);
        } catch (error) {
            console.error('Review submission failed:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="review-name" className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                    <input type="text" id="review-name" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Your name" />
                </div>
                <div>
                    <label htmlFor="review-email" className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input type="email" id="review-email" name="email" value={formData.email} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="your.email@example.com" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating *</label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none transition-transform hover:scale-110">
                            <svg className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    ))}
                    <span className="ml-3 text-gray-600 font-medium">{formData.rating} / 5</span>
                </div>
            </div>

            <div>
                <label htmlFor="review-title" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input type="text" id="review-title" name="title" value={formData.title} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="Sum up your experience" />
            </div>

            <div>
                <label htmlFor="review-text" className="block text-sm font-semibold text-gray-700 mb-1">Review *</label>
                <textarea id="review-text" name="review" value={formData.review} onChange={handleChange} required rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your experience..." />
            </div>

            <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting || submitSuccess}
                    className={`flex-1 px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300 rounded-lg ${submitSuccess ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {submitSuccess ? '✓ Submitted!' : isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
                {isModal && onClose && (
                    <button type="button" onClick={onClose}
                        className="px-6 py-3 text-sm font-semibold tracking-wider uppercase border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                )}
            </div>

            {submitSuccess && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">Thank you! Your review will be visible after approval.</p>
                </motion.div>
            )}
        </form>
    );

    if (isModal) return formContent;

    return (
        <section className="py-20 px-6 md:px-12 bg-white">
            <div className="max-w-3xl mx-auto">
                <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">Share Your Experience</h2>
                    <p className="text-gray-600 text-lg">We'd love to hear what you think about our products</p>
                </motion.div>
                {formContent}
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/ReviewForm.jsx
git commit -m "feat: update ReviewForm with modal support, title field, and productId prop"
```

---

### Task 7: Create ReviewCarousel Component

**Files:**
- Create: `frontend/components/ReviewCarousel.jsx`

- [ ] **Step 1: Create the ReviewCarousel component**

Create `frontend/components/ReviewCarousel.jsx`:

```jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { reviewAPI } from '@/lib/api';

function StarRating({ rating, size = 'w-5 h-5' }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`${size} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function ReviewCarousel({ page }) {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        try {
            const { data } = await reviewAPI.getApproved({ page });
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setReviewCount(data.reviewCount || 0);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.offsetWidth * 0.8;
        scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="py-16 px-6 md:px-12 bg-white">
                <div className="max-w-7xl mx-auto text-center text-gray-400">Loading reviews...</div>
            </section>
        );
    }

    if (reviews.length === 0) return null;

    return (
        <section className="py-16 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">What Our Customers Say</h2>
                    <div className="flex items-center justify-center gap-3">
                        <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
                        <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                    </div>
                </motion.div>

                {/* Carousel */}
                <div className="relative">
                    {/* Arrow Left */}
                    <button onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Scrollable Container */}
                    <div ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {reviews.map((review) => (
                            <motion.div key={review._id}
                                className="flex-shrink-0 w-[300px] md:w-[350px] snap-start bg-[#fefce8] rounded-xl p-6 shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ duration: 0.4 }}>
                                <StarRating rating={review.rating} />
                                {review.title && <h4 className="font-semibold text-gray-900 mt-3">{review.title}</h4>}
                                <p className="text-gray-600 mt-2 text-sm leading-relaxed line-clamp-4">{review.review}</p>
                                <div className="mt-4 pt-3 border-t border-yellow-200">
                                    <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Arrow Right */}
                    <button onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex">
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/ReviewCarousel.jsx
git commit -m "feat: add ReviewCarousel component for page-level review display"
```

---

### Task 8: Create ProductReviews Component

**Files:**
- Create: `frontend/components/ProductReviews.jsx`

- [ ] **Step 1: Create the ProductReviews component**

Create `frontend/components/ProductReviews.jsx`:

```jsx
'use client';

import { useState, useEffect } from 'react';
import { reviewAPI } from '@/lib/api';
import ReviewForm from './ReviewForm';

function StarRating({ rating, size = 'w-5 h-5' }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className={`${size} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function ProductReviews({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const { data } = await reviewAPI.getApproved({ productId });
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setReviewCount(data.reviewCount || 0);
        } catch (error) {
            console.error('Failed to fetch product reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-gray-400 py-4">Loading reviews...</p>;

    return (
        <div>
            {/* Rating Summary */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <StarRating rating={Math.round(averageRating)} size="w-6 h-6" />
                    <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="px-5 py-2.5 bg-black text-white text-sm font-semibold tracking-wider uppercase hover:bg-gray-800 transition-colors rounded-lg">
                    Write a Review
                </button>
            </div>

            {/* Review Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Write a Review</h3>
                            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <ReviewForm productId={productId} isModal={true}
                            onClose={() => setShowForm(false)}
                            onSuccess={() => { setShowForm(false); fetchReviews(); }} />
                    </div>
                </div>
            )}

            {/* Review List */}
            {reviews.length === 0 ? (
                <p className="text-gray-500 py-4">No reviews yet. Be the first to review this product!</p>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b pb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <StarRating rating={review.rating} size="w-4 h-4" />
                                <span className="text-sm text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            {review.title && <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>}
                            <p className="text-gray-600">{review.review}</p>
                            <p className="text-sm font-medium text-gray-800 mt-2">{review.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/ProductReviews.jsx
git commit -m "feat: add ProductReviews component with modal form and rating summary"
```

---

### Task 9: Integrate ReviewCarousel on Suncream & Sunglasses Pages

**Files:**
- Modify: `frontend/app/suncream/page.js`
- Modify: `frontend/app/sunglasses/page.js`

- [ ] **Step 1: Add ReviewCarousel to suncream page**

In `frontend/app/suncream/page.js`, add the import at the top:

```javascript
import ReviewCarousel from '@/components/ReviewCarousel';
```

Then add `<ReviewCarousel page="suncream" />` just before the existing `<ReviewForm />` component (before line 113):

```jsx
            {/* Customer Reviews Carousel */}
            <ReviewCarousel page="suncream" />

            {/* Review Form */}
            <ReviewForm page="suncream" />
```

- [ ] **Step 2: Add ReviewCarousel to sunglasses page**

In `frontend/app/sunglasses/page.js`, add the import at the top:

```javascript
import ReviewCarousel from '@/components/ReviewCarousel';
```

Then add `<ReviewCarousel page="sunglasses" />` just before the existing `<ReviewForm />` component:

```jsx
            {/* Customer Reviews Carousel */}
            <ReviewCarousel page="sunglasses" />

            {/* Review Form */}
            <ReviewForm page="sunglasses" />
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/suncream/page.js frontend/app/sunglasses/page.js
git commit -m "feat: add ReviewCarousel to suncream and sunglasses pages"
```

---

### Task 10: Integrate ProductReviews on Product Detail Page

**Files:**
- Modify: `frontend/app/products/[slug]/page.js`

- [ ] **Step 1: Add ProductReviews import**

At the top of `frontend/app/products/[slug]/page.js`, add:

```javascript
import ProductReviews from '@/components/ProductReviews';
```

- [ ] **Step 2: Replace the reviews tab content**

Find the reviews tab content block (lines 346-366). Replace the entire `{activeTab === 'reviews' && (...)}` block with:

```jsx
            {activeTab === 'reviews' && (
              <ProductReviews productId={product._id} />
            )}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/products/[slug]/page.js
git commit -m "feat: replace embedded reviews with ProductReviews component on product detail page"
```

---

### Task 11: Add Admin Reviews Page

**Files:**
- Create: `frontend/app/admin/reviews/page.js`

- [ ] **Step 1: Create the admin reviews page**

Create `frontend/app/admin/reviews/page.js`:

```jsx
'use client';

import { useEffect, useState } from 'react';
import { reviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

const TABS = ['all', 'pending', 'approved', 'rejected'];

function StarDisplay({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => { fetchReviews(); }, [activeTab]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await reviewAPI.getAll({ status: activeTab });
            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await reviewAPI.approve(id);
            toast.success('Review approved');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to approve review');
        }
    };

    const handleReject = async (id) => {
        try {
            await reviewAPI.reject(id);
            toast.success('Review rejected');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to reject review');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this review?')) return;
        try {
            await reviewAPI.delete(id);
            toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const getSourceLabel = (review) => {
        if (review.productId) {
            return review.productId.name || 'Product';
        }
        if (review.page) {
            return review.page.charAt(0).toUpperCase() + review.page.slice(1) + ' Page';
        }
        return 'General';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Review Management</h1>

            {/* Status Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No {activeTab !== 'all' ? activeTab : ''} reviews found.</div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="bg-white border rounded-lg p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span className="font-semibold text-gray-900">{review.name}</span>
                                        <span className="text-xs text-gray-400">{review.email}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[review.status]}`}>
                                            {review.status}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                            {getSourceLabel(review)}
                                        </span>
                                    </div>
                                    <StarDisplay rating={review.rating} />
                                    {review.title && <h4 className="font-medium text-gray-900 mt-2">{review.title}</h4>}
                                    <p className="text-gray-600 text-sm mt-1">{review.review}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(review.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                    {review.status !== 'approved' && (
                                        <button onClick={() => handleApprove(review._id)}
                                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors">
                                            Approve
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button onClick={() => handleReject(review._id)}
                                            className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors">
                                            Reject
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(review._id)}
                                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/admin/reviews/page.js
git commit -m "feat: add admin reviews management page with approve/reject/delete"
```

---

### Task 12: Add Reviews to Admin Sidebar

**Files:**
- Modify: `frontend/components/admin/Sidebar.jsx`

- [ ] **Step 1: Add StarIcon SVG**

In `frontend/components/admin/Sidebar.jsx`, add this icon component after the existing icon components (after `ChartBarIcon`, before `XIcon` around line 38):

```jsx
const StarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
```

- [ ] **Step 2: Add Reviews to NAV_ITEMS**

In the `NAV_ITEMS` array (line 51-57), add the Reviews entry after Analytics:

```javascript
const NAV_ITEMS = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/products', label: 'Products', icon: ShoppingBagIcon },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
    { href: '/admin/customers', label: 'Customers', icon: UsersIcon },
    { href: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
    { href: '/admin/reviews', label: 'Reviews', icon: StarIcon },
];
```

- [ ] **Step 3: Commit**

```bash
git add frontend/components/admin/Sidebar.jsx
git commit -m "feat: add Reviews link to admin sidebar navigation"
```

---

### Task 13: Final Verification

- [ ] **Step 1: Verify backend starts without errors**

Run: `cd backend && node -e "require('./models/Review'); require('./models/Product'); console.log('Models loaded OK')"`
Expected: `Models loaded OK`

- [ ] **Step 2: Verify frontend builds without errors**

Run: `cd frontend && npx next build`
Expected: Build completes without errors

- [ ] **Step 3: Manual testing checklist**

1. Submit a review on suncream page — should show success message with "after approval" text
2. Submit a review on a product detail page via "Write a Review" modal
3. Go to admin panel → Reviews → see pending reviews
4. Approve a review → verify it appears on the correct page/product
5. Reject a review → verify it disappears from public view
6. Delete a review → verify it's gone from admin too
7. Check product detail page shows correct average rating after approving a product review

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: unified review system complete — all pages integrated"
```
