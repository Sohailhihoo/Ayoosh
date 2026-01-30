const mongoose = require('mongoose');
require('dotenv').config();

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

    const beauty = await Category.create({ name: 'Beauty', slug: 'beauty', displayOrder: 1 });
    const sunglasses = await Category.create({ name: 'Sunglasses', slug: 'sunglasses', displayOrder: 2 });
    const accessories = await Category.create({ name: 'Accessories', slug: 'accessories', displayOrder: 3 });

    const skincare = await Category.create({ name: 'Skincare', slug: 'skincare', parent: beauty._id, level: 1 });
    const makeup = await Category.create({ name: 'Makeup', slug: 'makeup', parent: beauty._id, level: 1 });
    const aviator = await Category.create({ name: 'Aviator', slug: 'aviator', parent: sunglasses._id, level: 1 });
    const wayfarer = await Category.create({ name: 'Wayfarer', slug: 'wayfarer', parent: sunglasses._id, level: 1 });
    const jewelry = await Category.create({ name: 'Jewelry', slug: 'jewelry', parent: accessories._id, level: 1 });
    const bags = await Category.create({ name: 'Bags', slug: 'bags', parent: accessories._id, level: 1 });
    console.log('   ✓ Created 9 categories');

    // ========== CREATE PRODUCTS ==========
    console.log('\n🛍️  Creating products...');

    const products = await Product.create([
      // Beauty Products
      {
        name: 'Hydrating Face Serum',
        slug: 'hydrating-face-serum',
        description: 'A lightweight serum that provides intense hydration with hyaluronic acid and vitamin B5.',
        brand: 'GlowUp',
        category: skincare._id,
        price: 45.00,
        compareAtPrice: 60.00,
        productType: 'beauty',
        sku: 'BEAUTY-001',
        stock: 100,
        status: 'active',
        isFeatured: true,
        isNewArrival: true
      },
      {
        name: 'Vitamin C Brightening Cream',
        slug: 'vitamin-c-brightening-cream',
        description: 'Brightens and evens skin tone with 15% vitamin C complex.',
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
        description: 'Long-lasting matte lipstick with rich pigmentation.',
        brand: 'BeautyLux',
        category: makeup._id,
        price: 24.00,
        productType: 'beauty',
        sku: 'BEAUTY-003',
        stock: 200,
        status: 'active',
        isBestseller: true
      },
      {
        name: 'Eyeshadow Palette - Nude Collection',
        slug: 'eyeshadow-palette-nude',
        description: '12 highly pigmented nude shades for everyday looks.',
        brand: 'BeautyLux',
        category: makeup._id,
        price: 38.00,
        productType: 'beauty',
        sku: 'BEAUTY-004',
        stock: 120,
        status: 'active',
        isFeatured: true
      },
      {
        name: 'Gentle Foaming Cleanser',
        slug: 'gentle-foaming-cleanser',
        description: 'pH-balanced cleanser that removes impurities without stripping.',
        brand: 'PureGlow',
        category: skincare._id,
        price: 28.00,
        productType: 'beauty',
        sku: 'BEAUTY-005',
        stock: 150,
        status: 'active'
      },
      {
        name: 'Night Repair Retinol Serum',
        slug: 'night-repair-retinol-serum',
        description: 'Advanced retinol formula for anti-aging and skin renewal.',
        brand: 'GlowUp',
        category: skincare._id,
        price: 68.00,
        compareAtPrice: 85.00,
        productType: 'beauty',
        sku: 'BEAUTY-006',
        stock: 75,
        status: 'active',
        isFeatured: true
      },

      // Sunglasses
      {
        name: 'Classic Aviator Sunglasses',
        slug: 'classic-aviator-sunglasses',
        description: 'Timeless aviator style with UV400 protection and polarized lenses.',
        brand: 'SunStyle',
        category: aviator._id,
        price: 89.00,
        productType: 'sunglasses',
        sku: 'SUN-001',
        stock: 75,
        status: 'active',
        isFeatured: true,
        isBestseller: true
      },
      {
        name: 'Gold Frame Aviators',
        slug: 'gold-frame-aviators',
        description: 'Premium gold-plated frames with gradient lenses.',
        brand: 'LuxVision',
        category: aviator._id,
        price: 125.00,
        productType: 'sunglasses',
        sku: 'SUN-002',
        stock: 45,
        status: 'active'
      },
      {
        name: 'Retro Wayfarer',
        slug: 'retro-wayfarer',
        description: 'Bold wayfarer design with polarized lenses and acetate frames.',
        brand: 'SunStyle',
        category: wayfarer._id,
        price: 75.00,
        productType: 'sunglasses',
        sku: 'SUN-003',
        stock: 60,
        status: 'active',
        isNewArrival: true
      },
      {
        name: 'Oversized Wayfarer - Black',
        slug: 'oversized-wayfarer-black',
        description: 'Statement oversized frames with 100% UV protection.',
        brand: 'UrbanShade',
        category: wayfarer._id,
        price: 95.00,
        productType: 'sunglasses',
        sku: 'SUN-004',
        stock: 55,
        status: 'active'
      },

      // Accessories
      {
        name: 'Pearl Drop Earrings',
        slug: 'pearl-drop-earrings',
        description: 'Elegant freshwater pearl earrings with sterling silver posts.',
        brand: 'Elegance',
        category: jewelry._id,
        price: 65.00,
        productType: 'accessories',
        sku: 'ACC-001',
        stock: 40,
        status: 'active',
        isFeatured: true
      },
      {
        name: 'Gold Layered Necklace Set',
        slug: 'gold-layered-necklace-set',
        description: 'Trendy layered necklace set with adjustable chains.',
        brand: 'Elegance',
        category: jewelry._id,
        price: 48.00,
        productType: 'accessories',
        sku: 'ACC-002',
        stock: 70,
        status: 'active',
        isBestseller: true
      },
      {
        name: 'Leather Crossbody Bag',
        slug: 'leather-crossbody-bag',
        description: 'Genuine leather bag with adjustable strap and multiple compartments.',
        brand: 'UrbanChic',
        category: bags._id,
        price: 129.00,
        compareAtPrice: 159.00,
        productType: 'accessories',
        sku: 'ACC-003',
        stock: 35,
        status: 'active',
        isFeatured: true
      },
      {
        name: 'Canvas Tote Bag - Beige',
        slug: 'canvas-tote-bag-beige',
        description: 'Spacious canvas tote perfect for daily use.',
        brand: 'EcoStyle',
        category: bags._id,
        price: 45.00,
        productType: 'accessories',
        sku: 'ACC-004',
        stock: 90,
        status: 'active',
        isNewArrival: true
      },
      {
        name: 'Minimalist Watch - Rose Gold',
        slug: 'minimalist-watch-rose-gold',
        description: 'Sleek minimalist watch with rose gold finish.',
        brand: 'TimeStyle',
        category: accessories._id,
        price: 85.00,
        productType: 'accessories',
        sku: 'ACC-005',
        stock: 50,
        status: 'active'
      }
    ]);
    console.log(`   ✓ Created ${products.length} products`);

    // ========== CREATE ORDERS ==========
    console.log('\n📦 Creating orders...');

    // Helper function to create order with random date in the past
    const createOrder = async (user, daysAgo, items, status = 'delivered') => {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);

      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = 5.99;
      const tax = Math.round(subtotal * 0.08 * 100) / 100;
      const total = subtotal + shippingCost + tax;

      // Generate order number
      const year = orderDate.getFullYear().toString().slice(-2);
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderNumber = `ORD-${year}${month}-${random}`;

      const order = new Order({
        orderNumber,
        user: user._id,
        items: items.map(item => ({
          product: item.product,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        customerDetails: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || ''
        },
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        billingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        subtotal,
        shippingCost,
        tax,
        total,
        paymentMethod: 'stripe',
        paymentStatus: status === 'cancelled' ? 'pending' : 'paid',
        shippingMethod: 'standard',
        status,
        statusHistory: [{
          status,
          note: `Order ${status}`,
          timestamp: orderDate
        }]
      });

      await order.save();

      // Update createdAt after save to backdate the order
      await Order.updateOne({ _id: order._id }, { createdAt: orderDate, updatedAt: orderDate });

      return order;
    };

    // Create orders for the past 30 days
    const orderPromises = [];

    // John's orders (3 orders)
    orderPromises.push(createOrder(customers[0], 2, [
      { product: products[0]._id, name: products[0].name, sku: products[0].sku, price: products[0].price, quantity: 2 },
      { product: products[2]._id, name: products[2].name, sku: products[2].sku, price: products[2].price, quantity: 1 }
    ], 'delivered'));

    orderPromises.push(createOrder(customers[0], 15, [
      { product: products[6]._id, name: products[6].name, sku: products[6].sku, price: products[6].price, quantity: 1 }
    ], 'delivered'));

    orderPromises.push(createOrder(customers[0], 28, [
      { product: products[10]._id, name: products[10].name, sku: products[10].sku, price: products[10].price, quantity: 1 },
      { product: products[11]._id, name: products[11].name, sku: products[11].sku, price: products[11].price, quantity: 1 }
    ], 'delivered'));

    // Jane's orders (4 orders)
    orderPromises.push(createOrder(customers[1], 1, [
      { product: products[1]._id, name: products[1].name, sku: products[1].sku, price: products[1].price, quantity: 1 },
      { product: products[3]._id, name: products[3].name, sku: products[3].sku, price: products[3].price, quantity: 1 }
    ], 'shipped'));

    orderPromises.push(createOrder(customers[1], 7, [
      { product: products[12]._id, name: products[12].name, sku: products[12].sku, price: products[12].price, quantity: 1 }
    ], 'delivered'));

    orderPromises.push(createOrder(customers[1], 18, [
      { product: products[8]._id, name: products[8].name, sku: products[8].sku, price: products[8].price, quantity: 1 }
    ], 'delivered'));

    orderPromises.push(createOrder(customers[1], 25, [
      { product: products[5]._id, name: products[5].name, sku: products[5].sku, price: products[5].price, quantity: 1 },
      { product: products[4]._id, name: products[4].name, sku: products[4].sku, price: products[4].price, quantity: 2 }
    ], 'delivered'));

    // Michael's orders (2 orders)
    orderPromises.push(createOrder(customers[2], 5, [
      { product: products[7]._id, name: products[7].name, sku: products[7].sku, price: products[7].price, quantity: 1 }
    ], 'processing'));

    orderPromises.push(createOrder(customers[2], 20, [
      { product: products[13]._id, name: products[13].name, sku: products[13].sku, price: products[13].price, quantity: 2 }
    ], 'delivered'));

    // Emily's orders (3 orders)
    orderPromises.push(createOrder(customers[3], 3, [
      { product: products[0]._id, name: products[0].name, sku: products[0].sku, price: products[0].price, quantity: 1 },
      { product: products[1]._id, name: products[1].name, sku: products[1].sku, price: products[1].price, quantity: 1 },
      { product: products[2]._id, name: products[2].name, sku: products[2].sku, price: products[2].price, quantity: 1 }
    ], 'delivered'));

    orderPromises.push(createOrder(customers[3], 12, [
      { product: products[9]._id, name: products[9].name, sku: products[9].sku, price: products[9].price, quantity: 1 }
    ], 'delivered'));

    orderPromises.push(createOrder(customers[3], 22, [
      { product: products[14]._id, name: products[14].name, sku: products[14].sku, price: products[14].price, quantity: 1 }
    ], 'delivered'));

    // David's orders (2 orders)
    orderPromises.push(createOrder(customers[4], 0, [
      { product: products[6]._id, name: products[6].name, sku: products[6].sku, price: products[6].price, quantity: 1 },
      { product: products[11]._id, name: products[11].name, sku: products[11].sku, price: products[11].price, quantity: 1 }
    ], 'pending'));

    orderPromises.push(createOrder(customers[4], 10, [
      { product: products[3]._id, name: products[3].name, sku: products[3].sku, price: products[3].price, quantity: 1 }
    ], 'delivered'));

    await Promise.all(orderPromises);
    console.log(`   ✓ Created ${orderPromises.length} orders`);

    // Update product sold counts
    console.log('\n📊 Updating product statistics...');
    for (const product of products) {
      const orders = await Order.find({
        'items.product': product._id,
        paymentStatus: 'paid'
      });

      let soldCount = 0;
      orders.forEach(order => {
        const item = order.items.find(i => i.product.toString() === product._id.toString());
        if (item) soldCount += item.quantity;
      });

      product.soldCount = soldCount;
      await product.save();
    }
    console.log('   ✓ Updated product sold counts');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📝 Summary:');
    console.log(`   • 1 Admin user`);
    console.log(`   • ${customers.length} Customer users`);
    console.log(`   • 9 Categories`);
    console.log(`   • ${products.length} Products`);
    console.log(`   • ${orderPromises.length} Orders`);
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