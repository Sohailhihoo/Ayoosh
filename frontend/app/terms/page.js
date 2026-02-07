'use client';

import React, { useState } from 'react';

const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'section-1', title: 'Section 1 – Online Store Terms and Prohibitions' },
    { id: 'section-2', title: 'Section 2 – General Conditions' },
    { id: 'section-3', title: 'Section 3 – Accuracy, Completeness and Timeliness of Information' },
    { id: 'section-4', title: 'Section 4 – Modifications to the Service and Pricing' },
    { id: 'section-5', title: 'Section 5 – Products and Services' },
    { id: 'section-6', title: 'Section 6 – Delivery' },
    { id: 'section-7', title: 'Section 7 – Accuracy of Billing and Account Information' },
    { id: 'section-8', title: 'Section 8 – Optional Tools' },
    { id: 'section-9', title: 'Section 9 – Third-Party Links' },
    { id: 'section-10', title: 'Section 10 – Cookies' },
    { id: 'section-11', title: 'Section 11 – User Comments, Feedback and Other Submissions' },
    { id: 'section-12', title: 'Section 12 – Personal Information' },
    { id: 'section-13', title: 'Section 13 – Errors, Inaccuracies and Omissions' },
    { id: 'section-14', title: 'Section 14 – Prohibited Uses' },
    { id: 'section-15', title: 'Section 15 – Disclaimer of Warranties; Limitation of Liability' },
    { id: 'section-16', title: 'Section 16 – Indemnification' },
    { id: 'section-17', title: 'Section 17 – Severability' },
    { id: 'section-18', title: 'Section 18 – Termination' },
    { id: 'section-19', title: 'Section 19 – Entire Agreement' },
    { id: 'section-20', title: 'Section 20 – Governing Law' },
    { id: 'section-21', title: 'Section 21 – Changes to Terms & Conditions' },
    { id: 'section-22', title: 'Section 22 – Gift Vouchers' },
    { id: 'section-23', title: 'Section 23 – Returns' },
    { id: 'section-24', title: 'Section 24 – Contact Information' },
];

