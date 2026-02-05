'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ReviewForm - Component for users to submit their reviews
 */
export default function ReviewForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        review: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Review submitted:', formData);
            setSubmitSuccess(true);
            setIsSubmitting(false);

            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({ name: '', email: '', rating: 5, review: '' });
                setSubmitSuccess(false);
            }, 2000);
        }, 1000);
    };

    return (
        <section className="py-20 px-6 md:px-12 bg-white">
            <div className="max-w-3xl mx-auto">
                {/* Section Title */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">Share Your Experience</h2>
                    <p className="text-gray-600 text-lg">We'd love to hear what you think about our products</p>
                </motion.div>

                {/* Review Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            placeholder="your.email@example.com"
                        />
                    </div>

                    {/* Rating Field */}
                    <div>
                        <label htmlFor="rating" className="block text-sm font-semibold text-gray-700 mb-2">
                            Rating *
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <svg
                                        className={`w-8 h-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                            <span className="ml-3 text-gray-600 font-medium">{formData.rating} / 5</span>
                        </div>
                    </div>

                    {/* Review Text Field */}
                    <div>
                        <label htmlFor="review" className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Review *
                        </label>
                        <textarea
                            id="review"
                            name="review"
                            value={formData.review}
                            onChange={handleChange}
                            required
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                            placeholder="Tell us about your experience with our products..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isSubmitting || submitSuccess}
                            className={`px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${submitSuccess
                                    ? 'bg-green-500 text-white'
                                    : 'bg-black text-white hover:bg-gray-800'
                                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitSuccess ? '✓ Review Submitted!' : isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>

                    {/* Success Message */}
                    {submitSuccess && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                            <p className="text-green-700 font-medium">Thank you for your review! We appreciate your feedback.</p>
                        </motion.div>
                    )}
                </motion.form>
            </div>
        </section>
    );
}
