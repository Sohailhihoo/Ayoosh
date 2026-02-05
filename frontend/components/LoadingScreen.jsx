'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * LoadingScreen Component
 * Shows on initial load (4.5s) and page navigation (3s)
 */
export default function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();
    const isFirstMount = useRef(true);
    const previousPathname = useRef(pathname);

    useEffect(() => {
        // Check if this is the initial load
        const hasLoadedBefore = sessionStorage.getItem('siteLoaded');

        // Determine if this is initial mount or a route change
        const isInitialLoad = isFirstMount.current && !hasLoadedBefore;
        const isRouteChange = previousPathname.current !== pathname;

        // Update refs
        previousPathname.current = pathname;

        if (isFirstMount.current) {
            isFirstMount.current = false;
            // Initial load - use 3s duration
            const timer = setTimeout(() => {
                setIsVisible(false);
                sessionStorage.setItem('siteLoaded', 'true');
            }, 3000);
            return () => clearTimeout(timer);
        }

        if (isRouteChange) {
            // Page navigation - show loading for 3s
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [pathname]);

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
