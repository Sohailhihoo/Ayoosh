'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlineUser, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCartStore, useAuthStore } from '@/lib/store';
import { ASSETS } from '@/lib/cloudinary-assets';

// Navigation items configuration
const NAV_ITEMS = [
  { href: '/products', label: 'SHOP', ariaLabel: 'Shop products' },
  { href: '/about', label: 'ABOUT', ariaLabel: 'About us' },
  { href: '/contact', label: 'CONTACT', ariaLabel: 'Contact us' },
];

const SCROLL_THRESHOLD = 50;


/**
 * Navbar Component
 * 
 * Main navigation bar featuring:
 * - Announcement bar
 * - Responsive navigation menu
 * - Logo (centered)
 * - User authentication state
 * - Shopping cart with item count
 * - Mobile menu toggle
 * 
 * @returns {JSX.Element} The navigation component
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const { totalItems, fetchCart } = useCartStore();
  const { isAuthenticated, user, logout, checkAuth, isLoading } = useAuthStore();
  const pathname = usePathname();

  // Pages where navbar should be transparent (overlay)
  const isTransparentPage = pathname === '/beauty' || pathname === '/sunglasses';

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
      return ASSETS.logos.main;
    }

    // Beauty page and other transparent pages
    if (isTransparentPage) {
      return isScrolled ? ASSETS.logos.main : ASSETS.logos.light;
    }

    // Default pages - always use main (black) logo
    return ASSETS.logos.main;
  };

  // Determine logo size based on navbar state
  const getLogoSize = () => {
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

  /**
   * Initialize user session and cart data, setup scroll listener
   */
  useEffect(() => {
    checkAuth(); // Validate session via /auth/me
    fetchCart();

    const handleScroll = () => {
      const pos = window.scrollY;
      setScrollPos(pos);
      setIsScrolled(pos > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkAuth, fetchCart]);

  /**
   * Toggles mobile menu state
   */
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  /**
   * Closes mobile menu
   */
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  /**
   * Handles user logout
   */

  const handleLogout = useCallback(async () => {
    await logout();
    closeMenu();
  }, [logout, closeMenu]);

  return (
    <>


      {/* Main Navigation */}
      <nav
        className={`transition-all duration-300 z-50 ${navClasses}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 relative">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled || !isTransparentPage ? 'h-24' : 'h-32'}`}>

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
                  <HiOutlineX className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <HiOutlineMenu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>

              {/* Desktop Nav Items (Moved to Left) */}
              <div className="hidden md:flex items-center space-x-8">
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
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link
                href="/home"
                className="block"
                aria-label="Ayoosh home"
              >
                <img
                  src={getLogoSrc()}
                  alt="Ayoosh logo"
                  className={`w-auto object-contain transition-all duration-300 ${getLogoSize()}`}
                  width="auto"
                  height="80"
                />
              </Link>
            </div>

            {/* Right Section: Icons */}
            <div className="flex items-center space-x-6">
              <button
                className="hover:opacity-70 transition-opacity hidden md:block" // Removed text tracking classes
                aria-label="Search products"
              >
                <HiOutlineSearch className="w-6 h-6" />
              </button>

              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    className="hover:opacity-70 transition-opacity hidden md:block"
                    aria-label="Account menu"
                    aria-haspopup="true"
                  >
                    <HiOutlineUser className="w-6 h-6" />
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
                  <HiOutlineUser className="w-6 h-6" />
                </Link>
              )}

              <Link
                href="/cart"
                className="text-base tracking-widest hover:opacity-80 transition-opacity flex items-center"
                aria-label={`Shopping cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              >
                <span className="hidden md:inline"><HiOutlineShoppingBag className="w-6 h-6" /></span>
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
