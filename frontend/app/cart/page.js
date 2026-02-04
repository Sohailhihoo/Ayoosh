'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

// Inline SVG icons to avoid react-icons module issues
const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function CartPage() {
  const { items, subtotal, total, totalItems, loading, fetchCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-24 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">
                      {item.product?.productType === 'suncream' && '☀️'}
                      {item.product?.productType === 'sunglasses' && '🕶️'}
                      {item.product?.productType === 'accessories' && '👜'}
                      {!item.product?.productType && '📦'}
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.product?.name || 'Product'}
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-500">
                            {item.variant.name}: {item.variant.value}
                          </p>
                        )}
                        <p className="text-pink-600 font-medium mt-1">
                          R{item.price?.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="font-semibold text-gray-900">
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">R{subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-500">Calculated at checkout</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">R{subtotal?.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Buttons */}
              <Link
                href="/checkout"
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                Proceed to Checkout
                <ArrowRightIcon className="w-5 h-5" />
              </Link>

              {!isAuthenticated && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    <Link href="/login?redirect=/checkout" className="text-pink-600 hover:underline">Login</Link>
                    {' '}for faster checkout, or continue as guest
                  </p>
                </div>
              )}

              <Link
                href="/products"
                className="block text-center text-pink-600 hover:underline mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
