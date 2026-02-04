const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // Not needed, handled by model
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
        // Password hashing is handled by User model pre-save hook
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
        const categories = await Category.insertMany([
            { name: 'Perfumes', description: 'Luxury fragrances', slug: 'perfumes' },
            { name: 'Skincare', description: 'Glow with the best', slug: 'skincare' },
            { name: 'Makeup', description: 'Enhance your beauty', slug: 'makeup' },
            { name: 'Sunglasses', description: 'Stylish eyewear', slug: 'sunglasses' }
        ]);
        console.log(`✅ Created ${categories.length} categories.`);

        // Map categories for product assignment
        const perfumesCat = categories.find(c => c.slug === 'perfumes');
        const skincareCat = categories.find(c => c.slug === 'skincare');

        // 4. Create Products
        console.log('📦 Creating Products...');
        const products = await Product.insertMany([
            {
                name: 'Chanel No. 5',
                slug: 'chanel-no-5',
                description: 'The essence of femininity. A powdery floral bouquet.',
                price: 150,
                category: perfumesCat._id,
                productType: 'beauty',
                brand: 'Chanel',
                stock: 50,
                sku: 'PERF-001',
                images: [{ url: 'https://via.placeholder.com/300?text=Chanel+No+5', alt: 'Chanel No 5', isPrimary: true }]
            },
            {
                name: 'Dior Sauvage',
                slug: 'dior-sauvage',
                description: 'A radically fresh composition, dictated by a name that has the ring of a manifesto.',
                price: 120,
                category: perfumesCat._id,
                productType: 'beauty',
                brand: 'Dior',
                stock: 45,
                sku: 'PERF-002',
                images: [{ url: 'https://via.placeholder.com/300?text=Dior+Sauvage', alt: 'Dior Sauvage', isPrimary: true }]
            },
            {
                name: 'Advanced Night Repair',
                slug: 'advanced-night-repair',
                description: 'Serum for radiant, youthful-looking skin.',
                price: 85,
                category: skincareCat._id,
                productType: 'beauty',
                brand: 'Estee Lauder',
                stock: 100,
                sku: 'SKIN-001',
                images: [{ url: 'https://via.placeholder.com/300?text=Advanced+Night+Repair', alt: 'Serum', isPrimary: true }]
            }
        ]);
        console.log(`✅ Created ${products.length} products.`);

        console.log('🎉 Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', JSON.stringify(error, null, 2));
        process.exit(1);
    }
};

seedData();
