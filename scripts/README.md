# RecyclePro Data Scraper

Standalone Node.js tool that fetches town DPW websites and generates TypeScript data files for the RecyclePro app.

## Setup

```bash
cd scripts
npm install
cp .env.example .env
# Add your Anthropic API key to .env
```

## Usage

**Scrape a single town:**
```bash
npx ts-node scrape-town.ts --town hackensack
```

**Scrape all towns in the queue:**
```bash
npx ts-node scrape-town.ts --all
```

## Workflow

1. Add a town entry to `towns-to-scrape.json` with its DPW URL
2. Run the scraper — it fetches the page and uses Claude to extract schedule data
3. Review the generated `.ts` file in `../RecyclePro/data/locations/{state}/{county}/towns/`
4. Verify accuracy against the official website
5. Add the export to the county's `towns/index.ts` barrel and add to the `{county}Towns` array

## Output

The scraper writes a `.ts` file with:
- Zone definitions (garbage days, recycling schedule, yard waste)
- Recycling center info (if found)
- Special instructions (if found)
- `streets: []` arrays — populated separately when street-to-zone data is available
- `// TODO` comments marking fields that need manual verification

## Data Strategy

**Phase 1 (this scraper):** Schedule data — which days, which zones, recycling alternation. Always available online.

**Phase 2 (future):** Street-to-zone assignments — which streets belong to each zone. Often not online; may require OPRA requests to the town.

When Phase 2 data is unavailable, the app's zone-selector modal handles it: users manually pick their zone from the list.
