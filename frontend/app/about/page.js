'use client';

import React from 'react';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen font-[family-name:var(--font-montserrat)]">
            {/* Hero Header */}
            <div className="bg-[#faf7f5] border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#e8a4b8] mb-4 font-medium">Our Story</p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl lg:text-6xl text-[#333] mb-6">
                        About Us
                    </h1>
                    <p className="text-lg md:text-xl text-[#4a4a4a] font-light tracking-wide">
                        Confidence. Comfort. Community.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                <div className="space-y-16 text-[#4a4a4a] text-[15px] leading-relaxed">

                    {/* Intro */}
                    <section className="text-center max-w-3xl mx-auto">
                        <div className="space-y-4">
                            <p>AYOOSH is more than skincare; it&rsquo;s a way of living. A mindset rooted in the belief that beauty starts from within. When you feel good, it shows. And when you show up as your best self, you&rsquo;re moved to do better, for yourself and for others.</p>
                            <p>Our purpose is simple: empowering confidence, prioritizing comfort, and celebrating self-expression every day, without compromising.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Our Story */}
                    <section>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Our Story</h2>
                        <div className="space-y-4">
                            <p>AYOOSH is a name shaped by heart, heritage, and intention. Inspired by our founder, Aisha Joosub, it&rsquo;s a personal adaptation that carries warmth, familiarity, and a deep sense of connection. The name itself reflects what the brand stands for, community, individuality, and the belief that beauty and well-being are deeply personal experiences.</p>
                            <p>AYOOSH has never been intended to be a trendy skincare brand or a label. It was designed as a place where individuality and self-expression are celebrated without any pressure. AYOOSH is rooted in the joy of well-being and embraces the notion that confidence increases when people are comfortable in their skin.</p>
                            <p>This philosophy is reflected in every aspect of the brand: celebrating our origins, honoring who we are and creating with purpose. AYOOSH doesn&rsquo;t mean fitting in. It&rsquo;s about feeling at home in yourself and connecting through shared values.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Our Philosophy */}
                    <section>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Our Philosophy</h2>
                        <p>Self-care should be joyful, uplifting, and purposeful. Our products support your well-being, because the way you feel affects the way you present yourself. Each formula is carefully designed to provide comfort for your skin, confidence for your spirit, as well as balance in your daily life.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Our Mantra */}
                    <section className="text-center py-8">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Our Mantra?</h2>
                        <p className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl text-[#e8a4b8] italic mb-6">
                            Look Good, Feel Good, and Do Good Simultaneously
                        </p>
                        <p>This isn&rsquo;t just a slogan; it&rsquo;s the foundation of everything we create. Choosing AYOOSH is choosing yourself and joining a community that values kindness, intention, and shared goodness.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Our Purpose */}
                    <section>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Our Purpose</h2>
                        <div className="space-y-4">
                            <p>AYOOSH is driven by a sense of purpose. A portion of every purchase is directed to the AYOOSH foundation, an initiative dedicated to empowerment, nourishment, and support communities in meaningful ways.</p>
                            <p>We believe that small, deliberate actions can bring about real change. One product is one step in the right direction. One act of kindness is born from one choice. As a community we are creating positive change for one person, one moment and one thoughtful act at a time.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Brand Universe */}
                    <section>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Brand Universe</h2>
                        <p className="mb-8">AYOOSH&rsquo;s vision has grown as the brand has evolved. The brand today is defined by three distinct but interconnected pillars that come together to create a lifestyle rooted in confidence, self-care, and purpose.</p>

                        {/* Pillar 1 */}
                        <div className="bg-[#faf7f5] rounded-lg p-6 md:p-8 mb-6">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e8a4b8] text-white flex items-center justify-center text-sm font-medium">1</span>
                                <div>
                                    <h3 className="text-lg font-medium text-[#333] mb-3">AYOOSH Skincare &mdash; Your Glow, Our Secret</h3>
                                    <p>This is the place where transformation starts, from the inside out. Our skincare was created to make you feel confident in your skin, help build self-esteem, and encourage daily self-care. When you feel good, it naturally shows.</p>
                                </div>
                            </div>
                        </div>

                        {/* Pillar 2 */}
                        <div className="bg-[#faf7f5] rounded-lg p-6 md:p-8 mb-6">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e8a4b8] text-white flex items-center justify-center text-sm font-medium">2</span>
                                <div>
                                    <h3 className="text-lg font-medium text-[#333] mb-3">Authentically AYOOSH - Fashion &amp; Accessories</h3>
                                    <p>Fashion is a form of self-expression that does not require explanation. Authentically AYOOSH is here to help you be yourself, bold, expressive, and unapologetic. Each piece is designed with comfort, confidence and effortless style in mind.</p>
                                </div>
                            </div>
                        </div>

                        {/* Pillar 3 */}
                        <div className="bg-[#faf7f5] rounded-lg p-6 md:p-8 mb-8">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e8a4b8] text-white flex items-center justify-center text-sm font-medium">3</span>
                                <div>
                                    <h3 className="text-lg font-medium text-[#333] mb-3">AYOOSH Foundation &mdash; Enrichment &amp; Empowerment Programme</h3>
                                    <p>Giving back is woven into who we are. Every purchase made through the AYOOSH foundation has a meaningful impact, supporting empowerment, nourishment, and community upliftment. Together, we transform our intention into action.</p>
                                </div>
                            </div>
                        </div>

                        {/* The Ayoosh Cycle */}
                        <div className="border border-gray-100 rounded-lg p-6 md:p-8">
                            <h3 className="text-lg font-medium text-[#333] mb-4">The Ayoosh Cycle</h3>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#e8a4b8] mt-2"></span>
                                    <span>Skincare routine will help you look and feel your best.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#e8a4b8] mt-2"></span>
                                    <span>Fashion allows you to be yourself.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#e8a4b8] mt-2"></span>
                                    <span>Foundation gives you the opportunity to make a difference through your choices.</span>
                                </li>
                            </ul>
                            <p className="mb-3">Together, these elements make up the AYOOSH Philosophy:</p>
                            <p className="font-[family-name:var(--font-playfair)] text-lg md:text-xl text-[#e8a4b8] italic">
                                Look Good, Feel Good, and Do Good Simultaneously
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
