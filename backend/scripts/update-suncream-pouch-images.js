const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Check your .env path.');
    process.exit(1);
}

const updateImages = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        const newImages = [
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1769748802/Pouch_and_Sachet_bjidrn.png', alt: 'Ayoosh Sun Cream Pouch', isPrimary: true },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778477286/Ayoosh_Content_Ideas_2_lxxyed.png', alt: 'Ayoosh Sun Cream Pouch - View 2', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778477287/Ayoosh_Content_Ideas_3_lemndw.png', alt: 'Ayoosh Sun Cream Pouch - View 3', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778477285/Ayoosh_Content_Ideas_yemvv8.jpg', alt: 'Ayoosh Sun Cream Pouch - View 4', isPrimary: false },
        ];

        console.log('📝 Updating SUN CREAM POUCH gallery images...');
        const product = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb4370176',
            { images: newImages },
            { new: true }
        );

        if (product) {
            console.log('✅ Updated images for:', product.name);
            console.log('   Total images:', product.images.length);
            product.images.forEach((img, i) => {
                console.log(`   ${i + 1}. ${img.url.split('/').pop()} (primary: ${img.isPrimary})`);
            });
        } else {
            console.log('⚠️ Product not found');
        }

        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

updateImages();
