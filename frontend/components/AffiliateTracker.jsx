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

        // Session cookie — no expires means browser deletes it when closed.
        // Discount is only valid for the session in which the customer clicked the influencer link.
        document.cookie = `ayoosh_ref=${encodeURIComponent(code)}; path=/; SameSite=Lax`;

        // Record click server-side — fire-and-forget, never blocks UX
        api.post('/affiliates/click', {
            affiliateCode: code,
            landingPage: window.location.pathname,
        }).catch(() => {});
    }, [searchParams]);

    return null;
}
