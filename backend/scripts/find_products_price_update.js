const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const findProducts = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('--- Searching for "tube" ---');
        const tubes = await Product.find({ name: { $regex: 'tube', $options: 'i' } });
        tubes.forEach(p => console.log(`ID: ${p._id}, Name: ${p.name}, Price: ${p.price}`));

        console.log('\n--- Searching for "pouch" ---');
        const pouches = await Product.find({ name: { $regex: 'pouch', $options: 'i' } });
        pouches.forEach(p => console.log(`ID: ${p._id}, Name: ${p.name}, Price: ${p.price}`));

        console.log('\n--- Searching for "sun cream" ---');
        const suncreams = await Product.find({ name: { $regex: 'sun cream', $options: 'i' } });
        suncreams.forEach(p => console.log(`ID: ${p._id}, Name: ${p.name}, Price: ${p.price}`));

        console.log('\n--- Counting sunglasses ---');
        const sunglassesCount = await Product.countDocuments({ productType: 'sunglasses' });
        console.log(`Total sunglasses found: ${sunglassesCount}`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

findProducts();
