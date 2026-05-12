import React from 'react';

export const metadata = {
    title: 'Blog | Ayoosh',
    description: 'Stay updated with the latest beauty tips, skincare advice, and Ayoosh news.',
    alternates: {
        canonical: '/blogs',
    },
    openGraph: {
        title: 'Blog | Ayoosh',
        description: 'Stay updated with the latest beauty tips, skincare advice, and Ayoosh news.',
        url: 'https://ayooshonline.com/blogs',
        siteName: 'Ayoosh',
        type: 'website',
    },
};

export default function BlogsPage() {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Blogs</h1>
            <p className="text-lg text-gray-600">Our latest updates coming soon.</p>
        </div>
    );
}
