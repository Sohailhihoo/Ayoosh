# Ayoosh Online — Code Audit

**Date:** 2026-06-16
**Scope:** Next.js 16 frontend + Express/MongoDB backend (PayFast/PayGate payments, JWT/cookie auth, admin panel, reviews, newsletter, file uploads)
**Goals:** Security · Speed · SEO

Severity legend: 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low

> The highest-severity items below were verified directly against the source. Fix 🔴 items before anything else.

---

## Recommended order of attack

1. **Payment fraud (Security 🔴 1–3)** — real money at risk, do first.
2. **Homepage indexing (SEO 🔴)** — site is effectively invisible on Google right now; ~30-min fix.
3. **Re-enable rate limiting + auth on PayFast routes** — quick, high value.
4. **NoSQL sanitize + add `compression`** — both ~1-line wins.
5. **Server Components migration + Redis cache invalidation** — bigger, schedule deliberately.

---

## 🔒 Security

### 🔴 CRITICAL

#### S1. Order total trusts client-supplied `shippingCost`
- **File:** `backend/routes/orders.js:144`
- **Problem:** `shippingCost` is read from `req.body` with only a `Number.isFinite` check — no lower bound. The PayFast ITN amount-check recomputes the expected total from the same tampered order record, so the fraud check passes.
- **Exploit:** `POST /api/orders` with `shippingCost: -99999` → total drops to ~zero → pay that → order marked paid.
- **Fix:** Compute shipping server-side from the chosen method/destination (use the existing `/api/shipping/rates`). Reject negative values. Never accept `shippingCost` from the body.

#### S2. Order prices come from the stored cart snapshot, never re-validated against the live catalog
- **Files:** `backend/routes/orders.js`, `backend/controllers/PayfastController.js`
- **Problem:** The order total is built from `cart.items[].price`. The ITN amount validation is circular — it compares the paid amount against the same snapshot the client influenced, not against live `Product.price`.
- **Fix:** Re-fetch each product and recompute the authoritative total at order creation **and** at ITN time.

#### S3. PayFast ITN webhook is not validated as genuine
- **Files:** `backend/routes/payfast.js:13`, `backend/controllers/PayfastController.js` (`handleITN`)
- **Problem:** `/notify` has no auth, no PayFast server-to-server postback validation, and no `merchant_id` / source-IP check — only an MD5 signature. A working forgery toolkit is committed to git: `crack-signature.js`, `find-signature.js`, `simulate-itn-root.js`, `test-signature.js`, `inspect-order-root.js` (all verified tracked), reportedly with hardcoded sandbox merchant credentials.
- **Exploit:** Forge a signed ITN with `payment_status=COMPLETE` → order flips to paid, affiliate commission paid, confirmation email sent — with no real payment.
- **Fix:**
  1. Add PayFast postback validation (POST data back to `https://www.payfast.co.za/eng/query/validate`, require `VALID`).
  2. Validate `merchant_id` matches your configured ID.
  3. Restrict `/notify` to PayFast's published source IP ranges.
  4. `git rm` all loose `*-signature.js` / `simulate-itn-*.js` / `inspect-order-*.js` scripts and rotate any committed keys/passphrase.

#### S4. NoSQL injection on auth & cart endpoints
- **Files:** `backend/routes/auth.js` (forgot-password), cart merge
- **Problem:** Unsanitized objects flow into Mongo queries. `POST /api/auth/forgot-password` with `{"email":{"$gt":""}}` matches an arbitrary user and sets a reset token on an account you don't own.
- **Fix:** Add `express-mongo-sanitize` globally + cast inputs to `String` and reject non-string values.

### 🟠 HIGH

| ID | Finding | File | Fix |
|----|---------|------|-----|
| S5 | `/initiate` & `/verify/:orderId` unauthenticated (IDOR) — enumerating order IDs leaks other customers' PII (name/email/phone/items) | `backend/routes/payfast.js:10,16` | Require auth + ownership check |
| S6 | Rate limiting entirely disabled — no brute-force protection on login | `backend/server.js:98,157` (both commented out) | Uncomment `authLimiter` on `/api/auth` and `generalLimiter` globally |
| S7 | Admin auth is client-side only (useEffect redirect); bypassable with JS disabled | `frontend/app/admin/layout.js` | Add `frontend/middleware.js` server-side role check (backend routes are already protected) |
| S8 | Mass assignment — whole `req.body` written to models | `products.js:238`, `categories.js:158`, `users.js:120` | Whitelist allowed fields |

### 🟡 MEDIUM

- **S9.** `trust proxy = true` (`server.js:33`) lets clients spoof `X-Forwarded-For` (defeats rate limits once re-enabled) → set to `1`.
- **S10.** Verbose auth logging leaks session IDs + emails (`middleware/auth.js`).
- **S11.** Review submission is unauthenticated, no rate limit, no HTML sanitization → spam / stored-XSS risk if rendered as HTML.
- **S12.** Coupon `usedCount` increment is non-atomic (transactions commented out) → usage limits can be exceeded under concurrency.
- **S13.** Shipping webhook (`shipping.js:96`) is unsigned → anyone can mark orders shipped/delivered.

