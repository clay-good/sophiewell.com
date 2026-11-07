// The MCP side of FDA's interaction examples: the data/fda-ddi-examples files the website ships, read from disk
// once. The page reads the same files through lib/fda-ddi-load.js. spec-v1701.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'fda-ddi-examples');
let db = null;

export function fdaDdiFromDisk() {
  if (db) return db;
  try {
    const read = (rel) => JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
    db = { manifest: read('manifest.json'), drugs: read(join('shards', 'drugs.json')), footnotes: read('footnotes.json'), notice: read('notice.json') };
  } catch {
    db = { manifest: null };
  }
  return db;
}
