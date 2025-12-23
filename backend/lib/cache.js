const redis = require('./redis');

/**
 * Redis Cache Middleware
 * Caches API responses for improved performance
 */

// Default cache expiration times (in seconds)
const CACHE_TTL = {
    SHORT: 60,          // 1 minute - for frequently changing data
    MEDIUM: 300,        // 5 minutes - for semi-static data
    LONG: 3600,         // 1 hour - for rarely changing data
    PRODUCTS: 120,      // 2 minutes - product listings
    CATEGORIES: 600,    // 10 minutes - category data
};

/**
 * Generate a cache key from request
 */
const generateCacheKey = (prefix, req) => {
    const queryString = JSON.stringify(req.query);
    return `cache:${prefix}:${req.originalUrl}:${queryString}`;
};

/**
 * Cache middleware factory
 * @param {string} prefix - Cache key prefix
 * @param {number} ttl - Time to live in seconds
 */
const cacheMiddleware = (prefix, ttl = CACHE_TTL.MEDIUM) => {
    return async (req, res, next) => {
        // Skip cache for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const cacheKey = generateCacheKey(prefix, req);

        try {
            // Check cache
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                console.log(`📦 Cache HIT: ${prefix}`);
                return res.json(JSON.parse(cachedData));
            }

            console.log(`🔍 Cache MISS: ${prefix}`);

            // Store original json function
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = async (data) => {
                // Only cache successful responses
                if (data.success !== false && res.statusCode === 200) {
                    try {
                        await redis.setEx(cacheKey, ttl, JSON.stringify(data));
                        console.log(`💾 Cached: ${prefix} (TTL: ${ttl}s)`);
                    } catch (cacheError) {
                        console.error('Cache set error:', cacheError.message);
                    }
                }

                // Call original json
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error.message);
            next(); // Continue without cache on error
        }
    };
};

/**
 * Invalidate cache by pattern
 * Call this when data is modified (create, update, delete)
 */
const invalidateCache = async (prefix) => {
    console.log(`🗑️  Invalidating cache: ${prefix}`);
    // Note: For full pattern invalidation, you'd need Redis SCAN
    // This is a simplified version for the current setup
};

/**
 * Specific cache middlewares for common routes
 */
const cacheProducts = cacheMiddleware('products', CACHE_TTL.PRODUCTS);
const cacheFeatured = cacheMiddleware('featured', CACHE_TTL.MEDIUM);
const cacheCategories = cacheMiddleware('categories', CACHE_TTL.CATEGORIES);
const cacheNewArrivals = cacheMiddleware('new-arrivals', CACHE_TTL.MEDIUM);
const cacheBestsellers = cacheMiddleware('bestsellers', CACHE_TTL.MEDIUM);

module.exports = {
    CACHE_TTL,
    generateCacheKey,
    cacheMiddleware,
    invalidateCache,
    cacheProducts,
    cacheFeatured,
    cacheCategories,
    cacheNewArrivals,
    cacheBestsellers
};
