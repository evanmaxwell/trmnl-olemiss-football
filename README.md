# TRMNL Ole Miss Football Plugin

This plugin displays the Ole Miss Rebels football schedule, recent scores, and the upcoming game. It uses the TRMNL Framework v2.

## Setup Instructions

1. **Host the Data script**
   The `fetch_data.js` script fetches data from the ESPN API and formats it into `payload.json`. You must run this script periodically (e.g., using a CRON job, a GitHub Action, or hosted on Render/Vercel) to serve the `payload.json` on a public URL.

2. **Create Plugin in TRMNL**
   - Go to [TRMNL Developer Dashboard](https://trmnl.com/developer).
   - Create a new Private Plugin.
   - Choose **Polling** strategy.
   - Paste the URL to your hosted `payload.json` in the Polling URL field.
   - Set polling frequency (e.g., every 6 hours or daily, as game schedule doesn't change by the minute, though polling during a game might be useful if you modify the script to fetch live scores).

3. **Configure Markup**
   - Copy the contents of `markup.html` and paste it into the **Markup** section of your plugin setup.

4. **Add Custom Variables**
   - Go to the Variables section of your plugin in TRMNL.
   - Add a custom variable with the key `view_mode`.
   - Set the default value to either:
     - `dashboard` to see the "Recent Game" and "Up Next" summary view.
     - `schedule` to see the full season calendar.

5. **Install on Device**
   Add the plugin to your TRMNL device timeline! You can install it twice—once with `view_mode` set to `dashboard` and another with `view_mode` set to `schedule`!
