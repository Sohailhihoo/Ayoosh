const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { cacheCategories } = require('../lib/cache');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', cacheCategories, async (req, res) => {
  try {
    const { includeProducts, tree } = req.query;

    let query = Category.find({ isActive: true }).sort('displayOrder name');

    if (includeProducts === 'true') {
      query = query.populate('productCount');
    }

    let categories = await query.lean();

    // Build tree structure if requested
    if (tree === 'true') {
      const categoryMap = {};
      const rootCategories = [];

      categories.forEach(cat => {
        categoryMap[cat._id] = { ...cat, children: [] };
      });

      categories.forEach(cat => {
        if (cat.parent) {
          if (categoryMap[cat.parent]) {
            categoryMap[cat.parent].children.push(categoryMap[cat._id]);
          }
        } else {
          rootCategories.push(categoryMap[cat._id]);
        }
      });

      categories = rootCategories;
    }

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let category;

    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(req.params.id)
        .populate('subcategories')
        .populate('productCount');
    } else {
      category = await Category.findOne({ slug: req.params.id, isActive: true })
        .populate('subcategories')
        .populate('productCount');
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/categories/:id/products
// @desc    Get products in a category
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

    let categoryId = req.params.id;

    // If slug, find category first
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      const category = await Category.findOne({ slug: req.params.id });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      categoryId = category._id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find({ category: categoryId, status: 'active' })
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments({ category: categoryId, status: 'active' })
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

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Set level based on parent
    if (req.body.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      if (parentCategory) {
        req.body.level = parentCategory.level + 1;
      }
    }

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with products. Move or delete products first.'
      });
    }

    // Check for subcategories
    const subcategoryCount = await Category.countDocuments({ parent: req.params.id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories.'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
