const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api';
const KLAVIYO_REVISION = '2024-10-15';

/**
 * Create or update a Klaviyo profile
 */
const upsertProfile = async (order) => {
    const email = order.customerDetails?.email;
    if (!email) return null;

    const body = {
        data: {
            type: 'profile',
            attributes: {
                email,
                first_name: order.customerDetails?.firstName || order.shippingAddress?.firstName || '',
                last_name: order.customerDetails?.lastName || order.shippingAddress?.lastName || '',
                phone_number: order.customerDetails?.phone || order.shippingAddress?.phone || '',
                location: {
                    address1: order.shippingAddress?.street || '',
                    city: order.shippingAddress?.city || '',
                    region: order.shippingAddress?.state || '',
                    zip: order.shippingAddress?.zipCode || '',
                    country: order.shippingAddress?.country || 'ZA',
                },
            },
        },
    };

    const res = await fetch(`${KLAVIYO_API_URL}/profiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
            'revision': KLAVIYO_REVISION,
        },
        body: JSON.stringify(body),
    });

    if (res.status === 409) {
        // Profile exists — that's fine
        const errorData = await res.json();
        const existingId = errorData?.errors?.[0]?.meta?.duplicate_profile_id;
        return existingId || null;
    }

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Klaviyo profile error:', errorText);
        return null;
    }

    const data = await res.json();
    return data?.data?.id || null;
};

/**
 * Track "Order Placed" event in Klaviyo
 */
const trackOrderPlaced = async (order) => {
    const email = order.customerDetails?.email;
    if (!email) {
        console.error('Klaviyo: No email found for order', order.orderNumber);
        return;
    }

    const items = order.items.map(item => ({
        product_name: item.name,
        product_image: item.image || '',
        sku: item.sku || '',
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
        variant: item.variant?.value || item.variant || '',
    }));

    // Estimated delivery
    let estimatedDelivery = '';
    if (order.estimatedDelivery) {
        estimatedDelivery = new Date(order.estimatedDelivery).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    } else if (order.shippingService?.max_delivery_date) {
        estimatedDelivery = new Date(order.shippingService.max_delivery_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
        // Default: 5-7 business days from now
        const est = new Date();
        est.setDate(est.getDate() + 7);
        estimatedDelivery = est.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const body = {
        data: {
            type: 'event',
            attributes: {
                metric: {
                    data: {
                        type: 'metric',
                        attributes: {
                            name: 'Order Placed',
                        },
                    },
                },
                profile: {
                    data: {
                        type: 'profile',
                        attributes: {
                            email,
                            first_name: order.customerDetails?.firstName || '',
                            last_name: order.customerDetails?.lastName || '',
                        },
                    },
                },
                properties: {
                    order_number: order.orderNumber,
                    order_id: order._id.toString(),
                    items,
                    item_count: order.items.reduce((sum, i) => sum + i.quantity, 0),
                    subtotal: order.subtotal || order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
                    shipping_cost: order.shippingCost || 0,
                    discount: order.discount || 0,
                    total: order.total,
                    currency: 'ZAR',
                    payment_method: order.paymentMethod,
                    shipping_method: order.shippingMethod || 'standard',
                    shipping_address: {
                        street: order.shippingAddress?.street || '',
                        city: order.shippingAddress?.city || '',
                        state: order.shippingAddress?.state || '',
                        zip_code: order.shippingAddress?.zipCode || '',
                        country: order.shippingAddress?.country || 'ZA',
                    },
                    estimated_delivery: estimatedDelivery,
                    coupon_code: order.couponCode || '',
                },
                value: order.total,
                unique_id: `order-${order._id.toString()}`,
                time: new Date().toISOString(),
            },
        },
    };

    const res = await fetch(`${KLAVIYO_API_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
            'revision': KLAVIYO_REVISION,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Klaviyo event error:', errorText);
        return false;
    }

    console.log(`Klaviyo: Order Placed event sent for ${order.orderNumber}`);
    return true;
};

/**
 * Send order confirmation via Klaviyo
 * Call this after payment is confirmed
 */
const sendOrderConfirmation = async (order) => {
    if (!KLAVIYO_API_KEY) {
        console.warn('Klaviyo: API key not set, skipping');
        return;
    }

    try {
        await upsertProfile(order);
        await trackOrderPlaced(order);
    } catch (error) {
        // Don't let Klaviyo errors break the payment flow
        console.error('Klaviyo error (non-blocking):', error.message);
    }
};

module.exports = { sendOrderConfirmation };
