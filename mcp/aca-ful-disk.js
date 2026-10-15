// The MCP side of CMS's federal upper limits file: the data/aca-ful shards the website ships, read from
// disk, for medicaid-ful-check and nadac-margin. The page reads the same files through
// lib/aca-ful-load.js; both end in fulLookup.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fulLookup, shardName } from '../lib/aca-ful-lookup.js';
import { normalizeNdc } from '../lib/nadac-margin.js';

const FUL_DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'aca-ful');

export function fulLookupFromDisk(raw) {
  const ndc = normalizeNdc(raw).ndc;
  if (!ndc) return undefined;
  try {
    const file = join(FUL_DATA, 'shards', shardName(ndc));
    const rows = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
    const read = (name) => JSON.parse(readFileSync(join(FUL_DATA, name), 'utf8'));
    return fulLookup({ ndc, manifest: read('manifest.json'), rows, groups: read('groups.json') });
  } catch {
    return { status: 'unavailable' };
  }
}
