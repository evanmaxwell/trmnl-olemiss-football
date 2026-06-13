# Design Spec: TRMNL X Smaller Views Density Updates

**Date**: 2026-06-13
**Topic**: Increase information density for Half Horizontal, Half Vertical, and Quadrant views on TRMNL X displays while preserving the existing layouts on TRMNL OG.

---

## 1. Goal

TRMNL X displays (1040x780 canvas split) render Half Horizontal, Half Vertical, and Quadrant views at higher resolutions than TRMNL OG. We want to dynamically enrich these layouts on TRMNL X using responsive CSS breakpoints (`lg:` classes) to leverage the API-enriched payload properties (opponent stats, standings, rankings) that we implemented in the data layer.

---

## 2. Proposed Changes

### 2.1. Half Horizontal (`markup_half_horizontal.html`)
- **TRMNL OG Layout (Default)**: Keep the 2-column layout (Previous Game on Left, Next Game on Right).
- **TRMNL X Layout (`lg:` classes)**: 
  - Keep the 2-column layout.
  - In the **Next Game** column (Right), display the opponent's AP rank, record, and conference standing underneath the main game info block.
  - Hide this stats summary block on smaller screens using `lg:hidden` or `hidden lg:block`.

### 2.2. Half Vertical (`markup_half_vertical.html`)
- **TRMNL OG Layout (Default)**: Keep the vertical stack showing Previous Game (Top) and Next Game (Bottom).
- **TRMNL X Layout (`lg:` classes)**:
  - Add an **Upcoming Games** list block at the bottom of the layout showing the next 3 games (from `schedule offset:1 limit:3`).
  - The list will use `hidden lg:block` so that it is only visible on large screens, utilizing the extra vertical height (780px vs 480px).

### 2.3. Quadrant (`markup_quadrant.html`)
- **TRMNL OG Layout (Default)**: Keep the extremely compact 2-column layout showing Previous Game (Left) and Next Game (Right) using team abbreviations.
- **TRMNL X Layout (`lg:` classes)**:
  - Add a **Season Summary Footer** bar at the bottom of the layout, displaying:
    - AP Rank (e.g. `#3`)
    - Season Record (e.g. `10-2`)
    - Standings Summary (e.g. `1st in SEC`)
  - Use `hidden lg:flex` on this footer so it is only rendered on TRMNL X.

---

## 3. Verification Plan

### Automated Verification
- Run `node fetch_data.js` and verify that the payload continues to build cleanly.
- Run `node test_payload.js` to assert payload integrity.

### Visual Verification
- Resizing the browser/renderer to `< 1024px` should render the classic layouts for all three views.
- Resizing the browser/renderer to `≥ 1024px` should render:
  - The matchup stats inside the Next Game block in the Half Horizontal view.
  - The upcoming games list at the bottom of the Half Vertical view.
  - The season summary footer bar at the bottom of the Quadrant view.
