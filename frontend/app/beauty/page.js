'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BeautyPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            try {
                const res = await fetch('/api/products?productType=beauty');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.data || []);
                }
            } catch (error) {
                console.log('Failed to load products');
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[70vh] overflow-hidden bg-white px-6 md:px-12 py-8">
                {/* Mobile Background Image */}
                <div
                    className="absolute inset-0 md:hidden bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/images/brand/beauty-hero.png')" }}
                />
                <div className="absolute inset-0 md:hidden bg-white/80" />

                <div className="h-full flex relative z-10">
                    {/* Left Content - 40% */}
                    <div className="w-full md:w-[40%] flex items-center px-8 md:px-16 lg:px-24 py-16">
                        <div>
                            <p className="text-sm md:text-base tracking-[0.2em] text-gray-600 mb-2">
                                LUXURY SKINCARE
                            </p>
                            <h1
                                className="text-[#b87c6b] mb-6"
                                style={{
                                    fontFamily: "'Tan Pearl', serif",
                                    fontWeight: 400,
                                    fontSize: '48px',
                                    lineHeight: '65px',
                                    letterSpacing: '0%'
                                }}
                            >
                                DAILY ROUTINE
                            </h1>
                            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
                                I love how natural the products feel. The Aloe Vera Gel and Green Tea Cream became part of my daily routine...
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/products?productType=beauty"
                                    className="px-8 py-3 bg-[#b87c6b] text-white text-sm tracking-wider hover:bg-[#a06b5a] transition-colors rounded"
                                >
                                    Shop Now
                                </Link>
                                <Link
                                    href="/products"
                                    className="px-8 py-3 border border-gray-800 text-gray-800 text-sm tracking-wider hover:bg-gray-100 transition-colors rounded"
                                >
                                    See all Collections
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Right Image - 60% */}
                    <div className="hidden md:block w-[60%] h-full relative">
                        <img
                            src="/images/brand/beauty-hero.png"
                            alt="Beauty Collection"
                            className="absolute right-0 top-0 h-full w-auto object-cover object-left"
                        />
                    </div>
                </div>
            </section>

            {/* Product Showcase Section */}
            <section className="py-24 md:py-32 pl-6 md:pl-12 pr-0 bg-gray-50 relative overflow-hidden min-h-[70vh]">
                <div className="max-w-[1800px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-tight mb-8">
                                <span className="text-[#b87c6b] italic">Glow</span> with Confidence<br />
                                Balanced Bright and<br />
                                <span className="text-[#b87c6b] italic">Beautiful!</span>
                            </h2>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#b87c6b]">+</span> Lacto | PDRN
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#b87c6b]">+</span> Vegan Product
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#b87c6b]">+</span> Anti Aging
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#b87c6b]">+</span> Chemical Free
                                </li>
                            </ul>
                        </div>
                        {/* Right Images */}
                        <div className="relative h-[500px] md:h-[600px]">
                            {/* Cream Tube */}
                            <img
                                src="/images/brand/rejoosh.png"
                                alt="Rejoosh Cream"
                                className="absolute -left-16 md:-left-10 top-1/2 -translate-y-1/2 h-[500px] md:h-[600px] w-auto object-contain z-10 rotate-[120deg]"
                            />
                            {/* Hand with Cream */}
                            <img
                                src="/images/brand/rejoosh-hand.png"
                                alt="Hand applying cream"
                                className="absolute -right-32 -top-20 h-[170%] w-auto object-contain scale-100"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-16 md:py-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-light text-center mb-12 tracking-wide">
                        Our Products
                    </h2>

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
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg mb-8">No products available yet</p>
                            <Link
                                href="/products"
                                className="inline-block px-8 py-3 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                BROWSE ALL PRODUCTS
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product._id}
                                    href={`/products/${product._id}`}
                                    className="group block"
                                >
                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                                        <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                                            💄
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-gray-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ${product.price?.toFixed(2) || '0.00'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
