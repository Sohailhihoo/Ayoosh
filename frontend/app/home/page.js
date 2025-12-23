'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import NewsletterPopup from '@/components/NewsletterPopup';

/**
 * HomePage Component
 * 
 * Main landing page featuring:
 * - Hero section with video background
 * - Premium luxury styling with gradients
 * 
 * @returns {JSX.Element} The home page component
 */
export default function HomePage() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHoveringHero, setIsHoveringHero] = useState(false);
    const heroRef = useRef(null);

    /**
     * Custom cursor tracking for hero section
     */
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const isInHero = (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                );
                setIsHoveringHero(isInHero);
                if (isInHero) {
                    setCursorPos({ x: e.clientX, y: e.clientY });
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const leftVideoRef = useRef(null);
    const centerVideoRef = useRef(null);
    const rightVideoRef = useRef(null);

    const handleMouseEnter = (ref) => {
        if (ref.current) {
            ref.current.play().catch(e => console.log('Video play failed:', e));
        }
    };

    const handleMouseLeave = (ref) => {
        if (ref.current) {
            ref.current.pause();
        }
    };

    return (
        <div className="bg-white">
            {/* Newsletter Popup */}
            <NewsletterPopup />

            {/* Custom Cursor for Hero */}
            {isHoveringHero && (
                <div
                    className="fixed pointer-events-none z-50 transition-transform duration-100 ease-out"
                    style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs font-light tracking-[0.2em] uppercase">
                            Explore
                        </span>
                    </div>
                </div>
            )}

            {/* Split-Screen Hero Section - 3 Panels */}
            <section
                ref={heroRef}
                className="relative h-screen min-h-[600px] flex flex-col md:flex-row"
                aria-label="Hero section"
            >
                {/* Left Panel - Skincare */}
                <Link
                    href="/beauty"
                    className="relative w-full md:w-1/3 h-1/3 md:h-full overflow-hidden group cursor-none block"
                    aria-label="Shop skincare collection"
                    onMouseEnter={() => handleMouseEnter(leftVideoRef)}
                    onMouseLeave={() => handleMouseLeave(leftVideoRef)}
                >
                    {/* Video Background */}
                    <video
                        ref={leftVideoRef}
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.3] group-hover:brightness-110 grayscale group-hover:grayscale-0"
                        aria-label="Skincare collection video"
                    >
                        <source src="/videos/hero-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-slate-800/80 group-hover:bg-slate-700/60 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-4 md:px-6 lg:px-8 pb-8 md:pb-12 pointer-events-none">
                        <div className="max-w-md relative z-10">
                            {/* Decorative Line */}
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent mx-auto mb-6 group-hover:w-20 transition-all duration-500"></div>

                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-widest text-white mb-2 drop-shadow-lg group-hover:tracking-[0.3em] transition-all duration-700">
                                <span className="block text-white">Skincare</span>
                            </h2>

                            <p className="text-sm text-gray-200/70 tracking-[0.2em] uppercase mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                Discover Collection
                            </p>

                            {/* Animated Arrow */}
                            <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span className="inline-block text-gray-200 text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
                </Link>

                {/* Center Panel - SkinBooster */}
                <Link
                    href="/products"
                    className="relative w-full md:w-1/3 h-1/3 md:h-full overflow-hidden group cursor-none block"
                    aria-label="Shop new arrivals"
                    onMouseEnter={() => handleMouseEnter(centerVideoRef)}
                    onMouseLeave={() => handleMouseLeave(centerVideoRef)}
                >
                    {/* Video Background */}
                    <video
                        ref={centerVideoRef}
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.3] group-hover:brightness-110 grayscale group-hover:grayscale-0"
                        aria-label="New arrivals video"
                    >
                        <source src="/videos/2.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-slate-700/70 group-hover:bg-slate-600/50 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-4 md:px-6 lg:px-8 pb-8 md:pb-12 pointer-events-none">
                        <div className="max-w-md relative z-10">
                            {/* Decorative Line */}
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent mx-auto mb-6 group-hover:w-20 transition-all duration-500"></div>

                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-widest text-white mb-2 drop-shadow-lg group-hover:tracking-[0.3em] transition-all duration-700">
                                <span className="block text-gray-100">SkinBooster</span>
                            </h2>

                            <p className="text-sm text-gray-200/70 tracking-[0.2em] uppercase mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                View Products
                            </p>

                            {/* Animated Arrow */}
                            <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span className="inline-block text-gray-200 text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
                </Link>

                {/* Right Panel - Accessories */}
                <Link
                    href="/products?productType=accessories"
                    className="relative w-full md:w-1/3 h-1/3 md:h-full overflow-hidden group cursor-none block"
                    aria-label="Shop accessories collection"
                    onMouseEnter={() => handleMouseEnter(rightVideoRef)}
                    onMouseLeave={() => handleMouseLeave(rightVideoRef)}
                >
                    {/* Video Background */}
                    <video
                        ref={rightVideoRef}
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.3] group-hover:brightness-110 grayscale group-hover:grayscale-0"
                        aria-label="Accessories collection video"
                    >
                        <source src="/videos/hero-video.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-slate-800/80 group-hover:bg-slate-700/60 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end items-center text-center px-4 md:px-6 lg:px-8 pb-8 md:pb-12 pointer-events-none">
                        <div className="max-w-md relative z-10">
                            {/* Decorative Line */}
                            <div className="w-12 h-px bg-gradient-to-r from-transparent via-gray-300/60 to-transparent mx-auto mb-6 group-hover:w-20 transition-all duration-500"></div>

                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-widest text-white mb-2 drop-shadow-lg group-hover:tracking-[0.3em] transition-all duration-700">
                                <span className="block text-white">Accessories</span>
                            </h2>

                            <p className="text-sm text-gray-200/70 tracking-[0.2em] uppercase mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                Shop Now
                            </p>

                            {/* Animated Arrow */}
                            <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <span className="inline-block text-gray-200 text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                            </div>
                        </div>
                    </div>

                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
                </Link>

                {/* Centered Logo */}
                <div className="absolute left-1/2 top-4 transform -translate-x-1/2 z-20 pointer-events-none">
                    <img
                        src="/images/brand/logo3.png"
                        alt="Ayush Logo"
                        className="h-16 md:h-32 lg:h-40 w-auto object-contain brightness-110 contrast-110 drop-shadow-[0_4px_30px_rgba(255,255,255,0.8)]"
                        style={{ animation: 'pulse 3s ease-in-out infinite' }}
                    />
                </div>

            </section>

        </div>
    );
}