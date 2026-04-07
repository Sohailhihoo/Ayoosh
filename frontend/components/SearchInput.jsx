'use client';

import { useState, useEffect, useRef } from 'react';
import { useProductFilters } from '@/hooks/useProductFilters';

// Inline SVG icons to avoid react-icons module issues
const SearchIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/**
 * SearchInput Component
 * 
 * Debounced search input that syncs with URL query params
 * - Immediate UI feedback via local state
 * - Debounced URL updates (prevents flooding server)
 * - Enter key submits immediately
 * - Syncs with URL on mount and external changes
 */
export default function SearchInput({
    placeholder = 'Search products...',
    debounceMs = 500,
    className = '',
}) {
    const { filters, setFilter } = useProductFilters();

    // Local state for immediate UI feedback
    const [inputValue, setInputValue] = useState(filters.search);

    // Ref to store the debounce timer
    const timerRef = useRef(null);

    /**
     * Sync local state with URL on mount and when URL changes externally
     */
    useEffect(() => {
        setInputValue(filters.search);
    }, [filters.search]);

    /**
     * Debounced URL update
     */
    useEffect(() => {
        // Don't trigger on initial mount sync
        if (inputValue === filters.search) return;

        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set new timer
        timerRef.current = setTimeout(() => {
            setFilter('search', inputValue || null);
        }, debounceMs);

        // Cleanup on unmount or value change
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [inputValue, debounceMs, setFilter, filters.search]);

    /**
     * Handle input change - updates local state immediately
     */
    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    /**
     * Clear search - updates both local state and URL immediately
     */
    const handleClear = () => {
        setInputValue('');
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setFilter('search', null);
    };

    /**
     * Handle Enter key - submit immediately without waiting for debounce
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            setFilter('search', inputValue || null);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Icon */}
            <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />

            {/* Input */}
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
                   placeholder-gray-400 text-gray-900"
                aria-label="Search products"
            />

            {/* Clear Button */}
            {inputValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                     hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                >
                    <XIcon className="w-4 h-4 text-gray-500" />
                </button>
            )}
        </div>
    );
}
