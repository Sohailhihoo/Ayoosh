const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const productId = '69825dab2d01b1efb437017c';
const imageUrl = 'https://res.cloudinary.com/dpdg462fb/image/upload/v1770630123/List_1_lsfi4e.jpg';

const updateImage = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);

        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found');
            process.exit(1);
        }

        console.log(`Found product: ${product.name}`);
        console.log('Updating to single image...');

        product.images = [{
            url: imageUrl,
            alt: product.name,
            isPrimary: true
        }];

        await product.save();

        console.log('✅ Successfully updated product to single image.');

        // Verification
        console.log('Current images:', product.images);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

updateImage();
