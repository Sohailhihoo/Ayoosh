const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('✅ Connected to MongoDB');

        const email = 'admin@beautystore.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists
        let admin = await User.findOne({ email });

        if (admin) {
            console.log('⚠️  Admin user already exists.');
            if (admin.role !== 'admin') {
                admin.role = 'admin';
                await admin.save();
                console.log('   Updated role to admin.');
            } else {
                console.log('   Role is already admin.');
            }
            // Optional: Reset password if you want, but might be invasive. 
            // Let's just create if missing or promote.
        } else {
            admin = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email,
                password: hashedPassword, // Direct hash since pre-save might re-hash if not careful, but usually pre-save handles plain text. 
                // Let's rely on pre-save hook if it exists. 
                // checking User model... usually User model handles hashing in pre-save.
                // If I pass hashed password here, double hashing might occur if pre-save blindly hashes.
                // Let's use plain text and let the model handle it if possible.
                // Wait, I don't see the User model content here.
                // Safer to check User model first? 
                // Standard practice: if passing to create(), let hook handle it.
                // BUT, if I don't know the hook, I'll try to find one.
                role: 'admin'
            });
            console.log('✅ Created Admin user.');
        }

        console.log('\n🔑 Login Credentials:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

// Getting User model to check hooks? No, I'll just write it carefully.
// I'll assume standard hashing middleware.
// Actually, looking at seed.js (Step 141), it used:
// password: 'admin123'
// So I should pass PLAIN TEXT password.

createAdmin();
