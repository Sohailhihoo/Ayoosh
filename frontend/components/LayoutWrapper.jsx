'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';
import LoadingScreen from '@/components/LoadingScreen';

/**
 * LayoutWrapper Component
 *
 * Client component that conditionally renders Navbar and Footer
 * based on the current pathname. Hides them on specific pages
 * that have their own custom navigation.
 */
export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    // Pages that should hide the global navbar
    const hideNavbar = pathname === '/home';

    // Forms page: standalone full-screen, hide all chrome
    const isFormPage = pathname.startsWith('/forms/');

    return (
        <>
            <LoadingScreen />
            {!hideNavbar && !isFormPage && <Navbar />}
            <main className="min-h-screen">
                <div key={pathname} style={{ animation: 'fadeIn 300ms ease-in' }}>
                    {children}
                </div>
            </main>
            {!isFormPage && <Footer />}
            {!isFormPage && <NewsletterPopup />}
        </>
    );
}

