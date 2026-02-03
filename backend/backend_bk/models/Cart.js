const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    name: String,
    value: String,
    sku: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,  // For guest users
  items: [cartItemSchema],
  couponCode: String,
  discount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Calculate total items
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Calculate discount amount
cartSchema.virtual('discountAmount').get(function () {
  const subtotal = this.subtotal;
  if (this.discountType === 'percentage') {
    return Math.round((subtotal * this.discount / 100) * 100) / 100;
  }
  return this.discount;
});

// Calculate total after discount
cartSchema.virtual('total').get(function () {
  return Math.max(0, this.subtotal - this.discountAmount);
});

// Utility: Safe variant comparison (avoids JSON.stringify key order issues)
const variantsMatch = (v1, v2) => {
  // Both null/undefined
  if (!v1 && !v2) return true;
  // One is null/undefined
  if (!v1 || !v2) return false;
  // Compare individual fields explicitly
  return v1.name === v2.name && v1.value === v2.value;
};

// Add item method
cartSchema.methods.addItem = async function (productId, quantity = 1, variant = null, price) {
  const existingItemIndex = this.items.findIndex(item =>
    item.product.toString() === productId.toString() &&
    variantsMatch(item.variant, variant)
  );

  if (existingItemIndex > -1) {
    this.items[existingItemIndex].quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      variant,
      quantity,
      price
    });
  }

  return this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function (itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      item.remove();
    } else {
      item.quantity = quantity;
    }
  }
  return this.save();
};

// Remove item
cartSchema.methods.removeItem = async function (itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

// Clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.couponCode = null;
  this.discount = 0;
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
