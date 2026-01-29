'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * ProductScroller - Immersive Scrollytelling Experience
 * Optimized for Mobile & Desktop
 */
export default function ProductScroller() {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // --- Animations ---

    // Product Rotation: Tilt Left -> Face Front (Zoom) -> Tilt Right
    const productRotate = useTransform(
        scrollYProgress,
        [0, 0.2, 0.5, 0.8, 1],
        [0, -10, 0, 10, 0]
    );

    // Product Scale: Normal -> Zoom In -> Normal
    const productScale = useTransform(
        scrollYProgress,
        [0, 0.2, 0.5, 0.8, 1],
        [1, 1, 1.2, 1, 1]
    );

    // Card Opacities - Sequential fade in/out
    const card1Opacity = useTransform(scrollYProgress, [0.1, 0.15, 0.25, 0.3], [0, 1, 1, 0]);
    const card2Opacity = useTransform(scrollYProgress, [0.4, 0.45, 0.55, 0.6], [0, 1, 1, 0]);
    const card3Opacity = useTransform(scrollYProgress, [0.7, 0.75, 0.85, 0.9], [0, 1, 1, 0]);

    // Card Y-Position - Slight parallax drift up
    const cardY = useTransform(scrollYProgress, [0, 1], [50, -50]);

    // Data for the story steps
    const steps = [
        {
            id: 1,
            badge: "The Formula",
            badgeColor: "text-[#b87c6b] bg-[#b87c6b]/10",
            title: "Pure & Potent",
            text: "Infused with 5% Niacinamide and organic botanical extracts to brighten and even out skin tone.",
            opacity: card1Opacity,
            position: "right" // Desktop position
        },
        {
            id: 2,
            badge: "The Texture",
            badgeColor: "text-blue-600 bg-blue-500/10",
            title: "Lightweight Glow",
            text: "A non-greasy, water-gel texture that absorbs instantly, leaving a dewy glass-skin finish.",
            opacity: card2Opacity,
            position: "left"
        },
        {
            id: 3,
            badge: "The Impact",
            badgeColor: "text-emerald-600 bg-emerald-500/10",
            title: "Sustainable Beauty",
            text: "Packaged in 100% recycled glass with a refillable pod system to minimize plastic waste.",
            opacity: card3Opacity,
            position: "right"
        }
    ];

    return (
        <section
            ref={containerRef}
            className="relative h-[300vh] bg-gradient-to-b from-[#fdf8f5] via-[#fff5f0] to-[#fdf8f5]"
        >
            {/* Sticky Viewport */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center">

                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#f8e1d9]/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e8c4b8]/30 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Main Product Stage */}
                <div className="relative z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl px-6 flex justify-center mb-0 md:mb-12">
                    <motion.div
                        style={{
                            rotate: productRotate,
                            scale: productScale,
                        }}
                        className="relative"
                    >
                        {/* Product Glow */}
                        <div className="absolute inset-0 top-1/2 -translate-y-1/2 bg-white/40 blur-3xl rounded-full scale-110 pointer-events-none" />

                        <img
                            src={ASSETS.homepage.rejoosh}
                            alt="Rejoosh Star Product"
                            className="w-auto h-[350px] md:h-[500px] object-contain drop-shadow-2xl relative z-10"
                        />
                    </motion.div>
                </div>

                {/* Scrollytelling Cards Layer - Absolute Positioned over sticky view */}
                <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    <div className="max-w-7xl mx-auto h-full relative">
                        {steps.map((step) => (
                            <motion.div
                                key={step.id}
                                style={{
                                    opacity: step.opacity,
                                    y: cardY,
                                }}
                                className={`
                                    absolute top-1/2 -translate-y-1/2 
                                    w-[85%] md:w-80 lg:w-96
                                    left-1/2 -translate-x-1/2  /* Default Mobile: Centered */
                                    md:left-auto md:translate-x-0 /* Reset for Desktop */
                                    ${step.position === 'left'
                                        ? 'md:left-12 lg:left-24'
                                        : 'md:right-12 lg:right-24 md:left-auto'
                                    }
                                    p-6 md:p-8
                                    bg-white/70 backdrop-blur-xl rounded-3xl 
                                    border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)]
                                    flex flex-col gap-3 md:gap-4
                                    transition-colors duration-300
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] md:text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full ${step.badgeColor}`}>
                                        {step.badge}
                                    </span>
                                    <div className="h-px flex-1 bg-black/5" />
                                </div>

                                <h3 className="text-2xl md:text-3xl font-serif text-gray-900 leading-tight">
                                    {step.title}
                                </h3>

                                <p className="text-sm md:text-base text-gray-600 leading-relaxed font-light">
                                    {step.text}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: useTransform(scrollYProgress, [0.9, 1], [1, 0]) }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
                >
                    <div className="w-[1px] h-12 bg-gray-300/50 relative overflow-hidden">
                        <motion.div
                            style={{ top: useTransform(scrollYProgress, [0, 1], ['-100%', '100%']) }}
                            className="absolute left-0 w-full h-1/2 bg-gray-800"
                        />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Scroll</span>
                </motion.div>

            </div>
        </section>
    );
}
