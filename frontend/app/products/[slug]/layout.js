const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

async function getProduct(slug) {
    try {
        const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 3600 } });
        const { data } = await res.json();
        return data || null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const data = await getProduct(slug);

    if (!data) {
        return {
            title: 'Product Not Found | Ayoosh',
            description: 'The product you are looking for could not be found.',
        };
    }

    const title = data.metaTitle || `${data.name} | Ayoosh`;
    const description = data.metaDescription || data.description || `Shop ${data.name} from Ayoosh. Premium quality beauty products.`;
    const image = data.images?.[0]?.url || '/og-image.jpg';

    return {
        title,
        description,
        alternates: {
            canonical: `/products/${slug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://ayooshonline.com/products/${slug}`,
            siteName: 'Ayoosh',
            images: [{ url: image, width: 800, height: 800, alt: data.name }],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    };
}

export default async function ProductLayout({ children, params }) {
    const { slug } = await params;
    const data = await getProduct(slug);

    const jsonLd = data ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.metaDescription || data.description,
        image: data.images?.map(img => img.url) || [],
        brand: {
            '@type': 'Brand',
            name: data.brand || 'Ayoosh',
        },
        sku: data.sku,
        url: `https://ayooshonline.com/products/${slug}`,
        offers: {
            '@type': 'Offer',
            url: `https://ayooshonline.com/products/${slug}`,
            priceCurrency: 'ZAR',
            price: data.price,
            ...(data.compareAtPrice ? { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } : {}),
            availability: data.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Ayoosh',
            },
        },
        ...(data.averageRating > 0 ? {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: data.averageRating,
                reviewCount: data.reviewCount || 1,
            },
        } : {}),
    } : null;

    // JSON-LD is safe here: JSON.stringify escapes all special characters,
    // and the data comes from our own database, not user input
    const jsonLdScript = jsonLd ? JSON.stringify(jsonLd) : null;

    return (
        <>
            {jsonLdScript && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdScript }}
                />
            )}
            {children}
        </>
    );
}
