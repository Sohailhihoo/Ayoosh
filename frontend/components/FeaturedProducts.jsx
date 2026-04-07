'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

/**
 * FeaturedProducts - Display featured products in a stylish grid
 * @param {string} title - Section title
 * @param {Array} products - Array of product objects with id, name, variant, price, image, rating, onSale
 * @param {number} maxProducts - Maximum number of products to show (default 2)
 */
export default function FeaturedProducts({
    title = 'Featured Products',
    products = [],
    maxProducts = 2
}) {
    const displayProducts = products.slice(0, maxProducts);

    return (
        <section className="py-16 md:py-24 px-6 md:px-12 bg-[#f4f2f0]">
            <div className="max-w-5xl mx-auto">
                {/* Section Title */}
                <motion.h2
                    className="text-2xl md:text-3xl font-light mb-12 tracking-wide"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    {title}
                </motion.h2>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {displayProducts.map((product, idx) => (
                        <FeaturedProductCard key={product._id || idx} product={product} index={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturedProductCard({ product, index }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCartStore();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await addToCart(product._id, 1, null, product.price);
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    // Render star rating
    const renderStars = (rating = 4) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                <span className="text-sm text-gray-500 ml-1">{rating?.toFixed(1) || '4.0'}</span>
            </div>
        );
    };

    return (
        <motion.div
            className="group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/products/${product._id}`} className="block">
                {/* Product Image Container */}
                <div className="relative bg-[#f4f2f0] rounded-lg overflow-hidden aspect-square mb-4 shadow-sm">
                    {/* Sale Badge removed */}

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsWishlisted(!isWishlisted);
                        }}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded flex items-center justify-center transition-colors"
                    >
                        <svg
                            className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-white'}`}
                            fill={isWishlisted ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Product Image */}
                    <div className="w-full h-full flex items-center justify-center p-8 group-hover:scale-105 transition-transform duration-500">
                        {product.images?.[0] || product.image ? (
                            <img
                                src={product.images?.[0] || product.image}
                                alt={product.name}
                                className="max-w-full max-h-full object-contain"
                                style={{ transform: `scale(${product.imageScale || 1})` }}
                            />
                        ) : (
                            <div className="text-8xl">🧴</div>
                        )}
                    </div>

                    {/* Add to Cart Button - appears on hover */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 p-4 bg-white/95 transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
                    >
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-3 bg-[#4a4a4a] text-white text-sm tracking-widest hover:bg-[#333] transition-colors"
                        >
                            ADD TO CART
                        </button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {product.name}
                            {product.variant && (
                                <span className="text-gray-400 font-normal"> | {product.variant}</span>
                            )}
                        </h3>
                        <p className="text-xl font-semibold text-yellow-500 mt-1">
                            R{product.price?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        {renderStars(product.rating)}
                    </div>
                </div>
            </Link>

            {/* Add to Cart Button - visible only on tablet/mobile */}
            <button
                onClick={handleAddToCart}
                className="w-full mt-3 py-3 bg-[#4a4a4a] text-white text-sm tracking-widest hover:bg-[#333] transition-colors rounded-lg md:hidden"
            >
                ADD TO CART
            </button>
        </motion.div>
    );
}
