const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Check your .env path.');
    process.exit(1);
}

const updateProducts = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // Update first product - SUN CREAM TUBE
        console.log('📝 Updating SUN CREAM (Tube) product...');
        const product1 = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb437017c',
            {
                name: 'SUN CREAM',
                price: 525.95,
                compareAtPrice: null,
                productType: 'suncream',
                description: 'Premium sun protection in a convenient 50ml tube. SPF 50+ PA+++ for maximum protection against UVA and UVB rays.',
                brand: 'Ayoosh'
            },
            { new: true }
        );

        if (product1) {
            console.log('✅ Updated SUN CREAM:', product1.name, '- R' + product1.price);
        } else {
            console.log('⚠️ SUN CREAM product not found');
        }

        // Update second product - SUN CREAM POUCH
        console.log('📝 Updating SUN CREAM POUCH product...');
        const product2 = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb4370176',
            {
                name: 'SUN CREAM POUCH',
                price: 515.95,
                compareAtPrice: null,
                productType: 'suncream',
                description: 'Convenient on-the-go sun protection. 10 sachets x 5ml each. Perfect for travel and daily use.',
                brand: 'Ayoosh'
            },
            { new: true }
        );

        if (product2) {
            console.log('✅ Updated SUN CREAM POUCH:', product2.name, '- R' + product2.price);
        } else {
            console.log('⚠️ SUN CREAM POUCH product not found');
        }

        console.log('🎉 Update Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
};

updateProducts();
