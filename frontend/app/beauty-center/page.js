'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * BeautyCenterPage Component
 * 
 * Luxury beauty center landing page featuring:
 * - Video background with warm overlay
 * - Custom navigation bar
 * - Service category tags
 * - Product/service cards carousel
 */
export default function BeautyCenterPage() {
    const [activeSlide, setActiveSlide] = useState(1);
    const videoRef = useRef(null);

    const services = [
        { name: 'Anti-Aging', icon: '✦' },
        { name: 'Wrinkle Care', icon: '✦' },
        { name: 'Skin Renewal', icon: '✦' },
        { name: 'Collagen Boost', icon: '✦' },
        { name: 'Youth Serum', icon: '✦' },
    ];

    const productCards = [
        {
            id: 1,
            title: 'Retinol Serum',
            description: 'Advanced formula to reduce fine lines and restore youthful radiance',
            image: '/images/retinol-serum.jpg',
        },
        {
            id: 2,
            title: 'Night Repair',
            description: 'Overnight treatment for deep wrinkle reduction and skin renewal',
            image: '/images/night-repair.jpg',
        },
    ];

    const nextSlide = () => {
        setActiveSlide((prev) => (prev < 4 ? prev + 1 : 1));
    };

    const prevSlide = () => {
        setActiveSlide((prev) => (prev > 1 ? prev - 1 : 4));
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Video Background */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/videos/4.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Content Container */}
            <div className="relative z-10 min-h-screen flex flex-col">

                {/* Custom Navigation Bar */}
                <nav className="flex items-center justify-between px-8 pt-8 pb-6">
                    {/* Left - Menu & Nav Links */}
                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/beauty-center"
                                className="px-6 py-2.5 bg-white rounded-full text-sm font-medium text-gray-800 shadow-sm hover:shadow-md transition-all"
                            >
                                Home
                            </Link>
                            <Link
                                href="/products"
                                className="px-6 py-2.5 bg-[#F6C811] rounded-full text-sm font-medium text-gray-800 hover:bg-[#e5b810] transition-colors"
                            >
                                Category
                            </Link>
                            <Link
                                href="/about"
                                className="px-6 py-2.5 bg-[#F6C811] rounded-full text-sm font-medium text-gray-800 hover:bg-[#e5b810] transition-colors"
                            >
                                About us
                            </Link>
                        </div>
                    </div>

                    {/* Center - Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/beauty-center">
                            <img
                                src={ASSETS.logos.final}
                                alt="Ayoosh logo"
                                className="h-24 w-auto object-contain"
                            />
                        </Link>
                    </div>

                    {/* Right - Icons */}
                    <div className="flex items-center gap-3">
                        <button className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <button className="w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                        <button className="w-11 h-11 rounded-full border border-gray-400 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </button>
                    </div>
                </nav>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row px-8 lg:px-16 pb-8">

                    {/* Left Content - Headlines & Tags */}
                    <div className="lg:w-1/2 flex flex-col justify-center">
                        {/* Main Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            <span className="text-[#F6C811]">Turn Back Time</span> with
                            <br />Premium <span className="text-gray-900">Anti-Aging</span>
                            <br /><span className="text-gray-900">Solutions</span>
                        </h1>

                        {/* Subtext */}
                        <p className="text-gray-600 text-sm md:text-base max-w-md mb-8 leading-relaxed">
                            Discover the secret to youthful, radiant skin with our scientifically advanced anti-aging formulas. Reduce wrinkles, restore elasticity, and reveal your most beautiful self.
                        </p>

                        {/* Service Tags */}
                        <div className="flex flex-wrap gap-3 mt-auto mb-8">
                            {services.map((service, index) => (
                                <button
                                    key={index}
                                    className="flex items-center gap-2 px-5 py-3 bg-[#F6C811] text-gray-800 rounded-full text-sm font-medium hover:bg-[#e5b810] transition-colors shadow-md"
                                >
                                    <span className="text-xs">{service.icon}</span>
                                    {service.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Gallery Button & Cards */}
                    <div className="lg:w-1/2 flex flex-col justify-between items-end">

                        {/* Gallery View Button */}
                        <div className="flex items-center gap-3 mb-8">
                            <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors shadow-lg">
                                <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                            <span className="text-gray-700 text-sm font-medium">
                                Gallery<br />View
                            </span>
                        </div>

                        {/* Product Cards */}
                        <div className="flex gap-4 mb-8">
                            {/* Retinol Serum Card */}
                            <div className="relative w-48 bg-[#e8d4c8] rounded-3xl overflow-hidden shadow-lg group">
                                <div className="absolute top-3 right-3 z-10">
                                    <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="h-32 bg-gradient-to-br from-[#d4b8a8] to-[#c9a89a] flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-[#c4a090] flex items-center justify-center overflow-hidden">
                                        <span className="text-3xl">✨</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-[#F6C811] font-semibold text-lg mb-1">Retinol Serum</h3>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        Advanced formula to reduce fine lines and restore radiance
                                    </p>
                                </div>
                            </div>

                            {/* Night Repair Card */}
                            <div className="relative w-48 bg-[#d4b8a8] rounded-3xl overflow-hidden shadow-lg group">
                                <div className="absolute top-3 right-3 z-10">
                                    <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="h-32 bg-gradient-to-br from-[#c9a89a] to-[#b89485] flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-xl bg-[#e8d4c8] flex items-center justify-center">
                                        <span className="text-2xl">🌙</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-lg mb-1">Night Repair</h3>
                                    <p className="text-gray-200 text-xs leading-relaxed">
                                        Overnight treatment for deep wrinkle reduction
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Carousel Pagination */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-800 font-semibold text-lg">
                                    {String(activeSlide).padStart(2, '0')}
                                </span>
                                <div className="w-24 h-0.5 bg-gray-400 relative">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gray-800 transition-all duration-300"
                                        style={{ width: `${(activeSlide / 4) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-gray-400 font-medium">04</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevSlide}
                                    className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:bg-white/30 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
