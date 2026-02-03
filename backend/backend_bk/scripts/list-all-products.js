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
        const products = await Product.find({}, 'name category productType createdAt');
        console.log(`Found ${products.length} products:`);
        products.forEach(p => {
            console.log(`[${p._id}] ${p.name} (${p.productType}) - Created: ${p.createdAt}`);
        });
    } catch (error) {
        console.error('Error listing products:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

listProducts();
