'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import cloudinaryLoader from '@/lib/cloudinary-loader';
import HeroLogoAnimation from '@/components/HeroLogoAnimation';

// Inline SVG icons to avoid react-icons module issues
const DropletIcon = () => (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-3.5 0-6.5-2.5-6.5-6.5 0-4.5 6.5-12 6.5-12s6.5 7.5 6.5 12c0 4-3 6.5-6.5 6.5z" />
    </svg>
);

const ZapIcon = () => (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);

const SunglassesIcon = () => (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h2M20 10h2M6 10h12M6 10a4 4 0 104 4M18 10a4 4 0 11-4 4M10 14h4" />
    </svg>
);

const HeartHandIcon = () => (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-6m-4 2h8" />
    </svg>
);



const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

/**
 * HomePage Component
 * 
 * Main landing page featuring:
 * - Hero section with video background
 * - Premium luxury styling with gradients
 * 
 * @returns {JSX.Element} The home page component
 */
export default function HomePage() {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [isHoveringHero, setIsHoveringHero] = useState(false);
    const [showLogoAnimation, setShowLogoAnimation] = useState(false);
    const heroRef = useRef(null);

    /**
     * Custom cursor tracking for hero section
     */
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const isInHero = (
                    e.clientX >= rect.left &&
                    e.clientX <= rect.right &&
                    e.clientY >= rect.top &&
                    e.clientY <= rect.bottom
                );
                setIsHoveringHero(isInHero);
                if (isInHero) {
                    setCursorPos({ x: e.clientX, y: e.clientY });
                }
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const leftVideoRef = useRef(null);
    const centerVideoRef = useRef(null);

    const handleMouseEnter = (ref) => {
        if (ref.current) {
            ref.current.play().catch(e => console.log('Video play failed:', e));
        }
    };

    const handleMouseLeave = (ref) => {
        if (ref.current) {
            ref.current.pause();
        }
    };

    // Mobile Autoplay Effect
    useEffect(() => {
        const checkMobileAndPlay = () => {
            if (window.innerWidth < 768) {
                if (leftVideoRef.current) leftVideoRef.current.play().catch(() => { });
                if (centerVideoRef.current) centerVideoRef.current.play().catch(() => { });
            }
        };

        checkMobileAndPlay();
        window.addEventListener('resize', checkMobileAndPlay);
        return () => window.removeEventListener('resize', checkMobileAndPlay);
    }, []);

    // Show logo animation component on homepage
    // The component itself handles whether to show animation or white logo
    useEffect(() => {
        const hasSeenAnimation = sessionStorage.getItem('logoAnimationComplete');

        if (!hasSeenAnimation) {
            // First visit: Wait for loading screen (3s) then show component
            const timer = setTimeout(() => {
                setShowLogoAnimation(true);
            }, 3000);

            return () => clearTimeout(timer);
        } else {
            // Returning visitor: Show component immediately (will display white logo)
            setShowLogoAnimation(true);
        }
    }, []);

    return (
        <div className="bg-black">
            <h1 className="sr-only">Ayoosh — Premium Korean Skincare, Skin Care &amp; Sunglasses</h1>
            {/* Hero Logo Animation (shows after loading screen on first visit) */}
            {showLogoAnimation && (
                <HeroLogoAnimation />
            )}

            {/* Custom Cursor for Hero */}
            {isHoveringHero && (
                <div
                    className="fixed pointer-events-none z-40 transition-transform duration-100 ease-out"
                    style={{
                        left: cursorPos.x,
                        top: cursorPos.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center animate-pulse">
                        <span className="text-white text-xs font-light tracking-[0.2em] uppercase">
                            Explore
                        </span>
                    </div>
                </div>
            )}

            {/* Split-Screen Hero Section - 2 Panels */}
            <section
                ref={heroRef}
                className="relative h-screen min-h-[600px] flex flex-col md:flex-row bg-black"
                aria-label="Hero section"
            >
                {/* Left Panel - Suncream */}
                <Link
                    href="/suncream"
                    className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden group cursor-none block"
                    aria-label="Shop skincare collection"
                    onMouseEnter={() => handleMouseEnter(leftVideoRef)}
                    onMouseLeave={() => handleMouseLeave(leftVideoRef)}
                >
                    {/* Video Background */}
                    <video
                        ref={leftVideoRef}
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.3] group-hover:brightness-110 grayscale group-hover:grayscale-0"
                        aria-label="Skincare collection video"
                    >
                        <source src="https://res.cloudinary.com/dpdg462fb/video/upload/q_auto:low,vc_auto,w_1280/v1770179502/1_pdu3jc.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>



                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>

                    {/* Transparent Button */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                        <button className="h-12 px-8 bg-transparent border border-white/50 text-white text-sm tracking-[0.2em] uppercase font-light hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center" style={{ opacity: 0.5 }}>
                            Shop Now
                        </button>
                    </div>
                </Link>



                {/* Right Panel - Sunglasses */}
                <Link
                    href="/sunglasses"
                    className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden group cursor-none block"
                    aria-label="Shop Sunglasses collection"
                    onMouseEnter={() => handleMouseEnter(centerVideoRef)}
                    onMouseLeave={() => handleMouseLeave(centerVideoRef)}
                >
                    {/* Video Background */}
                    <video
                        ref={centerVideoRef}
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.3] group-hover:brightness-110 grayscale group-hover:grayscale-0"
                        aria-label="SkinBooster collection video"
                    >
                        <source src="https://res.cloudinary.com/dpdg462fb/video/upload/q_auto:low,vc_auto,w_1280/v1770179502/2_m0puzp.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>



                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>

                    {/* Transparent Button */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                        <button className="h-12 px-8 bg-transparent border border-white/50 text-white text-sm tracking-[0.2em] uppercase font-light hover:bg-white/10 hover:border-white transition-all duration-300 flex items-center justify-center" style={{ opacity: 0.5 }}>
                            Shop Now
                        </button>
                    </div>
                </Link>
            </section>



            {/* New Section - 4 Boxes (Features/Values) */}
            <section className="py-20 px-6 md:px-12 border-t border-gray-100" style={{ backgroundColor: '#f4f3ef' }}>
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.2 }}
                    variants={staggerContainer}
                >

                    {/* Box 1 */}
                    <motion.div
                        className="group p-8 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-lg text-center flex flex-col items-center"
                        variants={scaleIn}
                    >
                        <div className="w-16 h-16 mb-4 mx-auto group-hover:scale-110 transition-all duration-500">
                            <Image loader={cloudinaryLoader} src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1770184422/Group_70_vhucel.png" alt="Skincare Icon" width={64} height={64} className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-lg font-playfair font-bold text-gray-900 mb-2">Skincare</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">Discover our Korean skincare rituals, crafted to help you glow with intention, feel 
confident in your own skin, and choose a little more care, a little more softness, and a 
little more you every day. </p>
                        <Link href="/products?productType=suncream" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase font-semibold hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            Shop Now
                        </Link>
                    </motion.div>

                    {/* Box 2 */}
                    <motion.div
                        className="group p-8 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-lg text-center flex flex-col items-center"
                        variants={scaleIn}
                    >
                        <div className="w-16 h-16 mb-4 mx-auto group-hover:scale-110 transition-all duration-500">
                            <Image loader={cloudinaryLoader} src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1770184424/Group_69_n3ezsx.png" alt="Sunglasses Icon" width={64} height={64} className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-lg font-playfair font-bold text-gray-900 mb-2">Sunglasses</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">Discover our statement sunglasses, designed to elevate your look, sharpen your 
presence, and help you see the world with confidence, clarity, and Ayoosh energy. </p>
                        <Link href="/products?productType=sunglasses" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase font-semibold hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            PRE-ORDER NOW
                        </Link>
                    </motion.div>



                    {/* Box 3 */}
                    <motion.div
                        className="group p-8 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-lg text-center flex flex-col items-center"
                        variants={scaleIn}
                    >
                        <div className="w-16 h-16 mb-4 mx-auto group-hover:scale-110 transition-all duration-500">
                            <Image loader={cloudinaryLoader} src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1770184357/Group_71_csjhfp.png" alt="Foundation Icon" width={64} height={64} className="w-full h-full object-contain" />
                        </div>
                        <h3 className="text-lg font-playfair font-bold text-gray-900 mb-2">Ayoosh Foundation</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">This is where Ayoosh becomes more than a brand, where we turn looking good, feeling 
good, and doing good into real impact for communities who need it most.</p>
                        <Link href="/about" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase font-semibold hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            Learn More
                        </Link>
                    </motion.div>

                </motion.div>
            </section>
        </div>
    );
}
