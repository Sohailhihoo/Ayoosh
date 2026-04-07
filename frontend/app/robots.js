/**
 * Robots.txt Generator for SEO
 * 
 * Controls how search engine crawlers access the site
 */
export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/_next/'],
            },
        ],
        sitemap: 'https://ayooshonline.com/sitemap.xml',
    };
}
