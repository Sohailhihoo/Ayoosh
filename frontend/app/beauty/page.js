'use client';

import { useEffect, useState } from 'react';
import { ASSETS } from '@/lib/cloudinary-assets';
import ProductScroller from '@/components/ProductScroller';
import HeroSection from '@/components/HeroSection';
import ProductShowcase from '@/components/ProductShowcase';
import SplitFeatureSection from '@/components/SplitFeatureSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import VideoShowcase from '@/components/VideoShowcase';
import BrandLogos from '@/components/BrandLogos';
import TestimonialSection from '@/components/TestimonialSection';
import JournalGrid from '@/components/JournalGrid';

// Title style for hero section
const heroTitleStyle = {
    fontFamily: "'Tan Pearl', serif",
    fontWeight: 400,
    fontSize: 'clamp(36px, 6vw, 64px)',
    lineHeight: '1.2',
    letterSpacing: '0.02em'
};

// Hero buttons configuration
const heroButtons = [
    { href: '/products?productType=beauty', label: 'Shop Now', variant: 'primary' },
    { href: '/products', label: 'See all Collections', variant: 'outline' }
];

// Split section configuration
const splitSectionConfig = {
    leftPanel: {
        subtitle: 'THE AYOOSH DIFFERENCE',
        title: 'Why Choose',
        titleHighlight: 'Us?',
        description: 'We believe in delivering exceptional quality with a commitment to your skin\'s health and the environment.',
        tags: ['100% Cruelty Free', 'Dermatologist Tested', 'Natural Ingredients', 'Sustainable Packaging']
    },
    rightPanel: {
        imageOnly: true,
        backgroundImage: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769617529/ayoosh_why_choose_us_cl2s0p.png'
    }
};

export default function BeautyPage() {
    // Sample featured products with Cloudinary image
    const featuredProducts = [
        {
            _id: 'featured-1',
            name: 'SUN CREAM',
            variant: 'variant',
            price: 20,
            image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769514674/ayoosh-beauty/brand/heroes/landing.png',
            onSale: true,
            rating: 5.0
        },
        {
            _id: 'featured-2',
            name: 'SUN CREAM TUBE',
            variant: 'all gram weight',
            price: 20,
            image: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769514674/ayoosh-beauty/brand/heroes/landing.png',
            onSale: true,
            rating: 5.0
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <HeroSection
                videoSrc="/videos/hero-video.mp4"
                subtitle="LUXURY SKINCARE"
                title="DAILY ROUTINE"
                titleStyle={heroTitleStyle}
                description="I love how natural the products feel. The Aloe Vera Gel and Green Tea Cream became part of my daily routine..."
                buttons={heroButtons}
                overlayOpacity={40}
            />

            {/* Scrollytelling Section */}
            <ProductScroller />

            {/* Product Showcase (Rejoosh) */}
            <ProductShowcase />

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

            {/* Video Showcase Section */}
            <VideoShowcase />

            {/* Brand Logos (Partners) */}
            <BrandLogos />

            {/* Testimonials */}
            <TestimonialSection />

            {/* Journal Grid */}
            <JournalGrid />
        </div>
    );
}
