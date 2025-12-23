'use client';

import { useState } from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import AdminSidebar from '@/components/admin/Sidebar';

/**
 * AdminLayout Component
 * 
 * Layout wrapper for admin pages
 * Provides sidebar navigation and main content area
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @returns {JSX.Element}
 */
export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Bar */}
                <header className="bg-white shadow-sm sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded"
                            aria-label="Open menu"
                        >
                            <HiOutlineMenu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-4 ml-auto">
                            <span className="text-sm text-gray-600">Welcome, Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
