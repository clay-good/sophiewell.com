// spec-v1624 step 1: the concept map and the fields it can fill. Every
// tagged field names a concept the map has, and a value in the concept's
// unit reaches the field's unit -- so no tag points at a field a record value
// can't fill. Yes/no fields are never tagged.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REGISTRY } from '../../mcp/tools.js';
import { unitKey, toConcept, toField } from '../../lib/record-units.js';

const CONCEPTS = JSON.parse(readFileSync(new URL('../../data/concepts/concepts.json', import.meta.url), 'utf8'));
const BY_ID = new Map(CONCEPTS.map((c) => [c.id, c]));
const DERIVED = new Set(['age', 'sex']); // from the record's birth date and gender, not a code

const tagged = [];
for (const calc of REGISTRY.values()) for (const f of calc.fields) if (f.concept) tagged.push({ id: calc.id, ...f });

test('the first release tags the tools spec-v1613 names', () => {
  const tools = new Set(tagged.map((t) => t.id));
  for (const id of ['prevent', 'ascvd', 'score2', 'egfr', 'egfr-suite', 'ckd-epi-cystatin', 'cockcroft-gault', 'kfre', 'fib4', 'apri', 'nafld-fibrosis', 'meld-na', 'bmi', 'ldl-calc', 'eag-a1c', 'tyg-index', 'anion-gap', 'corrected-calcium']) {
    assert.ok(tools.has(id), `${id} has no tagged field`);
  }
  assert.equal(tagged.length, 70); // 68 + eGFR's optional height and weight (spec-v1641 row 23)
});

test('every tag names a concept the map has, on a field of the right kind', () => {
  for (const t of tagged) {
    if (DERIVED.has(t.concept)) {
      if (t.concept === 'sex') assert.equal(t.kind, 'enum', `${t.id} ${t.dom}`);
      continue;
    }
    assert.ok(BY_ID.has(t.concept), `${t.id} ${t.dom}: no concept ${t.concept}`);
    assert.equal(t.kind, 'number', `${t.id} ${t.dom}: only numbers are filled from a record`);
  }
  assert.ok(!tagged.some((t) => t.kind === 'bool'), 'yes/no fields are never tagged');
});

test('a value in each concept\'s unit reaches every field tagged with it', () => {
  for (const t of tagged) {
    if (DERIVED.has(t.concept)) continue;
    const c = BY_ID.get(t.concept);
    assert.notEqual(toField(c, 1, t.unit), null, `${t.id} ${t.dom}: ${c.unit} cannot become ${t.unit}`);
  }
});

test('units: UCUM spellings, listed conversions, and an unlisted unit refused', () => {
  const cr = BY_ID.get('creatinine');
  assert.equal(unitKey('mm[Hg]'), 'mmhg');
  assert.equal(unitKey('10*3/uL'), unitKey('x10^9/L'));
  assert.equal(unitKey('[lb_av]'), 'lb');
  assert.equal(unitKey('mL/min/{1.73_m2}'), unitKey('mL/min/1.73m^2'));
  assert.equal(Math.round(toConcept(cr, 97, 'umol/L') * 100) / 100, 1.1);
  assert.equal(toConcept(cr, 1.1, 'mg/dL'), 1.1);
  assert.equal(toConcept(BY_ID.get('potassium'), 4.1, 'mg/dL'), null, 'an unlisted unit is not converted');
  const tc = BY_ID.get('total-cholesterol');
  assert.equal(Math.round(toField(tc, 212, 'mmol/L') * 100) / 100, 5.48);
  assert.equal(toField(BY_ID.get('body-height'), 170, 'm'), 1.7);
});

test('the map ships code numbers and short names only, with the LOINC notice', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../data/concepts/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.coverage, 'subset');
  assert.match(manifest.notes, /copyright Regenstrief Institute/);
  for (const c of CONCEPTS) for (const code of c.codes) assert.match(code.code, code.system === 'LOINC' ? /^\d{1,6}-\d$/ : /^HKQuantityTypeIdentifier[A-Za-z]+$/);
});

test('RECORD_TOOLS is exactly the set of tools with a tagged field', async () => {
  const { RECORD_TOOLS } = await import('../../lib/record-plan.js');
  assert.deepEqual([...RECORD_TOOLS].sort(), [...new Set(tagged.map((t) => t.id))].sort());
});
