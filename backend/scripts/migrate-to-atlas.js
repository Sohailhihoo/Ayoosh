const mongoose = require('mongoose');

// Local MongoDB connection
const LOCAL_MONGO_URI = 'mongodb://localhost:27017/beauty-store';

// Atlas MongoDB connection - UPDATE THIS WITH YOUR ATLAS CONNECTION STRING
const ATLAS_MONGO_URI = 'mongodb+srv://sohail373318_db_user:hIHOO373318@cluster0.smno4uo.mongodb.net/Ayoosh?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas (simplified for migration)
const productSchema = new mongoose.Schema({}, { strict: false });
const categorySchema = new mongoose.Schema({}, { strict: false });

async function migrate() {
    console.log('🚀 Starting migration from Local MongoDB to Atlas...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to Local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_MONGO_URI);
    console.log('✅ Connected to Local MongoDB\n');

    // Get local models
    const LocalProduct = localConn.model('Product', productSchema, 'products');
    const LocalCategory = localConn.model('Category', categorySchema, 'categories');

    // Fetch all data from local
    console.log('📦 Fetching data from Local MongoDB...');
    const products = await LocalProduct.find({}).lean();
    const categories = await LocalCategory.find({}).lean();

    console.log(`   Found ${products.length} products`);
    console.log(`   Found ${categories.length} categories\n`);

    if (products.length === 0 && categories.length === 0) {
        console.log('❌ No data found in local database. Exiting.');
        await localConn.close();
        process.exit(1);
    }

    // Connect to Atlas
    console.log('📡 Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get Atlas models
    const AtlasProduct = atlasConn.model('Product', productSchema, 'products');
    const AtlasCategory = atlasConn.model('Category', categorySchema, 'categories');

    // Check existing data in Atlas
    const existingProducts = await AtlasProduct.countDocuments();
    const existingCategories = await AtlasCategory.countDocuments();

    if (existingProducts > 0 || existingCategories > 0) {
        console.log(`⚠️  Atlas already has ${existingProducts} products and ${existingCategories} categories`);
        console.log('   Clearing existing data before import...\n');
        await AtlasProduct.deleteMany({});
        await AtlasCategory.deleteMany({});
    }

    // Import categories first
    if (categories.length > 0) {
        console.log('📤 Importing categories to Atlas...');
        await AtlasCategory.insertMany(categories);
        console.log(`✅ Imported ${categories.length} categories\n`);
    }

    // Import products
    if (products.length > 0) {
        console.log('📤 Importing products to Atlas...');
        await AtlasProduct.insertMany(products);
        console.log(`✅ Imported ${products.length} products\n`);
    }

    // Verify
    const finalProducts = await AtlasProduct.countDocuments();
    const finalCategories = await AtlasCategory.countDocuments();

    console.log('🎉 Migration Complete!');
    console.log(`   Atlas now has ${finalProducts} products and ${finalCategories} categories\n`);

    // Close connections
    await localConn.close();
    await atlasConn.close();

    console.log('✅ All connections closed. Migration successful!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
