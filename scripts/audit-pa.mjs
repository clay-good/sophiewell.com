#!/usr/bin/env node
// spec-v52 §4.10 / §8.2: PA pipeline golden-fixture audit.
//
// §4.10 makes byte-for-byte determinism a hard guarantee: same input bytes
// -> same JSON report bytes. This harness is the CI enforcement of that.
// It runs the full deterministic pipeline (buildBundle -> runEngine ->
// buildJsonReport) against every fixture under test/fixtures/pa-lint/ and
// diffs the produced report against the committed golden in
// test/fixtures/pa-lint/expected/<name>.report.json. CI fails on any drift.
//
// The report is built WITHOUT `generatedAt`, so the output is fully
// byte-stable (no `new Date()` enters the compute path, §4.10) and the
// golden files are reproducible. A rule edit, an extractor change, a
// classifier change, or a staleness-ledger bump that alters the report is
// caught here; the maintainer re-seeds the goldens deliberately with:
//
//   node scripts/audit-pa.mjs --update
//
// Determinism note: this is a snapshot check, not a clock-dependent one.
// SOPHIEWELL_NOW is not consulted -- the goldens must hold for all time.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle, runEngine } from '../lib/pa/engine.js';
import { buildJsonReport } from '../lib/pa/report.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const FIXTURE_DIR = join(ROOT, 'test', 'fixtures', 'pa-lint');
const EXPECTED_DIR = join(FIXTURE_DIR, 'expected');

const update = process.argv.includes('--update');

// Build the byte-stable JSON report for one fixture. A fixture is
// { name, description?, documents: [{name, sha256, kind, text, parseError?}],
//   opts?: { totalBytes } }. Pretty-printed with 2-space indent so the
// committed goldens are human-reviewable in diffs.
function reportFor(fixture) {
  const bundle = buildBundle(fixture.documents || [], fixture.opts || {});
  // spec-v52 §4.5.6: a fixture may carry `disabledSources` (sourceId ->
  // { since, reason }) to exercise the stale-source-disabling path without
  // touching the shipped ledger. Omitted by every fixture but disabled-source.
  const opts = fixture.disabledSources ? { disabledSources: fixture.disabledSources } : undefined;
  const findings = runEngine(bundle, undefined, opts);
  const report = buildJsonReport(bundle, findings); // no generatedAt -> stable
  return JSON.stringify(report, null, 2) + '\n';
}

async function loadFixtures() {
  let entries;
  try {
    entries = await readdir(FIXTURE_DIR);
  } catch (err) {
    console.error('audit-pa: cannot read fixture dir', FIXTURE_DIR, err && err.message ? err.message : err);
    process.exit(2);
  }
  const names = entries.filter((f) => f.endsWith('.json')).sort();
  const fixtures = [];
  for (const file of names) {
    const raw = await readFile(join(FIXTURE_DIR, file), 'utf8');
    const fixture = JSON.parse(raw);
    fixtures.push({ name: fixture.name || basename(file, '.json'), fixture });
  }
  return fixtures;
}

async function main() {
  const fixtures = await loadFixtures();
  if (!fixtures.length) {
    console.error('audit-pa: no fixtures found under test/fixtures/pa-lint/.');
    process.exit(2);
  }

  if (update) {
    await mkdir(EXPECTED_DIR, { recursive: true });
    for (const { name, fixture } of fixtures) {
      await writeFile(join(EXPECTED_DIR, name + '.report.json'), reportFor(fixture), 'utf8');
    }
    console.log(`audit-pa: wrote ${fixtures.length} expected report(s) to test/fixtures/pa-lint/expected/.`);
    process.exit(0);
  }

  const drifted = [];
  const missing = [];
  for (const { name, fixture } of fixtures) {
    const actual = reportFor(fixture);
    const expectedPath = join(EXPECTED_DIR, name + '.report.json');
    let expected;
    try {
      expected = await readFile(expectedPath, 'utf8');
    } catch {
      missing.push(name);
      continue;
    }
    if (actual !== expected) drifted.push(name);
  }

  if (missing.length) {
    for (const n of missing) console.error(`  MISSING expected/${n}.report.json -- run \`node scripts/audit-pa.mjs --update\`.`);
  }
  if (drifted.length) {
    for (const n of drifted) console.error(`  DRIFT ${n}: produced report differs from expected/${n}.report.json.`);
  }
  if (missing.length || drifted.length) {
    console.error(`audit-pa: ${drifted.length} drifted, ${missing.length} missing of ${fixtures.length} fixture(s).`);
    console.error('  If the change is intended, re-seed with `node scripts/audit-pa.mjs --update` and commit the goldens.');
    process.exit(1);
  }

  console.log(`audit-pa: clean (${fixtures.length} fixtures match committed golden reports).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('audit-pa: error', err);
  process.exit(2);
});
