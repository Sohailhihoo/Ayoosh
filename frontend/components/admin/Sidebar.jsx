'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    HiOutlineHome,
    HiOutlineShoppingBag,
    HiOutlineShoppingCart,
    HiOutlineUsers,
    HiOutlineChartBar,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineLogout,
} from 'react-icons/hi';
import { ASSETS } from '@/lib/cloudinary-assets';

const NAV_ITEMS = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineHome },
    { href: '/admin/products', label: 'Products', icon: HiOutlineShoppingBag },
    { href: '/admin/orders', label: 'Orders', icon: HiOutlineShoppingCart },
    { href: '/admin/customers', label: 'Customers', icon: HiOutlineUsers },
    { href: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
];

/**
 * AdminSidebar Component
 * 
 * Navigation sidebar for the admin dashboard
 * Features:
 * - Active route highlighting
 * - Collapsible on mobile
 * - Logout functionality
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Mobile menu open state
 * @param {Function} props.onClose - Close menu callback
 * @returns {JSX.Element}
 */
export default function AdminSidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-[#2d3748] text-white z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <Link href="/admin/dashboard" className="flex items-center space-x-2">
                        <img src={ASSETS.logos.main} alt="Admin" className="h-8 w-auto" />
                        <span className="text-xl font-semibold">Admin</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 hover:bg-gray-700 rounded"
                        aria-label="Close menu"
                    >
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-[#4a5568] text-white'
                                    : 'text-gray-300 hover:bg-[#374151] hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700">
                    <Link
                        href="/"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-[#374151] hover:text-white rounded-lg transition-colors"
                    >
                        <HiOutlineLogout className="w-5 h-5" />
                        <span className="font-medium">Back to Store</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
