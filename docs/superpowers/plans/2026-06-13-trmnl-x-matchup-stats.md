# TRMNL X Matchup Stats Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase information density on TRMNL X screens by displaying a detailed matchup stats comparison card for the next game, while maintaining the existing clean layout for TRMNL OG.

**Architecture:** Fetch additional team details (standing summary and record) for Ole Miss and the upcoming opponent at build-time in `fetch_data.js`. Integrate these stats into the `payload.json` output, and use CSS responsive media query/utility breakpoints (`lg:`) in `markup.html` to render the matchup card on large screens.

**Tech Stack:** Node.js (standard fetch/fs APIs), Liquid (TRMNL UI Framework v3), CSS (TRMNL responsive breakpoints).

---

### Task 1: Fetch and Integrate Ole Miss Standing Summary

**Files:**
- Modify: `fetch_data.js`

- [ ] **Step 1: Write code to fetch Ole Miss team info**
  Add a fetch call to `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/145` in `fetch_data.js` to retrieve Ole Miss's standing summary.
  Show code block of changes:
  ```javascript
  // Around line 86, add a fetch for Ole Miss team info:
  const oleMissTeamRes = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${OLE_MISS_TEAM_ID}`);
  const oleMissStanding = oleMissTeamRes.team?.standingSummary || "";
  ```

- [ ] **Step 2: Add Ole Miss standing to payload**
  Insert `oleMissStanding` into the top-level payload object:
  ```javascript
  // In the payload construction (around line 302):
  const payload = {
    rank: currentRank,
    season: seasonYear,
    record: seasonRecord,
    standingSummary: oleMissStanding, // Add this
    most_recent_game: mostRecentGame,
    next_game: nextGame ? {
      ...nextGame,
      oleMissStanding: oleMissStanding // Also put it in next_game for convenience
    } : null,
    all_games: processedGames,
    schedule: finalSchedule,
    images: {
      default: "https://a.espncdn.com/i/teamlogos/ncaa/500/145.png"
    },
    name: "Ole Miss Rebels"
  };
  ```

- [ ] **Step 3: Run data fetcher**
  Run: `node fetch_data.js`
  Expected: Command outputs "Successfully generated payload.json" without error.

- [ ] **Step 4: Commit changes**
  ```bash
  git add fetch_data.js
  git commit -m "feat: fetch and integrate Ole Miss standing summary"
  ```

---

### Task 2: Fetch and Integrate Next Opponent Stats

**Files:**
- Modify: `fetch_data.js`

- [ ] **Step 1: Write code to fetch opponent team details**
  Locate the opponent's team ID from the `nextGame` object and fetch details from `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${opponent_id}`:
  ```javascript
  // After nextGame is determined (around line 248):
  let opponentRecord = "0-0";
  let opponentStanding = "";
  if (nextGame) {
    // Find next game event in raw data to get opponent ID
    const nextGameEvent = events.find(e => e.competitions[0].status.type.completed === false);
    if (nextGameEvent) {
      const homeTeam = nextGameEvent.competitions[0].competitors.find(c => c.homeAway === "home");
      const awayTeam = nextGameEvent.competitions[0].competitors.find(c => c.homeAway === "away");
      const opponentCompetitor = homeTeam.id === OLE_MISS_TEAM_ID ? awayTeam : homeTeam;
      const opponentId = opponentCompetitor.id;
      
      try {
        const oppData = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/${opponentId}`);
        opponentStanding = oppData.team?.standingSummary || "";
        opponentRecord = oppData.team?.record?.[0]?.displayValue || "0-0";
      } catch (e) {
        console.error("Failed to fetch opponent details", e);
      }
    }
  }
  ```

- [ ] **Step 2: Append opponent stats to `next_game` in payload**
  ```javascript
  // In the payload construction:
  next_game: nextGame ? {
    ...nextGame,
    oleMissStanding: oleMissStanding,
    opponentRecord: opponentRecord,
    opponentStanding: opponentStanding
  } : null,
  ```

- [ ] **Step 3: Run data fetcher**
  Run: `node fetch_data.js`
  Expected: Payload contains `opponentRecord` and `opponentStanding`.

- [ ] **Step 4: Commit changes**
  ```bash
  git add fetch_data.js
  git commit -m "feat: fetch and integrate opponent record and standing summary"
  ```

---

### Task 3: Create Automated Verification Script

**Files:**
- Create: `test_payload.js`

- [ ] **Step 1: Write verification script**
  Create a file named `test_payload.js` to assert that the expected fields exist in `payload.json`:
  ```javascript
  const fs = require("fs");
  const assert = require("assert");

  try {
    const data = JSON.parse(fs.readFileSync("payload.json", "utf8"));
    
    assert.ok(data.standingSummary !== undefined, "standingSummary should be defined");
    
    if (data.next_game) {
      assert.ok(data.next_game.oleMissStanding !== undefined, "next_game.oleMissStanding should be defined");
      assert.ok(data.next_game.opponentRecord !== undefined, "next_game.opponentRecord should be defined");
      assert.ok(data.next_game.opponentStanding !== undefined, "next_game.opponentStanding should be defined");
      console.log("Next game data:");
      console.log(`- Ole Miss: standing=${data.next_game.oleMissStanding}`);
      console.log(`- Opponent: record=${data.next_game.opponentRecord}, standing=${data.next_game.opponentStanding}`);
    } else {
      console.log("No upcoming game (offseason mode).");
    }
    console.log("All assertions passed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
  ```

- [ ] **Step 2: Run verification script**
  Run: `node test_payload.js`
  Expected: Outputs "All assertions passed successfully!".

- [ ] **Step 3: Commit changes**
  ```bash
  git add test_payload.js
  git commit -m "test: add automated payload verification script"
  ```

---

### Task 4: Implement Responsive Matchup Card styling in Markup

**Files:**
- Modify: `markup.html`

- [ ] **Step 1: Add new styling block**
  Update the style block in `markup.html` (around lines 1-29) to add styles for the stats table and the logos. Ensure we don't use raw CSS for layout since the framework utility classes are preferred. But we need specific classes for the matchup layout:
  ```html
  <style>
    #next-game {
      margin: auto;
    }
    #next-game img, #no-games img {
      width: 38cqw;
      height: 38cqw;
      max-width: 160px;
      max-height: 160px;
      object-fit: contain;
    }
    #upcoming-games {
      margin: auto;
    }
    .upcoming-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
      gap: 0.5rem;
      align-items: center;
    }
    #upcoming-games img {
      width: 11cqw;
      height: 11cqw;
      max-width: 48px;
      max-height: 48px;
      object-fit: contain;
    }
    /* Styles for TRMNL X Matchup stats table */
    .matchup-table {
      border: 1px solid #000;
      border-radius: 4px;
      width: 100%;
      font-size: 11px;
    }
    .matchup-row {
      display: flex;
      border-bottom: 1px solid #eee;
      padding: 4px 0;
    }
    .matchup-row:last-child {
      border-bottom: none;
    }
    .matchup-col {
      flex: 1;
      text-align: center;
    }
    .matchup-col--label {
      flex: 1.2;
      color: #666;
      border-left: 1px solid #eee;
      border-right: 1px solid #eee;
    }
    .matchup-header {
      background: #eee;
      font-weight: bold;
      border-bottom: 1px solid #000;
    }
  </style>
  ```

- [ ] **Step 2: Update the Left Hero Column markup**
  Modify `#next-game` column inside `markup.html` (lines 35-62) to use responsive `lg:` visibility classes.
  - Hide the single logo and standard text on large screens (`lg:hidden`).
  - Add the new matchup card wrapper that is only visible on large screens (`hidden lg:flex`).
  ```html
  <!-- HERO COLUMN (Left - Next Game) -->
  <div id="next-game" class="column">
    {% assign next_event = schedule[0] %}
    
    <!-- TRMNL OG Layout (Default) -->
    <div class="flex flex--col flex--center text--center lg:hidden">
      <span class="label text--uppercase text--bold mb--3">Up Next</span>
      {% if next_event.opposingTeam.images.small %}
        <img class="image image-dither" src="{{ next_event.opposingTeam.images.small }}" alt="{{ next_event.opposingTeam.name }} logo" />
      {% endif %}
      <div class="flex flex--col mt--3">
        <p class="title title--medium text--bold">
          {% if next_event.isHomeGame %}vs{% else %}@{% endif %} {{ next_event.opposingTeam.name }}
        </p>
        <p class="description mt--1">{{ next_event.date }}</p>
        <p class="label label--small label--gray mt--2">{{ next_event.location }}</p>
      </div>
    </div>

    <!-- TRMNL X Layout (Large screen only) -->
    <div class="hidden lg:flex flex--col flex--center text--center">
      <span class="label text--uppercase text--bold mb--2">Up Next Matchup</span>
      
      <!-- Side-by-Side Logos -->
      <div class="flex flex--row flex--center flex--justify-center gap--large mb--2 w--full">
        <!-- Ole Miss Logo -->
        <img class="image image-dither" style="width: 60px; height: 60px;" src="https://a.espncdn.com/i/teamlogos/ncaa/500/145.png" alt="Ole Miss logo" />
        <span class="title title--small text--bold text--gray">VS</span>
        <!-- Opponent Logo -->
        {% if next_event.opposingTeam.images.small %}
          <img class="image image-dither" style="width: 60px; height: 60px;" src="{{ next_event.opposingTeam.images.small }}" alt="{{ next_event.opposingTeam.name }} logo" />
        {% endif %}
      </div>

      <div class="flex flex--col w--full">
        <p class="title title--medium text--bold">
          {% if rank != 'NR' %}#{{ rank }} {% endif %}Ole Miss {% if next_event.isHomeGame %}vs{% else %}@{% endif %} {{ next_event.opposingTeam.name }}
        </p>
        <p class="description mt--1">{{ next_event.date }}</p>
        <p class="label label--small label--gray mt--1">{{ next_event.location }}</p>

        <!-- Matchup Stats Table -->
        <div class="matchup-table mt--3">
          <div class="matchup-row matchup-header py--1">
            <div class="matchup-col">REBELS</div>
            <div class="matchup-col matchup-col--label">STATS</div>
            <div class="matchup-col">{{ next_event.opposingTeam.abbrev | default: 'OPP' }}</div>
          </div>
          <div class="matchup-row">
            <div class="matchup-col text--bold">{% if rank != 'NR' %}#{{ rank }}{% else %}NR{% endif %}</div>
            <div class="matchup-col matchup-col--label">AP Rank</div>
            <div class="matchup-col">{% if next_event.opposingTeam.curatedRank.current and next_event.opposingTeam.curatedRank.current != 99 %}#{{ next_event.opposingTeam.curatedRank.current }}{% else %}NR{% endif %}</div>
          </div>
          <div class="matchup-row">
            <div class="matchup-col text--bold">{{ record | default: '0-0' }}</div>
            <div class="matchup-col matchup-col--label">Record</div>
            <div class="matchup-col">{{ next_game.opponentRecord | default: '0-0' }}</div>
          </div>
          <div class="matchup-row">
            <div class="matchup-col text--bold">{{ next_game.oleMissStanding | default: 'SEC' }}</div>
            <div class="matchup-col matchup-col--label">Standing</div>
            <div class="matchup-col">{{ next_game.opponentStanding | default: 'Conf' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Previous Game Info Row (Shared, but styled) -->
    {% if most_recent_game %}
      <div class="border--top border--top-10 mt--3 pt--3 text--center grow w--full">
        <span class="label label--small label--gray mb--1">Previous Game</span>
        <div class="flex flex--row flex--center flex--justify-center mt--1">
          <span class="label label--bold {% if most_recent_game.outcome == 'W' %}label--success{% else %}label--error{% endif %} mr--3">{{ most_recent_game.outcome }}</span>
          <span class="title title--small text--bold mr--3">{{ most_recent_game.score }}</span>
          <span class="description text--semibold">{% if most_recent_game.homeAway == 'vs' %}vs {% else %}@ {% endif %}{{ most_recent_game.opponentName }}</span>
        </div>
      </div>
    {% endif %}
  </div>
  ```

- [ ] **Step 3: Run data fetcher to rebuild payload**
  Run: `node fetch_data.js`

- [ ] **Step 4: Commit changes**
  ```bash
  git add markup.html
  git commit -m "feat: implement responsive matchup comparison card in markup"
  ```
