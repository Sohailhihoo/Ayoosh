'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

/**
 * Mounted in root layout (inside Suspense) so it fires on every landing page.
 * Records clicks for analytics only — does not set a discount cookie.
 */
export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams?.get('ref');
        if (!refCode) return;

        const code = refCode.trim().toUpperCase();
        if (!code) return;

        // Record click server-side — fire-and-forget, never blocks UX
        api.post('/affiliates/click', {
            affiliateCode: code,
            landingPage: window.location.pathname,
        }).catch(() => {});
    }, [searchParams]);

    return null;
}
