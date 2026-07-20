'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import cloudinaryLoader from '@/lib/cloudinary-loader';

const TUBE = 'https://res.cloudinary.com/dpdg462fb/image/upload/v1780901598/rejoosh-tube-image_p9za7l.png';
const TERRA = '#A74E45';
const TERRA_LIGHT = '#BF6059';
const BLUSH = '#F5E8E3';
const GREY_BG = '#ECEAE6';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { visible: { transition: { staggerChildren: 0.11 } } };
const slideLeft = { hidden: { opacity: 0, x: -44 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };
const slideRight = { hidden: { opacity: 0, x: 44 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

function Reveal({ children, variants = fadeUp, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={variants} className={className}>
      {children}
    </motion.div>
  );
}

function RevealGroup({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-8%' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — HERO
// ═══════════════════════════════════════════════════════════════
function HeroSection() {
  return (
    <section
      className="relative overflow-hidden flex items-center justify-center h-[75svh] max-h-[600px] md:h-[calc(100vh-96px)] md:max-h-none"
      style={{ background: GREY_BG }}
    >

      {/* ─── Backdrop text — single div, clamp() handles mobile↔desktop sizing ─── */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        {[
          { word: 'KOREAN',    opacity: 0.45, size: 'clamp(75px, 23vw, 220px)' },
          { word: 'SKIN CARE', opacity: 0.72, size: 'clamp(58px, 18vw, 170px)' },
          { word: 'ROUTINE',   opacity: 0.45, size: 'clamp(65px, 20vw, 200px)' },
        ].map(({ word, opacity, size }) => (
          <div key={word} style={{
            fontFamily: "'Tan Pearl', 'Playfair Display', Georgia, serif",
            fontSize: size,
            fontWeight: 400,
            lineHeight: 0.92,
            color: '#B85C51',
            opacity,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}>
            {word}
          </div>
        ))}
      </div>

      {/* Product image — centered on top of text */}
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        {/* Mobile tube */}
        <img
          src={TUBE}
          alt="Rejoosh Lacto-PDRN Skin Booster"
          className="block md:hidden"
          style={{
            height: 'clamp(260px, 62svh, 520px)',
            width: 'auto',
            filter: 'drop-shadow(0 24px 48px rgba(80,20,0,0.22))',
          }}
        />
        {/* Desktop tube */}
        <img
          src={TUBE}
          alt="Rejoosh Lacto-PDRN Skin Booster"
          className="hidden md:block"
          style={{
            height: 'clamp(320px, 88vh, 980px)',
            width: 'auto',
            filter: 'drop-shadow(0 24px 48px rgba(80,20,0,0.22))',
          }}
        />
      </motion.div>

      {/* Mobile description — bottom right */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="md:hidden"
        style={{
          position: 'absolute', bottom: '5%', right: '5%',
          zIndex: 3,
          maxWidth: 130, textAlign: 'left',
          fontFamily: 'var(--font-montserrat)', fontSize: '0.62rem',
          color: '#5A4540', lineHeight: 1.75,
        }}
      >
        The world&apos;s first vegan Lacto PDRN skin booster. Repairs, restores, and resets your skin at a cellular level.
      </motion.p>

      {/* Desktop testimonial — hidden on mobile */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="hidden md:block"
        style={{
          position: 'absolute', bottom: '8%', right: '4%',
          zIndex: 3,
          maxWidth: 240, textAlign: 'right',
          fontFamily: 'var(--font-playfair)', fontSize: '0.75rem',
          color: '#5A4540', lineHeight: 1.75, fontStyle: 'italic',
          background: 'rgba(236, 234, 230, 0.72)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          padding: '10px 14px',
          borderRadius: 6,
        }}
      >
        &ldquo;I love how natural the products feel. The Aloe Vera Gel and Green Tea Cream became part of my daily routine...&rdquo;
      </motion.p>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — PRODUCT INTRO
// ═══════════════════════════════════════════════════════════════
function ProductIntroSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center">

        {/* Left — blush card with tube popping out from top */}
        <Reveal variants={slideLeft}>
          <div style={{ position: 'relative', paddingTop: '22%' }}>
            {/* Card background */}
            <div style={{
              background: 'radial-gradient(ellipse at 45% 50%, #C9847E 0%, #D9A49E 30%, #EDCCC7 62%, #F8E6E2 85%, #FDF2F0 100%)',
              borderRadius: 28,
              aspectRatio: '3/4',
              boxShadow: '0 8px 32px rgba(160,80,70,0.12)',
            }} />
            {/* Tube — overflows above the card */}
            <img
              src={TUBE}
              alt="Rejoosh product"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translate(-50%, 0) rotate(-8deg)',
                width: '32%',
                filter: 'drop-shadow(0 24px 44px rgba(80,20,0,0.32))',
                pointerEvents: 'none',
              }}
            />
          </div>
        </Reveal>

        {/* Right — copy */}
        <RevealGroup className="flex flex-col gap-4">
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Tan Pearl', Georgia, serif",
            fontWeight: 400,
            fontSize: 'clamp(52px, 8vw, 96px)',
            color: TERRA,
            lineHeight: 0.9, letterSpacing: '-0.01em', margin: 0,
          }}>
            REJOOSH
          </motion.h2>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.72rem', fontWeight: 600,
            letterSpacing: '0.22em', color: '#2B1A14',
            textTransform: 'uppercase', margin: 0,
          }}>
            The Future Skin Renewal
          </motion.p>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.95rem', color: '#6B5650',
            lineHeight: 1.85, maxWidth: 460, margin: 0,
          }}>
            Rejoosh is the home of Ayoosh Jewels: a series of hero products inspired by Korean innovation,
            advanced biotechnology and K-Pharmacy skincare. The first Jewel, our Lacto-PDRN Skin Booster,
            is built around vegan Lacto-PDRN, multi-layer hyaluronic acid hydration and probiotic ferment
            complexes. Together, they repair the skin barrier, restore microbiome balance and reset skin
            health, bringing regenerative science into your everyday routine. Each Jewel in Rejoosh series
            is designed to solve real skin concerns.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-2">
            <Link href="/products" style={{
              display: 'inline-block',
              background: TERRA, color: '#fff',
              fontFamily: 'var(--font-montserrat)',
              fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '14px 40px', textDecoration: 'none',
              borderRadius: '999px',
              transition: 'background 0.3s, transform 0.2s, box-shadow 0.3s',
              boxShadow: '0 4px 16px rgba(123,59,42,0.25)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = TERRA_LIGHT;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,59,42,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = TERRA;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(123,59,42,0.25)';
              }}
            >
              ORDER NOW
            </Link>
          </motion.div>
        </RevealGroup>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — CLINICAL RESULT
// ═══════════════════════════════════════════════════════════════
function ClinicalResultSection() {
  const tags = ['Vegan Lacto-PDRN', 'Probiotic Fermentation', 'Botanical Complex'];
  return (
    <section style={{ background: GREY_BG, overflow: 'hidden', position: 'relative' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 items-center" style={{ minHeight: 480 }}>

        {/* Left — large horizontal tube bleeding off left edge */}
        <div className="relative hidden md:block" style={{ overflow: 'hidden', minHeight: 480 }}>
          <Reveal variants={slideLeft} className="absolute inset-0">
            <img
              src={TUBE}
              alt="Rejoosh clinical"
              style={{
                position: 'absolute',
                top: '50%',
                left: '-35%',
                width: 'clamp(200px, 24vw, 340px)',
                height: 'auto',
                transform: 'translateY(-50%) rotate(-90deg)',
                transformOrigin: 'center center',
                filter: 'drop-shadow(12px 0px 32px rgba(80,20,0,0.15))',
              }}
            />
          </Reveal>
        </div>

        {/* Right — copy */}
        <RevealGroup className="flex flex-col gap-5 px-8 md:px-16 py-16">
          <motion.h2 variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 'clamp(24px, 3.2vw, 42px)',
            fontWeight: 900, color: TERRA,
            letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, lineHeight: 1,
          }}>
            Rejoosh by Ayoosh<br />A Range Built on Science
          </motion.h2>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} style={{
                border: `1px solid ${TERRA}`, color: TERRA,
                fontFamily: 'var(--font-montserrat)',
                fontSize: '0.68rem', fontWeight: 600,
                letterSpacing: '0.04em', padding: '5px 14px',
                borderRadius: '999px',
              }}>
                {tag}
              </span>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.88rem', fontWeight: 700,
            color: '#2B1A14', margin: 0,
          }}>
            A New Generation of Skin Renewal
          </motion.p>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.9rem', color: '#6B5650',
            lineHeight: 1.85, margin: 0, maxWidth: 440,
          }}>
            Derived from Lactobacillus rhamnosus, our vegan Lacto-PDRN activates your skin&apos;s
            natural repair receptors, boosting collagen and rebuilding your barrier beautifully.
          </motion.p>
        </RevealGroup>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4 — BENEFITS
