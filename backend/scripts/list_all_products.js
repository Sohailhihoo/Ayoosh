const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Product = require('../models/Product');

const listProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const products = await Product.find({}, 'name price productType');
        console.log('--- ALL PRODUCTS ---');
        products.forEach(p => {
            console.log(`ID: ${p._id} | Type: ${p.productType} | Name: ${p.name} | Price: ${p.price}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

listProducts();
