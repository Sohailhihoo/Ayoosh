'use client';
// Re-trigger HMR

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['300', '400', '500'],
    display: 'swap'
});


// Product Data
const sunglasses = [
    {
        id: 1,
        name: 'The Confidence',
        price: 'R 2,450.00',
        tagline: 'Confidence',
        description: 'The Confidence frame is joy, worn boldly. A bright yellow sunglass full of warmth and energy. Fearless. Radiant. Alive. It turns heads and lifts moods. Feels like sunshine and movement. For women who enter fully, choose happiness, and let their presence speak first.',
        specs: ['Yellow Tint', 'UV400', 'Lightweight'],
        image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767397/Yellow-Glasses_faznsr.png',
        color: '#DEA835'
    },
    {
        id: 2,
        name: 'The Focus',
        price: 'R 2,550.00',
        tagline: 'Focus',
        description: 'The Focus is a grounded perspective. A rich coffee-brown frame with quiet strength. Calm. Stable. Effortless. Designed to feel present without overpowering. It anchors your look and sharpens your style. An everyday essential that adds depth, warmth, and polish.',
        specs: ['Brown Lens', 'Acetate', 'Anti-Glare'],
        image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767395/Brown-Glasses_u6obla.png',
        color: '#A87E5A'
    },
    {
        id: 3,
        name: 'The Leadership',
        price: 'R 2,350.00',
        tagline: 'Leadership',
        description: 'The Leadership is clarity from a motion perspective. A deep blue frame for focused minds. Thoughtful. Intelligent. Forward. It speaks without volume. Strong without force. Made for those who choose direction, trust their vision, and lead on their own terms.',
        specs: ['Blue Gradient', 'Polarized', 'Impact Resistant'],
        image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767393/Blue-Glasses_fky8v9.png',
        color: '#649BC3'
    },
    {
        id: 4,
        name: 'The Roseview',
        price: 'R 2,650.00',
        tagline: 'RoseView',
        description: "The Roseview in pink is soft power. A warm pink frame rooted in self-love. Gentle yet strong. Romantic. Healing. Feminine. It flatters the skin and softens every look. Made for those who lead with grace and glow without effort.See the world through rose-colored glasses. A feminine touch with a modern edge for the bold spirit.",
        specs: ['Pink Tint', 'Gold Frame', 'Adjustable'],
        image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767392/Pink-Glasses_o5hxf2.png',
        color: '#D47E9C'
    }
];

export default function SunglassesCircle() {
    const containerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Scroll Progress
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Rotation: 0 to -270 degrees
    // Map scroll to rotation: 0 -> -270 degrees
    const rotateValue = useTransform(scrollYProgress, [0, 1], [0, -270]);
    const smoothRotate = useSpring(rotateValue, { stiffness: 120, damping: 20 });

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const index = Math.round(latest * 3);
            setActiveIndex(Math.max(0, Math.min(3, index)));
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    const activeProduct = sunglasses[activeIndex];

    return (
        <section ref={containerRef} className="relative h-[400vh] bg-[#d9d9d9] z-10 overflow-clip">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-visible">

                {/* Central Text Content - Shifted down slightly */}
                <div className="absolute z-20 flex flex-col items-center justify-center text-center max-w-lg px-6 pt-56 pointer-events-none w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProduct.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center"
                        >
                            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4" style={{ fontFamily: "'Tan Pearl', serif" }}>
                                {activeProduct.name}
                            </h2>
                            <p className={`${montserrat.className} text-gray-600 text-base leading-[2] mb-8 font-normal max-w-sm`}>
                                {activeProduct.description}
                            </p>

                            <button
                                className="pointer-events-auto text-white px-8 py-3 rounded-full text-sm font-bold tracking-wide uppercase transition-all hover:scale-105 shadow-xl hover:opacity-90"
                                style={{ backgroundColor: activeProduct.color }}
                            >
                                Pre Order
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Rotating Wheel Container - Moved down to clear Navbar */}
                <motion.div
                    style={{ rotate: smoothRotate }}
                    className="relative w-[1px] h-[1px] flex items-center justify-center z-10 mt-32"
                >
                    {sunglasses.map((product, index) => {
                        const angleDeg = (index * 90) - 90;
                        const radius = 340; // Decreased radius slightly

                        const x = Math.cos((angleDeg * Math.PI) / 180) * radius;
                        const y = Math.sin((angleDeg * Math.PI) / 180) * radius;

                        const isActive = activeIndex === index;

                        return (
                            <motion.div
                                key={product.id}
                                className="absolute w-[320px] h-[320px] flex items-center justify-center"
                                style={{
                                    x,
                                    y,
                                    rotate: useTransform(smoothRotate, (r) => -r)
                                }}
                            >
                                <div className={`transition-all duration-500 ease-out transform ${isActive
                                    ? 'scale-[1.6] z-50 filter-none opacity-100 drop-shadow-2xl'
                                    : 'scale-90 z-0 grayscale opacity-60'
                                    }`}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Decorative & Bg Elements */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 mt-32">
                    <div className="w-[680px] h-[680px] rounded-full border border-gray-200 opacity-60 dashed" />
                </div>

            </div>
        </section>
    );
}
