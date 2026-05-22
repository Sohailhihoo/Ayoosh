'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import cloudinaryLoader from '@/lib/cloudinary-loader';

/**
 * HeroLogoAnimation Component
 *
 * Logic:
 * - First visit: Shows full animation (rotate → move → pause → fade to white)
 * - Subsequent visits: Shows white logo immediately (permanent brand logo)
 */
export default function HeroLogoAnimation() {
    const [phase, setPhase] = useState(() => {
        // Check if user has seen the animation before
        const hasSeenAnimation = sessionStorage.getItem('logoAnimationComplete');
        // If they have, skip directly to 'complete' phase (white logo)
        return hasSeenAnimation ? 'complete' : 'rotating';
    });
    const [scrollY, setScrollY] = useState(0);

    // Track scroll position for all phases (needed to hide logo on scroll)
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide the logo when user scrolls past the hero
    const isHidden = scrollY > 50;

    useEffect(() => {
        // If starting in complete phase (returning visitor), don't set up timer
        if (phase === 'complete') return;

        // Track scroll position for animation trigger is handled above

        // No additional scroll listener needed here

        // Auto-transition after 3 seconds if user hasn't scrolled
        const autoTransitionTimer = setTimeout(() => {
            if (phase === 'rotating') {
                setPhase('transitioning');
            }
        }, 3000);

        return () => {
            clearTimeout(autoTransitionTimer);
        };
    }, [phase]);

    // Trigger transition when user scrolls down
    useEffect(() => {
        if (scrollY > 50 && phase === 'rotating') {
            setPhase('transitioning');
        }
    }, [scrollY, phase]);

    // After moving to top, pause then fade
    useEffect(() => {
        if (phase === 'transitioning') {
            const pauseTimer = setTimeout(() => {
                setPhase('paused');
            }, 1500);

            return () => clearTimeout(pauseTimer);
        }

        if (phase === 'paused') {
            const fadeTimer = setTimeout(() => {
                setPhase('fading');
            }, 100);

            return () => clearTimeout(fadeTimer);
        }

        if (phase === 'fading') {
            const completeTimer = setTimeout(() => {
                setPhase('complete');
                // Mark animation as complete for future visits
                sessionStorage.setItem('logoAnimationComplete', 'true');
            }, 800);

            return () => clearTimeout(completeTimer);
        }
    }, [phase]);

    return (
        <div className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${isHidden ? 'opacity-0' : 'opacity-100'}`} style={{ zIndex: 45 }}>
            <AnimatePresence>
                {/* Rotating Logo Phase - only on first visit */}
                {phase === 'rotating' && (
                    <motion.div
                        key="rotating-logo"
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.img
                            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769514667/ayoosh-beauty/brand/logos/loading.png"
                            alt="Ayoosh Logo"
                            className="w-20 h-20 md:w-24 md:h-24 object-contain"
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 3,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                )}

                {/* Transitioning Phase */}
                {phase === 'transitioning' && (
                    <motion.div
                        key="moving-logo"
                        className="absolute left-1/2 top-1/2"
                        initial={{
                            x: '-50%',
                            y: '-50%',
                            opacity: 1
                        }}
                        animate={{
                            x: '-50%',
                            y: 'calc(-50vh + 0.5rem)',
                            opacity: 1
                        }}
                        transition={{
                            duration: 1.5,
                            ease: [0.43, 0.13, 0.23, 0.96]
                        }}
                    >
                        <Image
                            loader={cloudinaryLoader}
                            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769514667/ayoosh-beauty/brand/logos/loading.png"
                            alt="Ayoosh Logo"
                            width={96}
                            height={96}
                            className="w-20 h-20 md:w-24 md:h-24 object-contain"
                        />
                    </motion.div>
                )}

                {/* Paused Phase */}
                {phase === 'paused' && (
                    <motion.div
                        key="paused-logo"
                        className="absolute left-1/2 top-2"
                        style={{ x: '-50%' }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                    >
                        <Image
                            loader={cloudinaryLoader}
                            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769514667/ayoosh-beauty/brand/logos/loading.png"
                            alt="Ayoosh Logo"
                            width={96}
                            height={96}
                            className="w-20 h-20 md:w-24 md:h-24 object-contain"
                        />
                    </motion.div>
                )}

                {/* Fading Phase */}
                {phase === 'fading' && (
                    <>
                        <motion.div
                            key="fading-out-logo"
                            className="absolute left-1/2 top-2"
                            style={{ x: '-50%' }}
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Image
                                loader={cloudinaryLoader}
                                src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769514667/ayoosh-beauty/brand/logos/loading.png"
                                alt="Ayoosh Logo"
                                width={96}
                                height={96}
                                className="w-20 h-20 md:w-24 md:h-24 object-contain"
                            />
                        </motion.div>

                        <motion.div
                            key="fading-in-white-logo"
                            className="absolute left-1/2 top-2"
                            style={{ x: '-50%' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Image
                                loader={cloudinaryLoader}
                                src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769783995/White-color-Logo_tre0tf.png"
                                alt="Ayoosh"
                                width={200}
                                height={200}
                                className="object-contain w-20 h-20 md:w-[200px] md:h-[200px]"
                            />
                        </motion.div>
                    </>
                )}

                {/* Complete Phase - Permanent white logo (shown on all visits) */}
                {phase === 'complete' && (
                    <motion.div
                        key="white-logo-permanent"
                        className="absolute left-1/2 top-2"
                        style={{ x: '-50%' }}
                        initial={{ opacity: 1 }}
                    >
                        <Image
                            loader={cloudinaryLoader}
                            src="https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769783995/White-color-Logo_tre0tf.png"
                            alt="Ayoosh"
                            width={200}
                            height={200}
                            className="object-contain w-20 h-20 md:w-[200px] md:h-[200px]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
