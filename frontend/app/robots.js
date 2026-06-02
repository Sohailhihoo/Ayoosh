/**
 * Robots.txt Generator for SEO
 *
 * Controls how search engine crawlers access the site.
 * Blocks all crawlers on non-production environments (staging, preview).
 */
export default function robots() {
    const isProduction = process.env.NODE_ENV === 'production';

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
