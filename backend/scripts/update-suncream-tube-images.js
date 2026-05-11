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
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1769715388/Sun_Tube_cmxezs.png', alt: 'Ayoosh Sun Cream Tube', isPrimary: true },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476135/8802070710559_2985979_injl1o.png', alt: 'Ayoosh Sun Cream Tube - View 2', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476132/8802070710559_2985985_tiyjdo.png', alt: 'Ayoosh Sun Cream Tube - View 3', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476126/8802070710559_2985986_dtuz1x.png', alt: 'Ayoosh Sun Cream Tube - View 4', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476123/8802070710559_3001928_u0zmbc.png', alt: 'Ayoosh Sun Cream Tube - View 5', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476120/8802070710559_3001930_mhjwu4.png', alt: 'Ayoosh Sun Cream Tube - View 6', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476120/8802070710559_2985979_ozecqn.jpg', alt: 'Ayoosh Sun Cream Tube - View 7', isPrimary: false },
            { url: 'https://res.cloudinary.com/dpdg462fb/image/upload/f_auto,q_auto,w_800/v1778476126/8802070710559_2985978_kayj6c.png', alt: 'Ayoosh Sun Cream Tube - View 8', isPrimary: false },
        ];

        console.log('📝 Updating SUN CREAM Tube gallery images...');
        const product = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb437017c',
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
