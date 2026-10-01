// The page side of NADAC for pharmacy-spread-check: load only the labeler shards a set of claims needs.
// The manifest's shard list is read first, so a shard that fails to load is "unavailable", never "not in
// NADAC". The MCP adapter reads the same files from disk and assembles them with the same nadacFrom.

import { loadManifest, loadFile, loadShard } from './data.js';
import { shardName } from './nadac-margin.js';
import { nadacFrom } from './pharmacy-spread-check.js';

export async function loadNadac(labelers) {
  let manifest;
  let week;
  try {
    [manifest, week] = await Promise.all([loadManifest('nadac'), loadFile('nadac', 'week.json')]);
  } catch {
    return { status: 'unavailable' };
  }
  const listed = new Set((manifest.shards || []).map((s) => s.name));
  const wanted = labelers.filter((lab) => listed.has(shardName(lab)));
  const got = await Promise.allSettled(wanted.map((lab) => loadShard('nadac', shardName(lab))));
  const shards = new Map(wanted.map((lab, i) => [lab, got[i].status === 'fulfilled' ? got[i].value : null]));
  return nadacFrom(manifest, week, labelers, shards);
}
