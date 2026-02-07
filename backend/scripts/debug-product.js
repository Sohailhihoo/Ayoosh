const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

const checkProductDetails = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const productId = '69825dab2d01b1efb437017c';

        const product = await Product.findById(productId);

        if (product) {
            console.log('📦 Product found:');
            console.log(JSON.stringify(product, null, 2));
        } else {
            console.log('❌ Product not found with ID:', productId);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkProductDetails();
