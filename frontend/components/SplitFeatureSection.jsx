'use client';

import { motion } from 'framer-motion';

/**
 * SplitFeatureSection - Configurable two-panel split section
 * @param {Object} leftPanel - { subtitle, title, titleHighlight, description, tags[] }
 * @param {Object} rightPanel - { subtitle, title, titleHighlight, description, stats[], backgroundImage }
 */
export default function SplitFeatureSection({ leftPanel, rightPanel }) {
    const panelAnimation = (direction) => ({
        initial: { opacity: 0, x: direction === 'left' ? -80 : 80 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: false, amount: 0.3 },
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    });

    const contentAnimation = (delay) => ({
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: false, amount: 0.5 },
        transition: { duration: 0.6, delay }
    });

    return (
        <section className="relative overflow-x-clip">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[55vh]">
                {/* Left Panel */}
                <motion.div
                    className="relative flex items-center justify-center p-12 md:p-16 bg-[#f8f5f2] overflow-hidden"
                    {...panelAnimation('left')}
                >
                    <div className="absolute top-0 left-0 w-48 h-48 bg-[#b87c6b]/10 rounded-full -translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#d4a574]/10 rounded-full translate-x-1/3 translate-y-1/3" />

                    <div className="relative z-10 max-w-md">
                        <motion.span
                            className="inline-block text-sm tracking-[0.3em] text-[#b87c6b] mb-4"
                            {...contentAnimation(0.2)}
                        >
                            {leftPanel.subtitle}
                        </motion.span>
                        <motion.h3
                            className="text-3xl md:text-4xl lg:text-5xl font-sans mb-6 leading-tight"
                            {...contentAnimation(0.3)}
                        >
                            {leftPanel.title}<br />
                            <span className="text-[#b87c6b] italic">{leftPanel.titleHighlight}</span>
                        </motion.h3>
                        <motion.p
                            className="text-gray-600 leading-relaxed mb-8"
                            {...contentAnimation(0.4)}
                        >
                            {leftPanel.description}
                        </motion.p>
                        {leftPanel.tags && (
                            <motion.div className="flex flex-wrap gap-3" {...contentAnimation(0.5)}>
                                {leftPanel.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-[#f4f2f0]/80 backdrop-blur-sm text-sm text-gray-700 rounded-full border border-[#b87c6b]/20 shadow-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Right Panel */}
                <motion.div
                    className="relative flex items-center justify-center text-white overflow-hidden group cursor-pointer"
                    style={{ padding: rightPanel.imageOnly ? 0 : '3rem 4rem' }}
                    {...panelAnimation('right')}
                >
                    {rightPanel.backgroundImage && (
                        <motion.img
                            src={rightPanel.backgroundImage}
                            alt="Feature background"
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
                            whileHover={{
                                scale: 1.05,
                                filter: 'brightness(1.1)'
                            }}
                            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        />
                    )}

                    {/* Overlay - only show if not imageOnly */}
                    {!rightPanel.imageOnly && (
                        <div className="absolute inset-0 bg-black/60" />
                    )}

                    {/* Hover glow effect for imageOnly mode */}
                    {rightPanel.imageOnly && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    {/* Decorative elements - only show if not imageOnly */}
                    {!rightPanel.imageOnly && (
                        <>
                            <div className="absolute top-1/4 right-0 w-72 h-72 bg-[#b87c6b]/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-1/4 left-0 w-56 h-56 bg-[#d4a574]/15 rounded-full blur-2xl" />
                        </>
                    )}

                    {/* Text content - only show if not imageOnly */}
                    {!rightPanel.imageOnly && (
                        <div className="relative z-10 max-w-md">
                            <motion.span
                                className="inline-block text-sm tracking-[0.3em] text-[#d4a574] mb-4"
                                {...contentAnimation(0.2)}
                            >
                                {rightPanel.subtitle}
                            </motion.span>
                            <motion.h3
                                className="text-3xl md:text-4xl lg:text-5xl font-sans mb-6 leading-tight"
                                {...contentAnimation(0.3)}
                            >
                                {rightPanel.title}<br />
                                <span className="text-[#d4a574] italic">{rightPanel.titleHighlight}</span>
                            </motion.h3>
                            <motion.p
                                className="text-gray-300 leading-relaxed mb-8"
                                {...contentAnimation(0.4)}
                            >
                                {rightPanel.description}
                            </motion.p>
                            {rightPanel.stats && (
                                <motion.div
                                    className="grid grid-cols-3 gap-6 text-center"
                                    {...contentAnimation(0.5)}
                                >
                                    {rightPanel.stats.map((stat, idx) => (
                                        <div key={idx}>
                                            <span className="block text-3xl font-light text-[#d4a574]">{stat.value}</span>
                                            <span className="text-xs text-gray-400 tracking-wider">{stat.label}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
