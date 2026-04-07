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

        // Store description as clean HTML with proper structure
        product.description = `<h1>Ayoosh Sun Cream Tube 50ml</h1>

<p>AYOOSH Sun Cream SPF 50+ PA++++ is a Korean-developed daily sunscreen designed for broad-spectrum protection in high-UV climates. This sunscreen features a lightweight, non-greasy, fast-absorbing formula. You know what the best part is? It blends seamlessly into the skin, with no white cast or clogged pores.</p>

<p>This sun-protective cream feels more like skincare than sunscreen. It sits comfortably under makeup and throughout active days. It is designed for the South African climate, lifestyle, and skin diversity. Ayoosh sunscreen, 50ml, provides reliable broad-spectrum protection while keeping skin hydrated and balanced throughout the day. A 50ml tube can be carried around in your bag, so you can ensure sun protection wherever you are.</p>

<h2>Benefits of Ayoosh Sunscreen</h2>
<ul>
<li>High SPF 50+ PA++++ broad-spectrum UVA and UVB protection</li>
<li>Lightweight texture that absorbs quickly and feels barely there</li>
<li>No white cast, suitable for all skin tones</li>
<li>Non-greasy, breathable finish for daily comfort</li>
<li>Helps prevent sun damage, premature aging, and pigmentation</li>
<li>Hydrates and soothes skin while protecting</li>
<li>Designed to sit well under makeup without pilling</li>
<li>Eye-area-friendly formulation approach to reduce irritation</li>
<li>Dermatologically tested and skin-irritation tested</li>
</ul>

<h3>50ml Sunscreen: A High-Performance Daily Sun Formula</h3>
<table>
<tbody>
<tr><td>Format</td><td>50ml Tube</td></tr>
<tr><td>Dimensions</td><td></td></tr>
<tr><td>Recommended For</td><td>All skin types, including sensitive and acne-prone skin</td></tr>
<tr><td>Feels Like</td><td>Lightweight, breathable cream that absorbs quickly and feels barely there</td></tr>
<tr><td>Finish</td><td>Natural skin-finish glow with zero white cast or greasiness</td></tr>
<tr><td>Protection Level:</td><td>SPF 50+ PA++++ broad-spectrum UVA &amp; UVB protection</td></tr>
<tr><td>FYI</td><td>Cruelty-Free<br>Vegan<br>Non-Comedogenic<br>Makeup-Friendly<br>Developed under Korean skincare standards<br>Prepared for South African retail compliance</td></tr>
</tbody>
</table>

<h3>How to Use</h3>
<ol>
<li>Apply generously to clean, dry skin as the final step of your morning skincare routine</li>
<li>Use at least 15 minutes before sun exposure</li>
<li>Reapply every 2\u20133 hours, especially after sweating, swimming, or towel-drying</li>
<li>Suitable for the face, neck, and exposed areas</li>
</ol>
<p>For best protection, make sunscreen a non-negotiable daily habit.</p>

<h3>Sustainable Packaging</h3>
<p>Ayoosh sunscreen packaging is made with pineapple resin and sustainable materials to make your skin glow and our planet eco-friendly.</p>

<h3>What\u2019s Inside Ayoosh 50ml Sun Cream</h3>
<ul>
<li><strong>Advanced Korean UV Filters</strong>: High-performance, photostable sun protection</li>
<li><strong>Vitamin E</strong>: Antioxidant support against environmental stressors</li>
<li><strong>Glycerin &amp; Propanediol</strong>: Deep hydration and moisture retention</li>
<li><strong>Betaine</strong>: Helps maintain skin balance and comfort</li>
<li><strong>Centella Asiatica</strong>: Known for calming and soothing irritated skin</li>
<li><strong>Allantoin</strong>: Supports skin repair and softness</li>
<li><strong>Chamomile Extract</strong>: Reduces redness and sensitivity</li>
<li><strong>Licorice Root &amp; Dipotassium Glycyrrhizate</strong>: Brightening and calming support</li>
<li><strong>Green Tea Extract</strong>: Antioxidant protection</li>
<li><strong>Polygonum Root &amp; Rosemary Extract</strong>: Added botanical defense</li>
</ul>

<div class="faq-section">
<h2>FAQs</h2>
<div class="faq-item">
<h3>1. Is AYOOSH sun cream suitable for daily use?</h3>
<p>Yes. It is designed for daily wear and features a lightweight, non-greasy formula. We recommend using it consistently to get better results.</p>
</div>
<div class="faq-item">
<h3>2. Will Ayoosh sunscreen leave a white cast on skin?</h3>
<p>No. Our sun cream completely absorbs the skin. It doesn\u2019t leave any invisible finish or any white or grey cast, even on deeper skin tones.</p>
</div>
<div class="faq-item">
<h3>3. Can I wear this sunscreen under makeup?</h3>
<p>Yes. The fast-absorbing texture of our cream for sun sits smoothly under makeup without piling or heaviness. This feature makes it ideal for daily skincare and cosmetic routines.</p>
</div>
<div class="faq-item">
<h3>4. Is AYOOSH sun cream suitable for sensitive skin?</h3>
<p>Our sun cream is dermatologically tested and formulated with soothing ingredients to support skin comfort and reduce irritation.</p>
</div>
<div class="faq-item">
<h3>5. Does this sunscreen protect against both UVA and UVB rays?</h3>
<p>Yes, it offers broad-spectrum SPF 50+ PA++++ protection. It helps defend skin from UVA aging rays and UVB burning rays for complete daily sun defense.</p>
</div>
</div>`;

        await product.save();

        console.log('\nProduct description updated with HTML structure!');
        console.log('Description length:', product.description.length);
        console.log('First 200 chars:', product.description.substring(0, 200));

    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        mongoose.connection.close();
    }
};

updateProduct();
