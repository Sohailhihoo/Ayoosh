'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

/**
 * ProductsGrid - Product grid with loading skeleton and empty state
 * @param {Array} products - Array of product objects
 * @param {boolean} loading - Loading state
 * @param {string} sectionTitle - Section title
 * @param {string} emptyLink - Link for empty state CTA
 * @param {string} emptyLinkText - Text for empty state CTA
 */
export default function ProductsGrid({
    products = [],
    loading = false,
    sectionTitle = 'Our Products',
    emptyLink = '/products',
    emptyLinkText = 'BROWSE ALL PRODUCTS'
}) {
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    const titleY = useTransform(smoothProgress, [0, 0.2], [60, 0]);
    const titleOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);

    return (
        <section ref={sectionRef} className="py-16 md:py-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    className="text-2xl md:text-3xl font-light text-center mb-12 tracking-wide"
                    style={{ y: titleY, opacity: titleOpacity }}
                >
                    {sectionTitle}
                </motion.h2>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <p className="text-gray-500 text-lg mb-8">No products available yet</p>
                        <Link
                            href={emptyLink}
                            className="inline-block px-8 py-3 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            {emptyLinkText}
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.1 }}
                        variants={staggerContainer}
                    >
                        {products.map((product) => (
                            <motion.div key={product._id} variants={scaleIn}>
                                <Link href={`/products/${product.slug}`} className="group block">
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                                        <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                                            💄
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        R{product.price?.toFixed(2) || '0.00'}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
