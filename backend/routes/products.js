const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { cacheProducts, cacheFeatured, cacheNewArrivals, cacheBestsellers } = require('../lib/cache');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', cacheProducts, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      productType,
      brand,
      minPrice,
      maxPrice,
      search,
      inStock,
      isFeatured,
      isNewArrival,
      skinType,
      frameShape
    } = req.query;

    // Build query
    const query = { status: 'active' };

    if (category) query.category = category;
    if (productType) query.productType = productType;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (isFeatured === 'true') query.isFeatured = true;
    if (isNewArrival === 'true') query.isNewArrival = true;
    if (skinType) query.skinType = { $in: skinType.split(',') };
    if (frameShape) query.frameShape = frameShape;

    // Execute query
    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', cacheFeatured, async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', isFeatured: true })
      .populate('category', 'name slug')
      .limit(8)
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/new-arrivals
// @desc    Get new arrival products
// @access  Public
router.get('/new-arrivals', cacheNewArrivals, async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', isNewArrival: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8)
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/bestsellers
// @desc    Get bestseller products
// @access  Public
router.get('/bestsellers', cacheBestsellers, async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', isBestseller: true })
      .populate('category', 'name slug')
      .sort('-soldCount')
      .limit(8)
      .lean();

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let product;

    // Check if it's an ObjectId or slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('reviews.user', 'firstName lastName');
    } else {
      product = await Product.findOne({ slug: req.params.id, status: 'active' })
        .populate('category', 'name slug')
        .populate('reviews.user', 'firstName lastName');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - just archive
    product.status = 'archived';
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add a review to product
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    product.reviews.push({
      user: req.user._id,
      rating,
      title,
      comment
    });

    await product.calculateAverageRating();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      status: 'active',
      $or: [
        { category: product.category },
        { productType: product.productType },
        { brand: product.brand }
      ]
    })
      .limit(4)
      .lean();

    res.json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
