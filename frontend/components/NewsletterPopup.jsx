'use client';

import { useState, useEffect } from 'react';

// Inline SVG icon to avoid react-icons module issues
const XIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/**
 * NewsletterPopup Component
 * 
 * A beautiful popup that appears when users first visit the site,
 * offering them a discount in exchange for their email subscription.
 */
export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        // Check if user has already seen or dismissed the popup in this session
        const hasSeenPopup = sessionStorage.getItem('newsletterPopupSeen');

        if (!hasSeenPopup) {
            // Show popup after a short delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('newsletterPopupSeen', 'true');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
                sessionStorage.setItem('newsletterPopupSeen', 'true');
                // Could store coupon in state to display it
            } else {
                // Handle error (maybe show toast or inline error)
                console.error('Subscription failed:', data.message);
                // For now, still close/show success to not block user, or show alert
                alert(data.message || 'Something went wrong');
                setIsSubmitting(false); // Re-enable button on error
                return;
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Failed to subscribe. Please try again.');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);

        // Close popup after showing success message
        setTimeout(() => {
            setIsVisible(false);
        }, 3000);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Popup Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close popup"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                {/* Decorative Header */}
                <div className="bg-gradient-to-r from-[#F6C811] to-[#d4a90e] py-8 px-6 text-center">
                    <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm tracking-widest mb-3">
                        EXCLUSIVE OFFER
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        FREE DELIVERY
                    </h2>
                    <p className="text-white/90 text-lg">
                        For the First 50 Customers
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {!isSubmitted ? (
                        <>
                            <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                Get free delivery for the first 50 customers by applying code{' '}
                                <span className="font-bold text-[#4a4a4a]">AYOOSH50</span> at checkout.
                                Subscribe to be the first to know!
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="w-full px-5 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#F6C811] focus:ring-2 focus:ring-[#F6C811]/20 transition-all text-gray-800 placeholder-gray-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-[#4a4a4a] text-white font-medium tracking-widest rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
                                </button>
                            </form>

                            <p className="text-center text-xs text-gray-400 mt-4">
                                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Welcome to the Family!
                            </h3>
                            <p className="text-gray-600 mb-2">
                                Use code <span className="font-bold text-[#4a4a4a]">AYOOSH50</span> at checkout for free delivery.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
