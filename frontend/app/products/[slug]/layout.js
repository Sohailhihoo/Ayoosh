const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export async function generateMetadata({ params }) {
    const { slug } = await params;

    try {
        const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 3600 } });
        const { data } = await res.json();

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
    } catch {
        return {
            title: 'Product | Ayoosh',
            description: 'Shop premium beauty products at Ayoosh.',
        };
    }
}

export default function ProductLayout({ children }) {
    return children;
}
