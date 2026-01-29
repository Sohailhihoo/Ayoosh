'use client';
import { motion } from 'framer-motion';

/**
 * BrandLogos Component
 * Displays a scrolling ticker of major beauty/media brands.
 * Uses SVG text to create high-quality, scalable logos.
 */
export default function BrandLogos() {
    const brands = [
        { id: 1, name: "VOGUE", font: "font-serif", tracking: "tracking-widest" },
        { id: 2, name: "Forbes", font: "font-serif", tracking: "tracking-normal" },
        { id: 3, name: "ELLE", font: "font-sans", tracking: "tracking-wider" },
        { id: 4, name: "Harpers BAZAAR", font: "font-serif", tracking: "tracking-wide" },
        { id: 5, name: "Cosmopolitan", font: "font-sans", tracking: "tracking-tight" },
        { id: 6, name: "Allure", font: "font-sans", tracking: "tracking-normal" },
    ];

    // Duplicate for seamless loop spread
    const tickerItems = [...brands, ...brands, ...brands, ...brands];

    return (
        <section className="py-32 md:py-40 bg-[#fdf6f0] border-t border-[#eee5df] overflow-hidden relative flex items-center">
            <div className="w-full max-w-none">

                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#fdf6f0] to-transparent z-10" />
                <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#fdf6f0] to-transparent z-10" />

                <div className="flex overflow-hidden w-full">
                    {/* Infinite Scroll Animation */}
                    <motion.div
                        className="flex items-center gap-24 md:gap-40 flex-nowrap"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            ease: "linear",
                            duration: 40,
                            repeat: Infinity
                        }}
                    >
                        {tickerItems.map((brand, index) => (
                            <div
                                key={`${brand.id}-${index}`}
                                className="flex-shrink-0 flex justify-center items-center opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-default"
                            >
                                {/* Text-based Logo Simulation */}
                                <span className={`text-4xl md:text-6xl ${brand.font} ${brand.tracking} font-bold text-gray-900 whitespace-nowrap leading-none select-none`}>
                                    {brand.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