### ✅ Already good
`.env` is gitignored · no fallback JWT secrets · bcrypt cost 12 · order-ownership IDOR handled correctly · admin API routes consistently use `protect` + `authorize('admin')`.

---

## ⚡ Speed

### 🔴 Highest-leverage

- **P1. Entire storefront is `'use client'` + `useEffect` fetching** (home, product list, product detail). Users get: skeleton → JS → hydrate → API round-trip → content. React Query is installed but unused; navigating back refetches everything.
  → Convert listing/detail/home to **Server Components** (Next 16 / React 19).
- **P2. Product detail = request waterfall** — `frontend/app/products/[slug]/page.js:218` awaits the product, then *sequentially* calls the heavy `/products` list just for 4 related items (a dedicated `/related` endpoint already exists).
  → `Promise.all` + use the `/related` endpoint.
- **P3. No gzip/brotli on the backend** — `compression` isn't even a dependency. One line, big mobile win.
  → `app.use(require('compression')())` early in the middleware chain.
- **P4. Redis cache invalidation is a no-op** — `backend/lib/cache.js:87` is an empty function and is never called from mutation routes, so price/stock edits take 2–10 min to appear.
  → Implement SCAN-based invalidation and call it from product/category create/update/delete.

### 🟡 Medium

- **P5.** `GET /products/:id` runs `viewCount++; product.save()` on **every** read (`products.js:213`) — a write on the hottest read path that also blocks caching. → fire-and-forget `Product.updateOne({_id},{$inc:{viewCount:1}})`.
- **P6.** `/api/reviews` is unbounded (no pagination/limit) and recomputes averages in JS though `Product.averageRating` is already cached. → paginate + use cached values.
- **P7.** Missing indexes: `Order.guestSessionId`, `Order.{paymentStatus, createdAt}` (analytics aggregations scan the collection).
- **P8.** `framer-motion` (16 components) and `recharts` (admin) are loaded eagerly — no `next/dynamic` usage anywhere. → dynamic-import below-the-fold/admin-only heavy components; consider `experimental.optimizePackageImports`.

### ⚪ Low

- **P9.** Review images use raw `<img>` instead of `next/image` (Cloudinary URLs already whitelisted) → AVIF/WebP + lazy loading.

---

## 🔍 SEO

### 🔴 CRITICAL — homepage is currently unindexable

**SEO1.** `frontend/app/page.js` redirects `/` → `/home`, but `frontend/app/robots.js:7` **disallows `/home`**. The root is just a redirect to a blocked URL, so Google cannot see your homepage content at all. (Verified.)
→ Move `app/home/page.js` content into `app/page.js`, delete `/home`, and remove `/home` from the robots disallow list. The root layout already sets `canonical: '/'`.

### 🟠 HIGH

- **SEO2.** OG/Twitter images referenced but don't exist — `layout.js:59,72` point to `/og-image.jpg` & `/twitter-image.jpg`, neither in `public/`. Every social share = broken preview. → Add 1200×630 images (or point to a real Cloudinary asset).
- **SEO3.** `/rejoosh` has **zero metadata** — it's `'use client'` with no `layout.js`, so no title/description/canonical/OG; Google may treat it as a homepage duplicate. Also missing from the sitemap. → Add `app/rejoosh/layout.js` with metadata + Product JSON-LD; add `/rejoosh` to `sitemap.js`.
- **SEO4.** No Organization / WebSite JSON-LD sitewide (only Product schema exists) → no brand knowledge panel / logo in SERP. → Add to root layout.
- **SEO5.** `/blogs` is an empty stub ("coming soon") but is submitted in the sitemap → thin-content signal. → Build real posts (`app/blogs/[slug]/` + Article schema) or noindex/remove from sitemap until content exists.

### 🟡 Medium

- **SEO6.** Homepage and `/rejoosh` have **no `<h1>`** (only `<h2>`s / image alts). → Add one descriptive `<h1>` per page.
- **SEO7.** Critical content is client-rendered → slower indexing; JSON-LD price/availability may mismatch the rendered DOM. → Server-render product name/description/price.
- **SEO8.** Sitemap uses `lastModified: new Date()` on every static page → devalues the lastmod signal. Use real timestamps.
- **SEO9.** `lang="en"` / `locale: 'en_US'` for a ZAR South-African store → use `en-ZA` / `en_ZA`.

### ⚪ Low

- **SEO10.** AggregateRating uses `reviewCount: data.reviewCount || 1` (`products/[slug]/layout.js:83`) — defaulting to 1 risks a Google rich-results policy flag. Only emit when there's a genuine count.
- **SEO11.** No BreadcrumbList JSON-LD though a visual breadcrumb exists (`products/[slug]/page.js:288`).
- **SEO12.** Empty `verification` block in `layout.js:86`.

### ✅ Already good
www → non-www redirect and `noindex` on cart/checkout/login/register/order-confirmation are correct.

---

*Generated from a three-track review (security, performance, SEO). File:line references reflect the state of the repo on the audit date; re-verify before acting if the code has moved.*
