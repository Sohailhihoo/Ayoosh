const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Dropped database - fresh start');

    // ========== CREATE USERS ==========
    console.log('\n👥 Creating users...');

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@beautystore.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('   ✓ Admin: admin@beautystore.com / admin123');

    const customers = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'customer',
        phone: '555-0101'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'customer',
        phone: '555-0102'
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael@example.com',
        password: 'password123',
        role: 'customer',
        phone: '555-0103'
      },
      {
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily@example.com',
        password: 'password123',
        role: 'customer',
        phone: '555-0104'
      },
      {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david@example.com',
        password: 'password123',
        role: 'customer',
        phone: '555-0105'
      }
    ]);
    console.log(`   ✓ Created ${customers.length} customer accounts`);

    // ========== CREATE CATEGORIES ==========
    console.log('\n📁 Creating categories...');

    const suncream = await Category.create({
      name: 'Suncream',
      slug: 'suncream',
      displayOrder: 1,
      description: 'Premium sun protection for all skin types',
      image: 'https://images.unsplash.com/photo-1526947425960-947c6e685839?auto=format&fit=crop&q=80',
    });
    const sunglasses = await Category.create({
      name: 'Sunglasses',
      slug: 'sunglasses',
      displayOrder: 2,
      description: 'Stylish protection for your eyes',
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80',
    });

    console.log('   ✓ Created 2 categories: Suncream & Sunglasses');

    // ========== CREATE PRODUCTS ==========
    // console.log('\n🛍️  Creating products...');
    // Products removed as per request - only keeping specific products from seed-additional.js

    // ========== CREATE ORDERS ==========
    // console.log('\n📦 Creating orders...');
    // Orders removed as they depend on the dummy products

    console.log('\n✅ Database initialized successfully (Users & Categories only)\n');
    console.log('📝 Summary:');
    console.log(`   • 1 Admin user`);
    console.log(`   • ${customers.length} Customer users`);
    console.log(`   • 2 Categories`);
    console.log('\n🔑 Admin Login:');
    console.log('   Email: admin@beautystore.com');
    console.log('   Password: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', JSON.stringify(error, null, 2));
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

seedData();