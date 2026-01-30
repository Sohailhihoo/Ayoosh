'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import SunglassesCircle from '@/components/SunglassesCircle';
import BrandLogos from '@/components/BrandLogos';
import TestimonialSection from '@/components/TestimonialSection';

// Hero configuration
const heroTitleStyle = {
    fontFamily: "'Tan Pearl', serif",
    fontWeight: 400,
    fontSize: 'clamp(28px, 4vw, 48px)',
    lineHeight: '1.2',
    letterSpacing: '0.02em'
};

const heroButtons = [
    { href: '/products?productType=sunglasses', label: 'Shop Now', variant: 'primary', color: '#0077b6' },
];

export default function SunglassesPage() {
    return (
        <div className="min-h-screen bg-[#f4f2f0]">
            {/* Hero Section */}
            <HeroSection
                videoSrc="/videos/sunglasses/sunglasses.mp4"
                title="The Perspective Range"
                titleStyle={heroTitleStyle}
                buttons={heroButtons}
                overlayOpacity={0}
                align="bottom-right"
            />

            {/* Circular Showcase */}
            <SunglassesCircle />

            {/* Introduction Section */}
            <section className="py-20 md:py-28 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                        className="text-sm tracking-[0.3em] text-[#b87c6b] uppercase font-medium mb-4 block"
                    >
                        Premium Eyewear
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-sans font-light mb-6 text-gray-900"
                    >
                        Style Meets <span className="text-[#b87c6b] italic">Protection</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-gray-600 leading-relaxed max-w-2xl mx-auto"
                    >
                        Discover our collection of premium sunglasses designed to complement your style
                        while providing superior UV protection. Crafted with precision and elegance.
                    </motion.p>
                </div>
            </section>

            {/* Coming Soon Banner */}
            <section className="py-20 md:py-28 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-sm tracking-[0.3em] text-[#d4a574] uppercase font-medium mb-4 block">
                            New Collection
                        </span>

                        <h2 className="text-4xl md:text-6xl font-sans font-light mb-6">
                            Coming <span className="text-[#d4a574] italic">Soon</span>
                        </h2>

                        <p className="text-gray-400 max-w-lg mx-auto mb-8">
                            Our exclusive sunglasses collection is in the works.
                            Be the first to know when we launch.
                        </p>

                        {/* Animated dots */}
                        <div className="flex items-center justify-center gap-2">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-[#d4a574]"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                                className="w-2 h-2 rounded-full bg-[#b87c6b]"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                            />
                            <motion.div
                                className="w-2 h-2 rounded-full bg-[#d4a574]"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Brand Logos */}
            <BrandLogos />

            {/* Testimonials */}
            <TestimonialSection />
        </div>
    );
}
