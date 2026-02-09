const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const productId = '69825dab2d01b1efb437017c';

const clearImages = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);

        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found');
            process.exit(1);
        }

        console.log(`Found product: ${product.name}`);
        console.log('Clearing images...');

        product.images = [];
        await product.save();

        console.log('✅ Successfully cleared product images.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

clearImages();
