# Design Spec: TRMNL X Matchup Stats Comparison

**Date**: 2026-06-13
**Topic**: Increase information density for TRMNL X screensizes while maintaining the existing layout for TRMNL OG.

---

## 1. Goal & Context

TRMNL OG (800x480, 5:3) and TRMNL X (1040x780, 4:3) render the same plugin template, but the TRMNL framework automatically scales the content. This design spec outlines how we can increase the information density on TRMNL X by displaying an enriched **Matchup Stats Comparison** card for the "Up Next" game on the larger display. 

On TRMNL OG, the display will retain its clean, less-dense layout.

---

## 2. Proposed Changes

### 2.1. Data Layer (`fetch_data.js`)

We will modify `fetch_data.js` to fetch additional team-specific endpoints from the ESPN API at build time to populate matchup stats for the next game.

- **Ole Miss Stats**:
  - Fetch `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/145`
  - Extract `standingSummary` (e.g. `"1st in SEC"`).
- **Opponent Stats**:
  - Identify the next uncompleted game's opponent team ID.
  - Fetch `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${opponent_id}`
  - Extract `standingSummary` and `record` (using the first overall record display value).
- **Offseason Safeguard**:
  - If there is no upcoming game (offseason), bypass the additional fetches.

We will write these new fields into the `payload.json` structure:

```json
{
  "next_game": {
    "opponentName": "Louisville Cardinals",
    "opponentRecord": "0-0",
    "opponentStanding": "4th in ACC",
    "oleMissStanding": "1st in SEC",
    "opponentLogo": "..."
  }
}
```

### 2.2. Markup Layer (`markup.html`)

We will update the Liquid template to render a responsive matchup card using `lg:` responsive breakpoints (min-width `1024px`).

- **TRMNL OG Layout (Default)**:
  - Single team logo (opponent).
  - Matchup text (e.g., `vs Louisville`).
  - Upcoming schedule list (capped at 8 items).
- **TRMNL X Layout (`lg:` classes)**:
  - **Side-by-Side Logos**: Show both the Ole Miss logo (available from shared markup or default images) and the opponent logo.
  - **Stats Comparison Table**: Render a grid/table showing:
    - AP Rank (Ole Miss rank vs Opponent rank)
    - Record (Ole Miss record vs Opponent record)
    - Conference Placement (Ole Miss standing vs Opponent standing)
  - **Responsive Hiding**: Use `lg:hidden` on the old layout blocks (single logo, simple text) and `lg:flex`/`lg:grid` on the new matchup card components.

---

## 3. Verification Plan

### Automated Verification
- Run `node fetch_data.js` and verify `payload.json` is generated successfully with:
  - `next_game.opponentRecord`
  - `next_game.opponentStanding`
  - `next_game.oleMissStanding`
- Run JSON validation.

### Visual Verification
- Use `screenshot_markup` or browser layout preview to test the responsive styling.
- Confirm that resizing the browser to `< 1024px` renders the OG style.
- Confirm that resizing to `≥ 1024px` renders the new matchup card.
