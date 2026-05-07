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
