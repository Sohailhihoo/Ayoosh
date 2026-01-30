import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import { ASSETS } from '@/lib/cloudinary-assets';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12">

          {/* Brand - Full width on mobile */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 flex flex-col items-center lg:items-start mb-8 lg:mb-0">
            <Link href="/">
              <img
                src={ASSETS.logos.light}
                alt="Ayoosh Logo"
                className="h-24 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-gray-400 text-center lg:text-left">
              Look Good, Feel Good<br />and Do Good
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider mb-4 md:mb-6">Products</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="/products?category=inner-care" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Inner Care
                </Link>
              </li>
              <li>
                <Link href="/products?category=skin-care" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Skin Care
                </Link>
              </li>
              <li>
                <Link href="/products?category=scalp-care" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Scalp Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Guides */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider mb-4 md:mb-6">Guides</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="/news" className="text-sm text-gray-400 hover:text-white transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="/vision" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Vision
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Q&A
                </Link>
              </li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider mb-4 md:mb-6">Service</h3>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/consultation" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Consultation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider mb-4 md:mb-6">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebookF className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © 2025 Ayoosh. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="text-xs text-gray-500 hover:text-white transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
