'use client';

import { useEffect, useState } from 'react';
import { ASSETS } from '@/lib/cloudinary-assets';
import ProductScroller from '@/components/ProductScroller';
import HeroSection from '@/components/HeroSection';

import SplitFeatureSection from '@/components/SplitFeatureSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import VideoShowcase from '@/components/VideoShowcase';
import BrandLogos from '@/components/BrandLogos';
import ReviewForm from '@/components/ReviewForm';
import ReviewCarousel from '@/components/ReviewCarousel';
import PromoBar from '@/components/PromoBar';

// Title style for hero section
const heroTitleStyle = {
    fontFamily: "'Tan Pearl', serif",
    fontWeight: 400,
    fontSize: 'clamp(28px, 4vw, 48px)', // Reduced from 36px, 6vw, 64px
    lineHeight: '1.2',
    letterSpacing: '0.02em'
};

// Hero buttons configuration
const heroButtons = [
    { href: '/products?productType=suncream', label: 'Shop Now', variant: 'primary' },

];

// Split section configuration
const splitSectionConfig = {
    leftPanel: {
        subtitle: 'THE AYOOSH DIFFERENCE',
        title: 'Why Choose',
        titleHighlight: 'Us?',
        description: 'Your skin deserves more than just SPF. Ayoosh sun care blends advanced Korean skincare with everyday protection to care for your skin while shielding it from the sun. Lightweight, breathable, and made to feel comfortable all day, it protects without the white cast, heaviness, or greasy finish, so your skin feels as good as it looks.',
        tags: [
            'SPF 50+ PA+++ Lightweight',
            'Natural Glow, No White Cast',
            'All Skin Types',
            'UVA & UVB Protection',
            'Dermatologically Tested'
        ]
    },
    rightPanel: {
        imageOnly: true,
        backgroundImage: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto/v1769691023/Why_choose_ayoosh_bjb1af.jpg'
    }
};

export default function BeautyPage() {
    // Sample featured products with Cloudinary image
    const featuredProducts = [
        {
            _id: '69825dab2d01b1efb437017c',
            slug: 'sun-cream-50ml-tube',
            name: 'Centella Cica Glow Sun Cream',
            variant: '50ml Tube',
            price: 484.99,
            priceNote: '(incl delivery)',
            image: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto/v1769715388/Sun_Tube_cmxezs.png',
            rating: 5.0
        },
        {
            _id: '69825dab2d01b1efb4370176',
            slug: 'sun-cream-pouch',
            name: 'Centella Cica Glow Sun Cream',
            variant: '10 x 5ml Sachet',
            price: 424.99,
            compareAtPrice: 474.99,
            priceNote: '(incl delivery)',
            image: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto/v1769748802/Pouch_and_Sachet_bjidrn.png',
            rating: 5.0,
            imageScale: 1.4
        }
    ];

    return (
        <div className="min-h-screen bg-[#f4f2f0]">
            {/* Hero Section */}
            <HeroSection
                videoSrc="https://res.cloudinary.com/dpdg462fb/video/upload/q_auto/v1770179476/hero_utjppl.mp4"
                title="AYOOSH SUN CREAM"
                titleStyle={heroTitleStyle}
                buttons={heroButtons}
                overlayOpacity={0}
                align="bottom-left"
            />

            {/* Scrollytelling Section */}
            <ProductScroller />



            {/* Two-Split Feature Section */}
            <SplitFeatureSection
                leftPanel={splitSectionConfig.leftPanel}
                rightPanel={splitSectionConfig.rightPanel}
            />

            {/* Featured Products Section */}
            <FeaturedProducts
                title="Trending Now"
                products={featuredProducts}
                maxProducts={2}
            />

            {/* Promo Bar */}
            <PromoBar />

            {/* Video Showcase Section */}
            <VideoShowcase />

            {/* Brand Logos (Partners) */}
            <BrandLogos />

            {/* Customer Reviews Carousel */}
            <ReviewCarousel page="suncream" />

            {/* Review Form */}
            <ReviewForm page="suncream" />
        </div>
    );
}
