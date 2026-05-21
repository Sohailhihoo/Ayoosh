# Ayoosh Online - Code Audit Report

**Date:** 18 May 2026
**Auditor:** Senior Software Developer (Automated Review)
**Project:** Ayoosh Online E-Commerce Platform
**Stack:** Next.js (Frontend) + Express/MongoDB (Backend)

---

## Executive Summary

The Ayoosh Online codebase has solid fundamentals with good project structure, proper use of modern frameworks (Next.js App Router, Zustand, Redis sessions), and correctly implemented payment signature verification. However, the audit identified **5 critical**, **8 major**, and **10+ minor** issues that need attention before the platform handles real customer payments and personal data.

**Overall Rating:** Functional but requires security hardening before production.

---

## Severity Definitions

| Severity | Definition |
|----------|-----------|
| **CRITICAL** | Security vulnerability or data loss risk. Must fix before production. |
| **MAJOR** | Significant bug, performance issue, or bad practice. Fix soon. |
| **MINOR** | Code quality, maintainability, or best practice improvement. |

---

## CRITICAL Issues

### 1. Rate Limiting is Disabled

- **File:** `backend/server.js`, lines 98, 157-158
- **Issue:** Both `generalLimiter` and `authLimiter` are defined but commented out. All endpoints including login, register, password reset, and payment webhooks have zero brute-force protection.
- **Risk:** Brute-force login attacks, account enumeration via password reset, denial-of-service on payment processing.
- **Fix:** Uncomment and apply `authLimiter` to auth routes and `generalLimiter` globally.

### 2. PayFast Routes Lack Authentication

- **File:** `backend/routes/payfast.js`, lines 10, 16
- **Issue:** `POST /api/payfast/initiate` and `GET /api/payfast/verify/:orderId` have no `protect` middleware. Any user can initiate a payment for any order or check any order's payment status by guessing MongoDB ObjectIDs.
- **Risk:** Unauthorized payment initiation, payment status information disclosure (privacy violation).
- **Fix:** Add `protect` middleware to `/initiate` and `/verify/:orderId` routes. The `/notify` webhook must remain unauthenticated (PayFast calls it).

### 3. JWT Tokens Stored in localStorage

- **Files:**
  - `frontend/lib/store.js`, lines 131-133
  - `frontend/lib/api.js`, lines 32-36
- **Issue:** Auth tokens are saved to localStorage as a "fallback" and sent via Authorization headers. This defeats the security of HttpOnly cookies. Any XSS vulnerability allows token theft.
- **Risk:** Session hijacking via cross-site scripting.
- **Fix:** Remove localStorage token storage entirely. Rely exclusively on HttpOnly cookies with `withCredentials: true`.

### 4. CSP Allows Unsafe Script Execution

- **File:** `backend/server.js`, line 40
- **Issue:** Content Security Policy includes `'unsafe-inline'` and overly permissive script sources. This weakens CSP protection against cross-site scripting attacks.
- **Risk:** XSS attacks can bypass Content Security Policy.
- **Fix:** Tighten the `scriptSrc` directive. Use nonce-based CSP for inline scripts where needed.

### 5. No Input Validation on Critical Routes

- **Files:**
  - `backend/routes/auth.js`, line 44 -- Register endpoint accepts email/password with no validation; minimum password length is only 6 characters.
  - `backend/routes/users.js`, line 120 -- `Object.assign(address, req.body)` is a mass assignment vulnerability. Attacker can inject arbitrary fields.
  - `backend/routes/products.js`, line 57 -- User input passed directly to MongoDB `$regex` without escaping. Vulnerable to ReDoS (Regular Expression Denial of Service).
- **Risk:** Weak passwords, NoSQL injection, mass assignment attacks, denial of service.
- **Fix:** Use `express-validator` or `joi` for all input validation. Escape regex input. Whitelist allowed fields for address updates.

---

## MAJOR Issues

### 6. No MongoDB Transactions on Order Creation (Race Condition)

- **File:** `backend/routes/orders.js`, lines 188-213
- **Issue:** Stock checking and decrementing are not atomic. Between checking stock and decrementing, another concurrent order can claim the same inventory, resulting in overselling.
- **Risk:** Selling more items than available in stock.
- **Fix:** Use MongoDB transactions (`session.startTransaction()`) to make stock check and decrement atomic.