// ═══════════════════════════════════════════════════════════════

const benefits = [
  {
    icon: '/rejoosh/1.png',
    title: 'Made For Every Skin',
    body: 'Whether your skin is dry, oily, sensitive, or acne-prone, Rejoosh is genuinely formulated for all of it. Every skin type. Every age. Every gender.',
  },
  {
    icon: '/rejoosh/2.png',
    title: 'Your Post-Procedure Ally',
    body: 'After lasers, peels, or anything that disrupts your barrier, PDRN, panthenol, and allantoin work together to help your skin recover faster and more completely.',
  },
  {
    icon: '/rejoosh/3.png',
    title: 'Repair From Within',
    body: 'PDRN stimulates collagen, adenosine reduces wrinkle depth, and hydrolyzed collagen provides the amino acid building blocks your skin needs for real structural repair.',
  },
];

function BenefitsSection() {
  return (
    <section style={{ background: '#F9F8F7', padding: '80px 0' }}>
      <RevealGroup className="max-w-5xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
        {benefits.map(({ icon, title, body }) => (
          <motion.div key={title} variants={fadeUp} className="flex flex-col items-center gap-5">
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              background: '#EDEAE7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={icon} alt={title} style={{ width: 56, height: 56, objectFit: 'contain' }} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '0.75rem', fontWeight: 800,
              letterSpacing: '0.06em', color: '#2B1A14', margin: 0,
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '0.85rem', color: '#6B5650',
              lineHeight: 1.8, maxWidth: 260, margin: 0,
            }}>
              {body}
            </p>
          </motion.div>
        ))}
      </RevealGroup>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 5 — WHY CHOOSE REJOOSH
