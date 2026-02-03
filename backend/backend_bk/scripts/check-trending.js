const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Check for Trending items (Featured or Bestsellers)
        const trending = await Product.find({
            $or: [{ isFeatured: true }, { isBestseller: true }]
        }).select('name sku isFeatured isBestseller');

        console.log(`\n🔥 Trending Products Found: ${trending.length}`);
        trending.forEach(p => console.log(`- ${p.name} (Featured: ${p.isFeatured}, Bestseller: ${p.isBestseller})`));

        // Check for Sunglasses
        const sunglasses = await Product.find({ productType: 'sunglasses' }).select('name sku');
        console.log(`\n😎 Sunglasses Found: ${sunglasses.length}`);
        sunglasses.forEach(p => console.log(`- ${p.name}`));

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
