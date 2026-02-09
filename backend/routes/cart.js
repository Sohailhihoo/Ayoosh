const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');

// Helper to get or create cart
const getOrCreateCart = async (userId, sessionId) => {
  let cart;

  if (userId) {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
  } else if (sessionId) {
    cart = await Cart.findOne({ sessionId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }
  }

  return cart;
};

// @route   GET /api/cart
// @desc    Get current cart
// @access  Public (with session) or Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Session ID required'
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    res.json({
      success: true,
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discountAmount,
        total: cart.total,
        totalItems: cart.totalItems,
        couponCode: cart.couponCode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Public (with session) or Private
router.post('/add', optionalAuth, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Session ID required'
      });
    }

    // Get product and verify stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check stock
    let price = product.price;
    let availableStock = product.stock;

    if (variant && product.hasVariants) {
      const selectedVariant = product.variants.find(
        v => v.name === variant.name && v.value === variant.value
      );
      if (selectedVariant) {
        price = selectedVariant.price || product.price;
        availableStock = selectedVariant.stock;
      }
    }

    if (availableStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} items available in stock`
      });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    await cart.addItem(productId, quantity, variant, price);

    // Repopulate after update
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/cart/item/:itemId
// @desc    Update item quantity
// @access  Public (with session) or Private
router.put('/item/:itemId', optionalAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Verify stock before updating
    const product = await Product.findById(item.product);
    if (product && quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`
      });
    }

    await cart.updateItemQuantity(req.params.itemId, quantity);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: quantity > 0 ? 'Cart updated' : 'Item removed',
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart/item/:itemId
// @desc    Remove item from cart
// @access  Public (with session) or Private
router.delete('/item/:itemId', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);
    await cart.removeItem(req.params.itemId);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: cart.items,
        subtotal: cart.subtotal,
        total: cart.total,
        totalItems: cart.totalItems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Public (with session) or Private
router.delete('/', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        subtotal: 0,
        total: 0,
        totalItems: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/cart/coupon
// @desc    Apply coupon code
// @access  Public (with session) or Private
router.post('/coupon', optionalAuth, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    // Verify coupon against database
    const Coupon = require('../models/Coupon');
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is expired or usage limit reached'
      });
    }

    cart.couponCode = code.toUpperCase();
    cart.discount = coupon.discount;
    cart.discountType = coupon.type;
    await cart.save();

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        couponCode: cart.couponCode,
        discount: cart.discountAmount,
        subtotal: cart.subtotal,
        total: cart.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/cart/coupon
// @desc    Remove coupon code
// @access  Public (with session) or Private
router.delete('/coupon', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];

    const cart = await getOrCreateCart(userId, sessionId);

    cart.couponCode = null;
    cart.discount = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Coupon removed',
      data: {
        subtotal: cart.subtotal,
        total: cart.total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/cart/merge
// @desc    Merge guest cart with user cart after login
// @access  Private
router.post('/merge', protect, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({
        success: true,
        message: 'No guest cart to merge'
      });
    }

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = await Cart.create({ user: userId, items: [] });
    }

    // Merge items
    for (const item of guestCart.items) {
      await userCart.addItem(item.product, item.quantity, item.variant, item.price);
    }

    // Delete guest cart
    await guestCart.deleteOne();

    await userCart.populate('items.product');

    res.json({
      success: true,
      message: 'Cart merged successfully',
      data: {
        items: userCart.items,
        subtotal: userCart.subtotal,
        total: userCart.total,
        totalItems: userCart.totalItems
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
