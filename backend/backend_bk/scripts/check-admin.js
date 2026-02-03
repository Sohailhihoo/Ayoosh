const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@beautystore.com' }).select('+password');
        if (admin) {
            console.log('✅ Admin user found:');
            console.log('ID:', admin._id);
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Password Hashed:', admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
        } else {
            console.log('❌ Admin user NOT found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
