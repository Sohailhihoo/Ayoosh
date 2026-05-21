# Loading Screen Redesign

**Date:** 2026-05-21  
**Status:** Approved

## Problem

The current loading screen has two issues:
1. **Too long on first visit** — JS timer fires at 3s but CSS animations run for 4s, so users see a black screen for ~4 seconds before content appears.
2. **Blocks every navigation** — The loading screen re-appears for 2.5s on every route change, making the site feel slow to navigate.

## Goal

- First visit: branded loading moment capped at 1s total.
- Page navigation: no loading screen; content fades in over 300ms instead.

## Changes

### 1. `frontend/components/LoadingScreen.jsx`

- Remove the `if (isRouteChange)` block entirely — the loading screen no longer fires on navigation.
- Change the initial load timer from `3000ms` to `800ms`, leaving 200ms for the CSS fade-out to complete within the 1s budget.
- Keep the `sessionStorage` check so the loading screen only shows on the first visit per session.

### 2. `frontend/app/globals.css`

- Change `spinTwice` animation duration from `4s` to `0.8s` to match the JS timer.
- Change `fadeOut` to start at `0.7s` and complete at `1s`: `animation: fadeOut 0.3s ease-out 0.7s forwards`.
- Add `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }` for use in page transitions.

### 3. `frontend/components/LayoutWrapper.jsx`

- Wrap `{children}` inside `<main>` with `<div key={pathname} style={{ animation: 'fadeIn 300ms ease-in' }}>`.
- The `key={pathname}` causes the div to unmount and remount on every route change, re-triggering the CSS animation automatically.
- No new dependencies or components required.

## Files Changed

| File | Type |
|---|---|
| `frontend/components/LoadingScreen.jsx` | Modify |
| `frontend/app/globals.css` | Modify |
| `frontend/components/LayoutWrapper.jsx` | Modify |

## Out of Scope

- Skeleton screens for individual page sections (separate feature if needed later)
- Any changes to page-level loading states (cart, checkout, etc.)
