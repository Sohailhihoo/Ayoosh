'use client';

import { useEffect, useState, useRef } from 'react';
import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * LoadingScreen Component
 * Shows on the very first visit (per session) with a slow, smooth logo spin
 * then fades out elegantly. Does NOT show on subsequent navigations.
 *
 * Starts hidden on both server and client (isVisible = false) to avoid
 * hydration mismatch. Only shows after mount if it's a first visit.
 */
export default function LoadingScreen() {
    // Always start false — server and client agree, no hydration mismatch
    const [isVisible, setIsVisible] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        // Skip if already visited this session
        if (sessionStorage.getItem('siteLoaded')) return;

        // First visit — show loading screen then hide after 3.8s
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('siteLoaded', 'true');
        }, 1800);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="loading-screen">
            <div className="loading-spinner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ASSETS.logos.loading}
                    alt=""
                    className="loading-logo"
                />
            </div>
        </div>
    );
}
