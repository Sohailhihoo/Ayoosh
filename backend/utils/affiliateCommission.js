const Affiliate = require('../models/Affiliate');
const Referral = require('../models/Referral');

/**
 * Process affiliate commission when an order is confirmed/paid.
 * Called from all payment gateways (Stripe, PayFast, PayGate).
 *
 * @param {Object} order - The mongoose Order document (must have affiliateCode field)
 */
async function processAffiliateCommission(order) {
    try {
        if (!order.affiliateCode) return;

        const affiliate = await Affiliate.findOne({
            affiliateCode: order.affiliateCode,
            status: 'approved'
        });

        if (!affiliate) {
            console.log(`[Affiliate] No approved affiliate found for code: ${order.affiliateCode}`);
            return;
        }

        // Check if commission already recorded for this order
        const existingReferral = await Referral.findOne({
            order: order._id,
            status: 'converted'
        });

        if (existingReferral) {
            console.log(`[Affiliate] Commission already recorded for order: ${order._id}`);
            return;
        }

        // Calculate commission
        const commission = affiliate.calculateCommission(order.total);

        // Update or create referral record
        const referral = await Referral.findOneAndUpdate(
            { affiliateCode: order.affiliateCode, order: null, status: 'clicked' },
            {
                status: 'converted',
                order: order._id,
                orderTotal: order.total,
                commission,
                commissionStatus: 'pending',
                convertedAt: new Date()
            },
            { sort: { createdAt: -1 }, new: true }
        );

        // If no existing click referral found, create a direct conversion record
        if (!referral) {
            await Referral.create({
                affiliate: affiliate._id,
                affiliateCode: order.affiliateCode,
                status: 'converted',
                order: order._id,
                orderTotal: order.total,
                commission,
                commissionStatus: 'pending',
                convertedAt: new Date(),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Keep for 1 year
            });
        }

        // Update affiliate totals
        affiliate.totalOrders += 1;
        affiliate.totalRevenue += order.total;
        affiliate.totalCommission += commission;
        await affiliate.save();

        console.log(`[Affiliate] Commission R${commission} recorded for ${affiliate.affiliateCode} on order ${order.orderNumber}`);
    } catch (error) {
        // Don't let affiliate errors break payment flow
        console.error('[Affiliate] Commission processing error:', error.message);
    }
}

module.exports = { processAffiliateCommission };
