'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { affiliateAPI } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { ASSETS } from '@/lib/cloudinary-assets';
import cloudinaryLoader from '@/lib/cloudinary-loader';

export default function AffiliateLayout({ children }) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
    const [affiliate, setAffiliate] = useState(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.push('/login?redirect=/affiliate/dashboard');
            return;
        }
        affiliateAPI.getMe()
            .then(({ data }) => setAffiliate(data.data))
            .catch(() => setAffiliate(null))
            .finally(() => setChecking(false));
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    if (!affiliate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-xl font-bold text-gray-900 mb-2">No affiliate account found</h1>
                <p className="text-sm text-gray-500 mb-6">Your account hasn&apos;t been linked to an affiliate profile yet.<br />Contact Ayoosh to get set up.</p>
                <Link href="/" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700">
                    Back to Store
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Nav */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image loader={cloudinaryLoader} src={ASSETS.logos.main} alt="Ayoosh" width={80} height={80} className="h-7 w-auto" />
                        <span className="text-sm font-medium text-gray-500">Affiliate Portal</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Hi, {user?.firstName}</span>
                        <Link href="/" className="text-gray-400 hover:text-gray-700">← Store</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Pass affiliate down via context-free prop drilling — children re-fetch if needed */}
                {children}
            </main>
        </div>
    );
}
