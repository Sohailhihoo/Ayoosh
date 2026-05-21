# Unified Review System Design

## Overview

A single review system for the entire Ayoosh site. All reviews (page-level and product-level) go through one model, one approval workflow, and one admin interface. Reviews are tagged to either a page (suncream, sunglasses) or a specific product.

## Data Model

### Unified Review Model (replaces existing Review model)

| Field | Type | Required | Notes |
|---|---|---|---|
| name | String | Yes | Reviewer's display name |
| email | String | Yes | Not shown publicly |
| rating | Number (1-5) | Yes | Star rating |
| title | String | No | Optional short heading |
| review | String | Yes | Review text body |
| page | String | No | "suncream" or "sunglasses"; null for product reviews |
| productId | ObjectId (ref Product) | No | Set for product reviews; null for page reviews |
| status | String (enum) | Yes | "pending", "approved", "rejected". Default: "pending" |
| timestamps | auto | - | createdAt, updatedAt |

**Tagging logic:**
- Page review (e.g. from suncream page): `page: "suncream"`, `productId: null`
- Product review (e.g. from product detail page): `page: null`, `productId: "<id>"`

### Product Model Changes

- **Remove**: embedded `reviews` array and `reviewSchema`
- **Keep**: `averageRating` (Number, default 0) and `reviewCount` (Number, default 0) as cached fields
- **Remove**: `calculateAverageRating()` instance method (replaced by rating sync logic in review routes)

## API Endpoints

### Public

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/reviews` | Submit a review. Body: `{ name, email, rating, title?, review, page?, productId? }`. Created with `status: "pending"`. |
| GET | `/api/reviews?page=suncream` | Get approved reviews for a page. Returns reviews where `status: "approved"` and `page` matches. Excludes email. |
| GET | `/api/reviews?productId=xxx` | Get approved reviews for a product. Returns reviews where `status: "approved"` and `productId` matches. Excludes email. Also returns aggregated `averageRating` and `reviewCount`. |

### Admin (requires auth middleware)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/reviews/all` | Get all reviews with optional status filter. Returns full data including email. |
| PUT | `/api/reviews/:id/approve` | Set status to "approved". If productId exists, recalculate and cache rating on Product. |
| PUT | `/api/reviews/:id/reject` | Set status to "rejected". If productId exists, recalculate and cache rating on Product. |
| DELETE | `/api/reviews/:id` | Delete permanently. If productId exists, recalculate and cache rating on Product. |

## Rating Cache Sync

When a review with a `productId` is approved, rejected, or deleted:

1. Query all reviews where `productId` matches AND `status: "approved"`
2. Calculate average rating and count
3. Update the Product document's `averageRating` and `reviewCount`

This keeps product rating lookups fast (read from Product doc) while maintaining a single review source of truth.

## Frontend Components

### 1. ReviewForm (modify existing)

**File**: `frontend/components/ReviewForm.jsx`

Current form collects name, email, rating, review text. Modifications:
- Add optional `productId` prop
- Add optional `title` field
- When `productId` is set, include it in the POST body (no `page` field)
- When `page` is set, include it in the POST body (no `productId` field)
- Support rendering as a **modal** (for product pages) or **inline** (for category pages)

### 2. ReviewCarousel (new)

**File**: `frontend/components/ReviewCarousel.jsx`

Horizontal carousel displaying approved reviews for a page. Used on suncream and sunglasses pages.

- Fetches reviews via `GET /api/reviews?page=<page>`
- Shows **average rating summary** at top: star visualization + "X.X out of 5" + "(N reviews)"
- Individual review cards show: star rating, reviewer name, title (if present), review text, date
- Swipeable on mobile, arrow navigation on desktop
- Handles empty state: "No reviews yet"

### 3. ProductReviews (new)

**File**: `frontend/components/ProductReviews.jsx`

Review display for the product detail page. Replaces the current inline reviews tab content.

- Fetches reviews via `GET /api/reviews?productId=<id>`
- Shows **average rating summary** at top: star visualization + "X.X out of 5" + "(N reviews)"
- Lists approved reviews: star rating, reviewer name, title, review text, date
- **"Write a Review" button** opens ReviewForm as a modal
- Handles empty state: "No reviews yet. Be the first to review this product!"

### 4. Admin Reviews Page (new)

**File**: `frontend/app/admin/reviews/page.js`

Added as "Reviews" in the existing admin sidebar navigation.

- Table view of all reviews
- **Status filter tabs**: All / Pending / Approved / Rejected
- Each row shows: reviewer name, rating (stars), review snippet, page/product tag, status badge, date
- **Actions per review**: Approve (green), Reject (orange), Delete (red)
- Pending reviews highlighted for attention
- Pending count shown as badge on sidebar "Reviews" link

### 5. Frontend API Updates

**File**: `frontend/lib/api.js`

Update `reviewAPI`:
```
submit(data)         -> POST /api/reviews
getApproved(params)  -> GET /api/reviews (with page or productId query)
getAll(params)       -> GET /api/reviews/all (admin)
approve(id)          -> PUT /api/reviews/:id/approve
reject(id)           -> PUT /api/reviews/:id/reject
delete(id)           -> DELETE /api/reviews/:id
```

## Page Integration

### Suncream Page (`frontend/app/suncream/page.js`)
- Replace current `<ReviewForm />` with `<ReviewCarousel page="suncream" />` to display approved reviews
- Add inline `<ReviewForm page="suncream" />` below the carousel for submissions

### Sunglasses Page (`frontend/app/sunglasses/page.js`)
- Same pattern: `<ReviewCarousel page="sunglasses" />` + `<ReviewForm page="sunglasses" />`

### Product Detail Page (`frontend/app/products/[slug]/page.js`)
- Replace the existing reviews tab content with `<ProductReviews productId={product._id} />`
- ProductReviews includes the "Write a Review" button that opens ReviewForm modal

### Admin Sidebar (`frontend/components/admin/Sidebar.jsx`)
- Add "Reviews" link to `/admin/reviews` in the navigation list

## Files Changed

**Backend (modify):**
- `backend/models/Review.js` — Update schema: add productId, status enum, remove approved boolean
- `backend/models/Product.js` — Remove embedded reviewSchema and reviews array, keep averageRating/reviewCount
- `backend/routes/reviews.js` — Rewrite: add productId support, status field, reject endpoint, rating cache sync, admin auth
- `backend/routes/products.js` — Remove POST /:id/reviews endpoint

**Frontend (modify):**
- `frontend/components/ReviewForm.jsx` — Add productId prop, title field, modal support
- `frontend/app/suncream/page.js` — Add ReviewCarousel, keep ReviewForm
- `frontend/app/sunglasses/page.js` — Add ReviewCarousel, keep ReviewForm
- `frontend/app/products/[slug]/page.js` — Replace reviews tab with ProductReviews component
- `frontend/lib/api.js` — Update reviewAPI methods
- `frontend/components/admin/Sidebar.jsx` — Add Reviews link

**Frontend (new):**
- `frontend/components/ReviewCarousel.jsx` — Carousel for page reviews
- `frontend/components/ProductReviews.jsx` — Product review display + modal trigger
- `frontend/app/admin/reviews/page.js` — Admin review management page
