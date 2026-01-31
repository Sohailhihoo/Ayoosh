// PayFast Service for Frontend
// Handles communication with backend and redirecting to PayFast

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Initiates a PayFast payment by getting payment data from backend
 * and redirecting user to PayFast payment page
 * 
 * @param {string} orderId - The MongoDB order ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const initiatePayFastPayment = async (orderId) => {
    try {
        // Get payment data from backend
        const response = await fetch(`${API_URL}/payfast/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to initiate payment');
        }

        const { paymentData, payfastUrl } = data;

        // Create a form and submit it to PayFast
        redirectToPayFast(paymentData, payfastUrl);

        return { success: true };

    } catch (error) {
        console.error('PayFast Payment Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Creates a hidden form and submits it to PayFast
 * This is how PayFast expects to receive payment data
 * 
 * @param {Object} paymentData - PayFast payment parameters
 * @param {string} payfastUrl - PayFast URL (sandbox or live)
 */
const redirectToPayFast = (paymentData, payfastUrl) => {
    console.log('Redirecting to PayFast:', payfastUrl);
    console.log('Payment Data:', paymentData);

    // Create form element
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payfastUrl;
    form.target = '_self'; // Explicitly set target
    form.style.display = 'none';

    // Add all payment data as hidden inputs
    Object.keys(paymentData).forEach((key) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
    });

    // Append form to body and submit
    document.body.appendChild(form);

    // Submit with a small delay to ensure DOM update
    setTimeout(() => {
        console.log('Submitting form...');
        form.submit();
    }, 100);
};

/**
 * Verify payment status after returning from PayFast
 * 
 * @param {string} orderId - The MongoDB order ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const verifyPayFastPayment = async (orderId) => {
    try {
        const response = await fetch(`${API_URL}/payfast/verify/${orderId}`, {
            method: 'GET',
            credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to verify payment');
        }

        return { success: true, data: result.data };

    } catch (error) {
        console.error('PayFast Verify Error:', error);
        return { success: false, error: error.message };
    }
};

export default {
    initiatePayFastPayment,
    verifyPayFastPayment,
};
