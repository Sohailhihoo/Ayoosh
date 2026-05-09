const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const updatePrices = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);

        // Suncream Tube -> 484.99, compareAtPrice removed
        console.log('Updating tube to 484.99...');
        const tubeResult = await Product.updateMany(
            { name: { $regex: 'tube', $options: 'i' }, productType: 'suncream' },
            { $set: { price: 484.99 }, $unset: { compareAtPrice: '' } }
        );
        console.log(`Updated ${tubeResult.modifiedCount} tube products.`);

        // Suncream Pouch -> 424.99, compareAtPrice 474.99
        console.log('Updating pouch to 424.99 (was 474.99)...');
        const pouchResult = await Product.updateMany(
            { name: { $regex: 'pouch|sachet', $options: 'i' }, productType: 'suncream' },
            { $set: { price: 424.99, compareAtPrice: 474.99 } }
        );
        console.log(`Updated ${pouchResult.modifiedCount} pouch products.`);

        // Verification
        console.log('\n--- VERIFICATION ---');
        const updatedProducts = await Product.find(
            { productType: 'suncream' },
            'name price compareAtPrice productType'
        );

        updatedProducts.forEach(p => {
            const compare = p.compareAtPrice ? ` (was R${p.compareAtPrice})` : '';
            console.log(`[${p.productType}] ${p.name}: R${p.price}${compare}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

updatePrices();
