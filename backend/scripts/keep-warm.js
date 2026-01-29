/**
 * Keep-Warm Script
 * 
 * Prevents Railway cold starts by pinging the API periodically.
 * Run this script via a cron job or external service to keep the server warm.
 * 
 * Usage:
 *   node scripts/keep-warm.js
 * 
 * Alternative: Use a free service like cron-job.org or UptimeRobot to ping your health endpoint
 */

const https = require('https');
const http = require('http');

// Configuration
const ENDPOINTS = [
    process.env.API_URL || 'https://backend-production-55b5.up.railway.app/api/health',
];

const TIMEOUT = 10000; // 10 seconds

/**
 * Ping an endpoint and log the response time
 */
const pingEndpoint = (url) => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const protocol = url.startsWith('https') ? https : http;

        const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
            const responseTime = Date.now() - startTime;

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[OK] ${url}`);
                console.log(`   Status: ${res.statusCode}`);
                console.log(`   Response Time: ${responseTime}ms`);
                resolve({ url, status: res.statusCode, responseTime, success: true });
            });
        });

        req.on('error', (err) => {
            const responseTime = Date.now() - startTime;
            console.log(`[ERROR] ${url}`);
            console.log(`   Error: ${err.message}`);
            console.log(`   Response Time: ${responseTime}ms`);
            resolve({ url, error: err.message, responseTime, success: false });
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`[TIMEOUT] ${url} - Timeout after ${TIMEOUT}ms`);
            resolve({ url, error: 'Timeout', responseTime: TIMEOUT, success: false });
        });
    });
};

/**
 * Main function - ping all endpoints
 */
const main = async () => {
    console.log('Keep-Warm Script');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('-'.repeat(50));

    const results = await Promise.all(ENDPOINTS.map(pingEndpoint));

    console.log('-'.repeat(50));

    const successful = results.filter(r => r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

    console.log(`Summary: ${successful}/${results.length} endpoints healthy`);
    console.log(`Average Response Time: ${Math.round(avgResponseTime)}ms`);
};

main().catch(console.error);
