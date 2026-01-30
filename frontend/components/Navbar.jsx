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
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems, fetchCart } = useCartStore();
  const { isAuthenticated, user, logout, checkAuth, isLoading } = useAuthStore();
  const pathname = usePathname();

  // Pages where navbar should be transparent (overlay)
  const isTransparentPage = pathname === '/beauty' || pathname === '/sunglasses';

  // Determine navbar styles based on scroll state and current page
  const getNavClasses = () => {
    if (isTransparentPage) {
      if (isScrolled) {
        // Special case for sunglasses: keep transparent bg but switch to black text
        if (pathname === '/sunglasses') {
          return 'fixed top-0 w-full z-50 transition-all duration-300 bg-transparent text-gray-900 shadow-none';
        }
        return 'fixed top-0 w-full z-50 transition-all duration-300 bg-white text-black shadow-lg';
      }
      return 'fixed top-0 w-full z-50 transition-all duration-300 bg-transparent text-white border-none';
    }
    return 'sticky top-0 bg-white text-black shadow-lg z-50';
  };

  const navClasses = getNavClasses();

  /**
   * Initialize user session and cart data, setup scroll listener
   */
  useEffect(() => {
    checkAuth(); // Validate session via /auth/me
    fetchCart();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
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
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-24">

            {/* Logo (Left-aligned) */}
            <Link
              href="/home"
              className={`flex-shrink-0 mr-12 ${isTransparentPage && !isScrolled ? 'mt-12 -ml-8' : '-ml-6'}`} // Conditional spacing
              aria-label="Ayoosh home"
            >
              <img
                src={isScrolled || !isTransparentPage ? ASSETS.logos.main : ASSETS.logos.light}
                alt="Ayoosh logo"
                className={`w-auto object-contain ${isTransparentPage && !isScrolled ? 'h-20' : 'h-12'}`}
                width="auto"
                height="48"
              />
            </Link>

            {/* Middle (Nav Items - now on Right) */}
            <div className="hidden md:flex items-center space-x-8 ml-auto mr-12">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base tracking-widest hover:opacity-70 transition-opacity"
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Navigation (Search, Account, Cart) */}
            <div className="flex items-center space-x-6">

              {/* Mobile Menu Button (Visible only on mobile, aligned with right section) */}
              <button
                className="md:hidden p-2 mr-4"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <HiOutlineX className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <HiOutlineMenu className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
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
