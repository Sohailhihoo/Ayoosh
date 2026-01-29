/**
 * Cloudinary Asset URLs
 * 
 * Centralized asset management for all Cloudinary-hosted images.
 * Update these URLs if assets are re-uploaded or moved.
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dpdg462fb/image/upload';

export const ASSETS = {
    // Brand Logos
    logos: {
        main: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/main`,
        loading: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/loading`,
        final: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/final`,
        alt: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/alt`,
        light: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/light`,
        yellow: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/yellow`,
        yellowAccent: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/logos/yellow-accent`,
    },

    // Hero Images
    heroes: {
        beauty: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/heroes/beauty`,
        landing: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/heroes/landing`,
    },

    // Homepage
    homepage: {
        rejoosh: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/homepage/rejoosh`,
        rejooshHand: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/homepage/rejoosh-hand`,
    },

    // Team
    team: {
        ayesha: `${CLOUDINARY_BASE}/v1/ayoosh-beauty/brand/team/ayesha`,
    },

    // Videos (still local for now)
    videos: {
        heroVideo: '/videos/hero-video.mp4',
        homepageSplit1: '/videos/homepage/split1.mp4',
        homepageSplit2: '/videos/homepage/split2.mp4',
    }
};

/**
 * Helper to get optimized image URL with transformations
 * @param {string} url - Base Cloudinary URL
 * @param {object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export function getOptimizedUrl(url, options = {}) {
    const { width, height, quality = 'auto', format = 'auto' } = options;

    let transforms = `f_${format},q_${quality}`;
    if (width) transforms += `,w_${width}`;
    if (height) transforms += `,h_${height}`;

    // Insert transforms into URL
    return url.replace('/upload/', `/upload/${transforms}/`);
}

export default ASSETS;
