const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');

const COMMISSION_RATE = 0.05; // flat 5%

/**
 * Credit a commission when an order is marked paid.
 * Called from the PayFast ITN handler only — never at order creation.
 *
 * Idempotency: the unique index on Referral.order turns any duplicate ITN
 * call into a E11000 error, which we catch and silently ignore.
 */
async function processAffiliateCommission(order) {
    try {
        if (!order.affiliateCode) return;

        const affiliate = await Affiliate.findOne({
            affiliateCode: order.affiliateCode.toUpperCase(),
            status: 'approved'
        });

        if (!affiliate) {
            console.log(`[Affiliate] No active affiliate for code: ${order.affiliateCode}`);
            return;
        }

        // Self-referral guard — block affiliate earning on their own orders
        const orderEmail = order.customerDetails?.email?.toLowerCase();
        if (affiliate.email === orderEmail) {
            console.log(`[Affiliate] Self-referral blocked for ${affiliate.affiliateCode}`);
            return;
        }
        if (affiliate.user && order.user) {
            const affiliateUserId = affiliate.user._id
                ? affiliate.user._id.toString()
                : affiliate.user.toString();
            const orderUserId = order.user._id
                ? order.user._id.toString()
                : order.user.toString();
            if (affiliateUserId === orderUserId) {
                console.log(`[Affiliate] Self-referral (user match) blocked for ${affiliate.affiliateCode}`);
                return;
            }
        }

        // Commission base: item subtotal minus coupon discount, no shipping
        const itemSubtotal = order.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const orderAmount = Math.max(0, itemSubtotal - (order.discount || 0));
        const commissionAmount = Math.round(orderAmount * COMMISSION_RATE * 100) / 100;

        // Create commission record — unique index on `order` prevents double-credit
        try {
            await Referral.create({
                affiliate: affiliate._id,
                affiliateCode: affiliate.affiliateCode,
                order: order._id,
                orderAmount,
                commissionAmount,
                status: 'pending',
            });
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate ITN — commission already recorded, safe to ignore
                console.log(`[Affiliate] Duplicate ITN for order ${order._id}, skipping`);
                return;
            }
            throw err;
        }

        // Atomic counter update on Affiliate — no read-modify-write
        await Affiliate.findByIdAndUpdate(affiliate._id, {
            $inc: {
                totalOrders: 1,
                totalRevenue: orderAmount,
                totalCommission: commissionAmount,
            }
        });

        console.log(`[Affiliate] R${commissionAmount} commission credited to ${affiliate.affiliateCode} for order ${order.orderNumber}`);
    } catch (error) {
        // Never let affiliate errors break the payment confirmation flow
        console.error('[Affiliate] Commission error:', error.message);
    }
}

/**
 * Void the commission for a cancelled or refunded order.
 * Call this when an order moves to cancelled/returned status.
 */
async function voidAffiliateCommission(orderId, reason = 'Order cancelled') {
    try {
        const referral = await Referral.findOne({ order: orderId, status: { $ne: 'void' } });
        if (!referral) return;

        // Reverse the Affiliate counters atomically
        await Promise.all([
            Referral.findByIdAndUpdate(referral._id, {
                status: 'void',
                voidReason: reason,
            }),
            Affiliate.findByIdAndUpdate(referral.affiliate, {
                $inc: {
                    totalOrders: -1,
                    totalRevenue: -referral.orderAmount,
                    totalCommission: -referral.commissionAmount,
                }
            }),
        ]);

        console.log(`[Affiliate] Commission voided for order ${orderId}: ${reason}`);
    } catch (error) {
        console.error('[Affiliate] Void commission error:', error.message);
    }
}

module.exports = { processAffiliateCommission, voidAffiliateCommission };
