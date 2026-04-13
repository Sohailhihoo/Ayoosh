'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '@/lib/store';
import { orderAPI, couponAPI } from '@/lib/api';
import { initiatePayFastPayment } from '@/lib/payfast';
import toast from 'react-hot-toast';

// Inline SVG icons to avoid react-icons module issues
const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const LockClosedIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default function CheckoutForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, subtotal, totalItems, fetchCart, clearCart, coupon, applyCoupon, removeCoupon } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Coupon State
    const [couponInput, setCouponInput] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        // Customer Details (for guests)
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        // Shipping Address
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'South Africa',
        // Payment & Shipping
        paymentMethod: 'payfast',  // Default to PayFast
        shippingMethod: 'standard',
        customerNote: '',
        // Same as shipping
        sameAsBilling: true
    });

    // Check if returning from cancelled PayFast payment
    useEffect(() => {
        if (searchParams.get('cancelled') === 'true') {
            toast.error('Payment was cancelled. Please try again.');
        }
    }, [searchParams]);

    useEffect(() => {
        const loadCart = async () => {
            await fetchCart();
            setPageLoading(false);
        };
        loadCart();
    }, []);

    // Pre-fill form if user is authenticated
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    // Calculate shipping cost based on method
    const shippingCosts = {
        standard: 0.00
    };

    // Calculate dynamic values
    const currentShippingCost = 0.00;

    const calculateDiscount = () => {
        if (!coupon) return 0;

        if (coupon.discountType === 'free_shipping') {
            return currentShippingCost;
        } else if (coupon.discountType === 'fixed') {
            return coupon.amount;
        } else if (coupon.discountType === 'percentage') {
            return (subtotal * coupon.amount) / 100;
        }
        return 0;
    };

    const calculateTotal = () => {
        const shipping = coupon?.discountType === 'free_shipping' ? 0 : currentShippingCost;
        let total = subtotal + shipping;

        if (coupon && coupon.discountType !== 'free_shipping') {
            total -= calculateDiscount();
        }

        return Math.max(0, total); // Ensure no negative total
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;

        setValidatingCoupon(true);
        try {
            const { data } = await couponAPI.validate(couponInput, subtotal);
            if (data.success) {
                applyCoupon(data.data);
                toast.success('Coupon applied successfully!');
            }
        } catch (error) {
            console.error('Coupon error:', error);
            toast.error(error.response?.data?.message || 'Invalid coupon code');
            removeCoupon();
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const required = ['email', 'firstName', 'lastName', 'street', 'city', 'state', 'zipCode'];
        for (const field of required) {
            if (!formData[field]?.trim()) {
                toast.error(`Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);

        try {
            // Create order
            const orderData = {
                customerDetails: {
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone
                },
                shippingAddress: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                    phone: formData.phone
                },
                paymentMethod: formData.paymentMethod,
                shippingMethod: formData.shippingMethod,
                customerNote: formData.customerNote,
                // Coupon Data
                couponCode: coupon?.code,
                discountAmount: calculateDiscount(),
                // Affiliate tracking
                affiliateCode: document.cookie.match(/ayoosh_ref=([^;]+)/)?.[1] || null
            };

            const response = await orderAPI.create(orderData);

            if (response.data.success) {
                const { orderId, orderNumber } = response.data.data;

                // Redirect to PayFast for payment
                toast.loading('Redirecting to PayFast...', { duration: 3000 });

                const result = await initiatePayFastPayment(orderId);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to initiate PayFast payment');
                }
                // User will be redirected to PayFast - don't clear cart yet
                // Cart will be cleared on successful return
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to place order');
            setLoading(false);
        }
    };

    const shipping = 0.00;
    const total = subtotal + shipping;

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-6xl mb-6">🛒</div>
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Link href="/products" className="btn-primary">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container-custom py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/cart" className="text-gray-600 hover:text-pink-600 transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold">Checkout</h1>
                    {!isAuthenticated && (
                        <span className="ml-auto text-sm text-gray-500">
                            <Link href="/login?redirect=/checkout" className="text-pink-600 hover:underline">Login</Link> for faster checkout
                        </span>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Contact Information */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    Contact Information
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="your@email.com"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Order confirmation will be sent here</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="+27 12 345 6789"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                    Shipping Address
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        >
                                            <option value="">Select Province</option>
                                            <option value="Eastern Cape">Eastern Cape</option>
                                            <option value="Free State">Free State</option>
                                            <option value="Gauteng">Gauteng</option>
                                            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                            <option value="Limpopo">Limpopo</option>
                                            <option value="Mpumalanga">Mpumalanga</option>
                                            <option value="Northern Cape">Northern Cape</option>
                                            <option value="North West">North West</option>
                                            <option value="Western Cape">Western Cape</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <select
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            <option>South Africa</option>
                                        </select>
                                    </div>
                                </div>
                            </div>



                            {/* Order Notes */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                                <textarea
                                    name="customerNote"
                                    value={formData.customerNote}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    placeholder="Special delivery instructions, gift message, etc."
                                />
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                                {/* Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                    {items.map(item => (
                                        <div key={item._id} className="flex gap-3">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {item.product?.images?.[0]?.url ? (
                                                    <img
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xl">📦</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{item.product?.name}</p>
                                                {item.variant && (
                                                    <p className="text-xs text-gray-500">{item.variant.name}: {item.variant.value}</p>
                                                )}
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-sm">R{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                <hr className="mb-4" />

                                {/* Totals */}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                    <span>R{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span>
                                        {coupon?.discountType === 'free_shipping' ? (
                                            <span className="text-green-600 font-medium">FREE (Coupon)</span>
                                        ) : (
                                            shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                {/* Discount Row */}
                                {coupon && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({coupon.code})</span>
                                        <span>-R{calculateDiscount().toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Coupon Input */}
                                {!coupon ? (
                                    <div className="flex gap-2 mt-4">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            placeholder="Coupon Code"
                                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={validatingCoupon || !couponInput.trim()}
                                            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {validatingCoupon ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-50 p-2 rounded-lg mt-4 border border-green-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 text-sm font-medium">✓ {coupon.code} applied</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                removeCoupon();
                                                setCouponInput('');
                                                toast.success('Coupon removed');
                                            }}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                <hr />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>R{calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <LockClosedIcon className="w-5 h-5" />
                                        Pay with PayFast - R{calculateTotal().toFixed(2)}
                                    </>
                                )}
                            </button>

                            {/* Security Badge */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <CheckIcon className="w-4 h-4 text-green-500" />
                                <span>Secure checkout</span>
                            </div>

                            {/* PayFast Trust Badge */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                                <p className="text-xs text-gray-500">
                                    You will be securely redirected to PayFast to complete your payment
                                </p>
                            </div>

                            <Link
                                href="/cart"
                                className="block text-center text-pink-600 hover:underline mt-4 text-sm"
                            >
                                ← Return to Cart
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
