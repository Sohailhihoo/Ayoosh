const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Category = require('../models/Category');

const clearAllData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('✅ Connected to MongoDB');

        // Count before clearing
        console.log('\n📊 Before cleanup:');
        console.log(`   • Orders: ${await Order.countDocuments()}`);
        console.log(`   • Customers: ${await User.countDocuments({ role: 'customer' })}`);
        console.log(`   • Products: ${await Product.countDocuments()}`);
        console.log(`   • Categories: ${await Category.countDocuments()}`);
        console.log(`   • Carts: ${await Cart.countDocuments()}`);

        // Clear ALL data
        await Order.deleteMany({});
        console.log('\n🗑️  Deleted all orders');

        await User.deleteMany({ role: { $ne: 'admin' } });
        console.log('🗑️  Deleted all customer accounts (admin preserved)');

        await Cart.deleteMany({});
        console.log('🗑️  Deleted all carts');

        await Product.deleteMany({});
        console.log('🗑️  Deleted all products');

        await Category.deleteMany({});
        console.log('🗑️  Deleted all categories');

        // Count after clearing
        console.log('\n📊 After cleanup:');
        console.log(`   • Orders: ${await Order.countDocuments()}`);
        console.log(`   • Users: ${await User.countDocuments()}`);
        console.log(`   • Products: ${await Product.countDocuments()}`);
        console.log(`   • Categories: ${await Category.countDocuments()}`);
        console.log(`   • Carts: ${await Cart.countDocuments()}`);

        console.log('\n✅ ALL data cleared! Dashboard will now be empty.');
        console.log('   Admin account preserved: admin@beautystore.com / admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

clearAllData();
