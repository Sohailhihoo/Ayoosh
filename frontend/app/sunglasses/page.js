import HeroSection from '@/components/HeroSection';
import SunglassesCircle from '@/components/SunglassesCircle';
import SplitFeatureSection from '@/components/SplitFeatureSection';
import BrandLogos from '@/components/BrandLogos';
import ReviewForm from '@/components/ReviewForm';
import ReviewCarousel from '@/components/ReviewCarousel';
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

// Why Choose Us section configuration
const splitSectionConfig = {
    leftPanel: {
        subtitle: 'THE PERSPECTIVE RANGE',
        title: 'Why Choose',
        titleHighlight: 'Us?',
        description: 'The Perspective Range is designed around how you see the world and how the world sees you. Ultra lightweight and made for comfort from the inside out, these lenses are clear enough that your eyes are still visible, creating connection instead of distance. Easy to wear indoors or outdoors, unisex in design and universal in feeling, each frame shifts more than light, it shifts energy, mood, and presence. This is eyewear that lets you be seen while you see differently.',
        tags: [
            'Ultra Lightweight',
            'Unisex Design',
            'Indoor & Outdoor',
            'Clear Lenses',
            'Universal Fit'
        ]
    },
    rightPanel: {
        imageOnly: true,
        backgroundImage: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_1280/v1769691023/Why_choose_ayoosh_bjb1af.jpg'
    }
};

const sunglassesVideos = [
    {
        id: 1,
        thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/f_auto,q_auto,so_0/v1770308098/1_bexn7a.jpg",
        videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/q_auto/v1770308098/1_bexn7a.mov",
        
    },
    {
        id: 2,
        thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/f_auto,q_auto,so_0/v1770308099/2_victgs.jpg",
        videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/q_auto/v1770308099/2_victgs.mp4",
        featured: true,
       
    },
    {
        id: 3,
        thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/f_auto,q_auto,so_0/v1770308086/3_xzzogy.jpg",
        videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/q_auto/v1770308086/3_xzzogy.mp4",
        
    }
];

export default function SunglassesPage() {
    return (
        <div className="min-h-screen bg-[#d9d9d9]">
            {/* Hero Section */}
            <HeroSection
                videoSrc="https://res.cloudinary.com/dpdg462fb/video/upload/q_auto/v1770179525/sunglasses_ocnfon.mp4"
                title="The Perspective Range"
                titleStyle={heroTitleStyle}
                buttons={heroButtons}
                overlayOpacity={0}
                align="bottom-right"
            />

            {/* Circular Showcase */}
            <SunglassesCircle />

            {/* Why Choose Us Section */}
            <SplitFeatureSection
                leftPanel={splitSectionConfig.leftPanel}
                rightPanel={splitSectionConfig.rightPanel}
            />

            {/* Promo Bar (Yellow Feature Section) */}
            <div className="mt-8">
                <PromoBar bgColor="#649BC3" hoverTextColor="#649BC3" />
            </div>

            {/* Video Showcase (Reels) */}
            <VideoShowcase videos={sunglassesVideos} bgColor="#d9d9d9" />



            {/* Brand Logos */}
            <BrandLogos bgColor="#d9d9d9" />

            {/* Customer Reviews Carousel */}
            <ReviewCarousel page="sunglasses" />

            {/* Review Form */}
            <ReviewForm page="sunglasses" />
        </div>
    );
}
