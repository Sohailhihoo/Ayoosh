'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCartStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1, null, product.price);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const productColors = {
    suncream: 'from-[#e0e0e0] to-[#f5f5f5]',
    sunglasses: 'from-[#e0e0e0] to-[#f5f5f5]',
    accessories: 'from-[#e8d4c4] to-[#f5e6d8]',
  };

  const productEmojis = {
    suncream: '☀️',
    sunglasses: '🕶️',
    accessories: '👜',
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className={`relative aspect-square bg-gradient-to-br ${productColors[product.productType] || 'from-gray-100 to-gray-200'} rounded-lg overflow-hidden mb-4`}>
          {/* Product Visual */}
          <div className="absolute inset-0 flex items-center justify-center">
            {(product.images?.[0]?.url || product.image) ? (
              <Image
                src={product.images?.[0]?.url || product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className={`text-6xl transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                {productEmojis[product.productType] || '📦'}
              </span>
            )}
          </div>

          {/* Badges removed */}

          {/* Quick Add Button */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-white/95 transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'
              }`}
          >
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#4a4a4a] text-white text-sm tracking-widest hover:bg-[#333] transition-colors"
            >
              {product.productType === 'sunglasses' ? 'ORDER NOW' : 'ADD TO CART'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center">
          <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
          <div className="text-sm">
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-gray-400 line-through">R{product.compareAtPrice.toFixed(2)}</span>
                <span className="text-red-600 font-medium">R{product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-gray-600">R{product.price?.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button - visible only on tablet/mobile */}
      <button
        onClick={handleAddToCart}
        className="w-full mt-2 py-3 bg-[#4a4a4a] text-white text-sm tracking-widest hover:bg-[#333] transition-colors rounded-lg md:hidden"
      >
        {product.productType === 'sunglasses' ? 'ORDER NOW' : 'ADD TO CART'}
      </button>
    </Link>
  );
}
