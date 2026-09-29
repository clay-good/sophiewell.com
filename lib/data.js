// Data loader. Same-origin fetches against the static data folder.
// Caches per-URL promises so repeated reads are cheap.

import { todayUtc, parseDate, diffDays } from './pa/date.js';

const cache = new Map();

async function fetchJsonOnce(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`Fetch ${path} failed: ${r.status}`);
  // Cloudflare's SPA fallback returns index.html (200, text/html) for missing
  // paths, so a 200 status alone isn't enough — verify content-type before
  // parsing. JSON dataset files must be served as application/json.
  const ct = r.headers.get('content-type') || '';
  if (!/json/i.test(ct)) throw new Error(`Fetch ${path} returned non-JSON (${ct || 'unknown'})`);
  return r.json();
}

export async function fetchJson(path) {
  if (!cache.has(path)) {
    const p = fetchJsonOnce(path);
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return cache.get(path);
}

export async function loadManifest(dataset) {
  return fetchJson(`data/${dataset}/manifest.json`);
}

// Per-dataset shard-layout memo. Manifests carry an explicit `shardLayout`
// field ("root" | "shards"); we cache the resolved value to avoid re-reading
// the manifest on every shard fetch.
const layoutMemo = new Map();

async function shardLayoutFor(dataset) {
  if (layoutMemo.has(dataset)) return layoutMemo.get(dataset);
  const m = await loadManifest(dataset);
  const layout = m.shardLayout === 'shards' ? 'shards' : 'root';
  layoutMemo.set(dataset, layout);
  return layout;
}

export async function loadShard(dataset, shardName) {
  if (shardName.includes('/')) return fetchJson(`data/${dataset}/${shardName}`);
  const layout = await shardLayoutFor(dataset);
  const base = layout === 'shards' ? `data/${dataset}/shards` : `data/${dataset}`;
  return fetchJson(`${base}/${shardName}`);
}

export async function loadAllShards(dataset) {
  const manifest = await loadManifest(dataset);
  const layout = manifest.shardLayout === 'shards' ? 'shards' : 'root';
  layoutMemo.set(dataset, layout);
  const base = layout === 'shards' ? `data/${dataset}/shards` : `data/${dataset}`;
  const shards = manifest.shards || [];
  const groups = await Promise.all(shards.map((s) =>
    s.name.includes('/') ? fetchJson(`data/${dataset}/${s.name}`) : fetchJson(`${base}/${s.name}`),
  ));
  return [].concat(...groups);
}

export async function loadFile(dataset, file) {
  return fetchJson(`data/${dataset}/${file}`);
}

export function clearCache() {
  cache.clear();
}

// --- Freshness at run time (spec-v1614 §4, spec-v1622 step 3) --------------
//
// datasetStatus(manifest, now) -> { status, edition, checkedOn, expiresOn,
// coverage, note }. `status` is one of:
//   sample   hand-written example rows; never answers about a reader's input
//   expired  past expiresOn; a tool asks for the value instead of answering
//   due      a newer edition was expected more than 30 days ago (only data a
//            builder fetches carries nextExpected; curated data is never due)
//   current  everything else
// `now` is a Date (or anything lib/pa/date.js parses); the SOPHIEWELL_NOW pin
// applies when it is omitted, so tests are deterministic. It runs on the
// reader's clock, so an offline reader past expiresOn gets `expired` too.

const DUE_GRACE_DAYS = 30;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => {
  const d = parseDate(iso);
  return d ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}` : '';
};

export function datasetStatus(manifest, now) {
  const m = manifest || {};
  const today = todayUtc(now);
  const checkedOn = m.fetchedAt || m.curatedAt || null;
  const base = { edition: m.sourceEdition || null, checkedOn, expiresOn: m.expiresOn || null, coverage: m.coverage || null, note: m.coverageNote || null };
  if (m.coverage === 'sample') return { status: 'sample', ...base };
  const expires = parseDate(m.expiresOn);
  // A manifest that cannot say when it lapses is treated as lapsed: fail closed.
  if (!expires || diffDays(today, expires) > 0) return { status: 'expired', ...base };
  const next = parseDate(m.nextExpected);
  if (next && diffDays(today, next) > DUE_GRACE_DAYS) return { status: 'due', ...base };
  return { status: 'current', ...base };
}

export const EXPIRED_TEXT = 'This data has passed its review date.';

// stampDetail(manifest, status) -> the stamp without the source's name, for a
// view that already prints the name (as a link) in front of it.
export function stampDetail(manifest, status) {
  const m = manifest || {};
  const s = status || datasetStatus(m);
  if (s.status === 'sample') return 'Sample data for examples only.';
  const edition = m.sourceEdition && m.sourceEdition !== 'unversioned' ? m.sourceEdition : null;
  let text;
  if (m.fetchedAt) {
    const eff = m.effectiveFrom ? ` (effective ${longDate(m.effectiveFrom)})` : '';
    text = `${edition ? `${edition}${eff}. ` : ''}Checked ${longDate(m.fetchedAt)}.`;
  } else {
    text = `${edition ? `${edition}. ` : ''}Curated by hand; checked by a person ${longDate(m.curatedAt)}.`;
  }
  return tail(text, s, edition);
}

function tail(text, s, edition) {
  if (s.status === 'due' && edition) return `${text} A newer edition is expected. This uses ${edition}.`;
  if (s.status === 'expired') return `${text} ${EXPIRED_TEXT}`;
  return text;
}

// stampText(manifest, status, label) -> the one sentence every view prints
// under data it read. `label` is the view's own name for the source; the
// manifest's agency stands in when there is none.
export function stampText(manifest, status, label) {
  const m = manifest || {};
  const s = status || datasetStatus(m);
  if (s.status === 'sample') return 'Sample data for examples only.';
  const name = label || m.label || m.agency || m.dataset || 'Bundled data';
  const edition = m.sourceEdition && m.sourceEdition !== 'unversioned' ? m.sourceEdition : null;
  let text;
  if (m.fetchedAt) {
    const eff = m.effectiveFrom ? `, effective ${longDate(m.effectiveFrom)}` : '';
    text = `${name}${edition ? `, ${edition}` : ''}${eff}. Checked ${longDate(m.fetchedAt)}.`;
  } else {
    text = `Curated from ${name}${edition ? ` (${edition})` : ''}. Checked by a person ${longDate(m.curatedAt)}.`;
  }
  return tail(text, s, edition);
}
