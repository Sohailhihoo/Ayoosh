'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

export default function VideoShowcase({ videos: propVideos, bgColor = '#f4f2f0' }) {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

    /**
     * Helper to optimize thumbnail URLs (images only)
     * Don't apply transformations to video URLs - it can break playback
     */
    const getOptimizedThumbnail = (url) => {
        if (!url || !url.includes('cloudinary.com')) return url;
        if (url.includes('f_auto,q_auto')) return url;
        return url.replace('/upload/', '/upload/w_720,f_auto,q_auto/');
    };

    // Default Video Data configuration (Beauty Page)
    // For thumbnails: use .jpg extension on video path OR provide separate image
    // For videos: use direct Cloudinary video URL without transformations
    const defaultVideos = [
        {
            id: 1,
            thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/so_0/v1770308098/1_bexn7a.jpg",
            videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/v1770308098/1_bexn7a.mov",
            
        },
        {
            id: 2,
            thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/so_0/v1770308099/2_victgs.jpg",
            videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/v1770308099/2_victgs.mp4",
            featured: true,
            
        },
        {
            id: 3,
            thumbnail: "https://res.cloudinary.com/dpdg462fb/video/upload/so_0/v1770308086/3_xzzogy.jpg",
            videoUrl: "https://res.cloudinary.com/dpdg462fb/video/upload/v1770308086/3_xzzogy.mp4",
            
        }
    ];

    // Use passed videos or default
    const rawVideos = propVideos || defaultVideos;

    // Only optimize thumbnails, keep video URLs as-is
    const videos = rawVideos.map(video => ({
        ...video,
        thumbnail: getOptimizedThumbnail(video.thumbnail),
        videoUrl: video.videoUrl  // Don't modify video URLs
    }));

    return (
        <section ref={sectionRef} className="py-20 overflow-hidden" style={{ backgroundColor: bgColor }}>
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center justify-center">
                    {videos.map((video, index) => (
                        <VideoCard key={video.id} video={video} index={index} sectionInView={isInView} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function VideoCard({ video, index, sectionInView }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const videoRef = useRef(null);

    const variants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }
        }
    };

    // Autoplay Logic
    useEffect(() => {
        if (!videoRef.current || !isLoaded) return;

        if (sectionInView) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay suppressed:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [sectionInView, isLoaded]);

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate={sectionInView ? "visible" : "hidden"}
            className={`
                relative group rounded-3xl overflow-hidden shadow-2xl bg-gray-100
                aspect-[9/16]
                ${video.featured ? 'md:scale-110 z-10' : 'opacity-90 hover:opacity-100'}
                transition-all duration-500 ease-out transform
            `}
        >
            {/* 1. THUMBNAIL LAYER */}
            <div
                className={`
                    absolute inset-0 bg-gray-200 flex items-center justify-center 
                    transition-opacity duration-700 
                    ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'} 
                    z-20
                `}
            >
                <img src={video.thumbnail} alt={video.alt} className="w-full h-full object-cover" />

                {/* Loader Spinner */}
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* 2. VIDEO LAYER */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover z-10"
                src={video.videoUrl}
                muted={true}
                loop
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                onLoadedData={() => {
                    console.log('Video loaded:', video.alt);
                    setIsLoaded(true);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => console.error('Video error:', video.alt, e.target.error)}
            />

            {/* 3. PLAY BUTTON LAYER */}
            {isLoaded && !isPlaying && (
                <div
                    className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors"
                    onClick={() => videoRef.current.play()}
                >
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                </div>
            )}

            {/* Caption */}
            <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
                <p className="text-white text-lg font-medium tracking-wide drop-shadow-md">{video.alt}</p>
            </div>
        </motion.div>
    );
}