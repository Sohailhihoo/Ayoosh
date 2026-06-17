# Ayoosh Online — Fixes Applied

**Date:** 2026-06-16
**Based on:** `CODE_AUDIT.md`

---

## What Was Fixed

### 🔒 Security

| ID | Fix | File(s) Changed |
|----|-----|-----------------|
| S1 | **Client shippingCost removed** — `bodyShippingCost` from `req.body` no longer accepted. Shipping cost is now computed server-side only from a rate table keyed by `shippingMethod`. A negative-value attack can no longer reduce the order total. | `backend/routes/orders.js` |
| S2 | **Cart price tampering closed** — Order items no longer use `item.price` from the cart snapshot. After the stock decrement, `updated.price` (live DB price) is used for every line item. A new `serverSubtotal` replaces all uses of `cart.subtotal` in coupon and total calculations. | `backend/routes/orders.js` |
| S3 | **PayFast ITN postback validation added** — After the MD5 signature check, the raw ITN body is now POSTed back to PayFast's `/eng/query/validate` endpoint. Orders are only processed on a `VALID` response. A `merchant_id` check was also added as a third layer. | `backend/controllers/PayfastController.js` |
| S4 | **NoSQL injection protection** — `express-mongo-sanitize` installed and applied globally. Strips `$` and `.` MongoDB operator keys from `req.body`, `req.params`, and `req.query` on every request. | `backend/server.js` |
| S5 | **PayFast IDOR closed** — `/initiate` and `/verify/:orderId` routes now require `optionalAuth`. Both controllers enforce ownership: authenticated users must own the order; guests must match by session ID or email. Enumerating order IDs no longer leaks customer PII. | `backend/routes/payfast.js`, `backend/controllers/PayfastController.js` |
| S6 | **Rate limiting re-enabled** — `generalLimiter` (100 req/15 min) applied globally; `authLimiter` (20 req/3 hr) applied to `/api/auth`. Brute-force and credential-stuffing attacks are now throttled. | `backend/server.js` |
| S8 | **Trust proxy hardened** — Changed from `true` (trust all hops) to `1` (trust only the immediate Railway load balancer). Clients can no longer spoof `X-Forwarded-For` to bypass rate limits. | `backend/server.js` |

---

### ⚡ Performance

| ID | Fix | File(s) Changed |
|----|-----|-----------------|
| P3 | **Gzip compression added** — `compression` middleware installed and applied as the first middleware in the chain. All API JSON responses are now compressed, reducing transfer size significantly on mobile. | `backend/server.js` |
| P5 | **viewCount write unblocked** — `product.viewCount += 1; await product.save()` (full document save on every page view) replaced with a fire-and-forget `Product.updateOne({ $inc: { viewCount: 1 } })`. The response is no longer blocked by a write, and the endpoint can now be cached. | `backend/routes/products.js` |
| P6 | **Reviews endpoints paginated** — Public reviews: default 20 per page, max 50. Admin all-reviews: default 50 per page, max 100. Both use `Promise.all` for count + data in parallel. Unbounded full-collection scans eliminated. | `backend/routes/reviews.js` |

---

### 🔍 SEO

| ID | Fix | File(s) Changed |
|----|-----|-----------------|
| SEO1 | **Homepage unblocked from Google** — `robots.js` no longer disallows `/home`. `app/page.js` now renders the `HomePage` component directly so content lives at the canonical `/`. Google can now crawl and index the homepage. | `frontend/app/robots.js`, `frontend/app/page.js` |
| SEO3 | **Rejoosh metadata added** — New `app/rejoosh/layout.js` created with full `metadata` export: title, description, keywords, canonical (`/rejoosh`), OpenGraph, and Twitter card. Google will no longer treat this page as a homepage duplicate. | `frontend/app/rejoosh/layout.js` *(new)* |
| SEO4 | **Organization + WebSite JSON-LD added sitewide** — `app/layout.js` now includes `Organization` schema (name, logo, contact, Instagram) and `WebSite` schema with a `SearchAction`. Enables brand knowledge panel and sitelinks search box in Google. | `frontend/app/layout.js` |
| SEO6 | **h1 added to homepage** — A visually hidden `<h1 className="sr-only">` tag added as the first element in `HomePage`. Google and screen readers now have a clear primary heading signal. | `frontend/app/home/page.js` |
| SEO8 | **Sitemap fixed** — Added `/rejoosh` entry. Replaced `new Date()` (changed on every crawl) with static dates for all static pages. Removed empty `/blogs` stub entry (was sending a thin-content signal to Google). | `frontend/app/sitemap.js` |

---

## What Still Needs Doing

These items from `CODE_AUDIT.md` require manual action or larger refactors — they were not auto-fixed.

### 🔴 Do These First

| ID | Task | Notes |
|----|------|-------|
| S3 (partial) | **Delete committed payment test scripts** and rotate credentials | Run: `git rm backend/crack-signature.js backend/find-signature.js backend/simulate-itn-root.js backend/test-signature.js backend/inspect-order-root.js backend/test-signature.js` — then rotate any sandbox merchant key/passphrase that was committed |
| SEO2 | **Add missing OG/Twitter images** | Create `frontend/public/og-image.jpg` and `frontend/public/twitter-image.jpg` at 1200×630px. All social shares currently show a broken preview. |

### 🟠 High Priority

| ID | Task | Notes |
|----|------|-------|
| S7 | **Add `frontend/middleware.js`** for server-side admin auth | Current admin protection is a client-side `useEffect` redirect only. Add a Next.js middleware that checks the session cookie and role before serving admin pages. |
| S11 | **Rate-limit + sanitize review submissions** | `/api/reviews` POST is unauthenticated with no rate limit and no HTML sanitization — spam and stored-XSS risk. |
| S12 | **Atomic coupon usage increment** | Coupon `usedCount` check-then-increment is non-atomic. Re-enable MongoDB transactions or use a `findOneAndUpdate` with an inline `$inc` and a `usedCount: { $lt: usageLimit }` filter condition. |
| S13 | **Sign the shipping webhook** | `POST /api/shipping/webhook` accepts order status updates with no signature check. Add the Bob Go webhook secret validation. |

### 🟡 Medium Priority

| ID | Task | Notes |
|----|------|-------|
| P1/P2 | **Convert product pages to Server Components** | `app/products/page.js` and `app/products/[slug]/page.js` are `'use client'` with `useEffect` fetching. Moving data fetching to the server eliminates the blank-skeleton → client-fetch waterfall and improves both LCP and indexing. |
| P4 | **Implement Redis cache invalidation** | `backend/lib/cache.js` `invalidateCache()` is currently an empty function. Price/stock edits take up to 10 min to appear. Implement SCAN-based prefix invalidation and call it from product/category mutation routes. |
| P7 | **Add missing DB indexes** | Add `orderSchema.index({ guestSessionId: 1 })` and `orderSchema.index({ paymentStatus: 1, createdAt: -1 })` to `backend/models/Order.js` for guest order lookups and analytics aggregations. |
| P8 | **Lazy-load framer-motion and recharts** | Neither is behind `next/dynamic`. Replace simple fade/scale animations with CSS; dynamically import chart components in the admin dashboard. |
| SEO7 | **Server-render product name/description/price** | Currently fetched client-side after hydration, which can delay indexing and create a mismatch between JSON-LD and rendered DOM. |
| SEO9 | **Fix locale to `en-ZA`** | `app/layout.js` uses `lang="en"` and `locale: 'en_US'` for a South-African ZAR store. Change to `en-ZA` / `en_ZA`. |

---

*Fixed items are marked complete in `CODE_AUDIT.md`. Verify in production after deployment.*
