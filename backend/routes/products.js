const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { cacheProducts, cacheFeatured, cacheNewArrivals, cacheBestsellers } = require('../lib/cache');
const { upload } = require('../lib/cloudinary');

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

    // Handle Category Filter (Slug or ID)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        query.category = category;
      } else {
        // It's a slug, find the category first
        const categoryDoc = await Category.findOne({
          $or: [{ slug: category }, { name: category }]
        });

        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // Category not found, return no products
          return res.json({
            success: true,
            data: { products: [], pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 } }
          });
        }
      }
    }
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

    // Select only essential fields for list view (performance optimization)
    const listFields = 'name slug price compareAtPrice images brand productType stock isFeatured isNewArrival averageRating reviewCount';

    // Custom sort: show suncream first, then sunglasses, then others
    const productTypeOrder = { suncream: 0, sunglasses: 1, accessories: 2 };

    const result = await Product.paginate(query, {
      page: Number(page),
      limit: Number(limit),
      sort,
      select: listFields,
      populate: { path: 'category', select: 'name slug' },
      lean: true,
    });

    // Sort by product type order when showing all products (no productType filter)
    if (!productType) {
      result.docs.sort((a, b) => {
        const orderA = productTypeOrder[a.productType] ?? 99;
        const orderB = productTypeOrder[b.productType] ?? 99;
        return orderA - orderB;
      });
    }

    res.json({
      success: true,
      data: {
        products: result.docs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          pages: result.totalPages
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
        .populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: req.params.id, status: 'active' })
        .populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Fire-and-forget viewCount increment — don't await, don't block the response
    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});

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
router.post('/', protect, authorize('admin'),
  upload.fields([
    { name: 'gallery', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const productData = req.body;

      // Initialize if fields are missing in body
      if (!productData.images) productData.images = [];

      // Handle Gallery Images (file uploads via multipart)
      let imageObjects = [];
      if (req.files && req.files['gallery']) {
        imageObjects = req.files['gallery'].map(file => ({
          url: file.path,
          alt: productData.name || 'Product Image'
        }));
      }

      // Handle Cloudinary URLs pasted directly in the form
      if (req.body.cloudinaryUrl) {
        const urls = Array.isArray(req.body.cloudinaryUrl)
          ? req.body.cloudinaryUrl
          : [req.body.cloudinaryUrl];
        const cloudinaryImages = urls
          .map(u => u.trim())
          .filter(u => u)
          .map(url => ({ url, alt: productData.name || 'Product Image' }));
        imageObjects = [...imageObjects, ...cloudinaryImages];
      }

      if (imageObjects.length > 0) {
        productData.images = imageObjects;
      }

      // Handle Video
      if (req.files && req.files['video']) {
        productData.video = req.files['video'][0].path;
      }

      const product = await Product.create(productData);

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
router.put('/:id', protect, authorize('admin'),
  upload.fields([
    { name: 'gallery', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const productData = req.body;

      // Logic:
      // 1. If new 'gallery' files: we APPEND or REPLACE? Typically replace or complex logic.
      //    Simplest for now: User sends existing images in body + new files.
      //    But here, let's just handle NEW uploads validation.

      let newImages = [];
      if (req.files && req.files['gallery']) {
        newImages = req.files['gallery'].map(file => ({
          url: file.path,
          alt: productData.name || 'Product Image'
        }));
      }

      // Handle comma-separated Cloudinary URLs sent as a plain string from the edit form
      if (productData.images && typeof productData.images === 'string') {
        const urlImages = productData.images
          .split(',')
          .map(u => u.trim())
          .filter(u => u)
          .map(url => ({ url, alt: productData.name || 'Product Image' }));
        productData.images = [...urlImages, ...newImages];
      } else if (newImages.length > 0) {
        productData.images = newImages;
      }

      // Handle Video
      if (req.files && req.files['video']) {
        productData.video = req.files['video'][0].path;
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        productData,
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
