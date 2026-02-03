/**
 * Cloudinary Image Migration Script
 * 
 * Uploads all brand and landing images to Cloudinary
 * with organized folder structure.
 * 
 * Usage: node scripts/migrate-images.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Define image mappings: [local path, cloudinary folder, new name]
const imageMappings = [
    // Brand Logos
    ['../../frontend/public/images/brand/logo.png', 'ayoosh-beauty/brand/logos', 'main'],
    ['../../frontend/public/images/brand/logo2.png', 'ayoosh-beauty/brand/logos', 'loading'],
    ['../../frontend/public/images/brand/logo3.png', 'ayoosh-beauty/brand/logos', 'final'],
    ['../../frontend/public/images/brand/logo4.png', 'ayoosh-beauty/brand/logos', 'alt'],
    ['../../frontend/public/images/brand/logo-light.png', 'ayoosh-beauty/brand/logos', 'light'],
    ['../../frontend/public/images/brand/yellow-logo.png', 'ayoosh-beauty/brand/logos', 'yellow'],
    ['../../frontend/public/images/brand/Yellow.png', 'ayoosh-beauty/brand/logos', 'yellow-accent'],

    // Brand Heroes
    ['../../frontend/public/images/brand/beauty-hero.png', 'ayoosh-beauty/brand/heroes', 'beauty'],
    ['../../frontend/public/images/landing/hero.png', 'ayoosh-beauty/brand/heroes', 'landing'],

    // Homepage Assets
    ['../../frontend/public/images/brand/rejoosh.png', 'ayoosh-beauty/homepage', 'rejoosh'],
    ['../../frontend/public/images/brand/rejoosh-hand.png', 'ayoosh-beauty/homepage', 'rejoosh-hand'],

    // Team
    ['../../frontend/public/images/brand/ayesha.png', 'ayoosh-beauty/brand/team', 'ayesha'],
];

async function uploadImage(localPath, folder, publicId) {
    const absolutePath = path.resolve(__dirname, localPath);

    if (!fs.existsSync(absolutePath)) {
        console.log(`❌ File not found: ${absolutePath}`);
        return null;
    }

    try {
        const result = await cloudinary.uploader.upload(absolutePath, {
            folder: folder,
            public_id: publicId,
            overwrite: true,
            resource_type: 'image'
        });

        console.log(`✅ Uploaded: ${folder}/${publicId}`);
        console.log(`   URL: ${result.secure_url}`);
        return result;
    } catch (error) {
        console.log(`❌ Failed: ${folder}/${publicId} - ${error.message}`);
        return null;
    }
}

async function migrateAll() {
    console.log('🚀 Starting Cloudinary Image Migration...\n');
    console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`Total images to upload: ${imageMappings.length}\n`);

    const results = {
        success: [],
        failed: []
    };

    for (const [localPath, folder, publicId] of imageMappings) {
        const result = await uploadImage(localPath, folder, publicId);
        if (result) {
            results.success.push({
                name: publicId,
                folder: folder,
                url: result.secure_url
            });
        } else {
            results.failed.push({ localPath, folder, publicId });
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.success.length > 0) {
        console.log('\n📋 CLOUDINARY URLs (copy to cloudinary-assets.js):');
        console.log('-'.repeat(50));

        const urlMap = {};
        results.success.forEach(item => {
            const key = `${item.folder.split('/').pop()}_${item.name}`.toUpperCase().replace(/-/g, '_');
            urlMap[key] = item.url;
        });

        console.log(JSON.stringify(urlMap, null, 2));
    }

    if (results.failed.length > 0) {
        console.log('\n❌ Failed uploads:');
        results.failed.forEach(f => console.log(`   - ${f.localPath}`));
    }
}

migrateAll().catch(console.error);
