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
        <section className="py-10 md:py-16 px-4 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div className="text-center mb-8 md:mb-10" initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 0.5 }}>
                    <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 tracking-wider">What Our Customers Say</h2>
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
                                className="flex-shrink-0 w-[260px] md:w-[350px] snap-start bg-[#fefce8] rounded-xl p-5 md:p-6 shadow-sm"
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
