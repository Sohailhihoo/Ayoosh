'use client';

import React, { useState } from 'react';

const sections = [
    { id: 'contact', title: 'Contact Information' },
    { id: 'section-1', title: 'Section 1 – Collection of Personal Information' },
    { id: 'section-2', title: 'Section 2 – Consent' },
    { id: 'section-3', title: 'Section 3 – Disclosure of Personal Information' },
    { id: 'section-4', title: 'Section 4 – Hosting & Data Storage' },
    { id: 'section-5', title: 'Section 5 – Payment' },
    { id: 'section-6', title: 'Section 6 – Third-Party Services' },
    { id: 'section-7', title: 'Section 7 – Links' },
    { id: 'section-8', title: 'Section 8 – Data Security' },
    { id: 'section-9', title: 'Section 9 – Age of Consent' },
    { id: 'section-10', title: 'Section 10 – Changes to This Privacy Policy' },
    { id: 'section-11', title: 'Section 11 – Complaints' },
];

export default function PrivacyPage() {
    const [tocOpen, setTocOpen] = useState(false);

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <div className="bg-[#faf7f5] border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#F6C811] mb-4 font-medium">Legal</p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#333] mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-400 tracking-wide">Ayoosh PTY Ltd</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                {/* Intro */}
                <p className="text-[#4a4a4a] text-[15px] leading-relaxed mb-12">
                    This Privacy Policy explains how Ayoosh PTY LTD (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;the Site&rdquo;) collects, uses, and shares personal information when you visit our website or make a purchase through the Site.
                </p>

                {/* Table of Contents - Collapsible on mobile */}
                <div className="mb-12 border border-gray-100 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setTocOpen(!tocOpen)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-[#faf7f5] text-left md:cursor-default"
                    >
                        <span className="text-xs uppercase tracking-[0.2em] text-[#4a4a4a] font-medium">
                            Table of Contents
                        </span>
                        <svg
                            className={`w-4 h-4 text-gray-400 transition-transform md:hidden ${tocOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    <div className={`${tocOpen ? 'block' : 'hidden'} md:block px-6 py-4`}>
                        <nav className="columns-1 md:columns-2 gap-8">
                            {sections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="block py-1.5 text-sm text-gray-500 hover:text-[#F6C811] transition-colors break-inside-avoid"
                                >
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-12 text-[#4a4a4a] text-[15px] leading-relaxed">

                    {/* Contact Information */}
                    <section id="contact">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Contact Information</h2>
                        <div className="space-y-4">
                            <p>If you have any questions about this Privacy Policy, would like more information about our privacy practices, or wish to submit a complaint, you can contact us using the details below:</p>
                            <div className="bg-[#faf7f5] border-l-2 border-[#F6C811] px-5 py-4 text-sm">
                                <p>Email: support@ayooshonline.com</p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 1 */}
                    <section id="section-1">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 1 &ndash; Collection of Personal Information</h2>
                        <div className="space-y-4">
                            <p>When you visit the Site, we collect personal information you provide voluntarily, for example, when you contact us or subscribe to receive our newsletters. It may include your email address, name, shipping and billing address, and phone number.</p>
                            <p>Postal code, preferences, or interests are examples of limited information that we may collect. Postal code, preferences, or interests. This information is not used to identify you.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Automatically Collected Information</h3>
                            <p>Certain technical information is automatically collected when you visit our site to help us maintain and improve it. This information may include:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Your IP address</li>
                                <li>Browser Type and Version</li>
                                <li>Operating system</li>
                                <li>Website or Source Referring</li>
                                <li>Pages accessed and access times</li>
                            </ul>
                            <p>These data are used to improve the functionality of the Site, for analytics and security purposes, as well as to better understand how users interact with it. This information is not used to identify you personally.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">User-Generated content</h3>
                            <p>You may make your personal information visible to others if you do so publicly via interactive features on the Site. Please be aware that we have no control over how third parties may use the information you choose.</p>
                            <p className="bg-[#faf7f5] border-l-2 border-[#F6C811] px-4 py-3 text-sm italic">Note: We will not monitor your private communications or gain access to them.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Email Marketing</h3>
                            <p>You may receive marketing emails from us about our products, updates, or promotions if you choose to opt-in. You can withdraw consent at any time using the unsubscribe button in our emails, or by contacting us directly.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Third-Party websites</h3>
                            <p>Our Site may include links to other websites. We do not control the content or privacy practices of these external websites. Please review their privacy policies prior to providing any personal data.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 2 */}
                    <section id="section-2">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 2 &ndash; Consent</h2>
                        <div className="space-y-4">
                            <p>We only use your personal information to fulfill your request. This includes completing a transaction, such as placing an online order, verifying your payment details, arranging a delivery, or processing a refund.</p>
                            <p>If we need your consent to process your personal data (for instance, marketing communications), then we will ask for your explicit consent.</p>
                            <p>You can withdraw your consent at any time. The lawfulness of the processing that was carried out prior to your withdrawal will remain unaffected. To withdraw your consent or to stop receiving communications from us, you can contact us at support@ayooshonline.com or use the unsubscribe link included in our emails.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 3 */}
                    <section id="section-3">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 3 &ndash; Disclosure of Personal Information</h2>
                        <div className="space-y-4">
                            <p>Your personal information may be disclosed if required by law, regulation or legal process or in response to lawful requests made by public authorities.</p>
                            <p>We may also disclose your personal information if necessary to enforce the Terms of Service or to protect our rights and property, investigate possible violations or to protect the safety or security of other users, our users, or ourselves.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 4 */}
                    <section id="section-4">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 4 &ndash; Hosting &amp; Data Storage</h2>
                        <div className="space-y-4">
                            <p>Our online store is hosted on abc. This platform provides us with the infrastructure to sell our products and provide services.</p>
                            <p>The hosting provider stores your personal information in its data storage systems, databases, and applications. To protect your data, reasonable technical and organizational measures are taken. These include secure servers and firewalls.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 5 */}
                    <section id="section-5">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 5 &ndash; Payment</h2>
                        <div className="space-y-4">
                            <p>If you decide to pay directly for your order:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>The third-party provider of payment services will process and store your payment information.</li>
                                <li>Payment card data is encrypted according to the Payment Card Industry Data Security Standard.</li>
                                <li>Payment providers&rsquo; data retention policies dictate that transaction data will only be retained for the time necessary to complete your purchase.</li>
                            </ul>
                            <p>Our store uses payment gateways that comply with PCI Security Standards Council requirements. This is a standard set by Visa, Mastercard and American Express.</p>
                            <p>The PCI-DSS standard is designed to ensure that credit card data is handled securely by both merchants and payment providers.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 6 */}
                    <section id="section-6">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 6 &ndash; Third-Party Services</h2>
                        <div className="space-y-4">
                            <p>We rely on trusted third-party service providers to help operate our website and deliver our services.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Use of Third-Party Providers</h3>
                            <p>Third-party service providers are used to provide certain services such as order fulfillment, payment processing, and analytics. These providers have access to your personal information when it is necessary for them to provide services on our behalf. They are also required to handle this information in accordance with the applicable data protection laws.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Third-Party Privacy Policies</h3>
                            <p>Certain third-party providers, such as payment gateways or payment transaction processors, maintain their own privacy policies that govern how they manage personal information provided to them in connection with purchase-related transactions. Please review the privacy policies of these third-party service providers to learn how they handle your personal information.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">International Data Transfers</h3>
                            <p>Third-party service providers might be located or processing personal information outside of your home country or ours. Your personal information could be subject to data protection laws in other jurisdictions if your third-party service providers are located there.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">External Links</h3>
                            <p>This Privacy Policy and Terms of Service will no longer be applicable when you leave our site or are redirected. We are not responsible or liable for the content of any third-party website.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 7 */}
                    <section id="section-7">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 7 &ndash; Links</h2>
                        <div className="space-y-4">
                            <p>Our Site may include links to other websites. You may be redirected to an external website when you click on these links.</p>
                            <p className="bg-[#faf7f5] border-l-2 border-[#F6C811] px-4 py-3 text-sm italic">Note: Please review the privacy policies of any third-party sites before you provide any personal information.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 8 */}
                    <section id="section-8">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 8 &ndash; Data Security</h2>
                        <div className="space-y-4">
                            <p>We protect your personal information through the use of reasonable industry standards and technical security measures.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Protective measures designed to protect personal information from loss, misuse, unauthorized access, disclosure, modification, or destruction</li>
                                <li>Use industry-standard security procedures and practices</li>
                                <li>Secure transmission of payment data using technologies such as SSL (Secure Sockets Layer) encryption</li>
                                <li>Payment service providers are required to process payment card data in accordance with PCI DSS requirements</li>
                            </ul>
                            <p>Although we will take all reasonable steps to ensure the security of your information, there is no guarantee that any transmission or electronic storage over the Internet or other methods can be 100% secure.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 9 */}
                    <section id="section-9">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 9 &ndash; Age of Consent</h2>
                        <div className="space-y-4">
                            <p>This site is for users who are 18 years or older. You confirm by using the Site that you are 18 years old.</p>
                            <p>We don&rsquo;t collect any personal information about individuals younger than 18. Please contact us if you suspect that a minor may have provided us with personal data. We will then take the appropriate steps to remove this information.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 10 */}
                    <section id="section-10">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 10 &ndash; Changes to This Privacy Policy</h2>
                        <div className="space-y-4">
                            <p>This Privacy Policy may be updated periodically to reflect changes to our practices, legal requirements, or operational needs. Please review this policy regularly to learn how to protect personal information.</p>
                            <p>Posted changes become effective immediately. We will notify you if we make any material changes to the Privacy Policy by updating the date of the policy or posting an announcement on the site.</p>
                            <p>If our company merges with another business or is acquired by another, your information could be transferred in the transaction. This would only happen if applicable data protection laws were followed.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 11 */}
                    <section id="section-11">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 11 &ndash; Complaints</h2>
                        <p>You can contact us if you have any questions or concerns regarding the handling of your personal data. Contact details are provided above in the Contact Information section. Your complaint will be reviewed, and we will respond in accordance with applicable data protection laws.</p>
                    </section>
                </div>

                {/* Back to top */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#F6C811] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        Back to top
                    </a>
                </div>
            </div>
        </div>
    );
}
