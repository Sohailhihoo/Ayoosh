/**
 * Generates a QR code PNG pointing to the token-gated form URL.
 *
 * Usage:
 *   node scripts/generate-qr.mjs [site-url]
 *
 * Examples:
 *   node scripts/generate-qr.mjs                          # uses http://localhost:3000
 *   node scripts/generate-qr.mjs https://ayooshonline.com # uses production URL
 *
 * Reads FORM_TOKEN from frontend/.env.local automatically.
 * Output: qr-form.png in the frontend root directory.
 */

import QRCode from 'qrcode';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

// --- Read FORM_TOKEN from .env.local ---
let envContent;
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch {
  console.error(`Could not read .env.local at: ${envPath}`);
  process.exit(1);
}

const tokenMatch = envContent.match(/^FORM_TOKEN=(.+)$/m);
if (!tokenMatch) {
  console.error('FORM_TOKEN not found in .env.local. Add it first:\n  FORM_TOKEN=<your-uuid>');
  process.exit(1);
}

const token = tokenMatch[1].trim();

// --- Determine base URL ---
const siteUrl = process.argv[2]?.replace(/\/$/, '') || 'http://localhost:3000';
const formUrl = `${siteUrl}/forms/${token}`;

// --- Generate QR code ---
const outputPath = path.join(__dirname, '..', 'qr-form.png');

await QRCode.toFile(outputPath, formUrl, {
  width: 400,
  margin: 2,
  color: {
    dark: '#171717',
    light: '#ffffff',
  },
});

console.log(`QR code saved to: qr-form.png`);
console.log(`Points to:        ${formUrl}`);
