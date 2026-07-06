'use client';

import { useEffect, useState, Suspense } from 'react';
import { productAPI } from '@/lib/api';
import { useProductFilters } from '@/hooks/useProductFilters';
import ProductCard from '@/components/ProductCard';
import SearchInput from '@/components/SearchInput';

// Inline SVG icons to avoid react-icons module issues
const AdjustmentsIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);

const XIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // URL-based filters (single source of truth)
  const {
    filters,
    setFilter,
    clearFilters,
    getApiParams,
    hasActiveFilters
  } = useProductFilters();

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getAll(getApiParams());
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || {});
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]); // Re-fetch when URL params change

  const productTypes = ['suncream', 'sunglasses', 'accessories'];
  const categoryLabels = {
    suncream: 'Skin Care',
    sunglasses: 'Sunglasses',
    accessories: 'Accessories'
  };
  const sortOptions = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-soldCount', label: 'Best Selling' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {filters.productType
              ? categoryLabels[filters.productType] || (filters.productType.charAt(0).toUpperCase() + filters.productType.slice(1))
              : 'All Products'}
          </h1>
          <p className="text-gray-600 mt-2">
            {pagination.total || 0} products found
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Search</h3>
                <SearchInput placeholder="Search products..." className="w-full" />
              </div>

              {/* Product Type */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType"
                      checked={!filters.productType}
                      onChange={() => setFilter('productType', null)}
                      className="text-yellow-600 focus:ring-yellow-500"
                    />
                    <span>All</span>
                  </label>
                  {productTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="productType"
                        checked={filters.productType === type}
                        onChange={() => setFilter('productType', type)}
                        className="text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="capitalize">{categoryLabels[type]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilter('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilter('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock === 'true'}
                    onChange={(e) => setFilter('inStock', e.target.checked ? 'true' : null)}
                    className="text-yellow-600 focus:ring-yellow-500 rounded"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
              >
                <AdjustmentsIcon className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>

              <select
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 btn-primary"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                {/* Previous */}
                <button
                  onClick={() => setFilter('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="px-4 py-2 rounded-lg font-medium bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (filters.page <= 3) {
                    pageNum = i + 1;
                  } else if (filters.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = filters.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setFilter('page', pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${filters.page === pageNum
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => setFilter('page', filters.page + 1)}
                  disabled={filters.page >= pagination.pages}
                  className="px-4 py-2 rounded-lg font-medium bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Search</h3>
              <SearchInput placeholder="Search products..." className="w-full" />
            </div>

            {/* Category */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="productType-mobile"
                    checked={!filters.productType}
                    onChange={() => setFilter('productType', null)}
                    className="text-yellow-600 focus:ring-yellow-500"
                  />
                  <span>All</span>
                </label>
                {productTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="productType-mobile"
                      checked={filters.productType === type}
                      onChange={() => setFilter('productType', type)}
                      className="text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="capitalize">{categoryLabels[type]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            {/* In Stock */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock === 'true'}
                  onChange={(e) => setFilter('inStock', e.target.checked ? 'true' : null)}
                  className="text-yellow-600 focus:ring-yellow-500 rounded"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="flex-1 btn-secondary"
              >
                Clear
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 btn-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
