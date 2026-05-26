'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('newsletterPopupSeen');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
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
            const response = await api.post('/newsletter/subscribe', { email });
            const data = response.data;

            if (data.success) {
                setIsSubmitted(true);
                sessionStorage.setItem('newsletterPopupSeen', 'true');
            } else {
                console.error('Subscription failed:', data.message);
                alert(data.message || 'Something went wrong');
                setIsSubmitting(false);
                return;
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Failed to subscribe. Please try again.');
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        setTimeout(() => setIsVisible(false), 3000);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Popup Card */}
            <div className="relative max-w-md w-full overflow-hidden animate-fade-in rounded-2xl shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-all"
                    aria-label="Close popup"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1779809171/THE_AYOOSH_CIRCLE_newsletter_ghg90k.png"
                    alt="The Ayoosh Circle"
                    className="w-full block"
                />

                {/* Content */}
                <div className="bg-white px-8 py-8">
                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-7 space-y-3">
                                <p className="text-[#F6C811] text-sm tracking-[0.2em] uppercase font-semibold">
                                    Look good. Do good. Feel good. Together.
                                </p>
                                <p className="text-gray-600 leading-relaxed text-[15px]">
                                    Be part of the Ayoosh community. Subscribe for early access to premium Korean skincare, sales, sustainable lifestyle rewards, and a healthier, happier you.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email address"
                                    required
                                    className="w-full px-5 py-4 bg-[#fafaf8] border border-gray-200 rounded-xl focus:outline-none focus:border-[#e8749e] focus:ring-2 focus:ring-[#e8749e]/20 transition-all text-gray-800 placeholder-gray-400 text-sm"
                                />

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-[#1a1a1a] text-white text-sm font-medium tracking-[0.2em] rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'JOINING...' : 'JOIN THE CIRCLE'}
                                </button>
                            </form>

                            <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
                                By signing up, you agree to receive marketing emails. Unsubscribe anytime.
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-[#F6C811]/15 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-[#F6C811]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3
                                className="text-xl text-gray-800 mb-2"
                                style={{ fontFamily: "'Tan Pearl', serif" }}
                            >
                                Welcome to the Circle!
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Glow together, grow together. We&apos;ll be in touch with early access and exclusive rewards.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
