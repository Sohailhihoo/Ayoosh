const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://sohail373318_db_user:hIHOO373318@cluster0.smno4uo.mongodb.net/Ayoosh';

async function checkDb() {
    try {
        console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections found in database "' + mongoose.connection.name + '":');

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }

        if (collections.length === 0) {
            console.log('WARNING: No collections found. The database is empty.');
        }

    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkDb();
