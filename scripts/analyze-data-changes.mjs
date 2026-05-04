#!/usr/bin/env node
// scripts/analyze-data-changes.mjs
//
// Compares the previous data folder against the freshly built one and emits
// a Markdown summary suitable for pasting into a pull request body. Zero
// runtime dependencies; uses Node 20 built-ins only.
//
// Usage:
//   node scripts/analyze-data-changes.mjs --previous PREV_DIR --current CUR_DIR > summary.md
//
// In CI the data-refresh workflow runs `git stash` of the new data, restores
// the previous version into a temp directory, runs the script with both
// paths, then sets the result as the PR body.
//
// Datasets covered explicitly:
//   - mpfs (conversion factor, top-N payment changes)
//   - icd10cm (added / removed codes)
//   - hcpcs  (added / removed codes)
//   - nadac  (top-N price changes by absolute and percentage delta)
//   - enforcement / oig-exclusions and medicare-opt-out (added / removed)
//   - any other dataset: counts only (added / removed / unchanged).

import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const args = parseArgs(process.argv.slice(2));
const PREV = args.previous ? resolve(args.previous) : null;
const CUR = args.current ? resolve(args.current) : resolve('data');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--previous') { out.previous = argv[i + 1]; i += 1; }
    else if (a === '--current')  { out.current  = argv[i + 1]; i += 1; }
  }
  return out;
}

function exists(p) { return existsSync(p); }
async function readJson(p) { return JSON.parse(await readFile(p, 'utf8')); }

async function loadDataset(root, dataset, file) {
  const direct = join(root, dataset, file || '');
  if (file && exists(direct)) return readJson(direct);
  // fall back to manifest+shards
  const manifestPath = join(root, dataset, 'manifest.json');
  if (!exists(manifestPath)) return null;
  const m = await readJson(manifestPath);
  const out = [];
  if (m.shards) {
    for (const s of m.shards) {
      // shard may be at root/dataset/shards/<name> or root/dataset/<name>
      let p = join(root, dataset, 'shards', s.name);
      if (!exists(p)) p = join(root, dataset, s.name);
      if (!exists(p)) continue;
      const arr = await readJson(p);
      if (Array.isArray(arr)) for (const r of arr) out.push(r);
    }
  } else if (Array.isArray(m.files)) {
    for (const fn of m.files) {
      const p = join(root, dataset, fn);
      if (!exists(p)) continue;
      const arr = await readJson(p);
      if (Array.isArray(arr)) for (const r of arr) out.push(r);
    }
  }
  return out.length ? out : null;
}

function diffByKey(prev, cur, keyFn) {
  const prevMap = new Map((prev || []).map((r) => [keyFn(r), r]));
  const curMap = new Map((cur || []).map((r) => [keyFn(r), r]));
  const added = [...curMap.keys()].filter((k) => !prevMap.has(k));
  const removed = [...prevMap.keys()].filter((k) => !curMap.has(k));
  return { added, removed, prevMap, curMap };
}

function pct(n) { return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : 'n/a'; }

async function analyzeMpfs(out) {
  const prev = PREV ? await loadDataset(PREV, 'mpfs') : null;
  const cur = await loadDataset(CUR, 'mpfs');
  if (!cur) return;
  out.push('## MPFS');
  // Conversion factor
  const cfPath = join(CUR, 'mpfs', 'conversion-factor.json');
  if (exists(cfPath)) {
    const cf = await readJson(cfPath);
    let prevCf = null;
    if (PREV && exists(join(PREV, 'mpfs', 'conversion-factor.json'))) {
      prevCf = await readJson(join(PREV, 'mpfs', 'conversion-factor.json'));
    }
    if (prevCf && prevCf.conversionFactor !== cf.conversionFactor) {
      const delta = (cf.conversionFactor - prevCf.conversionFactor) / prevCf.conversionFactor;
      out.push(`- Conversion factor changed from ${prevCf.conversionFactor} to ${cf.conversionFactor} (${pct(delta)} change). Effective ${cf.effectiveDate}.`);
    } else {
      out.push(`- Conversion factor: ${cf.conversionFactor} (effective ${cf.effectiveDate}).`);
    }
  }
  if (!prev) { out.push(`- ${cur.length} structural rows.`); return; }
  const { added, removed, prevMap, curMap } = diffByKey(prev, cur, (r) => r.code);
  out.push(`- Codes: +${added.length} added, -${removed.length} removed, ${cur.length} total.`);
  // Top payment changes by total RVU shift.
  const rvuTotal = (r) => (r.workRvu || 0) + (r.peRvuNonFacility || r.peRvuFacility || 0) + (r.mpRvu || 0);
  const changes = [];
  for (const [code, c] of curMap) {
    const p = prevMap.get(code);
    if (!p) continue;
    const delta = rvuTotal(c) - rvuTotal(p);
    if (Math.abs(delta) > 0.01) changes.push({ code, delta });
  }
  changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  if (changes.length) {
    out.push('- Top RVU shifts:');
    for (const ch of changes.slice(0, 10)) out.push(`  - ${ch.code}: total RVU change ${ch.delta.toFixed(3)}`);
  }
}

