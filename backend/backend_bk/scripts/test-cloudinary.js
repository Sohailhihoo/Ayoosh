require('dotenv').config();
const { cloudinary } = require('../lib/cloudinary');

async function testUpload() {
    console.log('🔄 Testing Cloudinary Connection...');
    console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);

    try {
        // Try to upload a sample image from a remote URL
        const result = await cloudinary.uploader.upload('https://cloudinary-res.cloudinary.com/image/upload/cloudinary_logo.png', {
            folder: 'beauty-store/tests',
            public_id: 'connection_test'
        });

        console.log('\n✅ Cloudinary Connection Successful!');
        console.log('-----------------------------------');
        console.log(`Url: ${result.secure_url}`);
        console.log(`Public ID: ${result.public_id}`);
        console.log('-----------------------------------');

        // Clean up - delete the test image
        console.log('🧹 Cleaning up test image...');
        await cloudinary.uploader.destroy(result.public_id);
        console.log('✅ Test image deleted.');

    } catch (error) {
        console.error('\n❌ Cloudinary Connection Failed:');
        console.error(error.message);

        if (error.message.includes('Must supply generic_api_key')) {
            console.log('\n💡 Tip: Check if CLOUDINARY_API_KEY is set in your .env file or if the variable name matches.');
        }
    }
}

testUpload();
