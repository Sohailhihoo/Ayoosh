const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Check your .env path.');
    process.exit(1);
}

const fixProductType = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // Update products back to show on shop page
        console.log('📝 Fixing product types...');

        const result1 = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb437017c',
            { productType: 'suncream' },
            { new: true }
        );

        const result2 = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb4370176',
            { productType: 'suncream' },
            { new: true }
        );

        console.log('✅ Updated product types to "suncream"');
        console.log('   - SUN CREAM:', result1?.productType);
        console.log('   - SUN CREAM POUCH:', result2?.productType);

        console.log('🎉 Fix Complete! Products should now appear in shop page.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    }
};

fixProductType();
