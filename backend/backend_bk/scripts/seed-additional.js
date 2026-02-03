const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');
const Product = require('../models/Product');

const seedAdditionalData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('✅ Connected to MongoDB');

        // 1. Ensure Categories Exist (Look up what seed.js created)
        const suncreamCategory = await Category.findOne({ slug: 'suncream' });
        const sunglassesCategory = await Category.findOne({ slug: 'sunglasses' });

        if (!suncreamCategory || !sunglassesCategory) {
            console.error('❌ Categories not found! Please run seed.js first.');
            process.exit(1);
        }

        // 2. Define Products
        const newProducts = [
            // --- 2 Suncream Products ---
            {
                name: 'Radiant Glow Face Oil',
                description: 'A luxurious blend of oils to give your skin a natural, healthy radiance. Perfect for all skin types.',
                brand: 'LuxeSkin',
                category: suncreamCategory._id,
                price: 55.00,
                compareAtPrice: 75.00,
                productType: 'beauty', // Kept as 'beauty' to match enum
                sku: 'BEAUTY-TREND-001',
                stock: 50,
                status: 'active',
                isFeatured: true,
                isBestseller: true,
                images: [{ url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769748802/Pouch_and_Sachet_bjidrn.png', alt: 'Radiant Glow Face Oil' }]
            },
            {
                name: 'Hydra-Boost Gel Cream',
                description: 'Ultra-lightweight gel moisturizer that locks in moisture for 24 hours. Oil-free and refreshing.',
                brand: 'AquaPure',
                category: suncreamCategory._id,
                price: 42.00,
                productType: 'beauty',
                sku: 'BEAUTY-TREND-002',
                stock: 80,
                status: 'active',
                isFeatured: true,
                isNewArrival: true,
                images: [{ url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769715388/Sun_Tube_cmxezs.png', alt: 'Hydra-Boost Gel Cream' }]
            },

            // --- 4 Sunglasses Products ---
            {
                name: 'Midnight Aviator',
                description: 'Sleek black metal frame with dark polarized lenses. A modern twist on a classic.',
                brand: 'ShadeMaster',
                category: sunglassesCategory._id,
                price: 110.00,
                productType: 'sunglasses',
                sku: 'SUN-NEW-001',
                stock: 30,
                status: 'active',
                images: [{ url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767397/Yellow-Glasses_faznsr.png', alt: 'Midnight Aviator' }]
            },
            {
                name: 'Retro Round Gold',
                description: 'Vintage-inspired round sunglasses with gold frames and tea-dipped lenses.',
                brand: 'RetroVibe',
                category: sunglassesCategory._id,
                price: 85.00,
                productType: 'sunglasses',
                sku: 'SUN-NEW-002',
                stock: 45,
                status: 'active',
                images: [{ url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767395/Brown-Glasses_u6obla.png', alt: 'Retro Round Gold' }]
            },
            {
                name: 'Cat-Eye Chic',
                description: 'Bold oversized cat-eye sunglasses for a dramatic, glamorous look.',
                brand: 'VogueVision',
                category: sunglassesCategory._id,
                price: 95.00,
                productType: 'sunglasses',
                sku: 'SUN-NEW-003',
                stock: 25,
                status: 'active',
                images: [{ url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767393/Blue-Glasses_fky8v9.png', alt: 'Cat-Eye Chic' }]
            },
            {
                name: 'Sport Performance X',
                description: 'Aerodynamic design with wrap-around protection, perfect for outdoor sports.',
                brand: 'ActiveGear',
                category: sunglassesCategory._id,
                price: 120.00,
                productType: 'sunglasses',
                sku: 'SUN-NEW-004',
                stock: 60,
                status: 'active',
                images: [{ url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1769767392/Pink-Glasses_o5hxf2.png', alt: 'Sport Performance X' }]
            }
        ];

        console.log(`\n🛍️  Adding ${newProducts.length} new products...`);

        // Insert new products
        for (const p of newProducts) {
            const exists = await Product.findOne({ sku: p.sku });
            if (exists) {
                console.log(`- Updated ${p.name}`);
                Object.assign(exists, p);
                await exists.save();
            } else {
                await Product.create(p);
                console.log(`+ Added ${p.name}`);
            }
        }

        console.log('\n✅ Seed complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedAdditionalData();