async function analyzeShardedKey(out, label, dataset, keyFn) {
  const prev = PREV ? await loadDataset(PREV, dataset) : null;
  const cur = await loadDataset(CUR, dataset);
  if (!cur) return;
  out.push(`## ${label}`);
  if (!prev) { out.push(`- ${cur.length} records (no previous version to diff).`); return; }
  const { added, removed } = diffByKey(prev, cur, keyFn);
  out.push(`- +${added.length} added, -${removed.length} removed, ${cur.length} total.`);
  if (added.length) out.push(`- New: ${added.slice(0, 10).join(', ')}${added.length > 10 ? `, ... (${added.length - 10} more)` : ''}`);
  if (removed.length) out.push(`- Removed: ${removed.slice(0, 10).join(', ')}${removed.length > 10 ? `, ... (${removed.length - 10} more)` : ''}`);
}

async function analyzeNadac(out) {
  const prev = PREV ? await loadDataset(PREV, 'nadac', 'nadac.json') : null;
  const cur = await loadDataset(CUR, 'nadac', 'nadac.json');
  if (!cur) return;
  out.push('## NADAC');
  if (!prev) { out.push(`- ${cur.length} drug pricing entries (no previous version to diff).`); return; }
  const { added, removed, prevMap, curMap } = diffByKey(prev, cur, (r) => r.ndc);
  out.push(`- +${added.length} added, -${removed.length} removed, ${cur.length} total.`);
  const changes = [];
  for (const [ndc, c] of curMap) {
    const p = prevMap.get(ndc);
    if (!p) continue;
    if (typeof p.perUnit !== 'number' || typeof c.perUnit !== 'number') continue;
    const abs = c.perUnit - p.perUnit;
    const rel = p.perUnit > 0 ? abs / p.perUnit : 0;
    if (Math.abs(rel) > 0.05) changes.push({ ndc, drug: c.drug, abs, rel });
  }
  changes.sort((a, b) => Math.abs(b.rel) - Math.abs(a.rel));
  if (changes.length) {
    out.push(`- Top price changes (>5% delta):`);
    for (const ch of changes.slice(0, 10)) {
      out.push(`  - ${ch.ndc} ${ch.drug || ''}: ${pct(ch.rel)} (delta $${ch.abs.toFixed(5)} per unit)`);
    }
  }
}

async function analyzeEnforcement(out) {
  for (const file of ['oig-exclusions.json', 'medicare-opt-out.json']) {
    const cur = await loadDataset(CUR, 'enforcement', file);
    if (!cur) continue;
    const prev = PREV ? await loadDataset(PREV, 'enforcement', file) : null;
    out.push(`## ${file === 'oig-exclusions.json' ? 'OIG Exclusions' : 'Medicare Opt-Out'}`);
    if (!prev) { out.push(`- ${cur.length} entries (no previous version to diff).`); continue; }
    const { added, removed } = diffByKey(prev, cur, (r) => r.npi || `${r.lastName},${r.firstName}`);
    out.push(`- +${added.length} added, -${removed.length} removed, ${cur.length} total.`);
  }
}

async function analyzeGeneric(out, dataset) {
  const cur = await loadDataset(CUR, dataset);
  if (!cur) return;
  const prev = PREV ? await loadDataset(PREV, dataset) : null;
  out.push(`## ${dataset}`);
  if (!prev) { out.push(`- ${cur.length} records (no previous version to diff).`); return; }
  out.push(`- ${prev.length} previous, ${cur.length} current (${cur.length - prev.length >= 0 ? '+' : ''}${cur.length - prev.length}).`);
}

async function listDatasets(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (exists(join(root, e.name, 'manifest.json'))) out.push(e.name);
  }
  return out;
}

async function main() {
  const out = [];
  out.push('# Data refresh summary');
  out.push('');
  out.push(`Generated ${new Date().toISOString()}.`);
  if (!PREV) out.push('No previous data folder supplied; reporting current sizes only.');
  out.push('');

  // Dataset-specific analyzers.
  await analyzeMpfs(out);
  await analyzeShardedKey(out, 'ICD-10-CM', 'icd10cm', (r) => r.code);
  await analyzeShardedKey(out, 'HCPCS Level II', 'hcpcs', (r) => r.code);
  await analyzeNadac(out);
  await analyzeEnforcement(out);

  // Anything else gets a generic count-only analysis.
  const HANDLED = new Set(['mpfs', 'icd10cm', 'hcpcs', 'nadac', 'enforcement']);
  const all = await listDatasets(CUR);
  for (const d of all) {
    if (HANDLED.has(d)) continue;
    await analyzeGeneric(out, d);
  }

  out.push('');
  out.push('---');
  out.push('Generated by `scripts/analyze-data-changes.mjs` per spec-v2 section 7.1.');
  process.stdout.write(out.join('\n') + '\n');
}

main().catch((err) => { console.error(err); process.exit(1); });
