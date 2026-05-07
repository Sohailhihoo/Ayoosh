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
