const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

const checkProducts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const products = await Product.find({
            _id: { $in: ['69825dab2d01b1efb437017c', '69825dab2d01b1efb4370176'] }
        }).select('name productType price stock status');

        console.log('📦 Suncream Products:');
        products.forEach(p => {
            console.log(`\n  ID: ${p._id}`);
            console.log(`  Name: ${p.name}`);
            console.log(`  Type: ${p.productType}`);
            console.log(`  Price: R${p.price}`);
            console.log(`  Stock: ${p.stock}`);
            console.log(`  Status: ${p.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkProducts();
