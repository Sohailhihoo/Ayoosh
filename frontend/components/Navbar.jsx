'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useCartStore, useAuthStore } from '@/lib/store';

// Navigation items configuration
const NAV_ITEMS = [
  { href: '/products', label: 'SHOP', ariaLabel: 'Shop products' },
  { href: '/about', label: 'ABOUT', ariaLabel: 'About us' },
  { href: '/contact', label: 'CONTACT', ariaLabel: 'Contact us' },
];

const SCROLL_THRESHOLD = 50;
const ANNOUNCEMENT_TEXT = 'FREE US SHIPPING ON ORDERS OVER $45';

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
      {/* Announcement Bar */}
      <div
        className="bg-[#f5f5f5] text-center py-3 text-sm tracking-wide text-gray-700"
        role="banner"
        aria-label="Promotional announcement"
      >
        {ANNOUNCEMENT_TEXT}
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-50 bg-white text-black transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-24">

            {/* Left Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm tracking-widest hover:opacity-70 transition-opacity"
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
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

            {/* Center Logo */}
            <Link
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2"
              aria-label="Ayush home"
            >
              <img
                src="/images/brand/logo.png"
                alt="Ayush logo"
                className="h-20 w-auto object-contain"
                width="auto"
                height="80"
              />
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center space-x-6">
              <button
                className="text-sm tracking-widest hover:opacity-70 transition-opacity hidden md:block"
                aria-label="Search products"
              >
                SEARCH
              </button>

              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    className="text-sm tracking-widest hover:opacity-70 transition-opacity hidden md:block"
                    aria-label="Account menu"
                    aria-haspopup="true"
                  >
                    ACCOUNT
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
                  className="text-sm tracking-widest hover:opacity-70 transition-opacity hidden md:block"
                  aria-label="Login to your account"
                >
                  ACCOUNT
                </Link>
              )}

              <Link
                href="/cart"
                className="text-sm tracking-widest hover:opacity-70 transition-opacity flex items-center"
                aria-label={`Shopping cart with ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              >
                <span className="hidden md:inline">CART</span>
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
                  className="block text-sm tracking-widest hover:opacity-70"
                  onClick={closeMenu}
                  role="menuitem"
                  aria-label={item.ariaLabel}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              <button
                className="block text-sm tracking-widest hover:opacity-70"
                aria-label="Search products"
              >
                SEARCH
              </button>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/orders"
                    className="block text-sm tracking-widest hover:opacity-70"
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    MY ORDERS
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block text-sm tracking-widest hover:opacity-70 text-left w-full"
                    role="menuitem"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block text-sm tracking-widest hover:opacity-70"
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
