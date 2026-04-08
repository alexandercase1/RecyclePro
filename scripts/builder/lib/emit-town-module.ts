import type { RecyclingRule, Town } from '../../../RecyclePro/data/types';
import * as fs from 'fs';
import * as path from 'path';

function stripUndefinedDeep<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map(stripUndefinedDeep) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === undefined || v === null) continue;
    out[k] = stripUndefinedDeep(v);
  }
  return out as T;
}

/**
 * Serialize a Town into a module matching existing files (e.g. fairlawn.ts, oradell.ts).
 */
export function emitTownModuleSource(
  town: Town,
  exportNames: { town: string; rules: string },
  rules: RecyclingRule[] = [],
): string {
  const clean = stripUndefinedDeep(town);
  const body = JSON.stringify(clean, null, 2);
  const rulesBody = JSON.stringify(rules, null, 2);

  return `import { Town, RecyclingRule } from '@/data/types';

export const ${exportNames.town}: Town = ${body};

export const ${exportNames.rules}: RecyclingRule[] = ${rulesBody};
`;
}

export function writeTownModuleFile(
  outPath: string,
  town: Town,
  exportNames: { town: string; rules: string },
  rules: RecyclingRule[] = [],
): void {
  const abs = path.resolve(outPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, emitTownModuleSource(town, exportNames, rules), 'utf8');
}
