// PayFast Service for Frontend - v3
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
        // Validate orderId
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        console.log('Initiating PayFast payment for order:', orderId);

        // ============================================================
        // PHASE 1: GET PAYMENT DATA FROM BACKEND
        // ============================================================
        const response = await fetch(`${API_URL}/payfast/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
            credentials: 'include',
        });

        // Check for network errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to initiate payment');
        }

        const { paymentData, payfastUrl } = data;

        // Validate response data
        if (!payfastUrl) {
            throw new Error('PayFast URL not received from server');
        }

        if (!paymentData || !paymentData.signature) {
            throw new Error('Invalid payment data received from server');
        }

        console.log('Backend response OK. Redirecting to PayFast...');

        // ============================================================
        // PHASE 2-5: CREATE FORM AND SUBMIT TO PAYFAST
        // ============================================================
        redirectToPayFast(paymentData, payfastUrl);

        return { success: true };

    } catch (error) {
        console.error('PayFast Payment Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Creates a hidden form and submits it to PayFast via POST
 * PayFast REQUIRES a POST request - cannot use simple redirect
 *
 * @param {Object} paymentData - PayFast payment parameters (from backend)
 * @param {string} payfastUrl - PayFast URL (sandbox or live)
 */
const redirectToPayFast = (paymentData, payfastUrl) => {
    // ============================================================
    // PHASE 1: VALIDATION
    // ============================================================
    if (!payfastUrl) {
        console.error('PayFast Error: No URL provided');
        throw new Error('PayFast URL is missing');
    }

    if (!paymentData || Object.keys(paymentData).length === 0) {
        console.error('PayFast Error: No payment data provided');
        throw new Error('Payment data is missing');
    }

    console.log('==========================================');
    console.log('PAYFAST FRONTEND REDIRECT');
    console.log('Target URL:', payfastUrl);
    console.log('Payment Data Keys:', Object.keys(paymentData).join(', '));
    console.log('==========================================');

    // ============================================================
    // PHASE 2: CREATE FORM ELEMENT (The Bridge)
    // Must use native DOM, not React virtual DOM
    // ============================================================
    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', payfastUrl);
    form.setAttribute('accept-charset', 'UTF-8');
    form.setAttribute('target', '_self');

    // Hide form from user (but keep in DOM flow)
    form.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';

    // ============================================================
    // PHASE 3: INJECT PAYMENT DATA AS HIDDEN INPUTS
    // Iterate through EVERY key from backend response
    // ============================================================
    Object.entries(paymentData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', String(value));
            form.appendChild(input);
            console.log(`  Input: ${key} = ${key === 'signature' ? '[HIDDEN]' : value}`);
        }
    });

    // ============================================================
    // PHASE 4: DOM INJECTION (Critical!)
    // Form MUST be attached to document.body before submission
    // ============================================================
    document.body.appendChild(form);

    // Verify form is connected to DOM
    if (!form.isConnected) {
        console.error('PayFast Error: Form not connected to DOM');
        throw new Error('Failed to attach form to DOM');
    }

    console.log('Form attached to DOM, initiating submission...');

    // ============================================================
    // PHASE 5: EXECUTE FORM SUBMISSION
    // Use requestAnimationFrame to ensure DOM has updated
    // ============================================================
    requestAnimationFrame(() => {
        try {
            console.log('Submitting PayFast form NOW...');
            form.submit();
        } catch (submitError) {
            console.error('PayFast Submit Error:', submitError);
            // Cleanup on error
            if (form.parentNode) {
                form.parentNode.removeChild(form);
            }
            throw submitError;
        }
    });
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
