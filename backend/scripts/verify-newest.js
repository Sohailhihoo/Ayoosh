const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store');
    } catch (err) {
        process.exit(1);
    }
};

const verify = async () => {
    await connectDB();
    try {
        const products = await Product.find({ productType: 'beauty' }).sort({ createdAt: -1 });
        const p1 = products[0];
        const p2 = products[1];

        console.log(`P1: ${p1.name}`);
        console.log(`P2: ${p2.name}`);

        if (p1.name === "SUN CREAM 50ml Tube" && p2.name === "SUN CREAM POUCH 10 x 5ml Sachet") {
            console.log("VERIFICATION SUCCESS");
        } else {
            console.log("VERIFICATION FAILED");
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

verify();
