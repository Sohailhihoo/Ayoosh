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

const updateProducts = async () => {
    await connectDB();
    try {
        // Find all beauty products, sorted by creation date (oldest first, same as seed order)
        const products = await Product.find({ productType: 'beauty' }).sort({ createdAt: 1 });

        if (products.length < 2) {
            console.log('Not enough beauty products to update.');
            return;
        }

        // Product 1: Sun Cream Tube
        const p1 = products[0];
        p1.name = "SUN CREAM 50ml Tube";
        p1.description = "SPF 50+ PA+++ Lightweight, Natural Glow, No White Cast. Validated by Ayoosh.";
        // Clear existing images and set the new one
        p1.images = [{
            url: "https://res.cloudinary.com/dpdg462fb/image/upload/v1769715388/Sun_Tube_cmxezs.png",
            alt: "SUN CREAM 50ml Tube",
            isPrimary: true
        }];
        // If there's a standalone image field (some schemas use it), update that too
        // Based on seed.js, the 'image' field might be used in the frontend featuredProducts, 
        // but the Product model uses 'images' array. 
        // I'll update the 'images' array as per the Mongoose model I read earlier.
        // Wait, verifying Product.js again... 
        // Confirmed: images: [{ url: String... }]

        await p1.save();
        console.log(`Updated Product 1: ${p1.name}`);

        // Product 2: Sun Cream Pouch
        const p2 = products[1];
        p2.name = "SUN CREAM POUCH 10 x 5ml Sachet";
        p2.description = "Portable protection. 10 x 5ml sachets for on-the-go sun care. Perfect for travel.";
        p2.images = [{
            url: "https://res.cloudinary.com/dpdg462fb/image/upload/v1769748802/Pouch_and_Sachet_bjidrn.png",
            alt: "SUN CREAM POUCH 10 x 5ml Sachet",
            isPrimary: true
        }];

        await p2.save();
        console.log(`Updated Product 2: ${p2.name}`);

    } catch (error) {
        console.error('Error updating products:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

updateProducts();