### 7. No Error Boundary Components (Frontend)

- **Directory:** `frontend/app/`
- **Issue:** No `error.js` files exist in the app directory. Unhandled React errors crash the entire application with a blank white screen.
- **Risk:** Poor user experience; customers lose their cart/checkout progress.
- **Fix:** Create `app/error.js` and `app/products/[slug]/error.js` with recovery UI.

### 8. Using `<img>` Instead of Next.js `<Image>`

- **Files:**
  - `frontend/components/ProductCard.jsx`, lines 47-51
  - `frontend/components/FeaturedProducts.jsx`, lines 119-124
  - `frontend/components/Navbar.jsx`, line 249
- **Issue:** Standard `<img>` tags are used instead of Next.js `<Image>` component. This misses automatic image optimization, responsive sizing, lazy loading, and WebP conversion.
- **Risk:** Slow page loads, poor Core Web Vitals, worse SEO ranking.
- **Fix:** Replace `<img>` with `next/image` and configure Cloudinary domain in `next.config.mjs`.

### 9. Console Logging in Production Code

- **Files:** 20+ instances across both frontend and backend
- **Key offenders:**
  - `backend/controllers/PayfastController.js`, line 219 -- Logs entire PayFast webhook body (contains payment details)
  - `backend/middleware/auth.js`, lines 13-14, 18, 22 -- Logs session IDs and cookies
  - `frontend/lib/payfast.js`, lines 93-97 -- Logs payment form data and URLs
  - `frontend/lib/api.js`, line 6 -- Logs API URL on every import
- **Risk:** Sensitive data leaked to logs; performance impact.
- **Fix:** Remove debug logs or implement a proper logging framework (winston/pino) with log levels.

### 10. Race Conditions in Zustand Store

- **File:** `frontend/lib/store.js`, lines 60-68
- **Issue:** `addToCart` sets `loading: true`, then calls `fetchCart()` which also sets loading. If called twice rapidly, the loading state becomes unpredictable.
- **Risk:** UI shows incorrect loading state; double-add to cart possible.
- **Fix:** Use a request queue or debounce mechanism. Check loading state before starting new requests.

### 11. Alert() Used for User Errors

- **File:** `frontend/components/NewsletterPopup.jsx`, lines 38, 44
- **Issue:** Browser `alert()` is used for error messages instead of the toast notification system (react-hot-toast) used everywhere else.
- **Risk:** Inconsistent user experience; blocks UI thread.
- **Fix:** Replace `alert()` with `toast.error()`.

### 12. Inconsistent API URL Fallbacks

- **Files:**
  - `frontend/lib/api.js`, line 4 -- Falls back to `http://127.0.0.1:5000/api`
  - `frontend/lib/payfast.js`, line 4 -- Falls back to `http://localhost:5001/api`
  - `frontend/app/sitemap.js`, line 7 -- Falls back to `http://localhost:5001/api`
- **Issue:** Different files use different fallback API URLs with different ports and hostnames.
- **Risk:** API calls fail silently in certain environments.
- **Fix:** Centralize API URL in a single constants file or ensure all files read the same env variable.

### 13. Frontend Packages in Backend Dependencies

- **File:** `backend/package.json`
- **Issue:** `react-hot-toast`, `react-icons`, and `zustand` are listed as backend dependencies. These are React frontend packages.
- **Risk:** Bloated `node_modules`, dependency confusion, slower installs.
- **Fix:** Remove these packages from backend `package.json`.

---

## MINOR Issues

### 14. No Proper Logging Framework
- All files use `console.log`/`console.error` instead of a structured logger like winston or pino.
- Makes log management in production difficult.

### 15. Magic Numbers
- Session expiry `604800` (`backend/routes/auth.js`, line 10)
- Rate limit values hardcoded (`backend/server.js`, lines 74-77)
- PayFast amount tolerance `0.01` (`backend/controllers/PayfastController.js`, line 266)
- Should be extracted to named constants.

### 16. No PropTypes or TypeScript
- No runtime type checking on React component props.
- Makes debugging harder and reduces IDE support.

