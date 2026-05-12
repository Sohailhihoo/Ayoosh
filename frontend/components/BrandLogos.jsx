'use client';
import { motion } from 'framer-motion';

/**
 * BrandLogos Component
 * Displays partner logos with a "more coming soon" note
 */

const partners = [
    {
        name: 'Pick n Pay',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Pick_n_Pay_logo.svg',
        url: 'https://www.pnp.co.za',
    },
];

export default function BrandLogos({ bgColor = '#fdf6f0' }) {
    return (
        <section
            className="py-14 md:py-20 border-t border-[#eee5df] overflow-hidden"
            style={{ backgroundColor: bgColor }}
        >
            <div className="w-full max-w-5xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <span className="text-sm tracking-[0.3em] text-[#b87c6b] uppercase font-medium">
                        Now Available At
                    </span>
                    <h2 className="text-3xl md:text-4xl font-sans text-gray-900 mt-3">
                        Our <span className="text-[#b87c6b] italic">Partners</span>
                    </h2>
                </motion.div>

                {/* Partner Logos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center justify-center gap-8 flex-wrap"
                >
                    {partners.map((partner) => (
                        <a
                            key={partner.name}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                className="h-14 md:h-20 w-auto object-contain opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                            />
                        </a>
                    ))}
                </motion.div>

                {/* More Coming Soon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-10 flex flex-col items-center gap-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-[#d4a574]/40" />
                        <p className="text-sm text-gray-500 tracking-wide">
                            More partnerships coming soon
                        </p>
                        <div className="h-px w-8 bg-[#d4a574]/40" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-[#b87c6b]"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-[#d4a574]"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-[#b87c6b]"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
