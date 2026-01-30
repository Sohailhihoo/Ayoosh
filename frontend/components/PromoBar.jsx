'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiGift, FiHeart, FiStar } from 'react-icons/fi';

/**
 * PromoBar - Horizontal promotional banner with 3 sections
 * Golden/yellow background with icons and CTA buttons
 */
export default function PromoBar() {
    const promoItems = [
        {
            id: 1,
            icon: FiGift,
            subtitle: 'Loyalty Program',
            title: 'For Happy Skin',
            buttonText: 'Join the program',
            href: '/loyalty'
        },
        {
            id: 2,
            icon: FiHeart,
            subtitle: 'Organic beauty is shared,',
            title: 'Sponsor those you love!',
            buttonText: 'Refer a Friend',
            href: '/refer'
        },
        {
            id: 3,
            icon: FiStar,
            subtitle: 'Treat yourself to good skincare',
            title: 'with Ayoosh Treatments',
            buttonText: 'Try Our Treatments',
            href: '/treatments'
        }
    ];

    return (
        <section className="bg-[#f8cb19] py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                    {promoItems.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center text-white"
                        >
                            {/* Icon */}
                            <div className="mb-4">
                                <item.icon className="w-10 h-10 stroke-[1.5]" />
                            </div>

                            {/* Subtitle */}
                            <p className="text-sm md:text-base font-light tracking-wide mb-1 opacity-90">
                                {item.subtitle}
                            </p>

                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-medium mb-4 font-sans">
                                {item.title}
                            </h3>

                            {/* CTA Button */}
                            <Link
                                href={item.href}
                                className="inline-flex items-center gap-2 px-5 py-2 border border-white/80 rounded-full text-sm font-medium hover:bg-white hover:text-[#f8cb19] transition-all duration-300"
                            >
                                {item.buttonText}
                                <span>→</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
