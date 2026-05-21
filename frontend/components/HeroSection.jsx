import Link from 'next/link';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinary-loader';

/**
 * HeroSection - Reusable video/image hero with overlay and CTAs
 * @param {string} videoSrc - Video source URL
 * @param {string} imageSrc - Fallback image source (if no video)
 * @param {string} logoSrc - Logo image source
 * @param {string} logoHref - Logo link destination
 * @param {string} subtitle - Small text above title
 * @param {string} title - Main heading
 * @param {string} description - Description text
 * @param {Object} titleStyle - Custom styles for title
 * @param {Array} buttons - Array of button objects { href, label, variant: 'primary' | 'outline' }
 * @param {number} overlayOpacity - Overlay opacity (0-100), default 40
 */
export default function HeroSection({
    videoSrc,
    imageSrc,
    logoSrc,
    logoHref = '/home',
    subtitle,
    title,
    description,
    titleStyle = {},
    buttons = [],
    overlayOpacity = 40,
    align = 'center' // 'center' | 'bottom-left'
}) {
    return (
        <section className="relative h-screen overflow-hidden">
            {/* Logo Header */}
            {logoSrc && (
                <header className="absolute top-0 left-0 right-0 z-20 flex justify-center py-6">
                    <Link href={logoHref}>
                        <Image
                            loader={cloudinaryLoader}
                            src={logoSrc}
                            alt="Logo"
                            width={160}
                            height={80}
                            className="h-16 md:h-20 w-auto object-contain"
                        />
                    </Link>
                </header>
            )}

            {/* Video/Image Background */}
            {videoSrc ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            ) : imageSrc ? (
                <Image
                    loader={cloudinaryLoader}
                    src={imageSrc}
                    alt="Hero background"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
            ) : null}

            {/* Dark Overlay */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
            />

            {/* Content */}
            <div className={`relative z-10 h-full flex ${align === 'bottom-left' ? 'items-end justify-start pb-24 md:pb-[15vh]' : align === 'bottom-right' ? 'items-end justify-end pb-24 md:pb-[15vh]' : 'items-center justify-center'} px-6 md:px-12 lg:px-24`}>
                <div className={`max-w-2xl ${align === 'bottom-right' ? 'text-right' : ''}`}>
                    {subtitle && (
                        <p className="text-sm md:text-base tracking-[0.3em] text-white/80 mb-4">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h1 className="text-white mb-12" style={titleStyle}>
                            {title}
                        </h1>
                    )}
                    {description && (
                        <p className="text-white/80 mb-8 max-w-md leading-relaxed text-lg">
                            {description}
                        </p>
                    )}
                    {buttons.length > 0 && (
                        <div className={`flex flex-wrap gap-4 ${align === 'bottom-right' ? 'justify-end' : align === 'bottom-left' ? 'justify-start' : 'justify-center'}`}>
                            {buttons.map((btn, idx) => (
                                <Link
                                    key={idx}
                                    href={btn.href}
                                    className={`px-8 py-3 text-sm tracking-wider transition-colors rounded ${btn.variant === 'outline'
                                        ? 'border border-white text-white hover:bg-white/10'
                                        : 'text-white hover:opacity-90'
                                        }`}
                                    style={btn.color ? { backgroundColor: btn.color } : { backgroundColor: '#f8cb19', color: '#000' }}
                                >
                                    {btn.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