// ═══════════════════════════════════════════════════════════════
const whyPoints = [
  <><strong>Vegan Lacto PDRN at 1500ppm</strong> ethically sourced, no animal DNA, no fish byproducts</>,
  <><strong>Six forms of hyaluronic acid</strong> from immediate surface hydration to 24-hour sustained moisture deep in the dermis</>,
  <><strong>Niacinamide + adenosine in direct synergy with PDRN</strong> fuelling cellular repair from two directions at once</>,
  <><strong>Six-botanical anti-inflammatory complex</strong> across five inflammation pathways</>,
  <><strong>Lightweight, fast-absorbing texture</strong> leaves only actives behind; compact 25g, built for daily habit</>,
];

function WhyChooseSection() {
  return (
    <section style={{ background: BLUSH }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">

        {/* Left — copy */}
        <Reveal variants={slideLeft}>
          <div className="px-10 md:px-16 py-16 md:py-20 flex flex-col gap-5">
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 400, color: '#2B1A14',
              lineHeight: 1.2, margin: 0,
            }}>
              Why Choose <span style={{ color: TERRA }}>REJOOSH</span>?
            </h2>

            <p style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '0.9rem', color: '#6B5650',
              lineHeight: 1.85, maxWidth: 440,
            }}>
              Most skincare sits on the surface, moisturizing, brightening, giving you something that looks good for a few hours. Rejoosh is going deeper. It repairs the foundation so everything else you use actually works. And it is one of the most multi-layered formulas in its category globally. 
            </p>

            <ul className="flex flex-col gap-3 mt-1">
              {whyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span style={{ color: TERRA, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span>
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.87rem', color: '#6B5650', lineHeight: 1.65 }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Right — hand photo */}
        <Reveal variants={slideRight} className="relative min-h-[420px] md:min-h-0">
          <div className="h-full w-full overflow-hidden" style={{ minHeight: 420, position: 'relative' }}>
            <Image
              loader={cloudinaryLoader}
              src="https://res.cloudinary.com/dpdg462fb/image/upload/v1780997064/Rectangle_59_bpjyrj.png"
              alt="Rejoosh hand application"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6 — PDRN SCIENCE
// ═══════════════════════════════════════════════════════════════
function PDRNSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">

        {/* Left — copy */}
        <RevealGroup className="flex flex-col gap-4">
          <motion.h2 variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: 'clamp(20px, 2.8vw, 32px)',
            fontWeight: 800, color: TERRA,
            lineHeight: 1.2, margin: 0,
          }}>
            Rejoosh Lacto-PDRN
          </motion.h2>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.7rem', fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#2B1A14', margin: 0,
          }}>
            Difference: Why Vegan is Better &amp; Optimal
          </motion.p>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.9rem', color: '#6B5650',
            lineHeight: 1.88, margin: 0,
          }}>
            Traditional PDRN is typically sourced from salmon, while REJOOSH uses biotechnology and fermentation to create vegan Lacto PDRN without compromising performance.
          </motion.p>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.7rem', fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#2B1A14', margin: 0,
          }}>
            Clean. Thoughtful. Advanced.
          </motion.p>

          <motion.ul variants={fadeUp} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['100% vegan', 'No animal-derived DNA', 'No fish-derived ingredients', 'Sustainably developed through fermentation technology'].map(point => (
              <li key={point} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: TERRA, fontWeight: 700, flexShrink: 0 }}>+</span>
                <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.87rem', color: '#6B5650', lineHeight: 1.65 }}>{point}</span>
              </li>
            ))}
          </motion.ul>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.9rem', color: '#B85C51',
            lineHeight: 1.85, margin: 0, fontStyle: 'italic',
          }}>
            Because we believe the future of skincare should be effective, ethical, and beautifully simple.
          </motion.p>
        </RevealGroup>

        {/* Right — PDRN image with tube overlay */}
        <Reveal variants={slideRight} className="relative min-h-[320px] md:min-h-[420px]">
          {/* Background science image */}
          <Image
            loader={cloudinaryLoader}
            src="https://res.cloudinary.com/dpdg462fb/image/upload/v1780997061/6706_yw7fzq.jpg"
            alt="PDRN Salmon DNA science"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center rounded-2xl"
          />
          {/* Tube — overlaid on left edge of image */}
          <img
            src={TUBE}
            alt="Rejoosh Lacto-PDRN tube"
            style={{
              position: 'absolute',
              top: '50%',
              left: '-6%',
              transform: 'translateY(-50%)',
              height: 'clamp(220px, 28vw, 380px)',
              width: 'auto',
              filter: 'drop-shadow(-8px 16px 32px rgba(80,20,0,0.35))',
              zIndex: 10,
            }}
          />
        </Reveal>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7 — CTA STRIP
