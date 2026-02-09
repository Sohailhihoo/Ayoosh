const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const updatePrices = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);

        // Update Tube
        console.log('Updating "tube" price to 484.99...');
        const tubeResult = await Product.updateMany(
            { name: { $regex: 'tube', $options: 'i' } },
            { $set: { price: 484.99 } }
        );
        console.log(`Updated ${tubeResult.modifiedCount} tube products.`);

        // Update Pouch
        console.log('Updating "pouch" price to 473.99...');
        // Searching for "pouch" or matching specific pouch product if needed. 
        // User said "Sun cream pouch", so "pouch" regex should work.
        const pouchResult = await Product.updateMany(
            { name: { $regex: 'pouch', $options: 'i' } },
            { $set: { price: 473.99 } }
        );
        console.log(`Updated ${pouchResult.modifiedCount} pouch products.`);

        // Update Sunglasses
        console.log('Updating all sunglasses price to 3999...');
        const sunglassesResult = await Product.updateMany(
            { productType: 'sunglasses' },
            { $set: { price: 3999 } }
        );
        console.log(`Updated ${sunglassesResult.modifiedCount} sunglasses.`);

        // Verification
        console.log('\n--- VERIFICATION ---');
        const updatedProducts = await Product.find({
            $or: [
                { name: { $regex: 'tube', $options: 'i' } },
                { name: { $regex: 'pouch', $options: 'i' } },
                { productType: 'sunglasses' }
            ]
        }, 'name price productType');

        updatedProducts.forEach(p => {
            console.log(`[${p.productType}] ${p.name}: ${p.price}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

updatePrices();
