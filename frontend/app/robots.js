export default function robots() {
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
