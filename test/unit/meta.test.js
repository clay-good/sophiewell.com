// Unit tests for the per-utility meta registry: every clinical calculator
// has a citation; every code lookup or pricing utility has a source; every
// calculator that the spec-v2 "Test with example" section names has an
// example whose expected output is documented.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { META } from '../../lib/meta.js';

const CLINICAL_CALC_IDS = [
  'unit-converter', 'bmi', 'bsa', 'map', 'anion-gap', 'corrected-calcium',
  'corrected-sodium', 'aa-gradient', 'egfr', 'cockcroft-gault', 'pack-years',
  'due-date', 'qtc', 'pf-ratio',
  'drip-rate', 'weight-dose', 'conc-rate',
  'gcs', 'apgar', 'abg',
];

const SOURCE_REQUIRED = [
  'icd10', 'hcpcs', 'cpt', 'ndc', 'pos-codes', 'modifier-codes',
  'revenue-codes', 'carc', 'rarc',
  'eob-decoder', 'no-surprises',
];

test('META: every clinical calculator has a citation', () => {
  for (const id of CLINICAL_CALC_IDS) {
    assert.ok(META[id], `${id}: meta entry missing`);
    assert.ok(META[id].citation && META[id].citation.length > 20, `${id}: citation missing or too short`);
  }
});

test('META: every clinical calculator has a Test-with-example payload', () => {
  for (const id of CLINICAL_CALC_IDS) {
    const m = META[id];
    assert.ok(m.example, `${id}: example missing`);
    assert.ok(m.example.fields && Object.keys(m.example.fields).length > 0, `${id}: example.fields empty`);
    assert.ok(m.example.expected && m.example.expected.length > 0, `${id}: example.expected missing`);
  }
});

test('META: every code lookup, pricing, and reference utility has a source', () => {
  for (const id of SOURCE_REQUIRED) {
    assert.ok(META[id], `${id}: meta entry missing`);
    assert.ok(META[id].source && META[id].source.dataset && META[id].source.label,
      `${id}: source missing or incomplete`);
  }
});

// Regression: every tool registered on the home grid (data-tool="...") MUST
// have a META entry that exposes either a citation or a non-null source.
// Without one, the inline "tool-meta" block renders empty and the user has
// no way to verify what authority the calculation/lookup is anchored to.
// See spec-v2 §5.1 and §5.2.
test('META: every tool surfaces either a citation or a source stamp', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 150, `home grid is suspiciously small (${ids.length})`);
  const naked = [];
  for (const id of ids) {
    const m = META[id];
    if (!m) { naked.push(`${id} (no META entry)`); continue; }
    const hasCite = typeof m.citation === 'string' && m.citation.length > 0;
    const hasSrc = m.source && m.source.dataset && m.source.label;
    if (!hasCite && !hasSrc) naked.push(id);
  }
  assert.deepEqual(naked, [],
    `Tools with neither citation nor source stamp: ${naked.join(', ')}`);
});

// spec-v9 §4.4 wave-1 (soft mode): track citation- and example-coverage
// across the full home-grid so the audit numbers in spec-v9 §1 become
// CI-visible. These assertions log the gap rather than fail; wave 2 flips
// the citation assertion to hard, wave 3d flips the example assertion.
//
// NO_INPUTS_TILES is the contributor-curated allowlist of tiles that have
// no inputs (pure tables, reference cards). Adding to this set is a
// code-review event.
const NO_INPUTS_TILES = new Set([
  // Filled in during wave 3 as input-less tiles are identified. Empty in
  // wave 1 so the soft-mode log surfaces the full backlog.
]);

test('META v9 coverage (hard): every tile has META[id].citation', async () => {
  // spec-v9 §4.4: wave 2 lands citation backfill for the remaining 34
  // tiles; the assertion flips from soft (log + floor) to hard (every
  // home-grid tile must carry a citation). Source stamps may also be
  // present; this test only checks the citation contract.
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]);
  const missing = [];
  for (const id of ids) {
    const m = META[id];
    if (!m) { missing.push(`${id} (no META entry)`); continue; }
    const hasCite = typeof m.citation === 'string' && m.citation.length > 0;
    if (!hasCite) missing.push(id);
  }
  assert.deepEqual(missing, [],
    `Tiles missing META[id].citation: ${missing.join(', ')}`);
});

test('META v9 coverage (soft): example backfill progress', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]);
  const missing = [];
  for (const id of ids) {
    if (NO_INPUTS_TILES.has(id)) continue;
    const m = META[id];
    if (!m) continue;
    const hasExample = m.example && m.example.fields && Object.keys(m.example.fields).length > 0;
    if (!hasExample) missing.push(id);
  }
  const candidate = ids.filter((id) => !NO_INPUTS_TILES.has(id)).length;
  const have = candidate - missing.length;
  console.log(`[meta v9 soft] example coverage: ${have}/${candidate} input-bearing tiles have META[id].example; missing ${missing.length}.`);
  // Soft assertion: pin the floor at the audit number from spec-v9 §1
  // (51 examples). Regressing below the baseline fails the suite.
  assert.ok(have >= 51, `example coverage regressed: ${have}/${candidate} (baseline 51).`);
});
