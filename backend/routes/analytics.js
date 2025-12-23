const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/stats
// @desc    Get dashboard overview statistics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

        // Parallel queries for better performance
        const [
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            todayRevenue,
            todayOrders,
            yesterdayRevenue,
            yesterdayOrders,
            monthRevenue,
            monthOrders,
            lastMonthRevenue,
            lastMonthOrders,
            pendingOrders,
            lowStockProducts
        ] = await Promise.all([
            // Total revenue (all time)
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            // Total orders
            Order.countDocuments(),
            // Total customers
            User.countDocuments({ role: 'customer' }),
            // Total products
            Product.countDocuments({ status: 'active' }),
            // Today's revenue
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            // Today's orders
            Order.countDocuments({ createdAt: { $gte: today } }),
            // Yesterday's revenue
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: yesterday, $lt: today } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            // Yesterday's orders
            Order.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
            // This month's revenue
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: thisMonth } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            // This month's orders
            Order.countDocuments({ createdAt: { $gte: thisMonth } }),
            // Last month's revenue
            Order.aggregate([
                { $match: { paymentStatus: 'paid', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            // Last month's orders
            Order.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
            // Pending orders
            Order.countDocuments({ status: 'pending' }),
            // Low stock products (stock < 10)
            Product.countDocuments({ status: 'active', stock: { $lt: 10, $gt: 0 } })
        ]);

        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
            if (!previous || previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const todayRevenueValue = todayRevenue[0]?.total || 0;
        const yesterdayRevenueValue = yesterdayRevenue[0]?.total || 0;
        const monthRevenueValue = monthRevenue[0]?.total || 0;
        const lastMonthRevenueValue = lastMonthRevenue[0]?.total || 0;

        res.json({
            success: true,
            data: {
                overview: {
                    totalRevenue: totalRevenue[0]?.total || 0,
                    totalOrders,
                    totalCustomers,
                    totalProducts,
                    pendingOrders,
                    lowStockProducts
                },
                today: {
                    revenue: todayRevenueValue,
                    orders: todayOrders,
                    revenueGrowth: calculateGrowth(todayRevenueValue, yesterdayRevenueValue),
                    ordersGrowth: calculateGrowth(todayOrders, yesterdayOrders)
                },
                month: {
                    revenue: monthRevenueValue,
                    orders: monthOrders,
                    revenueGrowth: calculateGrowth(monthRevenueValue, lastMonthRevenueValue),
                    ordersGrowth: calculateGrowth(monthOrders, lastMonthOrders)
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

// @route   GET /api/analytics/sales
// @desc    Get sales data over time
// @access  Private/Admin
router.get('/sales', protect, authorize('admin'), async (req, res) => {
    try {
        const { days = 30, groupBy = 'day' } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(days));
        startDate.setHours(0, 0, 0, 0);

        // Determine grouping format
        let dateFormat;
        switch (groupBy) {
            case 'week':
                dateFormat = { $week: '$createdAt' };
                break;
            case 'month':
                dateFormat = { $month: '$createdAt' };
                break;
            default: // day
                dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        }

        const salesData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: dateFormat,
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Format the response
        const formattedData = salesData.map(item => ({
            date: item._id,
            revenue: Math.round(item.revenue * 100) / 100,
            orders: item.orders,
            avgOrderValue: Math.round(item.avgOrderValue * 100) / 100
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/analytics/top-products
// @desc    Get best selling products
// @access  Private/Admin
router.get('/top-products', protect, authorize('admin'), async (req, res) => {
    try {
        const { limit = 10, period = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        // Get top products from orders
        const topProducts = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.total' }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: Number(limit)
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            {
                $unwind: '$productInfo'
            },
            {
                $project: {
                    _id: 1,
                    name: '$productInfo.name',
                    slug: '$productInfo.slug',
                    images: '$productInfo.images',
                    price: '$productInfo.price',
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: topProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/analytics/category-performance
// @desc    Get sales performance by category
// @access  Private/Admin
router.get('/category-performance', protect, authorize('admin'), async (req, res) => {
    try {
        const { period = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));

        // Get category performance from orders
        const categoryPerformance = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: 'paid'
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category._id',
                    name: { $first: '$category.name' },
                    revenue: { $sum: '$items.total' },
                    orders: { $sum: 1 },
                    itemsSold: { $sum: '$items.quantity' }
                }
            },
            {
                $sort: { revenue: -1 }
            }
        ]);

        // Calculate total revenue for percentage
        const totalRevenue = categoryPerformance.reduce((sum, cat) => sum + cat.revenue, 0);

        // Format response with percentages
        const formattedData = categoryPerformance.map(cat => ({
            _id: cat._id,
            name: cat.name,
            revenue: Math.round(cat.revenue * 100) / 100,
            orders: cat.orders,
            itemsSold: cat.itemsSold,
            percentage: totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0
        }));

        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
