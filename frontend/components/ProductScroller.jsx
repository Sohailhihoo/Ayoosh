'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ProductScroller - 3D Scroll Animation with Progressive Spec Components
 * - Desktop: Complex circular scroll animation (Sticky)
 * - Mobile: Simple static product showcase with specs grid (Normal flow)
 */
export default function ProductScroller() {
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // --- Product Animations (Desktop) ---
    const productRotateZ = useTransform(scrollYProgress, [0, 0.5, 1], [0, 5, 0]);
    const productScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.1, 1]);

    // --- Progressive Reveal (Desktop) ---
    const group1Opacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
    const group2Opacity = useTransform(scrollYProgress, [0.33, 0.45], [0, 1]);
    const group3Opacity = useTransform(scrollYProgress, [0.66, 0.78], [0, 1]);

    const specs = [
        { id: 1, label: "Advanced Korean UV filter", value: "SPF 50+ PA++++", group: 1, angle: 340 },
        { id: 2, label: "Vitamin E", value: "Antioxidant Protection", group: 1, angle: 0 },
        { id: 3, label: "Propanediol", value: "Hydration & Smoothness", group: 1, angle: 20 },
        { id: 4, label: "Glycerin", value: "Deep Moisturization", group: 2, angle: 50 },
        { id: 5, label: "Betaine", value: "Skin Barrier Support", group: 2, angle: 130 },
        { id: 6, label: "Centella Asiatica", value: "Soothing & Repair", group: 2, angle: 160 },
        { id: 7, label: "Allantoin", value: "Irritation Relief", group: 3, angle: 180 },
        { id: 8, label: "Chamomile Extract", value: "Calming Effect", group: 3, angle: 200 },
        { id: 10, label: "Polygonum Root Extract", value: "Intense Hydration", group: 3, angle: 220 },
        { id: 9, label: "Licorice Root Extract", value: "Brightening", group: 3, angle: 320 },
    ];

    const circleRadius = 450;

    const getGroupOpacity = (group) => {
        switch (group) {
            case 1: return group1Opacity;
            case 2: return group2Opacity;
            case 3: return group3Opacity;
            default: return group1Opacity;
        }
    };

    // Mobile layout - specs split into left and right columns around product
    const leftSpecs = [
        specs[8],  // Polygonum Root Extract - Intense Hydration
        specs[7],  // Chamomile Extract - Calming Effect
        specs[6],  // Allantoin - Irritation Relief
        specs[5],  // Centella Asiatica - Soothing & Repair
        specs[4],  // Betaine - Skin Barrier Support
    ];

    const rightSpecs = [
        specs[9],  // Licorice Root Extract - Brightening
        specs[0],  // Advanced Korean UV filter - SPF 50+ PA++++
        specs[1],  // Vitamin E - Antioxidant Protection
        specs[2],  // Propanediol - Hydration & Smoothness
        specs[3],  // Glycerin - Deep Moisturization
    ];

    return (
        <section
            ref={containerRef}
            className="relative bg-[#f4f2f0] lg:h-[300vh]"
        >
            {/* ==================== MOBILE VIEW (Visible < 1024px) ==================== */}
            <div className="lg:hidden py-10 px-3 sm:px-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2">

                    {/* Left Specs */}
                    <div className="flex flex-col gap-2.5 sm:gap-3 items-end flex-1">
                        {leftSpecs.map((spec, index) => (
                            <motion.div
                                key={spec.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5 text-right w-full
                                    ${index % 2 === 0
                                        ? 'bg-[#f9cb19] text-black'
                                        : 'bg-white text-gray-900 shadow-sm'}`}
                            >
                                <p className={`text-[7px] sm:text-[9px] uppercase tracking-wide font-medium mb-0.5 leading-tight ${index % 2 === 0 ? 'text-black/60' : 'text-gray-500'}`}>
                                    {spec.label}
                                </p>
                                <p className="text-[10px] sm:text-xs font-semibold leading-tight">
                                    {spec.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Center Product */}
                    <motion.img
                        src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto/v1769715388/Sun_Tube_cmxezs.png"
                        alt="Ayoosh Sun Cream"
                        className="flex-shrink-0 w-auto h-[220px] sm:h-[320px] object-contain"
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Right Specs */}
                    <div className="flex flex-col gap-2.5 sm:gap-3 items-start flex-1">
                        {rightSpecs.map((spec, index) => (
                            <motion.div
                                key={spec.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`rounded-lg px-2.5 py-2 sm:px-3 sm:py-2.5 text-left w-full
                                    ${index % 2 === 0
                                        ? 'bg-[#f9cb19] text-black'
                                        : 'bg-white text-gray-900 shadow-sm'}`}
                            >
                                <p className={`text-[7px] sm:text-[9px] uppercase tracking-wide font-medium mb-0.5 leading-tight ${index % 2 === 0 ? 'text-black/60' : 'text-gray-500'}`}>
                                    {spec.label}
                                </p>
                                <p className="text-[10px] sm:text-xs font-semibold leading-tight">
                                    {spec.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>

            {/* ==================== DESKTOP VIEW (Visible >= 1024px) ==================== */}
            <div className="hidden lg:flex sticky top-0 h-screen w-full overflow-hidden flex-col justify-center items-center">

                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#f8e1d9]/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#e8c4b8]/30 rounded-full blur-3xl opacity-50" />
                </div>

                {/* Circular Spec Layout */}
                <div className="absolute inset-0 w-full h-full z-20 pointer-events-none flex items-center justify-center">
                    {specs.map((spec, index) => {
                        const angleRad = (spec.angle * Math.PI) / 180;
                        const x = Math.cos(angleRad) * circleRadius;
                        const y = Math.sin(angleRad) * circleRadius;
                        const isYellow = index % 2 === 0;

                        return (
                            <motion.div
                                key={spec.id}
                                style={{
                                    opacity: getGroupOpacity(spec.group),
                                    transform: `translate(${x}px, ${y}px)`
                                }}
                                className="absolute flex flex-col items-center text-center transition-all duration-500"
                            >
                                <div className={`
                                    backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border transition-colors duration-300
                                    ${isYellow
                                        ? 'bg-[#f9cb19]/90 border-[#e8ba17] text-black'
                                        : 'bg-white/90 border-white/50 text-gray-900'}
                                `}>
                                    <p className={`text-xs uppercase tracking-widest font-medium mb-1 ${isYellow ? 'text-black/70' : 'text-gray-500'}`}>
                                        {spec.label}
                                    </p>
                                    <p className={`text-xl font-sans font-medium leading-tight ${isYellow ? 'text-black' : 'text-gray-900'}`}>
                                        {spec.value}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main Product Stage */}
                <div className="relative z-10 w-full max-w-xl lg:max-w-2xl px-6 flex justify-center">
                    <motion.div
                        style={{
                            rotate: productRotateZ,
                            scale: productScale,
                        }}
                        className="relative"
                    >
                        {/* Product Glow */}
                        <div className="absolute inset-0 top-1/2 -translate-y-1/2 bg-white/40 blur-3xl rounded-full scale-110 pointer-events-none" />

                        <img
                            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto/v1769715388/Sun_Tube_cmxezs.png"
                            alt="Ayoosh Sun Cream"
                            className="w-auto h-[750px] object-contain relative z-10"
                            style={{
                                filter: 'none'
                            }}
                        />
                    </motion.div>
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