### 17. Missing React.memo / useCallback
- List components like `ProductCard` and `FeaturedProductCard` re-render unnecessarily.
- Event handlers in `Navbar.jsx` are recreated on every render.

### 18. No Environment Variable Validation on Startup
- `backend/server.js` does not check for required env vars (`PAYFAST_MERCHANT_ID`, `MONGODB_URI`, etc.).
- Server starts but fails silently at runtime when a required variable is missing.

### 19. Inconsistent HTTP Status Codes
- Some "not found" responses return 404, others return 200 with `success: false`.
- Should standardize across all routes.

### 20. No Soft Delete for Orders/Users
- Hard deletes lose audit trail history.
- Important for e-commerce compliance.

### 21. Missing Pagination Validation
- `backend/routes/orders.js`, lines 14, 19 -- `page` and `limit` not validated. Negative page or `limit=99999` possible.

### 22. Unused Dependencies
- `mongoose` imported but only `startSession` used (which is commented out) in `backend/routes/orders.js`

### 23. Accessibility Gaps
- SVG icons inconsistently use `aria-hidden`.
- Filter inputs lack proper fieldset/legend grouping.
- Mobile menu has `role="menu"` but no keyboard navigation.

---

## What's Done Well

| Area | Details |
|------|---------|
| **Password Security** | bcrypt with salt rounds = 12. Properly hashed, never stored in plain text. |
| **Session Management** | Redis-backed sessions with HttpOnly, Secure cookies. Proper SameSite configuration. |
| **Security Headers** | Helmet well configured with HSTS (1 year + preload), X-Frame-Options, X-Content-Type-Options. |
| **PayFast Integration** | Signature generation and ITN verification correctly implemented. Raw body captured for accurate signature verification. |
| **Database Schemas** | Good model design with proper indexing on Product and Order. Schema validation in place. |
| **Project Structure** | Clean separation of models, routes, controllers, middleware, and utilities. |
| **Graceful Shutdown** | Server handles SIGTERM/SIGINT with proper MongoDB connection cleanup. |
| **CORS Configuration** | Flexible with explicit allowed origins. Properly blocks unauthorized origins in production. |
| **Affiliate System** | Well-implemented commission tracking with cookie-based referral codes. |
| **Klaviyo Integration** | Non-blocking email sending that won't break the payment flow on failure. |

---

## Recommended Fix Priority

### Priority 1 -- Before Launch (Quick Wins)

| # | Issue | Estimated Effort |
|---|-------|-----------------|
| 1 | Enable rate limiting | 15 minutes |
| 2 | Add `protect` middleware to PayFast routes | 15 minutes |
| 3 | Remove localStorage token storage | 30 minutes |
| 4 | Tighten CSP scriptSrc directive | 15 minutes |
| 5 | Add input validation to register/login | 1 hour |

### Priority 2 -- First Sprint After Launch

| # | Issue | Estimated Effort |
|---|-------|-----------------|
| 6 | MongoDB transactions for orders | 2 hours |
| 7 | Error boundary components | 1 hour |
| 8 | Replace `<img>` with `next/image` | 2 hours |
| 9 | Remove console.log statements | 1 hour |
| 10 | Fix Zustand race conditions | 1 hour |

### Priority 3 -- Ongoing Improvement

| # | Issue | Estimated Effort |
|---|-------|-----------------|
| 11 | Implement proper logging (winston/pino) | 2 hours |
| 12 | Add TypeScript gradually | Ongoing |
| 13 | Performance optimization (memo, useCallback) | 2 hours |
| 14 | Accessibility improvements | 3 hours |
| 15 | Standardize error responses | 2 hours |

---

## Conclusion

The Ayoosh Online platform has a well-structured codebase with correct payment integration and good use of modern tools. The primary concern is security hardening -- specifically rate limiting, route authentication, and input validation. These are straightforward fixes that should be completed before processing real customer payments.

The frontend would benefit from Next.js Image optimization and error boundaries for resilience. The backend needs proper input validation and transaction handling to prevent edge-case data corruption.

With the Priority 1 fixes applied (approximately 2 hours of work), the platform would be in a reasonable state for a soft launch.

---

*This report was generated through automated code analysis. Manual penetration testing and load testing are recommended before full production deployment.*
