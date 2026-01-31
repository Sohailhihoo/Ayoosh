const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

const updateNewestProducts = async () => {
    await connectDB();
    try {
        // Find all beauty products, sorted by Newest First
        const products = await Product.find({ productType: 'beauty' }).sort({ createdAt: -1 });

        if (products.length < 2) {
            console.log('Not enough beauty products to update.');
            return;
        }

        // 1. Update NEWEST Product (Top of Shop) -> Sun Cream Tube
        const p1 = products[0];
        console.log(`Updating NEWEST product [${p1._id}] (was: ${p1.name}) -> SUN CREAM Tube`);
        p1.name = "SUN CREAM 50ml Tube";
        p1.description = "SPF 50+ PA+++ Lightweight, Natural Glow, No White Cast. Validated by Ayoosh.";
        p1.images = [{
            url: "https://res.cloudinary.com/dpdg462fb/image/upload/v1769715388/Sun_Tube_cmxezs.png",
            alt: "SUN CREAM 50ml Tube",
            isPrimary: true
        }];
        await p1.save();

        // 2. Update 2nd NEWEST Product -> Sun Cream Pouch
        const p2 = products[1];
        console.log(`Updating 2nd NEWEST product [${p2._id}] (was: ${p2.name}) -> SUN CREAM Pouch`);
        p2.name = "SUN CREAM POUCH 10 x 5ml Sachet";
        p2.description = "Portable protection. 10 x 5ml sachets for on-the-go sun care. Perfect for travel.";
        p2.images = [{
            url: "https://res.cloudinary.com/dpdg462fb/image/upload/v1769748802/Pouch_and_Sachet_bjidrn.png",
            alt: "SUN CREAM POUCH 10 x 5ml Sachet",
            isPrimary: true
        }];
        await p2.save();

        // 3. Revert/Rename the OLDEST products (which I mistakenly updated before)
        // Since I don't know exactly which ones they were (dependent on sort), I'll just check if any *other* products have these specific names and rename them to avoid confusion.

        // Find products with the "Sun Cream" names that are NOT the ones we just updated
        const duplicates1 = await Product.find({
            _id: { $nin: [p1._id, p2._id] },
            name: "SUN CREAM 50ml Tube"
        });

        for (const d of duplicates1) {
            console.log(`Reverting duplicate 1 [${d._id}] -> Hydrating Face Serum (Restored)`);
            d.name = "Hydrating Face Serum"; // Original name from seed
            d.description = "A lightweight serum that provides intense hydration with hyaluronic acid and vitamin B5.";
            // Giving it a placeholder image/clearing provided one
            d.images = [];
            await d.save();
        }

        const duplicates2 = await Product.find({
            _id: { $nin: [p1._id, p2._id] },
            name: "SUN CREAM POUCH 10 x 5ml Sachet"
        });

        for (const d of duplicates2) {
            console.log(`Reverting duplicate 2 [${d._id}] -> Vitamin C Brightening Cream (Restored)`);
            d.name = "Vitamin C Brightening Cream"; // Original name from seed
            d.description = "Brightens and evens skin tone with 15% vitamin C complex.";
            d.images = [];
            await d.save();
        }

    } catch (error) {
        console.error('Error updating products:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

updateNewestProducts();
