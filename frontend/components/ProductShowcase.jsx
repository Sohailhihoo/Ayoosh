'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import Image from 'next/image';
import { ASSETS } from '@/lib/cloudinary-assets';
import cloudinaryLoader from '@/lib/cloudinary-loader';

export default function ProductScrollShowcase() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // 1. PHYSICS: Add 'Spring' physics so movement feels heavy and premium
    const smoothProgress = useSpring(scrollYProgress, { damping: 15, stiffness: 100 });

    // 2. SCROLL ANIMATIONS
    // Bottle rotates from angled to straight
    const rotate = useTransform(smoothProgress, [0, 0.6], [15, 0]);
    // Bottle grows
    const scale = useTransform(smoothProgress, [0, 0.6], [0.85, 1.1]);
    // Bottle slides slightly to the right to make room for text
    const xBottle = useTransform(smoothProgress, [0, 0.5], [0, 100]);

    // 3. FLOATING CARDS PARALLAX (They move at different speeds!)
    const yCard1 = useTransform(smoothProgress, [0, 1], [100, -100]); // Moves Up
    const yCard2 = useTransform(smoothProgress, [0, 1], [200, -50]);  // Moves Up Slower
    const yCard3 = useTransform(smoothProgress, [0, 1], [50, -150]);  // Moves Up Faster

    // 4. MOUSE INTERACTION (3D TILT)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const handleMouseMove = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { width, height, left, top } = currentTarget.getBoundingClientRect();
        mouseX.set((clientX - left - width / 2) / 20); // Sensitivity
        mouseY.set((clientY - top - height / 2) / 20);
    };

    return (
        <section
            ref={containerRef}
            className="relative h-[250vh] bg-[#faf9f6]"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center perspective-1000">

                {/* --- ALIVE BACKGROUND ORBS --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[#b87c6b]/10 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3], x: [0, -30, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-[#d4a574]/15 rounded-full blur-[80px]"
                    />
                </div>

                {/* --- MAIN STAGE --- */}
                <div
                    onMouseMove={handleMouseMove}
                    className="relative w-full max-w-7xl px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >

                    {/* LEFT: TEXT CONTENT (Fades in) */}
                    <motion.div
                        style={{ opacity: useTransform(smoothProgress, [0, 0.3], [0, 1]), x: useTransform(smoothProgress, [0, 0.3], [-50, 0]) }}
                        className="relative z-10"
                    >
                        <h2 className="text-5xl md:text-7xl font-sans leading-[1] mb-6 text-gray-900">
                            Pure.<br />
                            Potent.<br />
                            <span className="text-[#b87c6b] italic">Proven.</span>
                        </h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-sm">
                            A breakthrough in vegan skincare. We combined PDRN with nature's most powerful botanicals to reverse time.
                        </p>
                        <button className="group flex items-center gap-3 px-8 py-3 bg-black text-white rounded-full text-sm font-semibold tracking-wider hover:bg-[#b87c6b] transition-all">
                            EXPLORE SCIENCE
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </motion.div>


                    {/* RIGHT: THE MAGIC BOTTLE & CARDS */}
                    <div className="relative flex justify-center items-center h-[600px]">

                        {/* THE BOTTLE */}
                        <motion.div
                            style={{
                                rotate,
                                scale,
                                x: useMotionTemplate`calc(${xBottle}px + ${mouseX}px)`, // Combine Scroll + Mouse
                                y: mouseY
                            }}
                            className="relative z-20 w-[300px] md:w-[380px]"
                        >
                            {/* Glow behind bottle */}
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl rounded-full blur-xl -z-10" />
                            <Image
                                loader={cloudinaryLoader}
                                src={ASSETS.homepage.rejoosh}
                                alt="Rejoosh Cream"
                                width={380}
                                height={500}
                                sizes="(max-width: 768px) 100vw, 380px"
                                className="w-full h-auto drop-shadow-2xl object-contain"
                            />
                        </motion.div>

                        {/* --- FLOATING INGREDIENT CARDS (The "Live" Part) --- */}

                        {/* Card 1: Top Right */}
                        <FloatingCard
                            text="Lacto PDRN"
                            sub="Cell Repair"
                            y={yCard1}
                            className="absolute -top-10 -right-4 z-10"
                        />

                        {/* Card 2: Bottom Left */}
                        <FloatingCard
                            text="100% Vegan"
                            sub="Cruelty Free"
                            y={yCard2}
                            className="absolute bottom-20 -left-10 z-30"
                        />

                        {/* Card 3: Mid Right (Small) */}
                        <FloatingCard
                            text="Anti-Aging"
                            sub="Collagen Boost"
                            y={yCard3}
                            className="absolute top-1/2 -right-12 z-0 scale-75 blur-[1px]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

// Helper Component for Glass Cards
function FloatingCard({ text, sub, y, className }) {
    return (
        <motion.div
            style={{ y }}
            className={`p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b87c6b]/10 flex items-center justify-center text-[#b87c6b] font-bold">
                    +
                </div>
                <div>
                    <h4 className="text-gray-900 font-bold text-sm">{text}</h4>
                    <p className="text-gray-500 text-xs uppercase tracking-wider">{sub}</p>
                </div>
            </div>
        </motion.div>
    );
}