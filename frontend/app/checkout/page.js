import { Suspense } from 'react';
import CheckoutForm from './CheckoutForm';

export const metadata = {
    title: 'Checkout | Ayoosh Online',
    description: 'Secure checkout for your order',
    robots: { index: false, follow: false },
};

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            </div>
        }>
            <CheckoutForm />
        </Suspense>
    );
}
