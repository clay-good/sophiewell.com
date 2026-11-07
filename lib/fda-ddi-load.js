// The page side of FDA's interaction examples (data/fda-ddi-examples): the manifest, the drugs shard, the
// footnotes and the not-comprehensive sentence, loaded once per page. The MCP server reads the same files from
// disk (mcp/fda-ddi-disk.js). spec-v1701.

import { loadManifest, loadShard, loadFile } from './data.js';

let pending = null;

// loadFdaDdi() -> { manifest, drugs, footnotes, notice }. Rejects when a file does not load; the tool then says so.
export function loadFdaDdi() {
  if (!pending) {
    pending = Promise.all([
      loadManifest('fda-ddi-examples'),
      loadShard('fda-ddi-examples', 'drugs.json'),
      loadFile('fda-ddi-examples', 'footnotes.json'),
      loadFile('fda-ddi-examples', 'notice.json'),
    ]).then(([manifest, drugs, footnotes, notice]) => ({ manifest, drugs, footnotes, notice }))
      .catch((e) => { pending = null; throw e; });
  }
  return pending;
}
