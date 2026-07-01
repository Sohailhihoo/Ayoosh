const { createClient } = require('redis');

/**
 * Redis client for session management
 * Falls back to in-memory store if Redis is not available (development only)
 */

let redisClient = null;
let inMemoryStore = new Map(); // Fallback for dev without Redis

// Check if Redis URL is configured
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// In-memory fallback client (for development without Redis)
const inMemoryClient = {
    async setEx(key, expiry, value) {
        inMemoryStore.set(key, { value, expiry: Date.now() + expiry * 1000 });
        return 'OK';
    },
    async get(key) {
        const item = inMemoryStore.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            inMemoryStore.delete(key);
            return null;
        }
        return item.value;
    },
    async del(key) {
        inMemoryStore.delete(key);
        return 1;
    },
    async incr(key) {
        const item = inMemoryStore.get(key);
        const current = item && Date.now() <= item.expiry ? parseInt(item.value) || 0 : 0;
        const next = current + 1;
        inMemoryStore.set(key, { value: String(next), expiry: item?.expiry || Date.now() + 3600000 });
        return next;
    },
    async expire(key, seconds) {
        const item = inMemoryStore.get(key);
        if (item) {
            inMemoryStore.set(key, { ...item, expiry: Date.now() + seconds * 1000 });
            return 1;
        }
        return 0;
    },
    async sadd(key, ...members) {
        const item = inMemoryStore.get(key);
        const set = (item && Date.now() <= item.expiry) ? new Set(item.value) : new Set();
        let added = 0;
        for (const m of members) {
            if (!set.has(m)) { set.add(m); added++; }
        }
        inMemoryStore.set(key, { value: set, expiry: item?.expiry || Date.now() + 3600000 });
        return added;
    },
    async smembers(key) {
        const item = inMemoryStore.get(key);
        if (!item || Date.now() > item.expiry) return [];
        return [...item.value];
    },
    async srem(key, ...members) {
        const item = inMemoryStore.get(key);
        if (!item || Date.now() > item.expiry) return 0;
        const set = item.value;
        let removed = 0;
        for (const m of members) {
            if (set.has(m)) { set.delete(m); removed++; }
        }
        inMemoryStore.set(key, { ...item, value: set });
        return removed;
    },
    isMemoryFallback: true
};

// Try to connect to Redis, fall back to in-memory if failed
const initRedis = async () => {
    // If no REDIS_URL is set, default immediately to memory (skip connection attempt)
    if (!process.env.REDIS_URL) {
        console.log('ℹ️  No REDIS_URL found, using in-memory session store');
        return inMemoryClient;
    }

    try {
        redisClient = createClient({ url: redisUrl });
        redisClient.on('error', (err) => {
            console.error('Redis Client Error (handled):', err.message);
            // Don't crash, just log
        });

        // Set a short timeout for initial connection
        const connectPromise = redisClient.connect();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
        );

        await Promise.race([connectPromise, timeoutPromise]);
        console.log('✅ Connected to Redis');
        return redisClient;
    } catch (error) {
        console.warn('⚠️  Redis not available, using in-memory session store (development only)');
        return inMemoryClient;
    }
};

// Export a wrapper that returns the appropriate client
let clientReady = null;
const getClient = async () => {
    if (!clientReady) {
        clientReady = initRedis();
    }
    return clientReady;
};

// Create a proxy that forwards all calls to the actual client
const clientProxy = {
    async setEx(key, expiry, value) {
        const client = await getClient();
        return client.setEx(key, expiry, value);
    },
    async get(key) {
        const client = await getClient();
        return client.get(key);
    },
    async del(key) {
        const client = await getClient();
        return client.del(key);
    },
    async incr(key) {
        const client = await getClient();
        return client.incr(key);
    },
    async expire(key, seconds) {
        const client = await getClient();
        return client.expire(key, seconds);
    },
    async sadd(key, ...members) {
        const client = await getClient();
        return client.sadd(key, ...members);
    },
    async smembers(key) {
        const client = await getClient();
        return client.smembers(key);
    },
    async srem(key, ...members) {
        const client = await getClient();
        return client.srem(key, ...members);
    }
};

module.exports = clientProxy;
