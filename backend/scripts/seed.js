const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load env config

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Check your .env path.');
    process.exit(1);
}

// RAW USER DATA
const rawCategories = [
    {
        "_id": { "$oid": "69825d6c7515d48eea90e1d7" },
        "name": "Suncream",
        "slug": "suncream",
        "description": "Premium sun protection for all skin types",
        "image": "https://images.unsplash.com/photo-1526947425960-947c6e685839?auto=format&fit=crop&q=80",
        "isActive": true,
        "displayOrder": 1,
        "createdAt": { "$date": "2026-02-03T20:41:16.641Z" },
        "updatedAt": { "$date": "2026-02-03T20:41:16.641Z" }
    },
    {
        "_id": { "$oid": "69825d6c7515d48eea90e1da" },
        "name": "Sunglasses",
        "slug": "sunglasses",
        "description": "Stylish protection for your eyes",
        "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80",
        "isActive": true,
        "displayOrder": 2,
        "createdAt": { "$date": "2026-02-03T20:41:16.707Z" },
        "updatedAt": { "$date": "2026-02-03T20:41:16.707Z" }
    }
];

const rawProducts = [
    {
        "_id": { "$oid": "69825dab2d01b1efb4370176" },
        "name": "Radiant Glow Face Oil",
        "description": "A luxurious blend of oils to give your skin a natural, healthy radiance. Perfect for all skin types.",
        "brand": "LuxeSkin",
        "category": { "$oid": "69825d6c7515d48eea90e1d7" },
        "price": 55,
        "compareAtPrice": 75,
        "productType": "beauty",
        "images": [{ "url": "https://res.cloudinary.com/dpdg462fb/image/upload/v1769748802/Pouch_and_Sachet_bjidrn.png", "alt": "Radiant Glow Face Oil", "isPrimary": false, "_id": { "$oid": "69825dab2d01b1efb4370177" } }],
        "sku": "BEAUTY-TREND-001",
        "stock": 50,
        "trackInventory": true,
        "status": "active",
        "isFeatured": true,
        "isBestseller": true,
        "slug": "radiant-glow-face-oil",
        "createdAt": { "$date": "2026-02-03T20:42:19.246Z" },
        "updatedAt": { "$date": "2026-02-03T20:42:19.246Z" }
    },
    {
        "_id": { "$oid": "69825dab2d01b1efb437017c" },
        "name": "Hydra-Boost Gel Cream",
        "description": "Ultra-lightweight gel moisturizer that locks in moisture for 24 hours. Oil-free and refreshing.",
        "brand": "AquaPure",
        "category": { "$oid": "69825d6c7515d48eea90e1d7" },
        "price": 42,
        "productType": "beauty",
        "images": [{ "url": "https://res.cloudinary.com/dpdg462fb/image/upload/v1769715388/Sun_Tube_cmxezs.png", "alt": "Hydra-Boost Gel Cream", "isPrimary": false, "_id": { "$oid": "69825dab2d01b1efb437017d" } }],
        "sku": "BEAUTY-TREND-002",
        "stock": 80,
        "trackInventory": true,
        "status": "active",
        "isFeatured": true,
        "isNewArrival": true,
        "slug": "hydra-boost-gel-cream",
        "createdAt": { "$date": "2026-02-03T20:42:19.390Z" },
        "updatedAt": { "$date": "2026-02-03T20:42:19.390Z" }
    },
    {
        "_id": { "$oid": "69825dab2d01b1efb4370181" },
        "name": "Midnight Aviator",
        "description": "Sleek black metal frame with dark polarized lenses. A modern twist on a classic.",
        "brand": "ShadeMaster",
        "category": { "$oid": "69825d6c7515d48eea90e1da" },
        "price": 110,
        "productType": "sunglasses",
        "images": [{ "url": "https://res.cloudinary.com/dpdg462fb/image/upload/v1769767397/Yellow-Glasses_faznsr.png", "alt": "Midnight Aviator", "isPrimary": false, "_id": { "$oid": "69825dab2d01b1efb4370182" } }],
        "sku": "SUN-NEW-001",
        "stock": 30,
        "trackInventory": true,
        "status": "active",
        "slug": "midnight-aviator",
        "createdAt": { "$date": "2026-02-03T20:42:19.526Z" },
        "updatedAt": { "$date": "2026-02-03T20:42:19.526Z" }
    },
    {
        "_id": { "$oid": "69825dab2d01b1efb4370187" },
        "name": "Retro Round Gold",
        "description": "Vintage-inspired round sunglasses with gold frames and tea-dipped lenses.",
        "brand": "RetroVibe",
        "category": { "$oid": "69825d6c7515d48eea90e1da" },
        "price": 85,
        "productType": "sunglasses",
        "images": [{ "url": "https://res.cloudinary.com/dpdg462fb/image/upload/v1769767395/Brown-Glasses_u6obla.png", "alt": "Retro Round Gold", "isPrimary": false, "_id": { "$oid": "69825dab2d01b1efb4370188" } }],
        "sku": "SUN-NEW-002",
        "stock": 45,
        "trackInventory": true,
        "status": "active",
        "slug": "retro-round-gold",
        "createdAt": { "$date": "2026-02-03T20:42:19.665Z" },
        "updatedAt": { "$date": "2026-02-03T20:42:19.665Z" }
    },
    {
        "_id": { "$oid": "69825dab2d01b1efb437018d" },
        "name": "Cat-Eye Chic",
        "description": "Bold oversized cat-eye sunglasses for a dramatic, glamorous look.",
        "brand": "VogueVision",
        "category": { "$oid": "69825d6c7515d48eea90e1da" },
        "price": 95,
        "productType": "sunglasses",
        "images": [{
            "url": "https://res.cloudinary.com/dpdg462fb/image/upload/v1769767393/Blue-Glasses_fky8v9.png", "alt": "Cat-Eye Chic",
            "isPrimary": false, "_id": { "$oid": "69825dab2d01b1efb437018e" }
        }],
        "sku": "SUN-NEW-003",
        "stock": 25,
        "trackInventory": true,
        "status": "active",
        "slug": "cat-eye-chic",
        "createdAt": { "$date": "2026-02-03T20:42:19.804Z" },
        "updatedAt": { "$date": "2026-02-03T20:42:19.804Z" }
    },
    {
        "_id": { "$oid": "69825dab2d01b1efb4370192" },
        "name": "Sport Performance X",
        "description": "Aerodynamic design with wrap-around protection, perfect for outdoor sports.",
        "brand": "ActiveGear",
        "category": { "$oid": "69825d6c7515d48eea90e1da" },
        "price": 120,
        "productType": "sunglasses",
        "images": [{
            "url": "https://res.cloudinary.com/dpdg462fb/image/upload/v1769767392/Pink-Glasses_o5hxf2.png", "alt": "Sport Performance X",
            "isPrimary": false, "_id": { "$oid": "69825dab2d01b1efb4370193" }
        }],
        "sku": "SUN-NEW-004",
        "stock": 51,
        "trackInventory": true,
        "status": "active",
        "slug": "sport-performance-x",
        "createdAt": { "$date": "2026-02-03T20:42:19.940Z" },
        "updatedAt": { "$date": "2026-02-03T20:42:19.940Z" }
    }
];

