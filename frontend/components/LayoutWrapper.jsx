'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewsletterPopup from '@/components/NewsletterPopup';

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

    // Pages that should hide the global footer
    const hideFooter = false;

    return (
        <>
            {!hideNavbar && <Navbar />}
            <main className="min-h-screen">
                <div key={pathname} style={{ animation: 'fadeIn 300ms ease-in' }}>
                    {children}
                </div>
            </main>
            {!hideFooter && <Footer />}
            <NewsletterPopup />
        </>
    );
}

