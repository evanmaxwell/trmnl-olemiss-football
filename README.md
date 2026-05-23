# TRMNL Ole Miss Football Integration

A TRMNL plugin that displays the Ole Miss Rebels football schedule, rankings, and record using the ESPN API and TRMNL UI Framework v3. 

It is designed to scale dynamically across standard TRMNL e-ink screens (800x480, 5:3) and high-resolution TRMNL X displays (1040x780, 4:3).

---

## Features

- **Responsive Sizing**: Uses CSS Container Queries (`cqw` and `cqh` units) instead of absolute pixel values, ensuring proportional scaling and zero text-clipping across all TRMNL screen models.
- **Dynamic Layout Adaptation**:
  - **In-Season Mode**: Shows a split-column dashboard containing a large "Up Next" matchup hero panel and a vertical upcoming schedule list.
  - **Offseason Mode**: Displays a centered final summary panel with the concluded season year and record.
- **Robust API Fallbacks**: Queries the active regular season schedule (`seasontype=2`) to fetch upcoming games early in the year, with automated fallback logic to retrieve default or previous postseason data.
- **Offline Monochrome Assets**: Embeds the official vector **Ole Miss Script Logo** via base64 encoding in the shared markup layer, ensuring high-contrast rendering without network dependencies.

---

## File Structure

- **`fetch_data.js`**: Node.js script that fetches live schedule data, formats game dates, determines home/away parameters, and writes the structured data to `payload.json`.
- **`markup.html`**: The Framework v3 Liquid/CSS template used to render the interface on TRMNL.
- **`payload.json`**: Reference schema demonstrating the parsed data output format.

---

## Setup & Deployment

### 1. Deploy the Data Parser
The Node.js script `fetch_data.js` needs to run periodically to serve a fresh `payload.json` file. 

#### Option A: GitHub Actions (Automated Hosting)
You can configure a GitHub Action to update the payload automatically and deploy it to GitHub Pages.

1. Create a workflow file at `.github/workflows/update.yml` in your repository:
   ```yaml
   name: Update Schedule Payload
   on:
     schedule:
       - cron: '0 */6 * * *' # Runs every 6 hours
     workflow_dispatch: # Allows manual trigger

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm install
         - run: node fetch_data.js
         - name: Deploy Payload to gh-pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./
             keep_files: true
   ```
2. Enable **GitHub Pages** in your repository settings and set the source branch to `gh-pages`.

#### Option B: Local Running
Run the fetcher locally on your computer:
```bash
node fetch_data.js
```

---

### 2. Configure the TRMNL Console

1. Log in to the **[TRMNL Developer Portal](https://trmnl.com/developer)**.
2. Select **Create New Private Plugin** and input your plugin parameters.
3. **Set Data Strategy**:
   - **Polling**: Set **Strategy** to `Polling`. Enter your public hosted URL (e.g. `https://yourusername.github.io/om-football/payload.json`) in the Polling URL field, and set the Polling Verb to `GET`.
   - **Static**: Set **Strategy** to `Static` and paste the contents of `payload.json` directly into the `Static Data` settings field.

---

### 3. Add Layout Markup

Paste the template codes into your plugin setup:

#### Shared Markup (`markup_shared`)
Under the **Shared Markup** tab in the TRMNL editor, add the vector branding block:
```html
{%- capture svg_logo -%}
<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" height="50.463" width="152.92" version="1.1" viewBox="0 0 152.91656 50.462502"><g><path d="m77.447 1.1094..." fill="#14213d" /></g></svg>
{%- endcapture -%}
```

#### Size Layouts
In the markup editor tabs, copy and apply the layout code:
- **Full Size (800x480)**: Paste the contents of `markup.html`.
- **Half Horizontal (800x240)**: Custom half-row styling.
- **Half Vertical (400x480)**: Vertical split styling.
- **Quadrant (400x240)**: Compact hero match preview styling.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
