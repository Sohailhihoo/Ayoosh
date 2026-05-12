'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import toast from 'react-hot-toast';

// Inline SVG icons to avoid react-icons module issues
const HeartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const MinusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ShoppingBagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const StarIcon = ({ className, filled }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Product-specific accordion content
const SUNCREAM_ACCORDION = [
  {
    id: 'ingredients',
    title: 'Ingredients',
    content: (
      <p className="text-gray-500 text-sm leading-relaxed">
        Water, Ethylhexyl Methoxycinnamate, Propanediol, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Diethylamino Hydroxybenzoyl Hexyl Benzoate, C12-15 Alkyl Benzoate, Neopentyl Glycol Dicaprylate/Dicaprate, Betaine, Polyglyceryl-3 Methylglucose Distearate, Silica, Cetearyl Alcohol, Glyceryl Stearate, Cetearyl Olivate, 1,2-Hexanediol, Hydroxyacetophenone, Dimethicone, Sorbitan Olivate, Polyacrylate Crosspolymer-6, Dipotassium Glycyrrhizate, Allantoin, Glycerin, Polyhydroxystearic Acid, Butylene Glycol, Sorbitan Stearate, Tocopheryl Acetate, Polyglyceryl-10 Stearate, Lecithin, Isostearic Acid, Isopropyl Myristate, Ethylhexyl Palmitate, Disodium EDTA, Ammonium Acryloyldimethyltaurate/VP Copolymer, Polyglyceryl-3 Polyricinoleate, Lavandula Angustifolia (Lavender) Oil, Dimethicone/Vinyl Dimethicone Crosspolymer, Linalool, t-Butyl Alcohol, Centella Asiatica Extract, Asiaticoside, BHT, Madecassic Acid, Asiatic Acid, Polygonum Cuspidatum Root Extract, Scutellaria Baicalensis Root Extract, Camellia Sinensis Leaf Extract, Glycyrrhiza Glabra (Licorice) Root Extract, Rosmarinus Officinalis (Rosemary) Leaf Extract, Chamomilla Recutita (Matricaria) Flower Extract.
      </p>
    ),
  },
  {
    id: 'key-benefits',
    title: 'Key Benefits',
    content: (
      <div>
        <ul className="space-y-3 text-gray-500 text-sm leading-relaxed">
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">SPF 50+ PA++++:</strong> Maximum broad-spectrum UVA and UVB protection</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Zero White Cast:</strong> Invisible on all skin tones, from fair to deep</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Centella Cica Complex:</strong> Soothes irritation, calms redness, and repairs the skin barrier</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">6 Botanical Antioxidants:</strong> Help fight free radical damage and premature aging</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Lightweight Glow Finish:</strong> Non-greasy, dewy, lit-from-within look</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Skin Barrier Support:</strong> Betaine and Allantoin lock in moisture all day</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Works Under Makeup:</strong> Sits perfectly as a primer base with no pilling</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Dermatologically Tested:</strong> Suitable for all skin types, including sensitive skin</span></li>
          <li className="flex gap-2"><span className="text-yellow-500 font-bold">&#8226;</span><span><strong className="text-gray-700">Made in Korea:</strong> Formulated and manufactured to the highest K-beauty standards</span></li>
        </ul>
        <p className="mt-4 text-sm text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-100 font-medium">
          A portion of the proceeds goes to the Ayoosh Foundation
        </p>
      </div>
    ),
  },
  {
    id: 'how-to-use',
    title: 'How to Use',
    content: (
      <div className="space-y-5">
        <ol className="space-y-3 text-gray-500 text-sm leading-relaxed">
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">1</span><span>Apply as the final step of your morning skincare routine, after moisturiser.</span></li>
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">2</span><span>Use approximately two finger-lengths for the face and neck.</span></li>
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">3</span><span>Smooth evenly across all exposed areas 15 minutes before sun exposure.</span></li>
          <li className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center">4</span><span>Reapply every 2-3 hours, or after swimming, sweating, or towel-drying.</span></li>
        </ol>
        <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-100">
          <strong>Tip:</strong> Don&apos;t forget your ears, neck, and upper chest (the spots that age fastest).
        </p>
      </div>
    ),
  },
  {
    id: 'key-ingredients',
    title: 'Key Ingredients',
    content: (
      <div className="space-y-5 text-sm">
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Centella Asiatica Complex</h4>
          <p className="text-gray-500 leading-relaxed">Pure Centella Extract + Asiaticoside + Madecassic Acid + Asiatic Acid. A therapeutic-level &quot;Cica&quot; blend that repairs the skin barrier, reduces inflammation, and accelerates healing.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">6-Botanical Antioxidant Shield</h4>
          <p className="text-gray-500 leading-relaxed">Green Tea &bull; Licorice Root &bull; Rosemary &bull; Chamomile &bull; Scutellaria Baicalensis &bull; Polygonum Cuspidatum. Neutralises free radicals and prevents premature ageing from environmental stress.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">4-Filter Photostable UV System</h4>
          <p className="text-gray-500 leading-relaxed">A modern combination of UV filters (including Tinosorb S and Uvinul A Plus) that remains stable under sunlight — providing consistent, all-day protection without degrading.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Betaine</h4>
          <p className="text-gray-500 leading-relaxed">A natural humectant that draws moisture into the skin and keeps it hydrated throughout the day.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Allantoin</h4>
          <p className="text-gray-500 leading-relaxed">Soothes irritation, promotes healing, and softens the skin&apos;s surface.</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Vitamin E (Tocopheryl Acetate)</h4>
          <p className="text-gray-500 leading-relaxed">An antioxidant that protects cells from oxidative damage and supports skin repair.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'faqs',
    title: 'FAQs',
    content: (
      <div className="space-y-4 text-sm">
        {[
          { q: 'Will this leave a white cast on dark skin?', a: 'No. Engineered to be invisible on all skin tones, including deep and very deep complexions. Zero white cast, guaranteed.' },
          { q: 'Can I wear this under makeup?', a: 'Yes. Works beautifully as a primer base. Makeup applies smoothly without pilling or separation.' },
          { q: 'Is this suitable for sensitive skin?', a: 'Yes. Dermatologically tested and infused with Centella Asiatica, which actively calms and soothes reactive skin.' },
          { q: 'How much should I apply?', a: 'Two finger-lengths (approximately 1/4 teaspoon) for face and neck. This is the amount needed for full SPF 50+ protection.' },
          { q: 'How often should I reapply?', a: 'Every 2-3 hours, or immediately after swimming, sweating, or towel-drying.' },
          { q: 'What does PA++++ mean?', a: 'PA++++ is the highest UVA protection rating. It means maximum defence against the rays that cause premature ageing and pigmentation.' },
          { q: 'Where is this made?', a: 'Manufactured in South Korea.' },
          { q: 'Is this reef-safe?', a: 'This formula does not contain Oxybenzone or Octinoxate, the two filters most commonly linked to coral reef damage.' },
        ].map((faq, i) => (
          <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <p className="font-semibold text-gray-900 mb-1">Q: {faq.q}</p>
            <p className="text-gray-500 leading-relaxed">A: {faq.a}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    content: (
      <div className="text-gray-500 text-sm leading-relaxed space-y-2">
        <p>Dermatologically tested for all skin types. Patch-test prior to use is recommended.</p>
        <p>This product is not intended to diagnose, treat, cure, or prevent any medical condition.</p>
        <p>For external use only. Avoid contact with eyes. If contact occurs, rinse thoroughly with water. Do not apply to broken or irritated skin. Discontinue use if irritation, rash, or redness occurs.</p>
        <p>Avoid excessive sun exposure, even when using sunscreen. Keep out of reach of children. Store in a cool, dry place below 30&deg;C, away from direct sunlight.</p>
      </div>
    ),
  },
];

const DEFAULT_ACCORDION = [
  { id: 'ingredients', title: 'Ingredients', content: <p className="text-gray-500 text-sm leading-relaxed">Content coming soon.</p> },
  { id: 'key-benefits', title: 'Key Benefits', content: <p className="text-gray-500 text-sm leading-relaxed">Content coming soon.</p> },
  { id: 'how-to-use', title: 'How to Use', content: <p className="text-gray-500 text-sm leading-relaxed">Content coming soon.</p> },
  { id: 'key-ingredients', title: 'Key Ingredients', content: <p className="text-gray-500 text-sm leading-relaxed">Content coming soon.</p> },
];

// Map product slugs to their accordion content
const PRODUCT_ACCORDION_MAP = {
  'sun-cream-50ml-tube': SUNCREAM_ACCORDION,
  'sun-cream-pouch': SUNCREAM_ACCORDION,
};

function getAccordionItems(slug) {
  return PRODUCT_ACCORDION_MAP[slug] || DEFAULT_ACCORDION;
}

function AccordionItem({ title, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 group-hover:text-yellow-600 transition-colors">
          {title}
        </span>
        <span className={`ml-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] pb-6' : 'max-h-0'}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setSelectedImageIndex(0);
      const { data } = await productAPI.getOne(slug);
      setProduct(data.data);

      // Fetch related products
      try {
        const relatedRes = await productAPI.getAll({
          productType: data.data.productType,
          limit: 4
        });
        setRelatedProducts(
          relatedRes.data.data.products.filter(p => p.slug !== slug).slice(0, 4)
        );
      } catch (e) {
        console.log('No related products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const price = selectedVariant?.price || product.price;
      await addToCart(product._id, quantity, selectedVariant, price);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products" className="btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const currentPrice = selectedVariant?.price || product.price;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="container-custom py-4">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-yellow-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-yellow-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <div className="container-custom py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Slider */}
          <div className="relative">
            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center overflow-hidden">
              {(product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url || product.image) ? (
                <img
                  src={product.images?.[selectedImageIndex]?.url || product.images?.[0]?.url || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <span className="text-8xl">
                  {product.productType === 'suncream' && '☀️'}
                  {product.productType === 'sunglasses' && '🕶️'}
                  {product.productType === 'accessories' && '👜'}
                  {!['suncream', 'sunglasses', 'accessories'].includes(product.productType) && '📦'}
                </span>
              )}
            </div>
            {/* Slider Controls */}
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(i => i === 0 ? product.images.length - 1 : i - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex(i => i === product.images.length - 1 ? 0 : i + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                {/* Dots Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${selectedImageIndex === i ? 'bg-yellow-500 w-4' : 'bg-gray-400/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-yellow-600 font-medium uppercase tracking-wide mb-2">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      filled={i < Math.round(product.averageRating)}
                      className={`w-5 h-5 ${i < Math.round(product.averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                R{currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    R{product.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                    Save R{(product.compareAtPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
              {product.productType === 'suncream' && (
                <span className="text-sm text-gray-500">(incl delivery)</span>
              )}
            </div>

            {/* Short Description */}
            {product.productType !== 'sunglasses' && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.shortDescription || 'Experience the pinnacle of Korean sun care with a formula that does more than just protect. The Ayoosh Centella Cica Glow Sun Cream is a weightless, broad-spectrum SPF 50+ PA++++ treatment that seamlessly blends advanced UV defense with therapeutic skin-soothing botanicals. Designed to melt into the skin without a trace, it delivers a refined, natural glow while strengthening your skin\'s resilience against environmental stressors.'}
              </p>
            )}

            {/* Variants */}
            {product.hasVariants && product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">
                  {product.variants[0].name}:
                  <span className="text-yellow-600 ml-2">{selectedVariant?.value || 'Select'}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border-2 rounded-lg transition-colors ${selectedVariant?.value === variant.value
                        ? 'border-yellow-600 bg-yellow-50 text-yellow-600'
                        : 'border-gray-200 hover:border-yellow-300'
                        }`}
                    >
                      {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {product.productType === 'sunglasses' ? 'Pre-Order' : 'Add to Cart'}
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-300 transition-colors">
                <HeartIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Product Meta */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">SKU:</span> {product.sku}</p>
              <p><span className="font-medium">Category:</span> {product.productType}</p>
            </div>
          </div>
        </div>

        {/* Product Details Accordion */}
        {product.productType !== 'sunglasses' && (
          <div className="mt-16 border-t border-gray-200">
            {getAccordionItems(slug).map((item) => (
              <AccordionItem
                key={item.id}
                title={item.title}
                isOpen={openAccordion === item.id}
                onToggle={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
              >
                {item.content}
              </AccordionItem>
            ))}
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <ProductReviews productId={product._id} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
