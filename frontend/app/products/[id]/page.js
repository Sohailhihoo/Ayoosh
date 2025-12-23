'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productAPI } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { HiOutlineHeart, HiMinus, HiPlus, HiOutlineShoppingBag, HiStar } from 'react-icons/hi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getOne(id);
      setProduct(data.data);
      
      // Fetch related products
      try {
        const relatedRes = await productAPI.getAll({ 
          productType: data.data.productType,
          limit: 4 
        });
        setRelatedProducts(
          relatedRes.data.data.products.filter(p => p._id !== id).slice(0, 4)
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
          <Link href="/" className="hover:text-pink-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-pink-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>

      {/* Product Details */}
      <div className="container-custom py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center">
              <span className="text-8xl">
                {product.productType === 'beauty' && '💄'}
                {product.productType === 'sunglasses' && '🕶️'}
                {product.productType === 'accessories' && '👜'}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-pink-600 font-medium uppercase tracking-wide mb-2">
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
                    <HiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.averageRating)
                          ? 'fill-current'
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
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                    Save ${(product.compareAtPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.shortDescription || product.description}</p>

            {/* Variants */}
            {product.hasVariants && product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">
                  {product.variants[0].name}: 
                  <span className="text-pink-600 ml-2">{selectedVariant?.value || 'Select'}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                        selectedVariant?.value === variant.value
                          ? 'border-pink-600 bg-pink-50 text-pink-600'
                          : 'border-gray-200 hover:border-pink-300'
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
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <HiPlus className="w-4 h-4" />
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
                <HiOutlineShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors">
                <HiOutlineHeart className="w-6 h-6" />
              </button>
            </div>

            {/* Product Meta */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">SKU:</span> {product.sku}</p>
              <p><span className="font-medium">Category:</span> {product.productType}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b">
            <div className="flex gap-8">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-pink-600 border-b-2 border-pink-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600">{product.description}</p>
                
                {product.ingredients?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Ingredients</h3>
                    <p className="text-gray-600">{product.ingredients.join(', ')}</p>
                  </div>
                )}

                {product.skinType?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Suitable for</h3>
                    <div className="flex gap-2">
                      {product.skinType.map((type, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm capitalize">
                          {type} skin
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review, i) => (
                      <div key={i} className="border-b pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </div>
                          <span className="font-medium">{review.title}</span>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
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
