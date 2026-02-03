const pkg = require('multer-storage-cloudinary');
console.log('Type:', typeof pkg);
console.log('Exports:', Object.keys(pkg));
console.log('Is Constructor?', typeof pkg === 'function' && pkg.prototype && pkg.prototype.constructor === pkg);
console.log('Value:', pkg);
