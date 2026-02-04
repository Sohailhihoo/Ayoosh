'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { verifyPayFastPayment } from '@/lib/payfast';
import { verifyPayGatePayment } from '@/lib/paygate';

// Inline SVG icons to avoid react-icons module issues
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
    const paymentMethod = searchParams.get('paymentMethod');

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 10;
        let pollTimer;

        const verifyOrder = async () => {
            // COD Logic: If no orderId, just show pending success
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
                let result;
                // Check status via backend
                result = await verifyPayFastPayment(orderId);

                if (result.success) {
                    setOrder(result.data);

                    if (result.data.paymentStatus === 'paid') {
                        // Payment confirmed!
                        clearCart();
                        setLoading(false);
                        return; // Stop polling
                    } else if (result.data.paymentStatus === 'failed') {
                        // Payment failed
                        setLoading(false);
                        return; // Stop polling
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

            // Continue polling if pending and attempts remaining
            attempts++;
            if (attempts < maxAttempts) {
                pollTimer = setTimeout(verifyOrder, 3000); // Poll every 3 seconds
            }
        };

        verifyOrder();

        // Cleanup timer on unmount
        return () => clearTimeout(pollTimer);
    }, [orderId, orderNumber, status, paymentMethod, clearCart]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
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
                    <Link href="/" className="text-pink-600 hover:underline">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Payment was cancelled
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
                        <Link
                            href="/checkout"
                            className="block w-full bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="block w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Determine status display
    const isPaid = order?.paymentStatus === 'paid';
    const isPending = order?.paymentStatus === 'pending' || order?.paymentStatus === 'processing';

    // Success page
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
            <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg">
                {/* Status Icon */}
                <div className={`w-20 h-20 ${isPaid ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    {isPaid ? (
                        <CheckIcon className="w-10 h-10 text-green-600" />
                    ) : (
                        <ClockIcon className="w-10 h-10 text-blue-600" />
                    )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isPaid ? 'Thank You!' : 'Order Received!'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {isPaid
                        ? 'Your payment was successful and your order is confirmed.'
                        : 'Your order has been placed and is being processed.'
                    }
                </p>

                {/* Order Details */}
                {order && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                        <h2 className="font-semibold mb-4 text-lg">Order Details</h2>
                        <div className="space-y-3">
                            {(order.orderNumber || orderNumber) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Number:</span>
                                    <span className="font-mono font-semibold">{order.orderNumber || orderNumber}</span>
                                </div>
                            )}
                            {order.orderId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order ID:</span>
                                    <span className="font-mono text-sm">{order.orderId.slice(-8).toUpperCase()}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status:</span>
                                <span className={`font-medium px-2 py-1 rounded-full text-sm ${isPaid
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {isPaid ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                            {order.total && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-semibold">R{order.total.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700">
                        {isPaid
                            ? 'A confirmation email has been sent to your email address with your order details.'
                            : 'Payment confirmation may take a few moments. You will receive an email once your payment is confirmed.'
                        }
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link
                        href="/orders"
                        className="block w-full bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors font-medium"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/"
                        className="block w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {/* Support Link */}
                <p className="mt-6 text-sm text-gray-500">
                    Need help? <Link href="/contact" className="text-pink-600 hover:underline">Contact Support</Link>
                </p>
            </div>
        </div>
    );
}

// Export with Suspense wrapper for useSearchParams
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
