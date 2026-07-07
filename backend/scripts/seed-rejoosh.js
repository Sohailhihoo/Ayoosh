/**
 * One-off seed script: creates the Rejoosh Lacto-PDRN Skin Booster product.
 * Run once from the backend directory:
 *   node scripts/seed-rejoosh.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find or create the Skin Care category (slug: suncream)
  let category = await Category.findOne({ slug: 'suncream' });
  if (!category) {
    category = await Category.findOne({ name: /skin care/i });
  }
  if (!category) {
    category = await Category.create({ name: 'Skin Care', slug: 'suncream' });
    console.log('Created Skin Care category');
  }

  const existing = await Product.findOne({ slug: 'rejoosh-lacto-pdrn-skin-booster' });
  if (existing) {
    console.log('Product already exists — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const product = await Product.create({
    name: 'Rejoosh Lacto-PDRN Skin Booster | The First Ayoosh Jewel',
    slug: 'rejoosh-lacto-pdrn-skin-booster',
    sku: 'REJOOSH-LPDRN-001',
    brand: 'Rejoosh',
    category: category._id,
    productType: 'suncream',
    price: 899,
    stock: 480,
    status: 'active',
    shortDescription:
      'Rejoosh is the home of the Ayoosh Jewels. The first Jewel is Rejoosh Lacto-PDRN Skin Booster, a next-generation Korean skin booster powered by vegan, probiotic-derived Lacto-PDRN at 1500ppm. It is formulated with six types of hyaluronic acid, a dual probiotic ferment complex, niacinamide, and adenosine to repair, restore, and reset the skin. No needles. No clinic. Just healthier skin from the inside out. More than skincare. This is skin food: feed your skin, fuel your glow.',
    description: `INGREDIENTS

Polydeoxyribonucleotide / Lacto PDRN (at 1500ppm), Niacinamide (Vitamin B3), Adenosine, Sodium Hyaluronate, Sodium Hyaluronate Crosspolymer, Hydrolyzed Hyaluronic Acid, Hydroxypropyltrimonium Hyaluronate, Sodium Acetylated Hyaluronate, Hyaluronic Acid, Lactobacillus/Soybean Ferment Extract, Lactobacillus Ferment Lysate, Scutellaria Baicalensis Root Extract (Skullcap), Portulaca Oleracea Extract (Purslane), Salix Alba Bark Extract (Willow Bark), Chamaecyparis Obtusa Leaf Extract (Hinoki Cypress), Cinnamomum Cassia Bark Extract (Cinnamon Bark), Origanum Vulgare Leaf Extract (Oregano), Hydrolyzed Collagen, Panthenol, Allantoin, and Trehalose.

KEY BENEFITS

Repairs skin at a cellular level: Lacto PDRN at 1500ppm activates the skin's natural regeneration cascade. It stimulates collagen production and strengthens the skin barrier from within.

Deep, multi-layer hydration: Six forms of hyaluronic acid work at different skin depths simultaneously, delivering hydration from the surface all the way to the dermis for up to 24 hours.

Rebalances the skin microbiome: A dual probiotic ferment complex rebuilds microbial balance and primes the skin's protective immune response for a calm complexion.

Visibly reduces fine lines and wrinkles: Adenosine delivers rapid receptor stimulation while PDRN provides sustained release.

Brightens and evens skin tone: Niacinamide inhibits melanin transfer to reduce hyperpigmentation while building ceramides and regulating sebum for a balanced complexion.

Calms inflammation across five pathways: A six-extract botanical complex targets multiple inflammation pathways simultaneously for lasting relief.

100% vegan (no animal DNA, no fish): Lacto PDRN is fermentation-derived from Lactobacillus rhamnosus, making it the clean, ethical alternative to conventional salmon-derived PDRN.

Suitable for all skin types: Formulated for dry, oily, combination, sensitive, acne-prone, ageing, and post-procedure skin. All genders. All ages.

HOW TO USE

Apply Rejoosh Lacto-PDRN on clean skin after toner and before moisturizer. Massage gently until fully absorbed. Use morning and evening as part of your daily skincare routine. For daytime use, always finish with Centella Cica SPF 50+. Use consistently for best results; deeper repair builds over time.

A portion of profits from every purchase goes to the Ayoosh Foundation.`,
    images: [
      {
        url: 'https://res.cloudinary.com/dpdg462fb/image/upload/v1782976775/5_pfnhhd.png',
        alt: 'Rejoosh Lacto-PDRN Skin Booster',
        isPrimary: true,
      },
    ],
  });

  console.log(`Product created: ${product.name} (${product._id})`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
