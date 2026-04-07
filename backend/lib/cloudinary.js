const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage (v2.2.1 compatible)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'beauty-store/products',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'],
    resource_type: 'auto',
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
});

// Initialize Multer
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
