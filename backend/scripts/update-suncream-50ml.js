const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beauty-store')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const updateProduct = async () => {
    try {
        const productId = '69825dab2d01b1efb437017c';

        const product = await Product.findById(productId);
        if (!product) {
            console.error('Product not found');
            process.exit(1);
        }

        console.log('Current product name:', product.name);
        console.log('Current slug:', product.slug);

        // Update fields
        product.name = 'Ayoosh Sun Cream 50ml Tube | Daily Sun Protection';
        product.metaTitle = 'Ayoosh Sun Cream 50ml Tube | Daily Sun Protection';
        product.metaDescription = 'Ayoosh SPF 50 Sun Cream offers lightweight, non-greasy sun protection with no white cast. It helps to keep skin hydrated and protected every day. Shop now!';
        product.description = `AYOOSH Sun Cream SPF 50+ PA++++ is a Korean-developed daily sunscreen designed for broad-spectrum protection in high-UV climates. This sunscreen features a lightweight, non-greasy, fast-absorbing formula. You know what the best part is? It blends seamlessly into the skin, with no white cast or clogged pores.

This sun-protective cream feels more like skincare than sunscreen. It sits comfortably under makeup and throughout active days. It is designed for the South African climate, lifestyle, and skin diversity. Ayoosh sunscreen, 50ml, provides reliable broad-spectrum protection while keeping skin hydrated and balanced throughout the day. A 50ml tube can be carried around in your bag, so you can ensure sun protection wherever you are.

Benefits of Ayoosh Sunscreen

High SPF 50+ PA++++ broad-spectrum UVA and UVB protection

Lightweight texture that absorbs quickly and feels barely there

No white cast, suitable for all skin tones

Non-greasy, breathable finish for daily comfort

Helps prevent sun damage, premature aging, and pigmentation

Hydrates and soothes skin while protecting

Designed to sit well under makeup without pilling

Eye-area-friendly formulation approach to reduce irritation

Dermatologically tested and skin-irritation tested

50ml Sunscreen: A High-Performance Daily Sun Formula

Format

50ml Tube

Dimensions



Recommended For

All skin types, including sensitive and acne-prone skin

Feels Like

Lightweight, breathable cream that absorbs quickly and feels barely there

Finish

Natural skin-finish glow with zero white cast or greasiness

Protection Level:

SPF 50+ PA++++ broad-spectrum UVA & UVB protection

FYI

Cruelty-Free

Vegan

Non-Comedogenic

Makeup-Friendly

Developed under Korean skincare standards

Prepared for South African retail compliance

How to Use

Apply generously to clean, dry skin as the final step of your morning skincare routine

Use at least 15 minutes before sun exposure

Reapply every 2\u20133 hours, especially after sweating, swimming, or towel-drying

Suitable for the face, neck, and exposed areas

For best protection, make sunscreen a non-negotiable daily habit.

Sustainable Packaging

Ayoosh sunscreen packaging is made with pineapple resin and sustainable materials to make your skin glow and our planet eco-friendly.

What\u2019s Inside Ayoosh 50ml Sun Cream

Advanced Korean UV Filters: High-performance, photostable sun protection

Vitamin E: Antioxidant support against environmental stressors

Glycerin & Propanediol: Deep hydration and moisture retention

Betaine: Helps maintain skin balance and comfort

Centella Asiatica: Known for calming and soothing irritated skin

Allantoin: Supports skin repair and softness

Chamomile Extract: Reduces redness and sensitivity

Licorice Root & Dipotassium Glycyrrhizate: Brightening and calming support

Green Tea Extract: Antioxidant protection

Polygonum Root & Rosemary Extract: Added botanical defense

FAQs

Is AYOOSH sun cream suitable for daily use?

Yes. It is designed for daily wear and features a lightweight, non-greasy formula. We recommend using it consistently to get better results.

Will Ayoosh sunscreen leave a white cast on skin?

No. Our sun cream completely absorbs the skin. It doesn\u2019t leave any invisible finish or any white or grey cast, even on deeper skin tones.

Can I wear this sunscreen under makeup?

Yes. The fast-absorbing texture of our cream for sun sits smoothly under makeup without piling or heaviness. This feature makes it ideal for daily skincare and cosmetic routines.

Is AYOOSH sun cream suitable for sensitive skin?

Our sun cream is dermatologically tested and formulated with soothing ingredients to support skin comfort and reduce irritation.

Does this sunscreen protect against both UVA and UVB rays?

Yes, it offers broad-spectrum SPF 50+ PA++++ protection. It helps defend skin from UVA aging rays and UVB burning rays for complete daily sun defense.`;

        await product.save();

        console.log('\nProduct updated successfully!');
        console.log('New name:', product.name);
        console.log('New slug:', product.slug);
        console.log('Meta title:', product.metaTitle);
        console.log('Meta description:', product.metaDescription);

    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        mongoose.connection.close();
    }
};

updateProduct();
