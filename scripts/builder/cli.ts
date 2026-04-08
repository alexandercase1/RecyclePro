/**
 * Town data tooling: build typed town modules from JSON + optional saved HTML tables.
 *
 * Usage:
 *   npx tsx scripts/scrapers/cli.ts build <input.json> <out.ts> <ExportName>
 *     Example: npx tsx scripts/scrapers/cli.ts build ./scripts/scrapers/examples/sample-town-input.json ./out/gen.ts RiverEdge riverEdgeRules
 *
 *   npx tsx scripts/scrapers/cli.ts fetch <url> <out.html>
 *     Save a municipality page locally, then point zone.html.file at it in your JSON.
 */

import * as fs from 'fs';
import * as path from 'path';
import { writeTownModuleFile } from './lib/emit-town-module';
import {
  parseBuildInputJson,
  townFromBuildInput,
} from './lib/build-input';

function rulesNameFromTownExport(exportName: string): string {
  return `${exportName}Rules`;
}

async function fetchHtml(url: string, outFile: string): Promise<void> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'RecycleProTownScraper/1.0 (contact: local dev; educational institutional use)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  const abs = path.resolve(outFile);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, html, 'utf8');
  console.log(`Wrote ${abs} (${html.length} bytes)`);
}

function cmdBuild(
  jsonPath: string,
  outTsPath: string,
  townExport: string,
  rulesExport?: string,
): void {
  const raw = fs.readFileSync(path.resolve(jsonPath), 'utf8');
  const input = parseBuildInputJson(raw);
  const town = townFromBuildInput(input);
  const rulesName = rulesExport ?? rulesNameFromTownExport(townExport);
  writeTownModuleFile(path.resolve(outTsPath), town, {
    town: townExport,
    rules: rulesName,
  });
  console.log(`Wrote ${path.resolve(outTsPath)}`);
}

function printHelp(): void {
  console.log(`RecyclePro town builder

Commands:
  build <input.json> <out.ts> <TownExportName> [RulesExportName]
  fetch <url> <out.html>

Build JSON shape (see scripts/scrapers/examples/sample-town-input.json):
  — Top-level: id, name, state, county, zones[], optional recyclingCenter, specialInstructions
  — Each zone: id, name, schedule (same shape as app), plus one of:
      streets[]          — final Street objects
      streetLines[]      — "Oak Ave" or "Oak Ave 12-99"
      html: { file, rowSelector, columnIndex, skipRows? } — scrape from saved page

Workflow:
  1) npx tsx scripts/scrapers/cli.ts fetch "https://..." ./scripts/scrapers/cache/page.html
  2) Open page.html in DevTools, find a selector for street rows; put in JSON per zone
  3) npx tsx scripts/scrapers/cli.ts build my-town.json ./data/locations/.../mytown.ts myTown
  4) Register the town in county index + rules index (see ADDING_LOCATIONS.md)
`);
}

async function main(): Promise<void> {
  const [, , command, ...rest] = process.argv;

  if (!command || command === 'help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  if (command === 'fetch') {
    const [url, out] = rest;
    if (!url || !out) {
      console.error('Usage: fetch <url> <out.html>');
      process.exit(1);
    }
    await fetchHtml(url, out);
    return;
  }

  if (command === 'build') {
    const [jsonPath, outTs, exportName, rulesName] = rest;
    if (!jsonPath || !outTs || !exportName) {
      console.error(
        'Usage: build <input.json> <out.ts> <TownExportName> [RulesExportName]',
      );
      process.exit(1);
    }
    cmdBuild(jsonPath, outTs, exportName, rulesName);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
