const mongoose = require('mongoose');
require('dotenv').config();

// Force connection to 'beauty-store' instead of 'Ayoosh'
let uri = process.env.MONGODB_URI || 'mongodb+srv://sohail373318_db_user:hIHOO373318@cluster0.smno4uo.mongodb.net/Ayoosh';
uri = uri.replace('/Ayoosh', '/beauty-store');

async function checkBeautyStore() {
    try {
        console.log('Connecting to (beauty-store):', uri.replace(/:([^:@]+)@/, ':****@'));
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections found in database "beauty-store":');

        let foundProducts = false;
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
            if (col.name === 'products') foundProducts = true;
        }

        if (!foundProducts) {
            console.log('\n❌ No products found in beauty-store either.');
        } else {
            console.log('\n✅ Products found in beauty-store!');
        }

    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkBeautyStore();
