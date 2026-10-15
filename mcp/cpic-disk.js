// The MCP side of the CPIC tables: the data/cpic files the website ships, read from disk once. The page
// reads the same files through lib/cpic-load.js; both hand the same object to lib/cpic-tables.js.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'cpic');
let db = null;

export function cpicFromDisk() {
  if (db) return db;
  try {
    const read = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
    const manifest = read('manifest.json');
    db = { manifest, strings: read('strings.json') };
    for (const s of manifest.shards || []) db[s.name.replace(/\.json$/, '')] = read(join('shards', s.name));
  } catch {
    db = { manifest: null };
  }
  return db;
}
