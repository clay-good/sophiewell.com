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
  'revenue-codes', 'carc', 'rarc', 'ncci', 'mue', 'lcd',
  'mpfs', 'nadac', 'hospital-prices',
  'eob-decoder', 'no-surprises', 'state-rights',
  'npi', 'oig', 'opt-out',
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
