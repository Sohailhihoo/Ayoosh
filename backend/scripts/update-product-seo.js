const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is undefined. Check your .env path.');
    process.exit(1);
}

const updates = [
    {
        id: '69825dab2d01b1efb437017c', // SUN CREAM Tube
        metaTitle: 'Ayoosh Sun Cream 50ml Tube | Daily Sun Protection',
        metaDescription: 'Ayoosh SPF 50 Sun Cream offers lightweight, non-greasy sun protection with no white cast. It helps to keep skin hydrated and protected every day. Shop now!',
    },
    {
        id: '69825dab2d01b1efb4370176', // SUN CREAM Pouch
        metaTitle: 'Ayoosh SPF 50 Sun Cream Pouch | 10 x 5 ml Sachets',
        metaDescription: 'One Ayoosh Sun Cream pouch contains 10 handy 5 ml sachets with SPF 50 protection. Lightweight, non-greasy formula with no white cast for daily use.',
    },
    {
        id: '69825dab2d01b1efb4370181', // The Confidence
        metaTitle: 'Ayoosh The Confidence Yellow Metal Aviator Sunglasses',
        metaDescription: 'Ayoosh The Confidence sunglasses feature yellow polarized lenses and a lightweight metal aviator frame. They are an ideal choice for everyday wear and a bold presence. Buy now!',
    },
    {
        id: '69825dab2d01b1efb4370187', // The Focus
        metaTitle: 'The Focus Coffee Brown Aviator Sunglasses',
        metaDescription: 'The Focus sunglasses feature Coffee Brown polarized lenses and a lightweight metal aviator frame, delivering everyday comfort and timeless style. Shop now!',
    },
    {
        id: '69825dab2d01b1efb437018d', // The Leadership
        metaTitle: 'Ayoosh The Leadership Blue Metal Aviator Sunglasses',
        metaDescription: 'Ayoosh The Leadership sunglasses feature blue polarized lenses and a metal aviator frame. It\'s perfect for a confident presence and unisex everyday style. Buy now!',
    },
];

const updateSEO = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        for (const update of updates) {
            const product = await Product.findByIdAndUpdate(
                update.id,
                { metaTitle: update.metaTitle, metaDescription: update.metaDescription },
                { new: true }
            );
            if (product) {
                console.log(`Updated: ${product.name}`);
                console.log(`  Title: ${product.metaTitle}`);
                console.log(`  Desc:  ${product.metaDescription}`);
            } else {
                console.log(`Not found: ${update.id}`);
            }
        }

        await mongoose.disconnect();
        console.log('Done.');
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

updateSEO();
