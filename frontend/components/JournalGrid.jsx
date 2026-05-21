'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

// 1. Data Structure
const articles = [
    {
        id: 1,
        category: "SUN CARE",
        title: "Mastering The Art Of Well Aging",
        image: "https://images.unsplash.com/photo-1556228720-1957be940f95?q=80&w=700&auto=format&fit=crop",
        readTime: "5 min read",
        slug: "mastering-well-aging"
    },
    {
        id: 2,
        category: "INGREDIENTS",
        title: "Why Niacinamide is a Game Changer",
        image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=700&auto=format&fit=crop",
        readTime: "4 min read",
        slug: "niacinamide-benefits"
    },
    {
        id: 3,
        category: "LIFESTYLE",
        title: "The Morning Routine for Busy Days",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=700&auto=format&fit=crop",
        readTime: "3 min read",
        slug: "busy-morning-routine"
    },
    {
        id: 4,
        category: "SUSTAINABILITY",
        title: "Packaging That Loves the Planet",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=700&auto=format&fit=crop",
        readTime: "6 min read",
        slug: "sustainable-packaging"
    }
];

export default function JournalGrid() {
    return (
        <section className="py-24 bg-[#f4f2f0] border-t border-gray-50">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">

                {/* 4. Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-yellow-500">
                            {/* Sparkle Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" /></svg>
                        </span>
                        <h2 className="text-3xl md:text-4xl font-sans text-gray-900">Our Journal</h2>
                    </div>
                </div>

                {/* 2. Layout Architecture (Standard Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {articles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer flex flex-col h-full"
                        >
                            {/* 3. Card Design - Image */}
                            <div className="aspect-[4/5] overflow-hidden rounded-lg mb-5 bg-gray-100 relative">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                {/* Subtle Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            </div>

                            {/* Typography */}
                            <div className="flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-yellow-600 font-bold text-xs uppercase tracking-widest">
                                        {article.category}
                                    </span>
                                    <span className="text-gray-400 text-xs italic">{article.readTime}</span>
                                </div>

                                <h3 className="text-xl font-sans text-gray-900 leading-snug mb-3 font-semibold group-hover:text-[#b87c6b] transition-colors">
                                    {article.title}
                                </h3>

                                {/* Footer Link */}
                                <div className="mt-auto pt-2">
                                    <span className="inline-flex items-center text-sm font-medium text-gray-900 group-hover:text-[#b87c6b] transition-colors">
                                        Read More
                                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 4. Bottom Footer Link */}
                <div className="border-t border-gray-100 pt-8 mt-4">
                    <a href="#" className="inline-block text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-[#b87c6b] transition-colors border-b border-gray-200 hover:border-[#b87c6b] pb-0.5">
                        View All Posts
                    </a>
                </div>

            </div>
        </section>
    );
}
