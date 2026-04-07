'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

// Default filter values
const DEFAULTS = {
    page: 1,
    limit: 12,
    sort: '-createdAt',
    productType: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    inStock: '',
    isFeatured: '',
    isNewArrival: '',
};

// Params that should reset page to 1 when changed
const FILTER_PARAMS = ['productType', 'category', 'brand', 'minPrice', 'maxPrice', 'search', 'inStock', 'isFeatured', 'isNewArrival', 'sort'];

/**
 * Custom hook for managing product filters via URL query parameters
 * URL is the single source of truth - survives refresh and is shareable
 */
export function useProductFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    /**
     * Get current filters from URL (source of truth)
     */
    const filters = useMemo(() => ({
        page: Number(searchParams.get('page')) || DEFAULTS.page,
        limit: Number(searchParams.get('limit')) || DEFAULTS.limit,
        sort: searchParams.get('sort') || DEFAULTS.sort,
        productType: searchParams.get('productType') || DEFAULTS.productType,
        category: searchParams.get('category') || DEFAULTS.category,
        brand: searchParams.get('brand') || DEFAULTS.brand,
        minPrice: searchParams.get('minPrice') || DEFAULTS.minPrice,
        maxPrice: searchParams.get('maxPrice') || DEFAULTS.maxPrice,
        search: searchParams.get('search') || DEFAULTS.search,
        inStock: searchParams.get('inStock') || DEFAULTS.inStock,
        isFeatured: searchParams.get('isFeatured') || DEFAULTS.isFeatured,
        isNewArrival: searchParams.get('isNewArrival') || DEFAULTS.isNewArrival,
    }), [searchParams]);

    /**
     * Build query string from params object
     */
    const buildQueryString = useCallback((params) => {
        const query = params.toString();
        return query ? `?${query}` : '';
    }, []);

    /**
     * Update a single filter
     * - If value is empty/null, removes the param
     * - If changing a filter param (not page), resets page to 1
     */
    const setFilter = useCallback((key, value) => {
        const params = new URLSearchParams(searchParams.toString());

        // Handle the value
        if (value === null || value === '' || value === DEFAULTS[key]) {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }

        // Reset page to 1 if changing a filter (not the page itself)
        if (key !== 'page' && FILTER_PARAMS.includes(key)) {
            params.delete('page'); // Remove page param (defaults to 1)
        }

        router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    }, [searchParams, pathname, router, buildQueryString]);

    /**
     * Update multiple filters at once
     */
    const setFilters = useCallback((updates) => {
        const params = new URLSearchParams(searchParams.toString());
        let shouldResetPage = false;

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '' || value === DEFAULTS[key]) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }

            // Check if we need to reset page
            if (key !== 'page' && FILTER_PARAMS.includes(key)) {
                shouldResetPage = true;
            }
        });

        // Reset page if any filter changed
        if (shouldResetPage && !('page' in updates)) {
            params.delete('page');
        }

        router.push(`${pathname}${buildQueryString(params)}`, { scroll: false });
    }, [searchParams, pathname, router, buildQueryString]);

    /**
     * Clear all filters (reset to defaults)
     */
    const clearFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    /**
     * Get params object for API call
     * Only includes non-default values
     */
    const getApiParams = useCallback(() => {
        const params = {};

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== DEFAULTS[key]) {
                params[key] = String(value);
            }
        });

        // Always include page and limit for API
        params.page = String(filters.page);
        params.limit = String(filters.limit);

        return params;
    }, [filters]);

    /**
     * Check if any filters are active
     */
    const hasActiveFilters = useMemo(() => {
        return FILTER_PARAMS.some(key => {
            return filters[key] && filters[key] !== DEFAULTS[key];
        });
    }, [filters]);

    return {
        filters,
        setFilter,
        setFilters,
        clearFilters,
        getApiParams,
        hasActiveFilters,
    };
}
