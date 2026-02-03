const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String,           // e.g., "Size", "Color", "Shade"
  value: String,          // e.g., "Large", "Red", "Nude Pink"
  sku: String,
  price: Number,          // Override price if different
  stock: { type: Number, default: 0 },
  images: [String]
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: String,
  isVerifiedPurchase: { type: Boolean, default: false }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  shortDescription: String,
  brand: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: String,

  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  compareAtPrice: Number,     // Original price for showing discounts
  costPrice: Number,          // For profit calculations

  // Product type specific fields
  productType: {
    type: String,
    enum: ['beauty', 'sunglasses', 'accessories'],
    required: true
  },

  // Beauty product specific
  ingredients: [String],
  skinType: [String],         // ['oily', 'dry', 'combination', 'sensitive', 'all']
  concerns: [String],         // ['acne', 'aging', 'hydration', etc.]

  // Sunglasses specific
  frameShape: String,         // 'aviator', 'wayfarer', 'round', 'cat-eye', etc.
  frameMaterial: String,      // 'metal', 'plastic', 'acetate', etc.
  lensType: String,           // 'polarized', 'mirrored', 'gradient', etc.
  uvProtection: String,

  // Images & Media
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  video: String, // Cloudinary URL for product video

  // Inventory
  sku: {
    type: String,
    unique: true,
    required: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  lowStockThreshold: { type: Number, default: 10 },
  trackInventory: { type: Boolean, default: true },

  // Variants (colors, sizes, shades)
  hasVariants: { type: Boolean, default: false },
  variants: [variantSchema],

  // Reviews
  reviews: [reviewSchema],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },

  // SEO
  metaTitle: String,
  metaDescription: String,
  tags: [String],

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },

  // Shipping
  weight: Number,             // in grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },

  // Sales data
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 }

}, { timestamps: true });

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

// Calculate average rating when reviews change
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
  return this.save();
};

// Check if product is in stock
productSchema.virtual('inStock').get(function () {
  if (this.hasVariants) {
    return this.variants.some(v => v.stock > 0);
  }
  return this.stock > 0;
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

// Compound indexes for common query patterns (performance optimization)
productSchema.index({ status: 1, category: 1 });           // Category filtering
productSchema.index({ status: 1, productType: 1 });        // Product type filtering
productSchema.index({ status: 1, isFeatured: 1 });         // Featured products
productSchema.index({ status: 1, isNewArrival: 1 });       // New arrivals
productSchema.index({ status: 1, isBestseller: 1 });       // Bestsellers
productSchema.index({ status: 1, createdAt: -1 });         // Latest products
productSchema.index({ status: 1, price: 1 });              // Price sorting

module.exports = mongoose.model('Product', productSchema);
