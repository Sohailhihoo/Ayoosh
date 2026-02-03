import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Initiate PayGate payment and redirect to PayGate payment page
 * @param {string} orderId - The order ID to process payment for
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const initiatePayGatePayment = async (orderId) => {
    try {
        console.log('Initiating PayGate payment for order:', orderId);

        // Call backend to initiate payment
        const response = await axios.post(
            `${API_BASE_URL}/api/payments/initiate`,
            { orderId },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true, // Include cookies for session
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to initiate payment');
        }

        const { payRequestId, paygateId, redirectUrl } = response.data;

        console.log('PayGate payment initiated:', {
            payRequestId,
            paygateId,
        });

        // Create a form and submit it to redirect to PayGate
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = redirectUrl;

        // Add PayGate parameters
        const params = {
            PAY_REQUEST_ID: payRequestId,
            CHECKSUM: payRequestId, // PayGate will validate this
        };

        Object.keys(params).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        });

        // Append form to body and submit
        document.body.appendChild(form);
        form.submit();

        return { success: true };

    } catch (error) {
        console.error('PayGate initiation error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to initiate PayGate payment'
        };
    }
};

/**
 * Verify payment status after return from PayGate
 * @param {string} orderId - The order ID to verify
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const verifyPayGatePayment = async (orderId) => {
    try {
        console.log('Verifying PayGate payment for order:', orderId);

        const response = await axios.get(
            `${API_BASE_URL}/api/payments/verify/${orderId}`,
            {
                withCredentials: true,
            }
        );

        return {
            success: response.data.success,
            data: response.data.data,
        };

    } catch (error) {
        console.error('PayGate verification error:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Failed to verify payment'
        };
    }
};

/**
 * Parse PayGate return URL parameters
 * @param {URLSearchParams} searchParams - URL search parameters from return URL
 * @returns {object} Parsed PayGate response data
 */
export const parsePayGateResponse = (searchParams) => {
    return {
        payRequestId: searchParams.get('PAY_REQUEST_ID'),
        transactionStatus: searchParams.get('TRANSACTION_STATUS'),
        resultCode: searchParams.get('RESULT_CODE'),
        resultDesc: searchParams.get('RESULT_DESC'),
        transactionId: searchParams.get('TRANSACTION_ID'),
        authCode: searchParams.get('AUTH_CODE'),
        currency: searchParams.get('CURRENCY'),
        amount: searchParams.get('AMOUNT'),
        resultDesc: searchParams.get('RESULT_DESC'),
        transactionStatusDescription: getTransactionStatusDescription(
            searchParams.get('TRANSACTION_STATUS')
        ),
    };
};

/**
 * Get human-readable description for PayGate transaction status
 * @param {string} statusCode - PayGate transaction status code
 * @returns {string} Human-readable description
 */
const getTransactionStatusDescription = (statusCode) => {
    const statusMap = {
        '1': 'Approved',
        '2': 'Declined',
        '4': 'Cancelled',
        '0': 'Not Done',
    };
    return statusMap[statusCode] || 'Unknown';
};

/**
 * Check if payment was successful based on transaction status
 * @param {string} transactionStatus - PayGate transaction status code
 * @returns {boolean} True if payment was successful
 */
export const isPaymentSuccessful = (transactionStatus) => {
    return transactionStatus === '1'; // 1 = Approved
};
