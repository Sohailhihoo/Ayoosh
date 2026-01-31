'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore, useAuthStore } from '@/lib/store';
import { orderAPI } from '@/lib/api';
import { initiatePayFastPayment } from '@/lib/payfast';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiLockClosed, HiCheck } from 'react-icons/hi';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, subtotal, totalItems, fetchCart, clearCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Check if returning from cancelled PayFast payment
    useEffect(() => {
        if (searchParams.get('cancelled') === 'true') {
            toast.error('Payment was cancelled. Please try again.');
        }
    }, [searchParams]);

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

    const shippingCosts = {
        standard: 99.00,
        express: 199.00,
        overnight: 349.00,
        pickup: 0
    };

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
                customerNote: formData.customerNote
            };

            const response = await orderAPI.create(orderData);

            if (response.data.success) {
                const { orderId, orderNumber } = response.data.data;

                // Handle payment based on method
                if (formData.paymentMethod === 'payfast') {
                    // Redirect to PayFast
                    toast.loading('Redirecting to PayFast...', { duration: 3000 });

                    const result = await initiatePayFastPayment(orderId);

                    if (!result.success) {
                        throw new Error(result.error || 'Failed to initiate PayFast payment');
                    }
                    // User will be redirected to PayFast - don't clear cart yet
                    // Cart will be cleared on successful return

                } else if (formData.paymentMethod === 'cod') {
                    // Cash on Delivery
                    toast.success('Order placed successfully!');
                    await clearCart();
                    router.push(`/order-confirmation?orderNumber=${orderNumber}`);
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to place order');
            setLoading(false);
        }
    };

    const tax = subtotal * 0.15; // 15% VAT for South Africa
    const shipping = shippingCosts[formData.shippingMethod] || 99.00;
    const total = subtotal + tax + shipping;

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
                        <HiArrowLeft className="w-6 h-6" />
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

                            {/* Shipping Method */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                    Shipping Method
                                </h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'standard', name: 'Standard Shipping', time: '5-7 business days', price: 99.00 },
                                        { id: 'express', name: 'Express Shipping', time: '2-3 business days', price: 199.00 },
                                        { id: 'overnight', name: 'Overnight', time: 'Next business day', price: 349.00 },
                                        { id: 'pickup', name: 'Store Pickup', time: 'Ready in 2 hours', price: 0 }
                                    ].map(method => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${formData.shippingMethod === method.id
                                                ? 'border-pink-500 bg-pink-50'
                                                : 'border-gray-200 hover:border-pink-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="shippingMethod"
                                                    value={method.id}
                                                    checked={formData.shippingMethod === method.id}
                                                    onChange={handleChange}
                                                    className="text-pink-600 focus:ring-pink-500"
                                                />
                                                <div>
                                                    <p className="font-medium">{method.name}</p>
                                                    <p className="text-sm text-gray-500">{method.time}</p>
                                                </div>
                                            </div>
                                            <span className="font-semibold">
                                                {method.price === 0 ? 'FREE' : `R${method.price.toFixed(2)}`}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                    Payment Method
                                </h2>
                                <div className="space-y-3">
                                    {/* PayFast Option */}
                                    <label
                                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'payfast'
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-pink-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="payfast"
                                                checked={formData.paymentMethod === 'payfast'}
                                                onChange={handleChange}
                                                className="text-pink-600 focus:ring-pink-500"
                                            />
                                            <div>
                                                <p className="font-medium">Pay with PayFast</p>
                                                <p className="text-sm text-gray-500">Credit/Debit Card, EFT, SnapScan, Mobicred & more</p>
                                            </div>
                                        </div>
                                        <img
                                            src="https://www.payfast.co.za/assets/images/logos/payfast_logo_colour.svg"
                                            alt="PayFast"
                                            className="h-8"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </label>

                                    {/* Cash on Delivery Option */}
                                    <label
                                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'cod'
                                            ? 'border-pink-500 bg-pink-50'
                                            : 'border-gray-200 hover:border-pink-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cod"
                                                checked={formData.paymentMethod === 'cod'}
                                                onChange={handleChange}
                                                className="text-pink-600 focus:ring-pink-500"
                                            />
                                            <div>
                                                <p className="font-medium">Cash on Delivery</p>
                                                <p className="text-sm text-gray-500">Pay when you receive your order</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl">💵</span>
                                    </label>
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
                                            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl">📦</span>
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
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                        <span>R{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>{shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">VAT (15%)</span>
                                        <span>R{tax.toFixed(2)}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>R{total.toFixed(2)}</span>
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
                                    ) : formData.paymentMethod === 'payfast' ? (
                                        <>
                                            <HiLockClosed className="w-5 h-5" />
                                            Pay with PayFast - R{total.toFixed(2)}
                                        </>
                                    ) : (
                                        <>
                                            <HiLockClosed className="w-5 h-5" />
                                            Place Order - R{total.toFixed(2)}
                                        </>
                                    )}
                                </button>

                                {/* Security Badge */}
                                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <HiCheck className="w-4 h-4 text-green-500" />
                                    <span>Secure checkout</span>
                                </div>

                                {/* PayFast Trust Badge */}
                                {formData.paymentMethod === 'payfast' && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                                        <p className="text-xs text-gray-500">
                                            You will be securely redirected to PayFast to complete your payment
                                        </p>
                                    </div>
                                )}

                                <Link
                                    href="/cart"
                                    className="block text-center text-pink-600 hover:underline mt-4 text-sm"
                                >
                                    ← Return to Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