export default function TermsPage() {
    const [tocOpen, setTocOpen] = useState(false);

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Header */}
            <div className="bg-[#faf7f5] border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#e8a4b8] mb-4 font-medium">Legal</p>
                    <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#333] mb-4">
                        Terms &amp; Conditions
                    </h1>
                    <p className="text-sm text-gray-400 tracking-wide">Ayoosh PTY Ltd</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
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
                                    className="block py-1.5 text-sm text-gray-500 hover:text-[#e8a4b8] transition-colors break-inside-avoid"
                                >
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-12 text-[#4a4a4a] text-[15px] leading-relaxed">

                    {/* Overview */}
                    <section id="overview">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Overview</h2>
                        <div className="space-y-4">
                            <p>This website is owned and operated by Ayoosh PTY Ltd. Ayoosh PTY Ltd is referred to as &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo; throughout this website and in these Terms &amp; Conditions. Ayoosh PTY Ltd offers this website, including all the information, tools and services that are available on it, subject to you accepting the terms, policies, and conditions set forth here. These Terms &amp; Condition govern your relationship with Ayoosh.</p>
                            <p>By using this website or purchasing our products and services, you agree to these Terms &amp; Conditions, as well as any other terms, conditions or policies that are referenced in the site or accessible via hyperlink. The Terms &amp; Conditions applies to all website users, including but without limitation of browsers, customers and merchants.</p>
                            <p>Please carefully read the Terms and Conditions before using our website. You agree to our terms and conditions by accessing or using the website. You must not use our website or access it if you don&rsquo;t agree with all the terms and conditions. Where these Terms &amp; Conditions are deemed an offer, acceptance is expressly limited to them.</p>
                            <p>The Terms &amp; Conditions will apply to any new tools, features, or services that are added to our current store. This page will always show you the most recent version of these Terms and Conditions. By posting any changes to the website, we reserve the right to update, modify or replace any part. You are responsible for checking this page regularly to see if there have been any updates. The use or access of the website after the changes are posted constitutes your acceptance of the changes.</p>
                            <p>Access to this website is provided on a temporary basis. We reserve the right to remove, modify or suspend the Services at any time, without prior notice. We are not responsible if the website is not available at any given time for any period of time. We may, from time to time, restrict access to certain or all areas of the website.</p>
                            <p>Our online store runs on ... This platform provides us with the ecommerce platform to enable us to sell you our products and services.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 1 */}
                    <section id="section-1">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 1 &ndash; Online Store Terms and Prohibitions</h2>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Eligibility and Consent</h3>
                        <p className="mb-4">You confirm that you have reached the age of 18 by accessing or using our website. You represent further that you have obtained consent for any minor dependents who are under your supervision to access this website.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Prohibited Uses</h3>
                        <p className="mb-4">You agree not to misuse this website or any of our services. You must not:</p>
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            <li>Promote, engage in or facilitate criminal activity.</li>
                            <li>Transmitting, distributing, or introducing any viruses, trojans, worms, or logic bombs or other malicious or harmful material, such as confidential or offensive information, is prohibited.</li>
                            <li>Unauthorized access or attempts to gain unauthorized access to any portion of the Service.</li>
                            <li>Data corruption, data damage, or any interference.</li>
                            <li>Disrupt, harass, or cause inconvenience to users.</li>
                            <li>Intellectual property rights or proprietary rights belong to any individual or entity.</li>
                            <li>Sending unsolicited promotional material, advertising, or other spam communications.</li>
                            <li>Try to interfere with or impair the performance, security, or functionality of the website or systems accessible through it.</li>
                        </ul>
                        <p className="mb-4">A violation of these provisions can be a crime. Ayoosh retains the right to report any violations of these Terms to law enforcement authorities, and to provide relevant information about users as needed. If you violate these Terms, your access to the Service may be immediately suspended or terminated.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-8">Limitation of Liability</h3>
                        <p className="mb-4">Ayoosh is not responsible for any damage or loss caused by viruses, distributed denial of service attacks, or other harmful materials that could affect your computer system, software, data or other proprietary material because of using our website.</p>
                        <p>You agree to refrain from using our products and services for any illegal or unauthorized purposes. You must follow all laws and regulations when using the Service. This includes, but is not limited to, copyright laws and intellectual property laws.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 2 */}
                    <section id="section-2">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 2 &ndash; General Conditions</h2>
                        <div className="space-y-4">
                            <p>We reserve the right to refuse service at any time to anyone for any reason.</p>
                            <p>You acknowledge that the content you transmit or submit through the Service (excluding credit card data) may be transmitted without encryption. This may include:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>(a) transmissions over multiple networks</li>
                                <li>(b) necessary modifications to meet the technical requirements for connecting networks or devices.</li>
                            </ul>
                            <p>Credit card data is always transmitted encrypted over networks. You agree to not copy, reproduce or duplicate any part of the Service or the Service&rsquo;s use, nor to sell, resell or exploit the Service or any communication or contact available via the website without our written consent.</p>
                            <p>The section headings in these Terms have been provided purely for convenience and will not affect their interpretation, scope or enforceability.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 3 */}
                    <section id="section-3">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 3 &ndash; Accuracy, Completeness and Timeliness of Information</h2>
                        <div className="space-y-4">
                            <p>No representations are made or warranties given regarding the accuracy, timeliness, completeness or correctness of any information available on our website.</p>
                            <p>The content on this site is only for informational purposes and not to be used as a basis for decisions. You should consult primary, independent, or more current sources of information before acting on any material provided on this site.</p>
                            <p>You are solely responsible for any reliance you place on information obtained through our website.</p>
                            <p>This site contains information that may be outdated. It is only provided for reference.</p>
                            <p className="bg-[#faf7f5] border-l-2 border-[#e8a4b8] px-4 py-3 text-sm italic">Note: We reserve the right to remove, modify, or update content on this site without prior notice. We are not required to update information. You agree to regularly check out this site for updates.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 4 */}
                    <section id="section-4">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 4 &ndash; Modifications to the Service and Pricing</h2>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Price changes</h3>
                        <p className="mb-4">Our prices may change at any time, without prior notice.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Service Modifications &amp; Availability</h3>
                        <p className="mb-4">At any time, we reserve the right to change, suspend or discontinue any portion of the Service or its content.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Liability Wavier</h3>
                        <p>We shall not be responsible for any modifications, price adjustments, suspensions, or discontinuations of the Service.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 5 */}
                    <section id="section-5">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 5 &ndash; Products and Services</h2>
                        <div className="space-y-4">
                            <p>Certain products and services may only be available online via the website. Products and Services may only be available in limited quantities. Our products and Services are subject to return or exchange only in accordance with our Return Policy.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Product Descriptions and Display</h3>
                            <p>We do our best to display the product images, descriptions, and colors accurately. We do not guarantee the accuracy of your device&rsquo;s display or that it will reflect the actual product.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Sales Limitations and Availability</h3>
                            <p>We reserve the right to limit sales of our products and Services to a particular person, geographical region or jurisdiction. This can be done on a case-by-case basis. We also reserve the right to limit quantities, modify product descriptions, or change pricing at any time without prior notice.</p>

                            <p>We reserve the right to make changes in product descriptions or pricing at any time, without prior notice. We reserve the right to discontinue any Service or product at any time. Any offer on this website is void in any jurisdiction where it&rsquo;s prohibited by law.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">No Warranty of Satisfaction</h3>
                            <p>We do not warrant or guarantee that the quality of any products, Services, information, or other materials purchased or obtained through the Service will meet your expectations, nor do we warrant that any errors in the Service will be corrected.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 6 */}
                    <section id="section-6">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 6 &ndash; Delivery</h2>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Order Processing and Shipping</h3>
                        <p className="mb-4">Orders will be processed in two (2) working days, subject to the availability of stock and payment. They will then be handed to a delivery company. Orders above R750 are delivered free of charge. Orders below R750 will be charged with a courier fee.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Delivery Addresses and Acceptance</h3>
                        <p className="mb-4">PO Boxes will not be accepted for delivery addresses. It is your responsibility to ensure that someone will be available to receive delivery at the address you provided during checkout.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Condition of the Goods</h3>
                        <p className="mb-4">The Provider must ensure that all goods are delivered to the courier in good condition and take reasonable measures to make sure they arrive at the User&rsquo;s chosen delivery address.</p>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Order Cancellation and Refunds</h3>
                        <p>Refunds for cancelled orders through the online facility are subject to a 10% administrative cost. The Provider reserves its right to cancel orders for which payment has been made. If the stock is not available or the quality of the products does not meet Provider standards, this may happen. If the Provider cancels a purchase, the User receives a refund in full.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 7 */}
                    <section id="section-7">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 7 &ndash; Accuracy of Billing and Account Information</h2>
                        <div className="space-y-4">
                            <p>This section outlines our rights regarding order acceptance and your obligations to ensure the accuracy of billing and account information.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Order Acceptance and Limitations</h3>
                            <p>We reserve the right not to accept any orders. We reserve the right to limit or cancel orders at our discretion. These restrictions may apply to orders placed by the same customer, with the same payment method or at the same billing address.</p>
                            <p>We may try to contact you via the details provided during the purchase process, such as your email address, billing information, or telephone number, if we need to modify or cancel an order. We reserve the right, at our discretion, to limit or prevent orders placed by resellers, distributors, or dealers.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Accuracy of Account Information</h3>
                            <p>You agree to provide accurate, current, and complete information about your account and purchases for all transactions you make through our store. You agree to update your account details promptly, including your payment information and email address, so we can process your transactions and contact you when necessary.</p>
                            <p>Please review our Returns policy for more information on returns and refunds.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 8 */}
                    <section id="section-8">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 8 &ndash; Optional Tools</h2>
                        <div className="space-y-4">
                            <p>You may be given access to tools provided by third parties that we don&rsquo;t monitor or control.</p>
                            <p>You agree and acknowledge that such tools are provided &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; without warranties, representations or conditions of any kind. We will not be liable for any damages arising out of or related to the use of optional third-party software.</p>
                            <p>You use optional tools available on the website at your own discretion and risk. It is your responsibility to ensure that you understand and accept the terms and conditions of the third-party providers who provide these tools.</p>
                            <p>We may introduce new services, features, tools, or resources through the website. All such additions will be subject to the Terms &amp; Conditions.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 9 */}
                    <section id="section-9">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 9 &ndash; Third-Party Links</h2>
                        <div className="space-y-4">
                            <p>Certain content, products, and Services made available through our Service may include materials provided by third parties.</p>
                            <p>You may be directed to third-party websites by clicking on links on our site. You acknowledge that:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>We do not monitor or review the content or accuracy of third-party sites.</li>
                                <li>No warranties or representations are made by us regarding the products or Services of third parties, including their websites, materials or services.</li>
                                <li>We do not accept any responsibility or liability whatsoever for the content, services, products, or transactions of third parties.</li>
                            </ul>
                            <p>We will not be held responsible for any damages, losses, or harm resulting from:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Purchase or use of products or services obtained via third-party websites</li>
                                <li>Third-party resources or content can be accessed or relied upon</li>
                                <li>Transactions made on third-party websites</li>
                            </ul>
                            <p>Before engaging in any transaction, you are responsible for understanding and reviewing the policies and practices of all third parties. You must direct any complaints, claims or concerns you may have about third-party services or products to the third party.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 10 */}
                    <section id="section-10">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 10 &ndash; Cookies</h2>
                        <div className="space-y-4">
                            <p>A cookie is an anonymous text file that is stored by the server of a website on your device. This could be a computer, tablet, phone, or any other type of device. Each cookie is unique for your web browser, and it contains anonymous information, including a unique identification and the name of the website. Cookies are used to store information on a website, such as preferences, items in your basket, and products that you may be interested in.</p>
                            <p>We use both first-party cookies and third-party cookies on our website. These cookies allow us to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Store preferences to improve user experience, for example, by keeping users logged in.</li>
                                <li>Google Analytics is a great tool to analyze aggregated web usage, including the time spent on a site and the number of pages visited.</li>
                                <li>Use Google Analytics Remarketing to deliver more relevant ads to previous website visitors.</li>
                            </ul>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Cookie Opt Out</h3>
                            <p>Most web browsers allow you to block all or certain types of cookies if you choose to do so. Users may also opt out of the Google Display Network through the Google Ads Preferences Manager.</p>
                            <p className="bg-[#faf7f5] border-l-2 border-[#e8a4b8] px-4 py-3 text-sm italic">Note: Please be aware that our website relies on cookies for many of its features to work properly. Blocking cookies can limit your experience with the site.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 11 */}
                    <section id="section-11">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 11 &ndash; User Comments, Feedback and Other Submissions</h2>
                        <div className="space-y-4">
                            <p>You agree to allow us to use your comments in any way we choose. This includes the rights to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Edit, copy, publish, distribute, translate, and otherwise use the comments</li>
                                <li>Use the comments in any medium and for any purpose</li>
                                <li>Use the comments without compensation or attribution</li>
                            </ul>
                            <p>No obligation exists to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Maintain any comments in confidence</li>
                                <li>Pay compensation for any comments</li>
                                <li>Respond to any comments</li>
                            </ul>
                            <p>We can, but we are not required, to monitor, edit or remove any content that, at our sole discretion, we deem to be illegal, offensive, threatening or defamatory. It could also be pornographic, vulgar, obscene or otherwise objectionable or in violation of intellectual property rights.</p>
                            <p>Your comments will not be published.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Infringe on any third-party rights, such as copyright, trademarks, privacy, personality or other personal or proprietary interests</li>
                                <li>Contain material that is abusive, obscene or unlawful</li>
                                <li>Include any harmful code, such as a computer virus or malware, that could affect the Service or any website related to it</li>
                                <li>Use a fake email address, impersonate someone else, or otherwise try to mislead third parties or us as to the source of your comments</li>
                            </ul>
                            <p>The content and accuracy are your sole responsibility. We accept no responsibility or liability for any comments made by you, a third party, or anyone else.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 12 */}
                    <section id="section-12">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 12 &ndash; Personal Information</h2>
                        <p>Our Privacy Policy governs your submission of personal data through our store. By using this site, you consent to your personal information being collected, used, and processed as described in the policy. You also warrant that any information you provide is accurate, up-to-date, and complete.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 13 */}
                    <section id="section-13">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 13 &ndash; Errors, Inaccuracies and Omissions</h2>
                        <div className="space-y-4">
                            <p>Information on our website, or in the Service, may occasionally contain typographical mistakes, inaccuracies or omissions that relate to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Product descriptions</li>
                                <li>Pricing</li>
                                <li>Offers and promotions</li>
                                <li>Shipping charges</li>
                                <li>Transit times</li>
                                <li>Product availability</li>
                            </ul>
                            <p>We reserve the right:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Correction of errors, inaccuracies or omissions</li>
                                <li>Update or change information</li>
                                <li>Cancel orders where any information in the Service or on any related website is inaccurate</li>
                            </ul>
                            <p>The actions can be taken without notice at any time and even after the order is submitted.</p>
                            <p>We assume no obligation to update, amend, or clarify information in the Service or on any related website, including pricing information, except where required by applicable law. Referring to an update date or refresh date does not mean that all the information has been updated or modified.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 14 */}
                    <section id="section-14">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 14 &ndash; Prohibited Uses</h2>
                        <div className="space-y-4">
                            <p>You are prohibited from using our site or its contents for the following reasons:</p>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>To solicit or perform unlawful acts or for any unlawful purpose</li>
                                <li>Violation of any international, provincial or state laws, regulations, rules or ordinances</li>
                                <li>Infringing or violating our intellectual property or that of others</li>
                                <li>Harassment, abuse, insults, harm, defamation, libel, disparagement, intimidation, or discrimination against anyone based on their gender, sexuality, religion, race, ethnicity, age, nationality, or disability</li>
                                <li>Submitting false, misleading or deceptive data</li>
                                <li>Uploading or transmitting viruses or other malicious code which may affect the functionality or the operation of the Service, or any website related to it, other websites or the Internet</li>
                                <li>Collect, track or misuse personal information about others</li>
                                <li>Engage in spamming or phishing.</li>
                                <li>Use for any offensive, obscene or immoral purpose</li>
                                <li>Interfere, bypass or circumvent security features on the Service or any website related to it, other websites or the Internet</li>
                            </ol>
                            <p>For any violation of the prohibited uses, we reserve the right, without prior notice, to terminate or temporarily suspend your access to any website related to the Service.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 15 */}
                    <section id="section-15">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 15 &ndash; Disclaimer of Warranties; Limitation of Liability</h2>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">No Guarantee of Service Availability or Performance</h3>
                        <div className="space-y-4 mb-6">
                            <p>We cannot guarantee that the Service is error-free, uninterrupted, timely, or secure. We do not guarantee that the results you get from using the Service or products will be accurate or reliable or that they will meet your expectations.</p>
                            <p>You agree that we can, at any time and without notice, discontinue the Service or remove it for an indefinite period.</p>
                        </div>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Use at your Own Risk</h3>
                        <div className="space-y-4 mb-6">
                            <p>You agree to accept sole responsibility for your use or inability to use the Service. Except as explicitly stated by us, the Service, and all products or Services delivered through it, are provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis.</p>
                            <p>This includes the exclusion from any representation, warranty, or condition of any kind, whether express or implied, including implied warranties and conditions of merchantability or merchantable quality, fitness to a specific purpose, durability, title or non-infringement.</p>
                        </div>

                        <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Limitation of Liability</h3>
                        <div className="space-y-4">
                            <p>Ayoosh PTY Ltd and its affiliates are not responsible for any injuries, losses, claims, or damages. This includes directors, officers&rsquo; employees, contractors, interns&rsquo; suppliers, service providers, content providers, advertisers.</p>
                            <p>It includes all damages, such as direct, indirect, or punitive damage. This can include lost profits, revenue, savings, data loss, replacement costs, or other damages.</p>
                            <p>This limitation is applicable to any and all damages that may arise from your use of the Service (or any products you obtain through it), including any errors or omissions, as well as any loss or damages caused by content or products transmitted or made available via the Service.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 16 */}
                    <section id="section-16">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 16 &ndash; Indemnification</h2>
                        <p>You agree to indemnify, defend, and hold harmless Ayoosh, including its parent companies, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, consultants, interns, and employees, from and against any and all third-party claims, liabilities, damages, losses, and costs, including reasonable legal fees, arising out of or relating to your use of this website or the Service, your breach of these Terms &amp; Conditions or any documents incorporated by reference, or your violation of any applicable law or the rights of any third party.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 17 */}
                    <section id="section-17">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 17 &ndash; Severability</h2>
                        <p>If a provision of these Terms and Conditions is found to be illegal, null, or unenforceable, it will be enforced to the maximum extent allowed by law. The unenforceable portion of these Terms &amp; Conditions will be removed, but this determination does not affect the validity and enforceability of the remaining provisions.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 18 */}
                    <section id="section-18">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 18 &ndash; Termination</h2>
                        <div className="space-y-4">
                            <p>All obligations and liabilities incurred by the parties prior to the termination date will survive termination.</p>
                            <p>The Terms &amp; Conditions remain in force until either you or we terminate them. You can terminate these Terms and Conditions at any point by notifying us of your desire to no longer use our services or by ceasing use of the site.</p>
                            <p>We may terminate the agreement without prior notice if, in our sole discretion, you do not comply or are suspected of failing to comply with a term or provision set forth in these Terms &amp; Conditions. You will be responsible for any amounts due, up to and beyond the date of termination. We may also deny access to Services in whole or in part.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 19 */}
                    <section id="section-19">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 19 &ndash; Entire Agreement</h2>
                        <div className="space-y-4">
                            <p>This section confirms the Terms &amp; Conditions as the entire and controlling agreement between you and us.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>The failure of us to enforce or exercise any right or provision in these Terms and Conditions does not constitute a waiver of such right or provision.</li>
                                <li>The Terms &amp; Conditions and any operating rules or policies posted on this website or related to the Service constitute the entire understanding and agreement between you and us regarding the Service.</li>
                                <li>This agreement replaces all previous or contemporaneous agreements or communications between you and us, whether written or oral, including any prior versions of the Terms &amp; Conditions.</li>
                                <li>The drafting party is not liable for any ambiguities that may arise in the interpretation or application of these Terms and Conditions.</li>
                            </ul>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 20 */}
                    <section id="section-20">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 20 &ndash; Governing Law</h2>
                        <p>These Terms &amp; Conditions, together with any separate agreements through which we provide Services, shall be governed by and construed in accordance with the laws of the Republic of South Africa.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 21 */}
                    <section id="section-21">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 21 &ndash; Changes to Terms &amp; Conditions</h2>
                        <p>This page will always show the latest version of these Terms and Conditions. By posting any changes on our website, we reserve the right to amend, update or replace these Terms &amp; Conditions at our discretion. You are responsible for checking the website regularly for any updates. Acceptance of the new Terms &amp; Conditions is implied by your continued use or access of the website or Service after any changes have been posted.</p>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 22 */}
                    <section id="section-22">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 22 &ndash; Gift Vouchers</h2>
                        <div className="space-y-4">
                            <p>Ayoosh gift vouchers are not redeemable in cash. They will also not be replaced for lost, stolen or destroyed vouchers, nor if they have been used without authorization.</p>
                            <p>Gift Vouchers cannot be sold, transferred, or exchanged to a third party. Ayoosh Gift Vouchers cannot be used to buy another Ayoosh Gift Voucher.</p>
                            <p>Ayoosh gift vouchers can only be redeemed online via www.ayooshonline.com.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 23 */}
                    <section id="section-23">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 23 &ndash; Returns</h2>
                        <div className="space-y-4">
                            <p>The policy of returns is valid for 30 days after the date of purchase. We are unable to offer refunds or exchanges if more than 30 days have passed since the purchase.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Returns Eligibility</h3>
                            <p>For an item to qualify for a refund, it must meet the following requirements:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>The item must not be used, and in the original condition it was received.</li>
                                <li>Return the item in its original packaging, including all seals, plastic wrap and plastic wrapping</li>
                                <li>A receipt or proof of purchase is required.</li>
                            </ul>
                            <p>Certain items, such as health and personal care items, are exempted from returns.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Refunds</h3>
                            <p>We will send you an email once your returned item is received. You will be informed if your refund is approved or not.</p>
                            <p>Your refund will be processed via EFT, or, where possible, to your original payment method, within a reasonable time frame.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Late or Missing Refunds</h3>
                            <p>If you do not receive your refund:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>First, check your bank account again</li>
                                <li>Contact your credit card provider to confirm the processing time.</li>
                                <li>Contact your bank to confirm if additional processing time is required.</li>
                            </ul>
                            <p>Please contact us at support@ayooshonline.com if you still haven&rsquo;t received your refund after completing all the steps above.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Sale Items</h3>
                            <p>Refunds are only available on items purchased at the regular price. Sale items are not refundable.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Exchanges</h3>
                            <p>Only defective or damaged items are exchanged. Please contact us if you wish to exchange an item for the same product at support@ayooshonline.com.</p>

                            <h3 className="text-lg font-medium text-[#333] mb-3 mt-6">Shipping Address and Returns Address</h3>
                            <p>Please return the product to:</p>
                            <address className="not-italic bg-[#faf7f5] px-5 py-4 my-3 border-l-2 border-[#e8a4b8] text-sm leading-relaxed">
                                Ayoosh (Pty) Ltd<br />
                                
                            </address>
                            <p>All return shipping charges are your responsibility. Shipping costs are not refundable. The cost of shipping will be deducted if your refund is approved.</p>
                            <p>Delivery times may vary depending on where you are located.</p>
                            <p>We recommend that items valued over R500.00 be shipped via a service with tracking or by purchasing shipping insurance. We cannot guarantee the receipt of items returned that are not insured or tracked.</p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Section 24 */}
                    <section id="section-24">
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#333] mb-6">Section 24 &ndash; Contact Information</h2>
                        <p>Questions or enquiries regarding these Terms &amp; Conditions should be directed to us at www.ayooshonline.com.</p>
                    </section>
                </div>

                {/* Back to top */}
                <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                    <a
                        href="#overview"
                        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#e8a4b8] transition-colors"
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
