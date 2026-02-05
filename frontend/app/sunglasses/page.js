'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import SunglassesCircle from '@/components/SunglassesCircle';
import BrandLogos from '@/components/BrandLogos';
import ReviewForm from '@/components/ReviewForm';
import PromoBar from '@/components/PromoBar';
import VideoShowcase from '@/components/VideoShowcase';

// Hero configuration
const heroTitleStyle = {
    fontFamily: "'Tan Pearl', serif",
    fontWeight: 400,
    fontSize: 'clamp(28px, 4vw, 48px)',
    lineHeight: '1.2',
    letterSpacing: '0.02em'
};

const heroButtons = [
    { href: '/products?productType=sunglasses', label: 'Pre Order', variant: 'primary', color: '#0077b6' },
];

const sunglassesVideos = [
    {
        id: 1,
        thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/so_0/v1770308098/1_bexn7a.jpg",
        videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/v1770308098/1_bexn7a.mov",
        alt: "Summer Vibes"
    },
    {
        id: 2,
        thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/so_0/v1770308099/2_victgs.jpg",
        videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/v1770308099/2_victgs.mp4",
        featured: true,
        alt: "The Perfect Fit"
    },
    {
        id: 3,
        thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/so_0/v1770308086/3_xzzogy.jpg",
        videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/v1770308086/3_xzzogy.mp4",
        alt: "Chic & Bold"
    }
];

export default function SunglassesPage() {
    return (
        <div className="min-h-screen bg-[#d9d9d9]">
            {/* Hero Section */}
            <HeroSection
                videoSrc="https://res.cloudinary.com/dpdg462fb/video/upload/v1770179525/sunglasses_ocnfon.mp4"
                title="The Perspective Range"
                titleStyle={heroTitleStyle}
                buttons={heroButtons}
                overlayOpacity={0}
                align="bottom-right"
            />

            {/* Circular Showcase */}
            <SunglassesCircle />

            {/* Promo Bar (Yellow Feature Section) */}
            <div className="mt-8">
                <PromoBar bgColor="#649BC3" hoverTextColor="#649BC3" />
            </div>

            {/* Video Showcase (Reels) */}
            <VideoShowcase videos={sunglassesVideos} bgColor="#d9d9d9" />



            {/* Brand Logos */}
            <BrandLogos bgColor="#d9d9d9" />

            {/* Review Form */}
            <ReviewForm />
        </div>
    );
}
