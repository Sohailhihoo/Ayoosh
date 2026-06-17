'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export default function ReviewForm({ page, productId, isModal = false, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        rating: 5,
        title: '',
        review: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('email', formData.email);
            fd.append('rating', formData.rating);
            fd.append('title', formData.title);
            fd.append('review', formData.review);
            if (page) fd.append('page', page);
            if (productId) fd.append('productId', productId);
            if (imageFile) fd.append('image', imageFile);

            const res = await fetch(`${API_URL}/reviews`, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.success) {
                setSubmitSuccess(true);
                setTimeout(() => {
                    setFormData({ name: '', email: '', rating: 5, title: '', review: '' });
                    setImageFile(null);
                    setImagePreview(null);
                    setSubmitSuccess(false);
                    if (onSuccess) onSuccess();
                    if (onClose) onClose();
                }, 2000);
            } else {
                toast.error(data.message || 'Failed to submit review. Please try again.');
            }
        } catch (error) {
            console.error('Review submission failed:', error);
            toast.error('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                    <label htmlFor="review-name" className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                    <input type="text" id="review-name" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="Your name" />
                </div>
                <div>
                    <label htmlFor="review-email" className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input type="email" id="review-email" name="email" value={formData.email} onChange={handleChange} required
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        placeholder="your.email@example.com" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating *</label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none transition-transform hover:scale-110">
                            <svg className={`w-7 h-7 md:w-8 md:h-8 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 font-medium">{formData.rating} / 5</span>
                </div>
            </div>

            <div>
                <label htmlFor="review-title" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input type="text" id="review-title" name="title" value={formData.title} onChange={handleChange}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="Sum up your experience" />
            </div>

            <div>
                <label htmlFor="review-text" className="block text-sm font-semibold text-gray-700 mb-1">Review *</label>
                <textarea id="review-text" name="review" value={formData.review} onChange={handleChange} required rows={3}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your experience..." />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Photo <span className="font-normal text-gray-400">(optional)</span></label>
                {imagePreview ? (
                    <div className="flex items-center gap-3">
                        <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <button type="button" onClick={removeImage}
                            className="text-xs text-red-500 hover:text-red-700 underline">Remove</button>
                    </div>
                ) : (
                    <label className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer transition-colors">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 19v-2.5M16.5 8L12 3.5 7.5 8M12 3.5v13" />
                        </svg>
                        Add a photo
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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
                    className="text-center p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium text-sm">Thank you! Your review will be visible after approval.</p>
                </motion.div>
            )}
        </form>
    );

    if (isModal) return formContent;

    return (
        <section className="py-12 md:py-20 px-4 md:px-12 bg-white">
            <div className="max-w-3xl mx-auto">
                <motion.div className="text-center mb-8 md:mb-12" initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.6 }}>
                    <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 tracking-wider">Share Your Experience</h2>
                    <p className="text-gray-600 text-sm md:text-lg">We&apos;d love to hear what you think about our products</p>
                </motion.div>
                {formContent}
            </div>
        </section>
    );
}
