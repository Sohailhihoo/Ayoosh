const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('✅ Connected to MongoDB');

        // Check if products exist
        const existingProducts = await Product.countDocuments();
        if (existingProducts > 0) {
            console.log(`Found ${existingProducts} products. Skipping seed.`);
            process.exit(0);
        }

        // Create categories
        console.log('\n📁 Creating categories...');
        const beauty = await Category.create({ name: 'Beauty', slug: 'beauty', displayOrder: 1 });
        const sunglasses = await Category.create({ name: 'Sunglasses', slug: 'sunglasses', displayOrder: 2 });
        const accessories = await Category.create({ name: 'Accessories', slug: 'accessories', displayOrder: 3 });

        const skincare = await Category.create({ name: 'Skincare', slug: 'skincare', parent: beauty._id, level: 1 });
        const makeup = await Category.create({ name: 'Makeup', slug: 'makeup', parent: beauty._id, level: 1 });
        const aviator = await Category.create({ name: 'Aviator', slug: 'aviator', parent: sunglasses._id, level: 1 });
        const jewelry = await Category.create({ name: 'Jewelry', slug: 'jewelry', parent: accessories._id, level: 1 });
        console.log('   ✓ Created categories');

        // Create products
        console.log('\n🛍️  Creating products...');
        const products = await Product.create([
            {
                name: 'Hydrating Face Serum',
                slug: 'hydrating-face-serum',
                description: 'A lightweight serum that provides intense hydration.',
                brand: 'GlowUp',
                category: skincare._id,
                price: 45.00,
                productType: 'beauty',
                sku: 'BEAUTY-001',
                stock: 100,
                status: 'active',
                isFeatured: true
            },
            {
                name: 'Vitamin C Cream',
                slug: 'vitamin-c-cream',
                description: 'Brightens and evens skin tone.',
                brand: 'GlowUp',
                category: skincare._id,
                price: 52.00,
                productType: 'beauty',
                sku: 'BEAUTY-002',
                stock: 85,
                status: 'active',
                isBestseller: true
            },
            {
                name: 'Matte Lipstick - Ruby Red',
                slug: 'matte-lipstick-ruby-red',
                description: 'Long-lasting matte lipstick.',
                brand: 'BeautyLux',
                category: makeup._id,
                price: 24.00,
                productType: 'beauty',
                sku: 'BEAUTY-003',
                stock: 200,
                status: 'active'
            },
            {
                name: 'Classic Aviator Sunglasses',
                slug: 'classic-aviator-sunglasses',
                description: 'Timeless aviator style with UV400 protection.',
                brand: 'SunStyle',
                category: aviator._id,
                price: 89.00,
                productType: 'sunglasses',
                sku: 'SUN-001',
                stock: 75,
                status: 'active',
                isFeatured: true
            },
            {
                name: 'Pearl Drop Earrings',
                slug: 'pearl-drop-earrings',
                description: 'Elegant freshwater pearl earrings.',
                brand: 'Elegance',
                category: jewelry._id,
                price: 65.00,
                productType: 'accessories',
                sku: 'ACC-001',
                stock: 40,
                status: 'active'
            }
        ]);

        console.log(`   ✓ Created ${products.length} products`);
        console.log('\n✅ Products seeded successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedProducts();
