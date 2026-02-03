const { createClient } = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(`Testing connection to: ${redisUrl}`);

const client = createClient({ url: redisUrl });

client.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
    process.exit(1);
});

(async () => {
    try {
        await client.connect();
        console.log('✅ Successfully connected to Redis!');
        await client.set('test_key', 'Hello Redis');
        const value = await client.get('test_key');
        console.log('Test key value:', value);
        await client.del('test_key');
        await client.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to connect:', error.message);
        process.exit(1);
    }
})();
