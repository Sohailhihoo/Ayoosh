/**
 * Dynamic Sitemap Generator for SEO
 *
 * Generates sitemap.xml with static pages and dynamic product pages
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export default async function sitemap() {
    const baseUrl = 'https://ayooshonline.com';

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${baseUrl}/suncream`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/sunglasses`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ];

    // Dynamic product pages
    let productPages = [];
    try {
        const res = await fetch(`${API_URL}/products?limit=1000`, { next: { revalidate: 3600 } });
        const { data } = await res.json();
        const products = data?.products || [];

        productPages = products
            .filter(p => p.status === 'active' && p.slug)
            .map(product => ({
                url: `${baseUrl}/products/${product.slug}`,
                lastModified: new Date(product.updatedAt || Date.now()),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
    } catch {
        // If API is unavailable, return static pages only
    }

    return [...staticPages, ...productPages];
}
