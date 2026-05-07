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

    // Execute query
    const skip = (Number(page) - 1) * Number(limit);

    // Select only essential fields for list view (performance optimization)
    const listFields = 'name slug price compareAtPrice images brand productType stock isFeatured isNewArrival averageRating reviewCount';

    // Custom sort: show suncream first, then sunglasses, then others
    const productTypeOrder = { suncream: 0, sunglasses: 1, accessories: 2 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .select(listFields)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    // Sort by product type order when showing all products (no productType filter)
    if (!productType) {
      products.sort((a, b) => {
        const orderA = productTypeOrder[a.productType] ?? 99;
        const orderB = productTypeOrder[b.productType] ?? 99;
        return orderA - orderB;
      });
    }

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

      // Handle Gallery Images (map to 'images' in DB schema)
      // Frontend sends 'gallery', DB expects 'images'
      if (req.files && req.files['gallery']) {
        const galleryUrls = req.files['gallery'].map(file => ({
          url: file.path,
          alt: productData.name || 'Product Image'
        }));
        // If schema expects array of strings, map to paths.
        // But our schema now expects objects: { url, alt, isPrimary } 
        // OR array of strings? Let's check schema again. 
        // Schema says: images: [{ url: String... }]
        // Previous code handled array of strings? 
        // "productData.images = req.files.map(file => file.path);" <-- logic from previous step.
        // Wait, schema was: images: [{ url: String, ... }] but previous code did array of strings?
        // Let's look at schema Line 84-88:
        // images: [{ url: String, ... }]
        // So mapping to string path was WRONG unless Mongoose casts it or previous code was simplistic.
        // Let's implement robust object mapping.

        productData.images = galleryUrls;
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
          alt: productData.name
        }));
      }

      // If existing images passed as JSON string (common in multipart forms)
      let existingImages = [];
      if (productData.existingImages) {
        try {
          existingImages = JSON.parse(productData.existingImages);
        } catch (e) {
          existingImages = [];
        }
      }

      // Merge: This logic depends on frontend. 
      // If we just want to ADD new images to DB:
      if (newImages.length > 0) {
        // We'll update after fetching or let consumer handle full Replace logic
        // Assuming 'images' field in body replaces structure.
        // Let's construct the final array if we can.
        productData.images = [...existingImages, ...newImages];
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
