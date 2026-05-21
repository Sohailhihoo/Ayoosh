'use client';

import { useEffect, useState, useRef } from 'react';
import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * LoadingScreen Component
 * Shows on the very first visit (per session) for 800ms, then fades out.
 * Does NOT show on subsequent page navigations.
 */
export default function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const hasRun = useRef(false);

    useEffect(() => {
        // Strict-mode guard — only run once
        if (hasRun.current) return;
        hasRun.current = true;

        // If this session has already seen the loading screen, skip it
        if (sessionStorage.getItem('siteLoaded')) {
            setIsVisible(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('siteLoaded', 'true');
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="loading-screen">
            <div className="loading-spinner">
                <img
                    src={ASSETS.logos.loading}
                    alt=""
                    className="loading-logo"
                />
            </div>
        </div>
    );
}
