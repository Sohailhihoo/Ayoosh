const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, optionalAuth } = require('../middleware/auth');
const { processAffiliateCommission } = require('../utils/affiliateCommission');

// Stripe initialization (only if STRIPE_SECRET_KEY is set)
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// @route   POST /api/payments/create-intent
// @desc    Create Stripe payment intent
// @access  Public (supports guest checkout)
router.post('/create-intent', optionalAuth, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured'
      });
    }

    const { orderId } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    // Find order by user OR guest session
    let order;
    if (userId) {
      order = await Order.findOne({
        _id: orderId,
        user: userId,
        paymentStatus: 'pending'
      });
    } else if (sessionId) {
      order = await Order.findOne({
        _id: orderId,
        guestSessionId: sessionId,
        paymentStatus: 'pending'
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or already paid'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.customerDetails?.email
      }
    });

    // Save payment intent ID
    order.paymentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: order.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment (called after successful frontend payment)
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify with Stripe if available
    if (stripe && paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: 'Payment not successful'
        });
      }
    }

    // Update order
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment confirmed'
    });
    await order.save();

    // Process affiliate commission
    await processAffiliateCommission(order);

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: {
        orderNumber: order.orderNumber,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public (secured by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      await handleRefund(refund);
      break;

    default:
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Unhandled event type: ${event.type}`);
      }
  }

  res.json({ received: true });
});

// Helper functions for webhook handling
async function handlePaymentSuccess(paymentIntent) {
  try {
    const order = await Order.findOne({ paymentId: paymentIntent.id });
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.status = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        note: 'Payment received via Stripe'
      });
      await order.save();

      // Process affiliate commission
      await processAffiliateCommission(order);
    }
  } catch (error) {
    console.error('Error handling payment success:', error.message);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const order = await Order.findOne({ paymentId: paymentIntent.id });
    if (order) {
      order.paymentStatus = 'failed';
      order.statusHistory.push({
        status: order.status,
        note: 'Payment failed'
      });
      await order.save();
      await order.save();
    }
  } catch (error) {
    console.error('Error handling payment failure:', error.message);
  }
}

async function handleRefund(charge) {
  try {
    const order = await Order.findOne({ paymentId: charge.payment_intent });
    if (order) {
      const refundAmount = charge.amount_refunded / 100;
      order.refundAmount = refundAmount;
      order.refundedAt = new Date();
      order.paymentStatus = charge.refunded ? 'refunded' : 'partially_refunded';
      order.statusHistory.push({
        status: order.status,
        note: `Refunded $${refundAmount}`
      });
      await order.save();
      await order.save();
    }
  } catch (error) {
    console.error('Error handling refund:', error.message);
  }
}

// @route   POST /api/payments/refund
// @desc    Process refund (admin only)
// @access  Private/Admin
router.post('/refund', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is not paid'
      });
    }

    let refund;
    if (stripe && order.paymentId) {
      // Process refund via Stripe
      refund = await stripe.refunds.create({
        payment_intent: order.paymentId,
        amount: amount ? Math.round(amount * 100) : undefined // Partial or full
      });
    }

    // Update order
    const refundAmount = amount || order.total;
    order.refundAmount = refundAmount;
    order.refundReason = reason;
    order.refundedAt = new Date();
    order.paymentStatus = refundAmount >= order.total ? 'refunded' : 'partially_refunded';
    order.statusHistory.push({
      status: order.status,
      note: `Refund processed: $${refundAmount}. Reason: ${reason}`,
      updatedBy: req.user._id
    });
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount,
        stripeRefundId: refund?.id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
