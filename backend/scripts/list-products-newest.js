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

const listProducts = async () => {
    await connectDB();
    try {
        // Sort by Newest first (-createdAt) to verify what the user likely sees
        const products = await Product.find({}, 'name productType createdAt').sort({ createdAt: -1 });
        console.log(`Found ${products.length} products (Newest First):`);
        products.forEach((p, i) => {
            console.log(`#${i + 1} [${p._id}] ${p.name} (${p.productType})`);
        });
    } catch (error) {
        console.error('Error listing products:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

listProducts();