// ═══════════════════════════════════════════════════════════════
const GiftIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
    <rect x="6" y="18" width="28" height="16" rx="1" />
    <path d="M4 18h32v-4H4z" />
    <path d="M20 18V34" />
    <path d="M20 14s-4-6-8-4 0 4 8 4z" />
    <path d="M20 14s4-6 8-4 0 4-8 4z" />
  </svg>
);

const PeopleIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
    <circle cx="14" cy="14" r="5" />
    <circle cx="27" cy="11" r="4" />
    <path d="M4 32 Q4 24 14 24 Q24 24 24 32" />
    <path d="M27 20 Q36 20 36 30" />
  </svg>
);

const FaceIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
    <circle cx="20" cy="16" r="9" />
    <path d="M13 22 Q13 32 20 32 Q27 32 27 22" />
    <path d="M17 13 Q18 15 20 13 Q22 15 23 13" />
    <path d="M24 8 Q28 5 30 2" />
    <circle cx="30" cy="2" r="1.5" fill="white" stroke="none" />
  </svg>
);

const ctaItems = [
  { Icon: GiftIcon,   eyebrow: 'Loyalty Program',            title: 'For Happy Skin',              cta: 'Join the program',    href: '/products' },
  { Icon: PeopleIcon, eyebrow: 'Organic beauty is shared,',  title: 'Sponsor those you love!',     cta: 'Refer a Friend',      href: '/products' },
  { Icon: FaceIcon,   eyebrow: 'Treat yourself to good skincare', title: 'with Ayoosh Treatments', cta: 'Try Our Treatments',  href: '/products' },
];

