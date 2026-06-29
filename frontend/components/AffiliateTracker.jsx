'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

/**
 * Mounted in root layout (inside Suspense) so it fires on every landing page.
 * Last-touch: always overwrites the cookie when a ?ref= param is present.
 */
export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams?.get('ref');
        if (!refCode) return;

        const code = refCode.trim().toUpperCase();
        if (!code) return;

        // Set cookie immediately (last-touch overwrite — don't wait for API)
        const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
        document.cookie = `ayoosh_ref=${encodeURIComponent(code)}; expires=${expires}; path=/; SameSite=Lax`;

        // Record click server-side — fire-and-forget, never blocks UX
        api.post('/affiliates/click', {
            affiliateCode: code,
            landingPage: window.location.pathname,
        }).catch(() => {});
    }, [searchParams]);

    return null;
}
