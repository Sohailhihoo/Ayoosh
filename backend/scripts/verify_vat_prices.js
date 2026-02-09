const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const verifyPrices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('--- VERIFICATION ---');
        const products = await Product.find({
            $or: [
                { name: { $regex: 'tube', $options: 'i' } },
                { name: { $regex: 'pouch', $options: 'i' } },
                { productType: 'sunglasses' }
            ]
        }, 'name price productType');

        products.forEach(p => {
            console.log(`[${p.productType}] ${p.name}: ${p.price}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

verifyPrices();
