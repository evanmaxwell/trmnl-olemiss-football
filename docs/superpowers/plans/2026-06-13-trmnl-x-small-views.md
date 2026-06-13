# TRMNL X Smaller Views Density Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase information density for Half Horizontal, Half Vertical, and Quadrant views on TRMNL X screens using responsive layouts while maintaining existing styles for TRMNL OG.

**Architecture:** Use Liquid variables (`next_game.opponentRecord`, `next_game.opponentStanding`, `next_game.oleMissStanding`, and the `schedule` array) alongside CSS responsive classes (`lg:hidden`, `hidden lg:flex`, `hidden lg:block`) to dynamically render dense features (matchup stats, upcoming schedule lists, and season summary footers) only on screens `≥ 1024px` width.

**Tech Stack:** Liquid, TRMNL UI Framework v3 Utility Classes.

---

### Task 1: Update Half Horizontal Layout

**Files:**
- Modify: `markup_half_horizontal.html`

- [ ] **Step 1: Edit next game column to include responsive stats**
  In the next game column (around line 35-51) in `markup_half_horizontal.html`, add a block that displays the opponent's stats only on large screens (`hidden lg:flex`):
  ```html
  <!-- Modify next-game column -->
  <div id="next-game" class="column">
    {% assign next_event = schedule[0] %}
    <div class="flex flex--col flex--justify-center h--full">
      <div class="flex flex--row flex--center-y gap--small grow">
        {% if next_event.opposingTeam.images.small %}
          <img class="image image-dither hero-logo" src="{{ next_event.opposingTeam.images.small }}" alt="{{ next_event.opposingTeam.name }} logo" />
        {% endif %}
        <div class="flex flex--col">
          <span class="label label--xsmall text--bold text--uppercase w--fit">Up Next</span>
          <p class="title title--small text--bold mt--1">
            {% if next_event.isHomeGame %}vs{% else %}@{% endif %} {{ next_event.opposingTeam.name }}
          </p>
          <p class="description mt--1">{{ next_event.date }}</p>
          <p class="label label--xsmall label--gray mt--1">{{ next_event.location }}</p>
        </div>
      </div>
      <!-- Opponent Stats (Large screen only) -->
      <div class="hidden lg:flex flex--row flex--center-y mt--2 border--top border--top-10 pt--1">
        <span class="label label--xsmall label--gray text--bold mr--1">
          {% if next_event.opposingTeam.curatedRank.current and next_event.opposingTeam.curatedRank.current != 99 %}#{{ next_event.opposingTeam.curatedRank.current }} {% endif %}
          {{ next_game.opponentRecord | default: '0-0' }} | {{ next_game.opponentStanding | default: 'Conf' }}
        </span>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: Update image selectors in style block**
  Change selector `#next-game img` to `#next-game .hero-logo` in the style block (lines 5-9) and add `hero-logo` class to the images:
  ```html
  <style>
    #next-game, #previous-game {
      margin: auto;
    }
    #next-game .hero-logo, #previous-game img, #no-games img {
      width: 96px;
      height: 96px;
      object-fit: contain;
    }
  </style>
  ```

- [ ] **Step 3: Stage and commit changes**
  ```bash
  git add markup_half_horizontal.html
  git commit -m "feat: add responsive opponent stats to half horizontal next game block"
  ```

---

### Task 2: Update Half Vertical Layout

**Files:**
- Modify: `markup_half_vertical.html`

- [ ] **Step 1: Add upcoming schedule list at the bottom**
  Under the next-game element (around line 43) in `markup_half_vertical.html`, insert the upcoming schedule list block visible only on large screens (`hidden lg:flex`):
  ```html
  <!-- Under #next-game-vert closing div (around line 43) -->
  {% if schedule.size > 1 %}
    <div class="hidden lg:flex flex--col mt--2 border--top border--top-10 pt--2 w--full">
      <span class="label label--small label--underline mb--1">Upcoming Schedule</span>
      <div class="list" data-overflow="true" data-overflow-counter="true" data-overflow-max-cols="1">
        {% for event in schedule offset:1 limit:3 %}
          <div class="item py--1 px--2 mb--1 border--bottom border--bottom-10">
            <div class="flex flex--row flex--space-between flex--center-y w--full">
              <div class="flex flex--col grow">
                <p class="title title--xsmall text--bold">
                  {% if event.isHomeGame %}
                    <span class="text--gray-40 text--bold mr--1">vs</span>
                  {% else %}
                    <span class="text--gray-40 text--bold mr--1">@</span>
                  {% endif %}
                  <span>{{ event.opposingTeam.name }}</span>
                </p>
                <p class="description mt--1">{{ event.date }}</p>
              </div>
              {% if event.opposingTeam.images.small %}
                <img class="image image-dither w--8 h--8" src="{{ event.opposingTeam.images.small }}" alt="{{ event.opposingTeam.name }} logo" />
              {% endif %}
            </div>
          </div>
        {% endfor %}
      </div>
    </div>
  {% endif %}
  ```

- [ ] **Step 2: Stage and commit changes**
  ```bash
  git add markup_half_vertical.html
  git commit -m "feat: add responsive upcoming schedule list to half vertical layout"
  ```

---

### Task 3: Update Quadrant Layout

**Files:**
- Modify: `markup_quadrant.html`

- [ ] **Step 1: Wrap column content in flex columns container**
  Make the root container a column layout `layout layout--col gap--small` and wrap the columns row in a `columns grow` element to make space for the footer (lines 12-51):
  ```html
  <div class="layout layout--col gap--small">
    {% if schedule.size > 0 %}
      <div class="columns grow">
        <!-- previous-game-quad and next-game-quad divs remain unchanged here -->
      </div>
  ```

- [ ] **Step 2: Add season summary footer bar**
  At the bottom of the schedule block (around line 51) in `markup_quadrant.html`, insert the footer:
  ```html
      <!-- Season Summary Footer (TRMNL X only) -->
      <div class="hidden lg:flex flex--row flex--center flex--justify-center gap--medium py--1 border--top border--top-10 w--full">
        <span class="label label--small label--primary">{% if rank != 'NR' %}#{{ rank }} {% endif %}Ole Miss</span>
        <span class="label label--small label--outline text--bold">Record: {{ record }}</span>
        <span class="label label--small label--gray">{{ next_game.oleMissStanding }}</span>
      </div>
    {% endif %}
  </div>
  ```

- [ ] **Step 3: Stage and commit changes**
  ```bash
  git add markup_quadrant.html
  git commit -m "feat: add responsive season summary footer to quadrant layout"
  ```

---

### Task 4: Verify All Templates with Local Test

- [ ] **Step 1: Re-run payload verification**
  Run: `node test_payload.js`
  Expected: Success output showing data matches the spec.
