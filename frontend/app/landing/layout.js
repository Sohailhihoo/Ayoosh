/**
 * Landing Page Layout with SEO Optimization
 * 
 * Provides page-specific metadata for search engine optimization
 * and cross-browser compatibility.
 */

export const metadata = {
    title: 'Ayoosh - Premium Skincare, Skin Boosters & Sunglasses | Official Store',
    description: 'Shop Ayoosh for premium skincare products, K Pharmacy skin boosters, and designer sunglasses. Discover luxury beauty essentials with free shipping on orders. Visit ayooshonline.com',
    keywords: 'Ayoosh, skincare, skin booster, K Pharmacy, sunglasses, beauty products, premium skincare, luxury beauty, ayooshonline, beauty store',
    authors: [{ name: 'Ayoosh' }],
    creator: 'Ayoosh',
    publisher: 'Ayoosh',

    // Open Graph for social sharing
    openGraph: {
        title: 'Ayoosh - Premium Skincare, Skin Boosters & Sunglasses',
        description: 'Discover luxury skincare products, K Pharmacy skin boosters, and trendy sunglasses at Ayoosh.',
        url: 'https://ayooshonline.com/landing',
        siteName: 'Ayoosh',
        images: [
            {
                url: '/images/landing/hero.png',
                width: 1200,
                height: 630,
                alt: 'Ayoosh Premium Beauty Products',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },

    // Twitter Card
    twitter: {
        card: 'summary_large_image',
        title: 'Ayoosh - Premium Skincare, Skin Boosters & Sunglasses',
        description: 'Discover luxury skincare products and accessories at Ayoosh.',
        images: ['/images/landing/hero.png'],
        creator: '@ayooshonline',
    },

    // Robots
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    // Alternate URLs
    alternates: {
        canonical: 'https://ayooshonline.com/landing',
    },

    // Additional meta tags for browser compatibility
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    themeColor: '#444444',
};

export default function LandingLayout({ children }) {
    return children;
}
