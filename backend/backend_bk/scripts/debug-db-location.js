const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkDb = async () => {
    const uri = process.env.MONGODB_URI;
    console.log('------------------------------------------------');
    console.log('DEBUG DATABASE CONNECTION');
    console.log('------------------------------------------------');
    console.log('URI from env:', uri.replace(/:([^:@]+)@/, ':****@')); // Mask password

    // Parse URI to find database name
    const url = new URL(uri);
    console.log('Target Cluster Host:', url.host);
    console.log('Target Database Name (from URI):', url.pathname.replace('/', ''));

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected successfully!');

        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const dbName = mongoose.connection.db.databaseName;
        console.log('👉 ACTIVELY CONNECTED TO DATABASE:', dbName);

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📂 Collections in this database:', collections.length);
        collections.forEach(c => {
            console.log(`   - ${c.name} (type: ${c.type})`);
        });

        // Count products specifically
        if (collections.find(c => c.name === 'products')) {
            const count = await mongoose.connection.db.collection('products').countDocuments();
            console.log(`\n🔢 Count of documents in 'products' collection: ${count}`);
        } else {
            console.log(`\n❌ 'products' collection NOT found in this database!`);
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

checkDb();
