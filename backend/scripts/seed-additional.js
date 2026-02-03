const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

const seedAdditionalData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('✅ Connected to MongoDB');

        // 1. Ensure Categories Exist
        let beautyCategory = await Category.findOne({ slug: 'beauty' });
        if (!beautyCategory) {
            beautyCategory = await Category.create({ name: 'Beauty', slug: 'beauty', displayOrder: 1 });
            console.log('Created Beauty category');
        }

        let sunglassesCategory = await Category.findOne({ slug: 'sunglasses' });
        if (!sunglassesCategory) {
            sunglassesCategory = await Category.create({ name: 'Sunglasses', slug: 'sunglasses', displayOrder: 2 });
            console.log('Created Sunglasses category');
        }

        // Subcategories for specificity (optional but good for structure)
        let skincareSub = await Category.findOne({ slug: 'skincare' });
        if (!skincareSub) {
            skincareSub = await Category.create({ name: 'Skincare', slug: 'skincare', parent: beautyCategory._id });
        }

        let classicSub = await Category.findOne({ slug: 'classic' });
        if (!classicSub) {
            classicSub = await Category.create({ name: 'Classic', slug: 'classic', parent: sunglassesCategory._id });
        }


        // 2. Define Products
        const newProducts = [
            // --- 2 Trending Beauty Products ---
            {
                name: 'Radiant Glow Face Oil',
                description: 'A luxurious blend of oils to give your skin a natural, healthy radiance. Perfect for all skin types.',
                brand: 'LuxeSkin',
                category: skincareSub._id,
                price: 55.00,
                compareAtPrice: 75.00,
                productType: 'beauty',
                sku: 'BEAUTY-TREND-001',
                stock: 50,
                status: 'active',
                isFeatured: true, // "Trending Now" often filters by featured or bestseller
                isBestseller: true,
                images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600', alt: 'Radiant Glow Face Oil' }]
            },
            {
                name: 'Hydra-Boost Gel Cream',
                description: 'Ultra-lightweight gel moisturizer that locks in moisture for 24 hours. Oil-free and refreshing.',
                brand: 'AquaPure',
                category: skincareSub._id,
                price: 42.00,
                productType: 'beauty',
                sku: 'BEAUTY-TREND-002',
                stock: 80,
                status: 'active',
                isFeatured: true,
                isNewArrival: true,
                images: [{ url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80&w=600', alt: 'Hydra-Boost Gel Cream' }]
            },

            // --- 4 Sunglasses Products ---
            {
                name: 'Midnight Aviator',
                description: 'Sleek black metal frame with dark polarized lenses. A modern twist on a classic.',
                brand: 'ShadeMaster',
                category: classicSub._id,
                price: 110.00,
                productType: 'sunglasses',
                sku: 'SUN-NEW-001',
                stock: 30,
                status: 'active',
                images: [{ url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600', alt: 'Midnight Aviator' }]
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
                images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600', alt: 'Retro Round Gold' }]
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
                images: [{ url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=600', alt: 'Cat-Eye Chic' }]
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
                images: [{ url: 'https://images.unsplash.com/photo-1625591348697-1658b45f4702?auto=format&fit=crop&q=80&w=600', alt: 'Sport Performance X' }]
            }
        ];

        console.log(`\n🛍️  Adding ${newProducts.length} new products...`);

        for (const p of newProducts) {
            // Check if exists to avoid duplicates (by SKU)
            const exists = await Product.findOne({ sku: p.sku });
            if (exists) {
                console.log(`- Skipped ${p.name} (already exists)`);
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
