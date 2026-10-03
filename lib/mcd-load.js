// The page side of the Medicare Coverage Database articles (data/mcd-articles) for lcd-diagnosis-check:
// the code index, then only the articles that list the code. The MCP adapter reads the same files from
// disk with articlesFor().

import { loadManifest, loadFile, loadShard, datasetStatus } from './data.js';

// articlesFor(index, code, read) -> the article records that list the code; `read(id)` returns one
// article's shard (an array holding it) or a promise of one.
export async function articlesFor(index, code, read) {
  const ids = [...new Set((index[code] || []).map(([id]) => id))];
  const shards = await Promise.all(ids.map((id) => read(id)));
  return shards.flat().filter((a) => a && ids.includes(a.id));
}

// loadArticles(code) -> { articles, edition } or { error } (the page says the data could not be loaded,
// or that it has passed its review date).
export async function loadArticles(code) {
  try {
    const manifest = await loadManifest('mcd-articles');
    if (datasetStatus(manifest).status === 'expired') return { expired: true, edition: manifest.sourceEdition };
    const index = await loadFile('mcd-articles', 'index.json');
    const articles = await articlesFor(index, code, (id) => loadShard('mcd-articles', `${id}.json`));
    return { articles, edition: manifest.sourceEdition };
  } catch {
    return { error: true };
  }
}