function CTAStripSection() {
  return (
    <section style={{ background: TERRA, padding: '56px 5%' }}>
      <RevealGroup className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0">
        {ctaItems.map(({ Icon, eyebrow, title, cta, href }, i) => (
          <motion.div key={title} variants={fadeUp}
            className={i < 2 ? 'border-b md:border-b-0 md:border-r border-white/20 pb-8 md:pb-0' : ''}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', padding: '0 5%',
              gap: 12,
            }}>
            <Icon />
            <div>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 2px', letterSpacing: '0.02em' }}>
                {eyebrow}
              </p>
              <h3 style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(16px, 2vw, 22px)',
                fontWeight: 400, fontStyle: 'italic',
                color: '#fff', margin: 0, lineHeight: 1.2,
              }}>
                {title}
              </h3>
            </div>
            <Link href={href} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(255,255,255,0.6)',
              color: '#fff', fontFamily: 'var(--font-montserrat)',
              fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.06em', padding: '8px 18px',
              textDecoration: 'none', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {cta} <span style={{ fontSize: '1rem' }}>→</span>
            </Link>
          </motion.div>
        ))}
      </RevealGroup>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 8 — REVIEWS
// ═══════════════════════════════════════════════════════════════
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} viewBox="0 0 20 20" style={{ width: size, height: size }}
        fill={s <= rating ? '#C9A440' : '#E0D5C8'}>
        <path d="M10 1l2.4 6.8H19l-5.7 4.1 2.2 6.8L10 14.8l-5.5 3.9 2.2-6.8L1 7.8h6.6z" />
      </svg>
    ))}
  </div>
);

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [current, setCurrent] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', rating: 5, title: '', review: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/reviews?page=rejoosh`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setReviews(data.reviews);
          setAvgRating(data.averageRating);
        }
      })
      .catch(() => {});
  }, []);

  const prev = () => setCurrent(i => (i - 1 + reviews.length) % reviews.length);
  const next = () => setCurrent(i => (i + 1) % reviews.length);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('rating', form.rating);
      formData.append('title', form.title);
      formData.append('review', form.review);
      formData.append('page', 'rejoosh');
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', rating: 5, title: '', review: '' });
        setImageFile(null);
        setImagePreview(null);
      } else {
        setError(data.message || 'Failed to submit review.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', fontFamily: 'var(--font-montserrat)',
    fontSize: '0.85rem', color: '#2B1A14',
    background: '#F9F8F7', border: '1px solid #DDD8D0',
    borderRadius: 8, padding: '10px 14px', outline: 'none',
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 style={{
                fontFamily: 'var(--font-montserrat)', fontWeight: 900,
                fontSize: 'clamp(22px, 3vw, 36px)', color: TERRA, margin: '0 0 8px',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>Customer Reviews</h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-3">
                  <StarRating rating={Math.round(avgRating)} size={18} />
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.85rem', color: '#6B5650' }}>
                    {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

          {/* Left — review carousel */}
          <Reveal variants={slideLeft}>
            {reviews.length === 0 ? (
              <div style={{
                background: BLUSH, borderRadius: 16, padding: '40px 32px',
                fontFamily: 'var(--font-playfair)', fontSize: '0.95rem',
                color: '#9B8E85', fontStyle: 'italic', textAlign: 'center',
              }}>
                No reviews yet. Be the first to share your experience!
              </div>
            ) : (
              <div style={{ background: BLUSH, borderRadius: 16, padding: '32px' }}>
                <StarRating rating={reviews[current].rating} size={18} />
                {reviews[current].title && (
                  <p style={{
                    fontFamily: 'var(--font-montserrat)', fontWeight: 700,
                    fontSize: '0.9rem', color: '#2B1A14', margin: '12px 0 8px',
                  }}>
                    {reviews[current].title}
                  </p>
                )}
                <motion.p
                  key={current}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontFamily: 'var(--font-playfair)', fontStyle: 'italic',
                    fontSize: '0.95rem', color: '#2B1A14', lineHeight: 1.85,
                    margin: '0 0 16px',
                  }}
                >
                  "{reviews[current].review}"
                </motion.p>
                <p style={{
                  fontFamily: 'var(--font-montserrat)', fontSize: '0.75rem',
                  color: TERRA, fontWeight: 600, margin: 0,
                }}>
                  — {reviews[current].name}
                </p>

                {reviews[current].image && (
                  <img src={reviews[current].image} alt="Review"
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 12, border: '1px solid #DDD8D0' }} />
                )}

                {reviews.length > 1 && (
                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={prev} style={{
                      background: 'none', border: `1px solid ${TERRA}`, cursor: 'pointer',
                      color: TERRA, width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>←</button>
                    <div className="flex gap-1.5">
                      {reviews.map((_, i) => (
                        <button key={i} onClick={() => setCurrent(i)} style={{
                          width: i === current ? 20 : 6, height: 6, borderRadius: 3,
                          background: i === current ? TERRA : '#D0C8C4',
                          border: 'none', cursor: 'pointer', padding: 0,
                          transition: 'width 0.3s, background 0.3s',
                        }} />
                      ))}
                    </div>
                    <button onClick={next} style={{
                      background: 'none', border: `1px solid ${TERRA}`, cursor: 'pointer',
                      color: TERRA, width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>→</button>
                  </div>
                )}
              </div>
            )}
          </Reveal>

          {/* Right — submit form */}
          <Reveal variants={slideRight}>
            <h3 style={{
              fontFamily: 'var(--font-montserrat)', fontWeight: 800,
              fontSize: '1rem', color: '#2B1A14', letterSpacing: '0.08em',
              textTransform: 'uppercase', margin: '0 0 20px',
            }}>Write a Review</h3>

            {submitted ? (
              <div style={{
                background: BLUSH, borderRadius: 12, padding: '24px',
                fontFamily: 'var(--font-montserrat)', fontSize: '0.9rem', color: TERRA,
              }}>
                Thank you for your review! It will appear after approval.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Your name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={inputStyle} />
                  <input required type="email" placeholder="Email address" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle} />
                </div>

                {/* Star picker */}
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.78rem', color: '#6B5650' }}>Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setForm(f => ({ ...f, rating: s }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <svg viewBox="0 0 20 20" style={{ width: 22, height: 22 }}
                          fill={s <= form.rating ? '#C9A440' : '#E0D5C8'}>
                          <path d="M10 1l2.4 6.8H19l-5.7 4.1 2.2 6.8L10 14.8l-5.5 3.9 2.2-6.8L1 7.8h6.6z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <input placeholder="Review title (optional)" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={inputStyle} />

                <textarea required rows={4} placeholder="Share your experience..."
                  value={form.review}
                  onChange={e => setForm(f => ({ ...f, review: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical' }} />

                {/* Image upload */}
                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer', border: '1px dashed #C8BDB5',
                    borderRadius: 8, padding: '10px 14px',
                    fontFamily: 'var(--font-montserrat)', fontSize: '0.82rem',
                    color: '#9B8E85', background: '#F9F8F7',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = TERRA}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#C8BDB5'}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                      style={{ width: 18, height: 18, flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A.75.75 0 0021 19.5V6a.75.75 0 00-.75-.75H3.75A.75.75 0 003 6v13.5c0 .414.336.75.75.75zM16.5 8.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    {imageFile ? imageFile.name : 'Add a photo (optional)'}
                    <input type="file" accept="image/*" onChange={handleImageChange}
                      style={{ display: 'none' }} />
                  </label>

                  {imagePreview && (
                    <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                      <img src={imagePreview} alt="Preview"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #DDD8D0' }} />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          background: TERRA, color: '#fff', border: 'none',
                          borderRadius: '50%', width: 20, height: 20,
                          cursor: 'pointer', fontSize: '0.75rem', lineHeight: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>×</button>
                    </div>
                  )}
                </div>

                {error ? (
                  <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '0.8rem', color: '#B04040', margin: 0 }}>
                    {error}
                  </p>
                ) : null}

                <button type="submit" disabled={submitting} style={{
                  background: submitting ? TERRA_LIGHT : TERRA, color: '#fff',
                  fontFamily: 'var(--font-montserrat)', fontSize: '0.78rem',
                  fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                  padding: '13px 32px', border: 'none', borderRadius: '999px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  alignSelf: 'flex-start',
                  transition: 'background 0.25s, transform 0.2s, box-shadow 0.25s',
                  boxShadow: '0 4px 16px rgba(123,59,42,0.25)',
                }}
                  onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = TERRA_LIGHT; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.background = submitting ? TERRA_LIGHT : TERRA; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════
// SECTION 10 — QUOTE SLIDER
// ═══════════════════════════════════════════════════════════════
const quotes = [
  { text: "Countless answers lie within nature's genius, awaiting our exploration and engagement.", sub: 'THE FUTURE OF NATURAL SKINCARE' },
  { text: 'Beauty is not a luxury — it is a form of self-respect, grounded in the wisdom of the natural world.', sub: 'THE REJOOSH PHILOSOPHY' },
  { text: 'Korean skincare is not a trend. It is a centuries-old ritual of patience, precision, and pure ingredients.', sub: 'KOREAN BEAUTY HERITAGE' },
];

function QuoteSliderSection() {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent(i => (i - 1 + quotes.length) % quotes.length);
  const next = () => setCurrent(i => (i + 1) % quotes.length);

  return (
    <section className="bg-white py-20">
      <Reveal>
        <div className="max-w-2xl mx-auto px-10 md:px-6 text-center relative">
          <button onClick={prev} style={{
            position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B5650', fontSize: '1.4rem',
          }}>‹</button>

          <motion.blockquote
            key={current}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(18px, 2.2vw, 26px)',
              fontWeight: 400, fontStyle: 'italic',
              color: '#2B1A14', lineHeight: 1.7, margin: '0 0 16px',
            }}
          >
            {quotes[current].text}
          </motion.blockquote>

          <p style={{
            fontFamily: 'var(--font-montserrat)',
            fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.22em', color: '#9B8E85',
            textTransform: 'uppercase', marginBottom: 24,
          }}>
            {quotes[current].sub}
          </p>

          <div className="flex gap-2 justify-center">
            {quotes.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{
                width: i === current ? 28 : 10, height: 3,
                borderRadius: 2, background: i === current ? TERRA : '#D0C8C4',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.3s, background 0.3s',
              }} />
            ))}
          </div>

          <button onClick={next} style={{
            position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B5650', fontSize: '1.4rem',
          }}>›</button>
        </div>
      </Reveal>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
export default function RejooshPage() {
  return (
    <div>
      <HeroSection />
      <ProductIntroSection />
      <ClinicalResultSection />
      <BenefitsSection />
      <WhyChooseSection />
      <PDRNSection />
      <CTAStripSection />
      <ReviewsSection />
      <QuoteSliderSection />
    </div>
  );
}
