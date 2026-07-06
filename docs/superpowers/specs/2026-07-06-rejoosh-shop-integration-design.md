# Rejoosh Tube — Shop Integration Design

**Goal:** Add the Rejoosh skincare tube as a purchasable product on the shop/products page and rename the "Sun Care" filter label to "Skin Care".

**Approach:** Rename the display label only (backend `productType` value `suncream` is unchanged). The Rejoosh tube is created in the admin panel with `productType: suncream` and automatically appears in the shop.

---

## Scope

### Code changes

| File | Change |
|------|--------|
| `frontend/app/products/page.js` | Rename "Sun Care" → "Skin Care" in the filter button label |
| `frontend/app/suncream/page.js` | Rename page heading / title from "Sun Care" / "Suncream" → "Skin Care" if present |
| Any other frontend file displaying "Sun Care" or "Suncream" as a user-visible label | Same rename |

All changes are display-label only. No backend routes, API params, productType enum values, or database documents are modified.

### Out of scope

- Product detail page — the existing generic `/products/[slug]` page is used as-is
- Accordion content (Ingredients, Key Benefits, How to Use) — will be populated later; shows "Content coming soon" until then
- ProductCard component — already handles all product types; no changes needed
- Backend / API — untouched

---

## Data flow after implementation

```
Admin creates Rejoosh tube (productType: suncream)
  ↓
Shop page /products fetches products with productType=suncream (when "Skin Care" filter active)
  ↓
Rejoosh tube appears as a ProductCard alongside other suncream products
  ↓
Customer clicks card → /products/<rejoosh-slug>
  ↓
Generic product detail page renders with Rejoosh tube data
  ↓
Accordion shows "Content coming soon" (to be filled later)
```

---

## Label rename locations

Search the frontend for these strings and update display text only:

| Current text | New text | Where |
|---|---|---|
| `"Sun Care"` | `"Skin Care"` | Filter button label in shop page |
| `"Suncream"` (if shown to users) | `"Skin Care"` | Any heading or filter UI |

The URL path `/suncream`, the API param `productType=suncream`, and the database value `suncream` remain unchanged.

---

## Your action items (after code is deployed)

1. **Open the admin panel** → Products → Add New Product
2. **Fill in the Rejoosh tube details:**
   - Name, slug, description, price
   - `productType`: **suncream**
   - Upload product images
   - Set status to **active**
3. The product will immediately appear on `/products` under the "Skin Care" filter and at `/products/<your-slug>`
4. When ready, add accordion content (Ingredients, Key Benefits, How to Use) via the product edit page or directly in the detail page component
