'use client';

import { useState } from 'react';

const BRANDS = [
    { id: 1, name: 'Chanel' },
    { id: 2, name: 'Dior' },
    { id: 3, name: 'Gucci' },
    { id: 4, name: 'Prada' },
    { id: 5, name: 'Versace' },
    { id: 6, name: 'Burberry' },
    { id: 7, name: 'Fendi' },
    { id: 8, name: 'Givenchy' },
];

const BrandLogo = ({ name }) => (
    <div className="brand-logo-item flex items-center justify-center px-8 md:px-12 lg:px-16 py-4 group">
        <span
            className="text-xl md:text-2xl lg:text-3xl font-light tracking-[0.2em] uppercase
                       text-gray-400 group-hover:text-gray-800 
                       transition-all duration-500 group-hover:scale-105"
            style={{ fontFamily: "'Playfair Display', serif" }}
        >
            {name}
        </span>
    </div>
);

export default function BrandsBar({ title = "Trusted By" }) {
    const [isPaused, setIsPaused] = useState(false);

    return (
        <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-[#fafafa]">
            {/* Heading */}
            <div className="text-center mb-10 md:mb-14">
                <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-500">
                    {title}
                </span>
                <div className="flex items-center justify-center mt-4">
                    <div className="w-8 h-px bg-gray-300"></div>
                    <div className="w-2 h-2 mx-3 rotate-45 border border-gray-300"></div>
                    <div className="w-8 h-px bg-gray-300"></div>
                </div>
            </div>

            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 lg:w-48 z-10 pointer-events-none bg-gradient-to-r from-[#fafafa] to-transparent"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 lg:w-48 z-10 pointer-events-none bg-gradient-to-l from-[#fafafa] to-transparent"></div>

            {/* Marquee */}
            <div
                className="relative overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    className="inline-flex items-center whitespace-nowrap animate-marquee"
                    style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                >
                    {BRANDS.map((brand) => (
                        <BrandLogo key={`a-${brand.id}`} name={brand.name} />
                    ))}
                    {BRANDS.map((brand) => (
                        <BrandLogo key={`b-${brand.id}`} name={brand.name} />
                    ))}
                </div>
            </div>

            {/* Footer text */}
            <div className="text-center mt-10 md:mt-14">
                <span className="text-xs tracking-[0.2em] uppercase text-gray-500 opacity-60">
                    Premium Partners
                </span>
            </div>
        </section>
    );
}
