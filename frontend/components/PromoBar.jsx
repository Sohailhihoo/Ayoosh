'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Inline SVG icons to avoid react-icons module issues
const GiftIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8M20 12V8h-4m4 0l-4 4M4 12v4h4m-4 0l4-4" />
  </svg>
);

const GiftBoxIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18c-1.5 0-4-1.5-4-3h8c0 1.5-2.5 3-4 3zM3 9h18v12H3V9zm0 0h18M12 9v12" />
    <rect x="3" y="9" width="18" height="12" rx="1" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M12 9v12M7.5 9V6a4.5 4.5 0 019 0v3" />
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/**
 * PromoBar - Horizontal promotional banner with 3 sections
 * Golden/yellow background with icons and CTA buttons
 */
export default function PromoBar({ bgColor = '#f8cb19', hoverTextColor = '#f8cb19' }) {
    // ... items ...
    const promoItems = [
        {
            id: 1,
            icon: GiftBoxIcon,
            subtitle: 'Loyalty Program',
            title: 'For Happy Skin',
            buttonText: 'Join the program',
            href: '/loyalty'
        },
        {
            id: 2,
            icon: HeartIcon,
            subtitle: 'Organic beauty is shared,',
            title: 'Sponsor those you love!',
            buttonText: 'Refer a Friend',
            href: '/refer'
        },
        {
            id: 3,
            icon: StarIcon,
            subtitle: 'Treat yourself to good skincare',
            title: 'with Ayoosh Treatments',
            buttonText: 'Try Our Treatments',
            href: '/treatments'
        }
    ];

    return (
        <section className="py-12 md:py-16" style={{ backgroundColor: bgColor }}>
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
                                className="group inline-flex items-center gap-2 px-5 py-2 border border-white/80 rounded-full text-sm font-medium hover:bg-white transition-all duration-300"
                                style={{
                                    '--hover-color': hoverTextColor
                                }}
                            >
                                <span className="text-white group-hover:text-[var(--hover-color)] transition-colors">
                                    {item.buttonText}
                                </span>
                                <span className="text-white group-hover:text-[var(--hover-color)] transition-colors">→</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

