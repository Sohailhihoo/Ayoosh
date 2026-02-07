const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

const updateDescriptions = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Update SUN CREAM
        await Product.findByIdAndUpdate(
            '69825dab2d01b1efb437017c',
            {
                name: 'SUN CREAM',
                description: 'Premium sun protection in a convenient 50ml tube. SPF 50+ PA+++ formula provides maximum protection against harmful UVA and UVB rays. Lightweight, non-greasy formula absorbs quickly without leaving a white cast. Perfect for daily use and all skin types. Water-resistant for up to 80 minutes.',
                brand: 'Ayoosh'
            }
        );
        console.log('✅ Updated SUN CREAM description');

        // Update SUN CREAM POUCH
        await Product.findByIdAndUpdate(
            '69825dab2d01b1efb4370176',
            {
                name: 'SUN CREAM POUCH',
                description: 'Convenient on-the-go sun protection in handy sachets. Each pouch contains 10 sachets of 5ml each - perfect for travel, gym bags, or daily use. SPF 50+ PA+++ formula provides maximum protection. Lightweight and portable, ensuring you never compromise on sun protection wherever you go.',
                brand: 'Ayoosh'
            }
        );
        console.log('✅ Updated SUN CREAM POUCH description');

        console.log('\n🎉 Descriptions updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateDescriptions();
