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
        description: 'Being the best sun cream brand, we know that your skin deserves care, not just SPF. Ayoosh sun range is built to fit real South African life, not just skincare routines.',
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
        backgroundImage: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769691023/Why_choose_ayoosh_bjb1af.jpg'
    }
};

export default function BeautyPage() {
    // Sample featured products with Cloudinary image
    const featuredProducts = [
        {
            _id: 'featured-1',
            name: 'SUN CREAM',
            variant: '50ml Tube',
            price: 20,
            image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769715388/Sun_Tube_cmxezs.png',
            onSale: true,
            rating: 5.0
        },
        {
            _id: 'featured-2',
            name: 'SUN CREAM POUCH',
            variant: '10 x 5ml Sachet',
            price: 20,
            image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769748802/Pouch_and_Sachet_bjidrn.png',
            onSale: true,
            rating: 5.0,
            imageScale: 1.4
        }
    ];

    return (
        <div className="min-h-screen bg-[#f4f2f0]">
            {/* Hero Section */}
            <HeroSection
                videoSrc="https://res.cloudinary.com/dpdg462fb/video/upload/v1770179476/hero_utjppl.mp4"
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

            {/* Review Form */}
            <ReviewForm />
        </div>
    );
}
