'use client';

import { motion } from 'framer-motion';
import { useRef } from 'react';

// Phase 1: The Data Structure
const reviews = [
    {
        id: 1,
        name: "Elena Rodriguez",
        location: "Miami, FL",
        rating: 5,
        headline: "Instant Glow-Up!",
        body: "I've tried everything, but this serum is the only thing that gave me that glass-skin look within a week. It's not just hype.",
        verified: true,
        product: "Ayoosh Sunscreen",
        avatar: "https://i.pravatar.cc/150?u=Elena"
    },
    {
        id: 2,
        name: "Sarah Chen",
        location: "San Francisco, CA",
        rating: 5,
        headline: "Obsessed with the texture",
        body: "The texture is divine and it absorbs instantly. Finally found a routine that works for my sensitive skin.",
        verified: true,
        product: "Ayoosh Sunscreen",
        avatar: "https://i.pravatar.cc/150?u=Sarah"
    },
    {
        id: 3,
        name: "Jessica Thomas",
        location: "London, UK",
        rating: 5,
        headline: "Worth every penny",
        body: "I was skeptical at first, but the results speak for themselves. My skin feels plumper and more hydrated than ever.",
        verified: true,
        product: "Ayoosh Sunscreen",
        avatar: ""
    },
    {
        id: 4,
        name: "Micah Johnson",
        location: "New York, NY",
        rating: 5,
        headline: "A game changer",
        body: "Simple effective, and luxurious. The packaging is beautiful but the formula is the real star here.",
        verified: true,
        product: "Ayoosh Sunscreen",
        avatar: "https://i.pravatar.cc/150?u=Micah"
    }
];

// Helper for Stars
const StarRating = ({ rating }) => (
    <div className="flex gap-1 text-[#b87c6b]"> {/* Muted Gold/Brand Color */}
        {[...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-300 fill-current'}`}
                viewBox="0 0 24 24"
            >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ))}
    </div>
);

// Review Card Component (The Child)
function ReviewCard({ review }) {
    const initials = review.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 w-[300px] md:w-[350px] p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm snap-center space-y-4"
        >
            {/* Top: Header w/ Stars */}
            <div className="flex justify-between items-start">
                <StarRating rating={review.rating} />
                {review.product && (
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                        {review.product}
                    </span>
                )}
            </div>

            {/* Middle: Content */}
            <div className="space-y-2 min-h-[100px]">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">"{review.headline}"</h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {review.body}
                </p>
            </div>

            {/* Bottom: Use Profile */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#fdf6f0] flex items-center justify-center overflow-hidden shrink-0 text-[#b87c6b] font-bold text-sm">
                    {review.avatar ? (
                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900">{review.name}</span>
                        {review.verified && (
                            <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        )}
                    </div>
                    {review.verified && (
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Verified Buyer • {review.location}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Testimonial Section (The Parent)
export default function TestimonialSection() {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-24 bg-[#f4f2f0] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="text-[#b87c6b] tracking-[0.2em] text-xs font-bold uppercase mb-3 block">
                        Community Love
                    </span>
                    <h2 className="text-3xl md:text-4xl font-sans text-gray-900">
                        Loved by 10,000+ Beautiful Customers
                    </h2>
                </motion.div>

                {/* Carousel Container */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="relative group" // Added group for hover effects on arrows
                >
                    {/* Left Arrow Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                        aria-label="Scroll left"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Right Arrow Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                        aria-label="Scroll right"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Items Wrapper - Horizontal Scroll */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-8 pt-2 px-4 snap-x cursor-grab active:cursor-grabbing no-scrollbar scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>

                    {/* Fade Masks for Scroll Hint */}
                    <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#f9f9f9] to-transparent pointer-events-none md:hidden" />
                </motion.div>

            </div>
        </section>
    );
}
