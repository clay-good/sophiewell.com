// The page side of the CPIC tables (data/cpic): the manifest, the shards a tool names, and the shared
// string table, loaded once per page. The MCP server reads the same files from disk (mcp/cpic-disk.js).

import { loadManifest, loadShard, loadFile } from './data.js';

const cache = new Map();
const once = (key, fn) => { if (!cache.has(key)) cache.set(key, fn().catch((e) => { cache.delete(key); throw e; })); return cache.get(key); };

// loadCpic(['allele', 'rule', 'gene']) -> { manifest, strings, allele, rule, gene }. Rejects when a file
// does not load; the tools then say the tables did not load.
export async function loadCpic(tables) {
  const [manifest, strings, ...rows] = await Promise.all([
    once('manifest', () => loadManifest('cpic')),
    once('strings', () => loadFile('cpic', 'strings.json')),
    ...tables.map((t) => once(t, () => loadShard('cpic', `${t}.json`))),
  ]);
  return { manifest, strings, ...Object.fromEntries(tables.map((t, i) => [t, rows[i]])) };
}
