const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const updatePrices = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);

        // 1. Ayoosh Sun Cream 50ml Tube -> 421.99
        // Using strict regex for "tube" combined with checking if it's the right product if possible, 
        // but broadly 'tube' worked before. User now specified full name "Ayoosh Sun Cream 50ml Tube".
        // I'll search for "tube" or the full name.
        console.log('Updating "tube" / "Ayoosh Sun Cream 50ml Tube" to 421.99...');
        // We use regex 'tube' to catch it as before, assuming unique.
        const tubeResult = await Product.updateMany(
            { name: { $regex: 'tube', $options: 'i' } },
            { $set: { price: 421.99 } }
        );
        console.log(`Updated ${tubeResult.modifiedCount} tube products.`);

        // 2. Sun cream pouch -> 412.99
        console.log('Updating "pouch" to 412.99...');
        const pouchResult = await Product.updateMany(
            { name: { $regex: 'pouch', $options: 'i' } },
            { $set: { price: 412.99 } }
        );
        console.log(`Updated ${pouchResult.modifiedCount} pouch products.`);

        // 3. All Sunglasses -> 3479.99
        console.log('Updating all sunglasses to 3479.99...');
        const sunglassesResult = await Product.updateMany(
            { productType: 'sunglasses' },
            { $set: { price: 3479.99 } }
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
