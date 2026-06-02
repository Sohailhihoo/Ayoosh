/**
 * Robots.txt Generator for SEO
 *
 * Controls how search engine crawlers access the site.
 * Blocks all crawlers on non-production environments (staging, preview).
 */
export default function robots() {
    const isProduction = process.env.NEXT_PUBLIC_SITE_URL === 'https://ayooshonline.com';

    if (!isProduction) {
        return {
            rules: [{ userAgent: '*', disallow: '/' }],
        };
    }

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/_next/', '/home'],
            },
        ],
        sitemap: 'https://ayooshonline.com/sitemap.xml',
    };
}
