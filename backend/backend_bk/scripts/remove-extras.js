const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const removeExtras = async () => {
    await connectDB();
    try {
        // Count before
        const totalBefore = await Product.countDocuments();
        console.log(`Total products before: ${totalBefore}`);

        // Delete all products that are NOT 'beauty'
        // This keeps the 6 beauty products
        const result = await Product.deleteMany({ productType: { $ne: 'beauty' } });

        console.log(`Deleted ${result.deletedCount} products.`);

        // Count after
        const totalAfter = await Product.countDocuments();
        console.log(`Total products after: ${totalAfter}`);

        const remaining = await Product.find({}, 'name productType');
        remaining.forEach(p => console.log(`- ${p.name} (${p.productType})`));

    } catch (error) {
        console.error('Error removing products:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

removeExtras();
