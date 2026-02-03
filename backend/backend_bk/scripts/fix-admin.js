const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('✅ Connected to MongoDB');

        const email = 'admin@beautystore.com';
        const password = 'admin123'; // Plain text!

        // Find existing admin
        const admin = await User.findOne({ email });

        if (admin) {
            console.log('Found admin user. Updating password...');
            // We set the plain text password. The pre-save hook will detect modification and hash it once.
            admin.password = password;
            await admin.save();
            console.log('✅ Password updated successfully (hashed by model hook).');
        } else {
            console.log('⚠️ Admin user not found, creating new one...');
            await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email,
                password: password, // Plain text
                role: 'admin'
            });
            console.log('✅ Created Admin user.');
        }

        console.log('\n🔑 Login Credentials (Fixed):');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixAdmin();
