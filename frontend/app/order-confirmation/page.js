'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { verifyPayFastPayment } from '@/lib/payfast';

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const status = searchParams.get('status');

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;
        let pollTimer;

        const verifyOrder = async () => {
            // COD Logic: no orderId, just show pending success
            if (orderNumber && !orderId) {
                setOrder({ orderNumber, paymentStatus: 'pending', status: 'pending' });
                clearCart();
                setLoading(false);
                return;
            }

            if (!orderId) {
                setError('No order information provided');
                setLoading(false);
                return;
            }

            try {
                const result = await verifyPayFastPayment(orderId);

                if (result.success) {
                    setOrder(result.data);
                    if (result.data.paymentStatus === 'paid') {
                        clearCart();
                        setLoading(false);
                        return;
                    } else if (result.data.paymentStatus === 'failed') {
                        setLoading(false);
                        return;
                    }
                } else {
                    if (status === 'success') {
                        setOrder({ orderId, paymentStatus: 'processing', status: 'pending' });
                    } else {
                        setError(result.error || 'Failed to verify order');
                    }
                }
            } catch (err) {
                console.error('Verification Error:', err);
                if (status === 'success') {
                    setOrder({ orderId, paymentStatus: 'processing', status: 'pending' });
                } else {
                    setError('Something went wrong');
                }
            } finally {
                setLoading(false);
            }

            attempts++;
            if (attempts < maxAttempts) {
                pollTimer = setTimeout(verifyOrder, 3000);
            }
        };

        verifyOrder();
        return () => clearTimeout(pollTimer);
    }, [orderId, orderNumber, status, clearCart]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying your order...</p>
                </div>
            </div>
        );
    }

    if (error && status !== 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/" className="text-yellow-600 hover:underline">Return to Home</Link>
                </div>
            </div>
        );
    }

    if (status === 'cancelled' || (order && order.paymentStatus === 'failed')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ExclamationIcon className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
                    <p className="text-gray-600 mb-6">Your payment was cancelled. Your order has not been processed.</p>
                    <div className="space-y-3">
                        <Link href="/checkout" className="block w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors">Try Again</Link>
                        <Link href="/" className="block w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">Return to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    const isPaid = order?.paymentStatus === 'paid';

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                    {/* Header */}
                    <div className={`p-8 text-center ${isPaid ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <div className={`w-20 h-20 ${isPaid ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {isPaid
                                ? <CheckIcon className="w-10 h-10 text-green-600" />
                                : <ClockIcon className="w-10 h-10 text-blue-600" />
                            }
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {isPaid ? 'Thank You!' : 'Order Received!'}
                        </h1>
                        <p className="text-gray-600">
                            {isPaid
                                ? 'Your payment was successful and your order is confirmed.'
                                : 'Your order has been placed and is being processed.'
                            }
                        </p>
                        {(order?.orderNumber || orderNumber) && (
                            <p className="mt-3 text-sm font-mono font-semibold text-gray-700 bg-white inline-block px-3 py-1 rounded-full border">
                                {order?.orderNumber || orderNumber}
                            </p>
                        )}
                    </div>

                    <div className="p-6 space-y-6">

                        {/* Order Items */}
                        {order?.items?.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</h2>
                                <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            {item.image && typeof item.image === 'string' && item.image.startsWith('http') && (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                                                R{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Breakdown */}
                        {order?.total && (
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Receipt</h2>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                    {order.subtotal != null && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>R{Number(order.subtotal).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.shippingCost != null && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Delivery ({order.shippingMethod || 'Standard'})</span>
                                            <span>{order.shippingCost === 0 ? 'Free' : `R${Number(order.shippingCost).toFixed(2)}`}</span>
                                        </div>
                                    )}
                                    {order.tax != null && order.tax > 0 && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax</span>
                                            <span>R{Number(order.tax).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {order.discount != null && order.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                                            <span>-R{Number(order.discount).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200 text-base">
                                        <span>Total</span>
                                        <span>R{Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Status */}
                        <div className="flex items-center justify-between py-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600">Payment Status</span>
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {isPaid ? 'Paid' : 'Pending'}
                            </span>
                        </div>

                        {/* Info Message */}
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                                {isPaid
                                    ? 'A confirmation email will be sent to your email address.'
                                    : 'Payment confirmation may take a few moments. You will receive an email once confirmed.'
                                }
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link href="/" className="block w-full bg-[#4a4a4a] text-white px-6 py-3 rounded-lg hover:bg-[#333] transition-colors font-medium text-center">
                                Continue Shopping
                            </Link>
                        </div>
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
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
