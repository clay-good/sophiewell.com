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
  // Wave 3a: pure reference tiles with no fillable form. The decision-tree
  // tile is click-driven (not text-input) and is treated as input-less for
  // the example-coverage contract.
  'abn-explainer',   // Group C: static box-by-box CMS-R-131 reference.
  'idr-eligibility', // Group C: click-through decision tree, no form fields.
  // Wave 3b: pure-table reference tiles in Group F (no inputs the user
  // fills before getting an answer; the tile *is* the table). opioid-mme
  // builds inputs dynamically per row, so there is no static field set
  // to pre-fill from META.
  'peds-dose',         // Group F: pediatric dose reference table.
  'anticoag-reversal', // Group F: anticoagulant reversal reference table.
  'high-alert',        // Group F: ISMP high-alert medication list.
  'iv-to-po',          // Group F: IV-to-PO bioavailability reference table.
  'opioid-mme',        // Group F: dynamic per-row opioid MME calculator.
  // Wave 3c: pure-reference tiles in Group G and Group I that show a
  // static table or scale and take no fillable form. The five PHQ-9-style
  // screeners (phq9, gad7, auditc, cage, epds) auto-fill via the
  // screener's own exampleAnswers (lib/scoring-v4.js + lib/screener.js)
  // rather than via META.example, so they are allowlisted here too.
  'asa',              // Group G: ASA Physical Status reference table.
  'mallampati',       // Group G: Mallampati class reference.
  'mrs',              // Group G: Modified Rankin Scale reference.
  'phq9',             // Group G: screener; pre-fills via PHQ9_CONFIG.exampleAnswers.
  'gad7',             // Group G: screener; pre-fills via GAD7_CONFIG.exampleAnswers.
  'auditc',           // Group G: screener; pre-fills via AUDITC_CONFIG.exampleAnswers.
  'cage',             // Group G: screener; pre-fills via CAGE_CONFIG.exampleAnswers.
  'epds',             // Group G: screener; pre-fills via EPDS_CONFIG.exampleAnswers.
  'adult-arrest-ref', // Group I: AHA adult cardiac-arrest drug table.
  'peds-arrest-ref',  // Group I: AHA pediatric cardiac-arrest drug table.
  'hypothermia',      // Group I: WMS hypothermia staging table.
  'heat-illness',     // Group I: WMS heat-illness staging table.
  'toxidromes',       // Group I: ATSDR/CDC toxidrome reference table.
  'dot-erg',          // Group I: PHMSA Emergency Response Guidebook table.
  'niosh-pg',         // Group I: CDC NIOSH Pocket Guide table.
  'cpr-numeric',      // Group I: AHA CPR/ECC numeric reference.
  'tccc',             // Group I: CoTCCC tourniquet/wound-packing reference.
  'co-cn-antidote',   // Group I: CO/CN antidote reference card.
  // Wave 3d: Group J/K/L/O reference + decision-tree tiles.
  'tetanus',          // Group J: tetanus prophylaxis decision tree.
  'rabies-pep',       // Group J: rabies PEP decision tree.
  'bbp-exposure',     // Group J: bloodborne pathogen exposure decision tree.
  'sti-screening',    // Group J: CDC STI screening reference table.
  'lab-adult',        // Group K: adult lab-range reference table.
  'lab-peds',         // Group K: pediatric lab-range reference table.
  'tdm-levels',       // Group K: therapeutic drug-level reference table.
  'tox-levels',       // Group K: toxicity threshold reference table.
  'cms1500',          // Group L: CMS-1500 field-by-field reference.
  'ub04',             // Group L: UB-04 field-by-field reference.
  'eob-glossary',     // Group L: EOB jargon glossary table.
  'high-alert-card',  // Group O: ISMP high-alert wallet card reference.
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

test('META v9 coverage (hard): every input-bearing tile has META[id].example', async () => {
  // spec-v9 §4.4: wave 3d completes the example backlog. The assertion
  // flips from soft (log + floor at 51) to hard: every home-grid tile
  // not in NO_INPUTS_TILES must carry META[id].example with non-empty
  // fields. Adding to NO_INPUTS_TILES is a code-review event.
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/data-tool="([^"]+)"/g)].map((m) => m[1]);
  const missing = [];
  for (const id of ids) {
    if (NO_INPUTS_TILES.has(id)) continue;
    const m = META[id];
    if (!m) { missing.push(`${id} (no META entry)`); continue; }
    const hasExample = m.example && m.example.fields && Object.keys(m.example.fields).length > 0;
    if (!hasExample) missing.push(id);
  }
  assert.deepEqual(missing, [],
    `Tiles missing META[id].example (or add to NO_INPUTS_TILES with rationale): ${missing.join(', ')}`);
});
