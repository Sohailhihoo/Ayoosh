'use client';
import { motion } from 'framer-motion';

/**
 * BrandLogos Component
 * Displays a "Coming Soon" message instead of brand logos
 */
export default function BrandLogos() {
    return (
        <section className="py-20 md:py-28 bg-[#fdf6f0] border-t border-[#eee5df] overflow-hidden relative flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center gap-6"
                >
                    {/* Coming Soon Badge */}
                    <span className="text-sm tracking-[0.3em] text-[#b87c6b] uppercase font-medium">
                        Partners & Features
                    </span>

                    {/* Coming Soon Title */}
                    <h2 className="text-4xl md:text-6xl font-sans text-gray-900">
                        Coming <span className="text-[#b87c6b] italic">Soon</span>
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 max-w-md leading-relaxed">
                        We're working on exciting partnerships and collaborations. Stay tuned for updates!
                    </p>

                    {/* Decorative dots */}
                    <div className="flex items-center gap-2 mt-4">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-[#b87c6b]"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-[#d4a574]"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-[#b87c6b]"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