// Helper to clean MongoDB dump format
const cleanData = (data) => {
    return data.map(item => {
        const newItem = { ...item };
        if (newItem._id && newItem._id.$oid) newItem._id = newItem._id.$oid;
        if (newItem.category && newItem.category.$oid) newItem.category = newItem.category.$oid;
        if (newItem.createdAt && newItem.createdAt.$date) newItem.createdAt = new Date(newItem.createdAt.$date);
        if (newItem.updatedAt && newItem.updatedAt.$date) newItem.updatedAt = new Date(newItem.updatedAt.$date);

        // Clean images array
        if (newItem.images && Array.isArray(newItem.images)) {
            newItem.images = newItem.images.map(img => {
                const newImg = { ...img };
                if (newImg._id && newImg._id.$oid) newImg._id = newImg._id.$oid;
                return newImg;
            });
        }
        delete newItem.__v;
        return newItem;
    });
};

const seedData = async () => {
    try {
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // 1. Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        // 2. Create Admin User
        console.log('👤 Creating Admin User...');
        const adminUser = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@beautystore.com',
            password: 'admin123',
            role: 'admin'
        });
        console.log('✅ Admin created: admin@beautystore.com / admin123');

        // 3. Create Categories
        console.log('📂 Creating Categories...');
        const categories = cleanData(rawCategories);
        await Category.insertMany(categories);
        console.log(`✅ Created ${categories.length} categories.`);

        // 4. Create Products
        console.log('📦 Creating Products...');
        const products = cleanData(rawProducts);
        await Product.insertMany(products);
        console.log(`✅ Created ${products.length} products.`);

        console.log('🎉 Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

seedData();
