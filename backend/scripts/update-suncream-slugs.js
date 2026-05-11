const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Check your .env path.');
    process.exit(1);
}

const updateSlugs = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // Update tube slug
        const tube = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb437017c',
            { slug: 'sun-cream-50ml-tube' },
            { new: true }
        );
        console.log(tube ? `✅ Tube: ${tube.slug}` : '⚠️ Tube not found');

        // Update pouch slug
        const pouch = await Product.findByIdAndUpdate(
            '69825dab2d01b1efb4370176',
            { slug: 'sun-cream-pouch' },
            { new: true }
        );
        console.log(pouch ? `✅ Pouch: ${pouch.slug}` : '⚠️ Pouch not found');

        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

updateSlugs();
