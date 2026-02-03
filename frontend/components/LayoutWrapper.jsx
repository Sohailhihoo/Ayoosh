'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
    const hideNavbar = pathname === '/beauty-center' || pathname === '/home' || pathname === '/landing';

    // Pages that should hide the global footer
    const hideFooter = pathname === '/beauty-center' || pathname === '/landing';

    // Pages that handle their own loading animation
    const hideLoadingScreen = false;

    return (
        <>
            {!hideLoadingScreen && <LoadingScreen />}
            {!hideNavbar && <Navbar />}
            <main className="min-h-screen">
                {children}
            </main>
            {!hideFooter && <Footer />}
        </>
    );
}

