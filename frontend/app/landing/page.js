'use client';

import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * Landing Page
 * 
 * Features a hero section with dark background (#444444)
 * and uses the default website navbar.
 */
export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                className="relative h-screen flex flex-col items-center justify-end text-center px-6 pb-48 overflow-hidden"
                style={{ backgroundColor: '#444444' }}
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-no-repeat"
                    style={{
                        backgroundImage: `url(${ASSETS.heroes.landing})`,
                        backgroundSize: '70% auto',
                        backgroundPosition: 'center calc(100% + 450px)'
                    }}
                />

                {/* Logo at Top */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
                    <img
                        src={ASSETS.logos.yellow}
                        alt="Ayoosh Logo"
                        className="h-24 w-auto"
                    />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-8 justify-center">
                        {/* Skincare - Yellow */}
                        <a
                            href="/beauty"
                            className="px-40 py-4 text-lg font-medium tracking-wider rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white"
                            style={{ backgroundColor: '#ddf15dff', color: '#333', fontFamily: "'Tan Pearl', serif", boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)' }}
                        >
                            Skincare
                        </a>

                        {/* Skin Booster - Maroon */}
                        <a
                            href="/products"
                            className="px-40 py-4 text-lg font-medium tracking-wider rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-center whitespace-nowrap border-2 border-white"
                            style={{ backgroundColor: '#8B4049', color: '#fff', fontFamily: "'Tan Pearl', serif", boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)' }}
                        >
                            Skin Booster
                        </a>

                        {/* Sunglasses - Orange */}
                        <a
                            href="/products?productType=sunglasses"
                            className="px-40 py-4 text-lg font-medium tracking-wider rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-2 border-white"
                            style={{ backgroundColor: '#E67E22', color: '#fff', fontFamily: "'Tan Pearl', serif", boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)' }}
                        >
                            Sunglasses
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
