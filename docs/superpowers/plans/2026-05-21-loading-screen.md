# Loading Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cap the branded loading screen to 1s on first visit only, and replace per-navigation blocking screens with a 300ms content fade-in.

**Architecture:** Three focused edits — simplify LoadingScreen to first-visit-only with an 800ms timer, fix the mismatched CSS animations to match, and wrap the page children in LayoutWrapper with a `key={pathname}` div so the fade-in re-triggers on every route change.

**Tech Stack:** Next.js 16 App Router, React, Tailwind CSS v4, vanilla CSS animations

---

### Task 1: Simplify LoadingScreen to first-visit-only

**Files:**
- Modify: `frontend/components/LoadingScreen.jsx`

The current component has two branches: initial load (3s) and route change (2.5s). Remove the route-change branch entirely and drop the timer from 3000ms to 800ms. Also remove the now-unused `pathname` dependency and `previousPathname` ref.

- [ ] **Step 1: Replace the full contents of `LoadingScreen.jsx`**

```jsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { ASSETS } from '@/lib/cloudinary-assets';

/**
 * LoadingScreen Component
 * Shows on the very first visit (per session) for 800ms, then fades out.
 * Does NOT show on subsequent page navigations.
 */
export default function LoadingScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const hasRun = useRef(false);

    useEffect(() => {
        // Strict-mode guard — only run once
        if (hasRun.current) return;
        hasRun.current = true;

        // If this session has already seen the loading screen, skip it
        if (sessionStorage.getItem('siteLoaded')) {
            setIsVisible(false);
            return;
        }

        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('siteLoaded', 'true');
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="loading-screen">
            <div className="loading-spinner">
                <img
                    src={ASSETS.logos.loading}
                    alt=""
                    className="loading-logo"
                />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify in browser — first visit**

Open an incognito window and navigate to `http://localhost:3000`. The loading screen should appear, spin briefly, and dismiss within ~1 second.

- [ ] **Step 3: Verify in browser — return visit**

Reload the same tab (not incognito). The loading screen should not appear at all — content should be immediately visible.

- [ ] **Step 4: Verify in browser — navigation**

Click any nav link (e.g. Products → About). The loading screen should NOT appear. Content should change without a black overlay.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/LoadingScreen.jsx
git commit -m "feat: cap loading screen to 800ms first-visit only, remove route-change overlay"
```

---

### Task 2: Fix CSS animations to match the new 800ms budget

**Files:**
- Modify: `frontend/app/globals.css`

The CSS has `spinTwice` hardcoded to `4s` and `fadeOut` starting at `4s` — both written for the old duration. Update them to match the new 800ms timer, and add a `fadeIn` keyframe for page transitions.

- [ ] **Step 1: Update `.loading-screen` animation**

Find this line in `globals.css`:
```css
animation: fadeOut 0.5s ease-out 4s forwards;
```
Replace with:
```css
animation: fadeOut 0.3s ease-out 0.7s forwards;
```
This starts the fade at 700ms and completes it at 1000ms, landing exactly at the 1s budget.

- [ ] **Step 2: Update `.loading-spinner` animation**

Find this line:
```css
animation: spinTwice 4s ease-in-out forwards;
```
Replace with:
```css
animation: spinTwice 0.8s ease-in-out forwards;
```

- [ ] **Step 3: Add `fadeIn` keyframe**

After the existing `@keyframes fadeOut` block, add:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

- [ ] **Step 4: Verify in browser**

Open incognito, go to `http://localhost:3000`. The logo should spin quickly and the screen should fade out cleanly within 1 second. No abrupt cut — the fade-out should be smooth.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/globals.css
git commit -m "fix: align loading screen CSS animations with 800ms timer"
```

---

### Task 3: Add 300ms page fade-in on navigation

**Files:**
- Modify: `frontend/components/LayoutWrapper.jsx`

Wrap `{children}` with a `<div key={pathname}>` that applies the `fadeIn` animation. The `key` prop forces React to unmount and remount the div on every route change, which re-triggers the CSS animation. `usePathname` is already imported in this file.

- [ ] **Step 1: Wrap children with a keyed fade-in div**

In `LayoutWrapper.jsx`, find:
```jsx
<main className="min-h-screen">
    {children}
</main>
```
Replace with:
```jsx
<main className="min-h-screen">
    <div key={pathname} style={{ animation: 'fadeIn 300ms ease-in' }}>
        {children}
    </div>
</main>
```

- [ ] **Step 2: Verify in browser — page transition**

Navigate between pages (e.g. Home → Products → About). Each page's content should fade in smoothly over ~300ms. No black overlay, no jarring cut.

- [ ] **Step 3: Verify fade-in does not interfere with loading screen**

Open incognito. The loading screen should still show on first visit, then dismiss — and the page content should fade in underneath it as normal.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/LayoutWrapper.jsx
git commit -m "feat: add 300ms fade-in on page navigation via keyed children wrapper"
```

---

### Task 4: Final verification and push

- [ ] **Step 1: Full flow check in incognito**

1. Open incognito → `http://localhost:3000` — loading screen shows, dismisses within 1s
2. Navigate to 3 different pages — each fades in over ~300ms, no black overlay
3. Reload (not incognito) → no loading screen, content appears immediately

- [ ] **Step 2: Push to main**

```bash
git push origin main
```
