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
                            </div>
                            {review.title && <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>}
                            <p className="text-gray-600">{review.review}</p>
                            {review.image && (
                                <img src={review.image} alt="Review" className="mt-3 w-20 h-20 object-cover rounded-lg border border-gray-100" />
                            )}
                            <p className="text-sm font-medium text-gray-800 mt-2">{review.name}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
