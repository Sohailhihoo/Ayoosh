'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { ASSETS } from '@/lib/cloudinary-assets';

// Inline SVG icons to avoid react-icons module issues
const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ShoppingBagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

// Navigation items configuration
const NAV_ITEMS = [
  { href: '/suncream', label: 'SUNCREAM', ariaLabel: 'Shop Suncream' },
  { href: '/sunglasses', label: 'SUNGLASSES', ariaLabel: 'Shop Sunglasses' },
  { href: '/about', label: 'ABOUT', ariaLabel: 'About us' },
  { href: '/products', label: 'SHOP', ariaLabel: 'Shop products' },
];

const SCROLL_THRESHOLD = 50;


/**
 * Navbar Component
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const { totalItems, fetchCart } = useCartStore();
  const { isAuthenticated, user, logout, checkAuth, isLoading } = useAuthStore();
  const { isHomeLoading } = useUIStore(); // Get loading state
  const pathname = usePathname();

  // Pages where navbar should be transparent (overlay)
  const isTransparentPage = ['/suncream', '/sunglasses', '/', '/home'].includes(pathname);

  // Check if on homepage
  const isHomePage = pathname === '/' || pathname === '/home';

  // Determine navbar styles based on scroll state and current page
  const getNavClasses = () => {
    // Special detailed logic for Sunglasses page (3 Stages)
    if (pathname === '/sunglasses') {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;

      // Stage 1: Hero (0 - 100vh) -> Transparent / White Text
      if (scrollPos < vh - 100) {
        return 'fixed top-0 w-full z-50 transition-all duration-300 bg-transparent text-white border-none';
      }
      // Stage 2: Product Scroll (100vh - 500vh) -> Transparent / Dark Text
      // We use 450vh to be safe as the scroll section ends
      else if (scrollPos < vh * 4.5) {
        return 'fixed top-0 w-full z-50 transition-all duration-300 bg-transparent text-gray-900 shadow-none';
      }
      // Stage 3: Rest of content -> White BG / Dark Text
      else {
        return 'fixed top-0 w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-md text-black shadow-lg';
      }
    }

    // Homepage: transparent at top, fully hidden when scrolled
    if (isHomePage) {
      if (isScrolled) {
        return 'fixed top-0 w-full z-50 bg-transparent text-white border-none opacity-0 pointer-events-none transition-opacity duration-500';
      }
      return 'fixed top-0 w-full z-50 bg-transparent text-white border-none opacity-100 transition-opacity duration-500';
    }

    if (isTransparentPage) {
      if (isScrolled) {
        return 'fixed top-0 w-full z-50 transition-all duration-300 bg-white text-black shadow-lg';
      }
      return 'fixed top-0 w-full z-50 transition-all duration-300 bg-transparent text-white border-none';
    }
    return 'sticky top-0 bg-white text-black shadow-lg z-50';
  };

  const navClasses = getNavClasses();

  // Determine which logo to use based on current navbar state
  const getLogoSrc = () => {
    // Sunglasses page has 3-stage logic
    if (pathname === '/sunglasses') {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;
      // Stage 1: Hero - use white logo on dark background
      if (scrollPos < vh - 100) {
        return ASSETS.logos.light;
      }
      // Stage 2 & 3: Use black logo on light/white background
      return ASSETS.logos.final;
    }

    // Homepage: always use white logo
    if (isHomePage) {
      return ASSETS.logos.light;
    }

    // Other transparent pages (suncream, etc.)
    if (isTransparentPage) {
      return isScrolled ? ASSETS.logos.final : ASSETS.logos.light;
    }

    // Default pages - always use main (black) logo
    return ASSETS.logos.final;
  };

  // Determine logo size based on navbar state
  const getLogoSize = () => {
    // Homepage: logo stays the same size always
    if (isHomePage) {
      return 'h-20 md:h-28';
    }

    if (pathname === '/sunglasses') {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;
      if (scrollPos < vh - 100) {
        return 'h-20 md:h-28'; // Large on hero
      }
      return 'h-14 md:h-20'; // Smaller after scroll
    }

    if (isTransparentPage && !isScrolled) {
      return 'h-20 md:h-28'; // Large on transparent
    }

    return 'h-14 md:h-20'; // Default smaller size
  };

  useEffect(() => {
    if (isHomePage) return;
    checkAuth();
    fetchCart();

    const handleScroll = () => {
      const pos = window.scrollY;
      setScrollPos(pos);
      setIsScrolled(pos > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkAuth, fetchCart, isHomePage]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    closeMenu();
  }, [logout, closeMenu]);

  // Never render navbar on homepage — it has its own logo animation
  if (isHomePage) return null;

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={`transition-all duration-300 z-50 ${navClasses}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 relative">
          <div className={`flex items-center justify-between transition-all duration-300 ${isHomePage ? 'h-32' : (isScrolled || !isTransparentPage ? 'h-24' : 'h-32')}`}>

            {/* Left Section: Mobile Menu & Desktop Nav */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 -ml-2 mr-4"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <XIcon className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="w-6 h-6" aria-hidden="true" />
                )}
              </button>

              {/* Desktop Nav Items (Moved to Left) */}
              <div className="hidden md:flex items-center gap-8">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-base tracking-widest hover:opacity-70 transition-opacity"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center Section: Logo (Absolute Centered) */}
            <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${(isHomeLoading && isHomePage) || (isHomePage && isScrolled) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <Link
                href="/home"
                className="block"
                aria-label="Ayoosh home"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getLogoSrc()}
                  alt="Ayoosh logo"
                  className={`w-auto object-contain transition-all duration-300 ${getLogoSize()}`}
                />
              </Link>
            </div>

            {/* Right Section: Icons */}
            <div className="flex items-center space-x-6">
              <button
                className="hover:opacity-70 transition-opacity hidden md:block"
                aria-label="Search products"
              >
                <SearchIcon className="w-6 h-6" />
              </button>

              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    className="hover:opacity-70 transition-opacity hidden md:block"
                    aria-label="Account menu"
                    aria-haspopup="true"
                  >
                    <UserIcon className="w-6 h-6" />
                  </button>
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-100"
                    role="menu"
                    aria-label="Account options"
                  >
                    <p className="px-4 py-2 text-sm text-gray-500">
                      Hi, {user?.firstName || 'User'}
                    </p>
                    <hr className="my-1" />
                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-gray-100"
                      role="menuitem"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hover:opacity-80 transition-opacity hidden md:block"
                  aria-label="Login to your account"
                >
                  <UserIcon className="w-6 h-6" />
                </Link>
              )}

              <Link
                href="/cart"
                className="text-base tracking-widest hover:opacity-80 transition-opacity flex items-center"
                aria-label={`Shopping cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              >
                <span className="hidden md:inline"><ShoppingBagIcon className="w-6 h-6" /></span>
                <span className="ml-1" aria-live="polite">({totalItems})</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden bg-white border-t border-gray-100"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="px-6 py-4 space-y-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-base tracking-widest hover:opacity-80"
                  onClick={closeMenu}
                  role="menuitem"
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              <button
                className="block text-base tracking-widest hover:opacity-80"
                aria-label="Search products"
              >
                SEARCH
              </button>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    className="block text-base tracking-widest hover:opacity-80"
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    MY ORDERS
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-base tracking-widest hover:opacity-80 text-left w-full"
                    role="menuitem"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block text-base tracking-widest hover:opacity-80"
                  onClick={closeMenu}
                  role="menuitem"
                  aria-label="Login to your account"
                >
                  ACCOUNT
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
