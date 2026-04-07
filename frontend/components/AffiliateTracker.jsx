'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

/**
 * AffiliateTracker - Reads ?ref= from URL and stores affiliate code in cookie.
 * Mounted globally in layout so it works on any landing page.
 */
export default function AffiliateTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (!refCode) return;

        // Check if we already have this affiliate cookie
        const existingRef = getCookie('ayoosh_ref');
        if (existingRef === refCode.toUpperCase()) return;

        // Validate and record the click
        api.post('/affiliates/click', {
            affiliateCode: refCode,
            landingPage: window.location.pathname
        }).then(({ data }) => {
            if (data.success) {
                const days = data.cookieDuration || 7;
                setCookie('ayoosh_ref', refCode.toUpperCase(), days);
            }
        }).catch(() => {
            // Silently fail - don't block user experience
        });
    }, [searchParams]);

    return null; // This component renders nothing
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}
