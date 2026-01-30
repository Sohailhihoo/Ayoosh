'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { FiDroplet, FiZap } from 'react-icons/fi';
import { BsSunglasses } from 'react-icons/bs';
import { FaHandHoldingHeart } from 'react-icons/fa';
import NewsletterPopup from '@/components/NewsletterPopup';
import { ASSETS } from '@/lib/cloudinary-assets';

// Animation variants for scroll-triggered animations
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

const fadeInLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

const fadeInRight = {
    hidden: { opacity: 0, x: 80 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
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
    const [logoMoved, setLogoMoved] = useState(false);
    const [stopRotation, setStopRotation] = useState(false);
    const [showFinalLogo, setShowFinalLogo] = useState(false);
    const heroRef = useRef(null);

    // Trigger logo animation sequence
    useEffect(() => {
        // Start movement after 4 seconds
        const moveTimer = setTimeout(() => {
            setLogoMoved(true);

            // Stop rotation 0.5 seconds AFTER movement starts
            setTimeout(() => {
                setStopRotation(true);
            }, 500);

            // Change to logo3 when movement completes (2 seconds duration)
            setTimeout(() => {
                setShowFinalLogo(true);
            }, 2000);

        }, 5000);

        return () => clearTimeout(moveTimer);
    }, []);

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



    return (
        <div className="bg-white">
            {/* Intro Logo Animation */}
            {/* Phase 1: Rotating Loading Logo (0s - 4s) -> Moves (4s - 5.5s) */}
            <div className={`fixed inset-0 z-[60] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${showFinalLogo ? 'opacity-0' : 'opacity-100'}`}>
                <motion.div
                    initial={{ scale: 1, rotate: 0, x: 0, y: 0 }}
                    animate={{
                        rotate: 360, // Keep rotating effectively by just targeting 360 with infinite repeat
                        x: logoMoved ? 'calc(min(-45vw, -600px) + 3px)' : 0, // Nudge 3px right
                        y: logoMoved ? '-42vh' : 0, // Move Up slightly less/more depending on height
                        scale: logoMoved ? 0.75 : 1, // Shrink slightly more (0.75)
                    }}
                    transition={{
                        rotate: { duration: 2, ease: "linear", repeat: Infinity }, // Never stop rotating
                        x: { duration: 1.5, ease: "easeInOut" },
                        y: { duration: 1.5, ease: "easeInOut" },
                        scale: { duration: 1.5, ease: "easeInOut" }
                    }}
                    className="relative w-[150px] h-[150px]"
                >
                    <img
                        src={ASSETS.logos.loading}
                        alt="Loading..."
                        className="w-full h-full object-contain"
                    />
                </motion.div>
            </div>

            {/* Phase 2: Final Logo (Appears after move completes) */}
            {/* This simulates the 'faded into permanent logo' effect at the destination position */}
            <motion.div
                className="fixed z-[55] w-32 h-32 md:w-48 md:h-48 pointer-events-none"
                style={{ top: 'calc(1.5rem - 3px)', left: 'calc(1.5rem - 3px)' }} // precise 3px nudge
                initial={{ opacity: 0 }}
                animate={{ opacity: showFinalLogo ? 1 : 0 }}
                transition={{ duration: 0.8 }}
            >
                <img
                    src={ASSETS.logos.final}
                    alt="Ayoosh"
                    className="w-full h-full object-contain"
                />
            </motion.div>

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
                className="relative h-screen min-h-[600px] flex flex-col md:flex-row"
                aria-label="Hero section"
            >
                {/* Left Panel - Skincare */}
                <Link
                    href="/beauty"
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
                        <source src="/videos/homepage/1.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>



                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
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
                        <source src="/videos/homepage/2.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Grey Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-700" aria-hidden="true"></div>

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" aria-hidden="true"></div>



                    {/* Border Glow Effect */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
                </Link>
            </section>

            {/* New Section - Picture & Text */}
            <section className="relative h-[50vh] min-h-[400px] flex flex-col md:flex-row overflow-hidden">

                {/* Left Panel - Image (Fade in from left) */}
                <motion.div
                    className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden group"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.3 }}
                    variants={fadeInLeft}
                >
                    <div className="absolute inset-0 bg-gray-900">
                        <img
                            src={ASSETS.homepage.rejoosh}
                            alt="Brand Philosophy"
                            className="w-full h-full object-contain p-8 transition-transform duration-1000 group-hover:scale-105 opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/10 transition-opacity duration-500 group-hover:opacity-0"></div>
                    </div>
                </motion.div>

                {/* Right Panel - Text (Fade in from right) */}
                <motion.div
                    className="w-full md:w-1/2 h-1/2 md:h-full bg-white flex flex-col items-center justify-center p-8 md:p-16 text-center"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.3 }}
                    variants={fadeInRight}
                >
                    <div className="max-w-xl">
                        <motion.h3
                            className="text-sm font-light tracking-[0.3em] uppercase text-gray-500 mb-4"
                            variants={fadeInUp}
                        >
                            Our Philosophy
                        </motion.h3>
                        <motion.h2
                            className="text-3xl md:text-5xl font-playfair font-medium text-gray-900 mb-8 leading-tight"
                            variants={fadeInUp}
                        >
                            Elevating Beauty <br /> to an Art Form
                        </motion.h2>
                        <motion.div
                            className="w-12 h-px bg-black mx-auto mb-8"
                            variants={fadeInUp}
                        />
                        <motion.p
                            className="text-gray-600 font-light leading-relaxed mb-8 text-lg"
                            variants={fadeInUp}
                        >
                            At Ayoosh, we believe that beauty is more than just appearance—it is a reflection of self-care and confidence.
                            Our curated collection brings together the finest elements of nature and science to enhance your natural radiance.
                        </motion.p>
                        <motion.div variants={fadeInUp}>
                            <Link
                                href="/about"
                                className="inline-block border-b border-black pb-1 text-sm tracking-[0.2em] uppercase hover:text-gray-600 hover:border-gray-400 transition-all duration-300"
                            >
                                Read Our Story
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

            </section>

            {/* New Section - 4 Boxes (Features/Values) */}
            <section className="bg-white py-20 px-6 md:px-12 border-t border-gray-100 mt-20">
                <motion.div
                    className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
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
                        <div className="text-3xl mb-4 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-500">
                            <FiDroplet />
                        </div>
                        <h3 className="text-lg font-playfair font-medium text-gray-900 mb-2">Skincare</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">Discover our carefully curated collection of premium skincare products, designed to nourish and protect your skin.</p>
                        <Link href="/products?category=skincare" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            Shop Now
                        </Link>
                    </motion.div>

                    {/* Box 2 */}
                    <motion.div
                        className="group p-8 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-lg text-center flex flex-col items-center"
                        variants={scaleIn}
                    >
                        <div className="text-3xl mb-4 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-500">
                            <FiZap />
                        </div>
                        <h3 className="text-lg font-playfair font-medium text-gray-900 mb-2">Skin Booster</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">Experience the power of skin-boosting treatments tailored to your skin type.</p>
                        <Link href="/products?category=skin-booster" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            Shop Now
                        </Link>
                    </motion.div>

                    {/* Box 3 */}
                    <motion.div
                        className="group p-8 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-lg text-center flex flex-col items-center"
                        variants={scaleIn}
                    >
                        <div className="text-3xl mb-4 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-500">
                            <BsSunglasses />
                        </div>
                        <h3 className="text-lg font-playfair font-medium text-gray-900 mb-2">Sunglasses</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">Protect your eyes with our premium collection of designer sunglasses.</p>
                        <Link href="/products?category=sunglasses" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            Shop Now
                        </Link>
                    </motion.div>

                    {/* Box 4 */}
                    <motion.div
                        className="group p-8 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-lg text-center flex flex-col items-center"
                        variants={scaleIn}
                    >
                        <div className="text-3xl mb-4 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-500">
                            <FaHandHoldingHeart />
                        </div>
                        <h3 className="text-lg font-playfair font-medium text-gray-900 mb-2">Ayoosh Foundation</h3>
                        <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">Supporting community initiatives and empowering women through beauty.</p>
                        <Link href="/about" className="inline-block border-b border-black pb-1 text-xs tracking-[0.2em] uppercase hover:text-gray-600 hover:border-gray-400 transition-all duration-300">
                            Learn More
                        </Link>
                    </motion.div>

                </motion.div>
            </section>
        </div>
    );
}