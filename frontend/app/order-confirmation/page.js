'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';
import { HiCheck, HiMail, HiTruck, HiHome } from 'react-icons/hi';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('orderNumber');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderNumber) {
                setLoading(false);
                return;
            }

            try {
                const response = await orderAPI.getByNumber(orderNumber);
                if (response.data.success) {
                    setOrder(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderNumber]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!orderNumber) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">No order found</h1>
                <Link href="/products" className="btn-primary">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container-custom py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiCheck className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600">
                            Thank you for your order. We've sent a confirmation email to your inbox.
                        </p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Order Number</p>
                                <p className="text-xl font-bold text-pink-600">{orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Order Date</p>
                                <p className="font-medium">
                                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                                </p>
                            </div>
                        </div>

                        {order && (
                            <>
                                {/* Order Items */}
                                <div className="border-t pt-6 mb-6">
                                    <h3 className="font-semibold mb-4">Order Items</h3>
                                    <div className="space-y-3">
                                        {order.items?.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {item.name} × {item.quantity}
                                                </span>
                                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>${order.subtotal?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span>${order.shippingCost?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax</span>
                                        <span>${order.tax?.toFixed(2)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount</span>
                                            <span>-${order.discount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span>${order.total?.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="border-t pt-6 mt-6">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <HiTruck className="w-5 h-5 text-gray-400" />
                                            Shipping Address
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                            {order.shippingAddress.street}<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                            {order.shippingAddress.country}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* What's Next */}
                    <div className="bg-pink-50 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold mb-4">What's next?</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <HiMail className="w-5 h-5 text-pink-600 mt-0.5" />
                                <p className="text-gray-600">
                                    You'll receive an email confirmation with your order details and tracking information once your order ships.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <HiTruck className="w-5 h-5 text-pink-600 mt-0.5" />
                                <p className="text-gray-600">
                                    Standard shipping typically takes 5-7 business days. You can track your order anytime.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/products"
                            className="flex-1 btn-primary text-center py-4"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/"
                            className="flex-1 btn-secondary text-center py-4 flex items-center justify-center gap-2"
                        >
                            <HiHome className="w-5 h-5" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
