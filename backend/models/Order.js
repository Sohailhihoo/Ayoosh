const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,           // Snapshot of product name at time of order
  image: String,          // Snapshot of product image
  sku: String,
  variant: mongoose.Schema.Types.Mixed,  // Can be object or null
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: Number
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // NOT required - will be generated in pre-validate hook
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Optional for guest checkout
  },
  guestSessionId: String,  // For guest order lookup
  customerDetails: {
    email: { type: String, required: true },
    firstName: String,
    lastName: String,
    phone: String
  },
  items: [orderItemSchema],

  // Addresses
  shippingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },

  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: String,
  affiliateCode: String,  // Affiliate referral code for commission tracking
  total: {
    type: Number,
    required: true
  },

  // Payment - UPDATED TO INCLUDE PAYFAST
  paymentMethod: {
    type: String,
    enum: ['paypal', 'cod', 'payfast'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: String,          // PayFast pf_payment_id or Stripe payment intent ID
  paidAt: Date,

  // Shipping
  shippingMethod: {
    type: String,
    enum: ['standard', 'pickup'],
    default: 'standard'
  },
  trackingNumber: String,
  carrier: String,
  estimatedDelivery: Date,

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Notes
  customerNote: String,
  internalNote: String,

  // Refund info
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date

}, { timestamps: true });

// Generate order number BEFORE validation (pre-validate, not pre-save)
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}-${random}`;
  }
  next();
});

// Update status with history
orderSchema.methods.updateStatus = function (newStatus, note = '', userId = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy: userId
  });

  if (newStatus === 'paid') {
    this.paidAt = new Date();
    this.paymentStatus = 'paid';
  }

  return this.save();
};

// Calculate totals
orderSchema.methods.calculateTotals = function () {
  this.subtotal = this.items.reduce((sum, item) => {
    item.total = item.price * item.quantity;
    return sum + item.total;
  }, 0);

  this.total = this.subtotal + this.shippingCost + this.tax - this.discount;
  return this;
};

// Index for searching orders
// orderSchema.index({ orderNumber: 1 }); // Removed: Already indexed by unique: true
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
