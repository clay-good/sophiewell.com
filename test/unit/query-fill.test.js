// spec-v753: lib/query-fill.js -- plain-language query to filled inputs.
//
// Two kinds of test here. The unit tests below pin the individual rules. The
// corpus test at the bottom runs every line of test/fixtures/queries.txt, which
// is the honest measure of whether a nurse's sentence lands prefilled, and the
// place to add a phrasing when one comes up.
//
// The safety cases matter more than the coverage ones. A field this module
// leaves blank costs a nurse one keystroke; a field it fills wrong costs them
// a wrong number they have to notice.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import {
  queryFill, canonUnit, convertUnit, fieldTerms, isNegated,
  normalizeQuery, labelThreshold, boolHit,
} from '../../lib/query-fill.js';
import { bucketFor } from '../../lib/field-bucket.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIELDS_DIR = join(ROOT, 'data', 'fields');

const buckets = new Map();
function fieldsFor(id) {
  const b = bucketFor(id);
  if (!buckets.has(b)) {
    buckets.set(b, JSON.parse(readFileSync(join(FIELDS_DIR, `${b}.json`), 'utf8')));
  }
  return buckets.get(b)[id] || null;
}

// --- units ------------------------------------------------------------------

test('canonUnit folds the registry spellings that mean one thing', () => {
  assert.equal(canonUnit('×10⁹/L'), canonUnit('x10^9/L'));
  assert.equal(canonUnit('µmol/L'), 'umol/l');
  assert.equal(canonUnit('years'), 'year');
  assert.equal(canonUnit('°C'), 'c');
});

test('convertUnit converts the bedside pairs and refuses the rest', () => {
  assert.equal(Math.round(convertUnit(180, 'lb', 'kg') * 100) / 100, 81.65);
  assert.equal(Math.round(convertUnit(70, 'in', 'cm') * 10) / 10, 177.8);
  assert.equal(convertUnit(100, 'mg/dL', 'mg/dL'), 100);
  // Not a dimension pair: refuse rather than pass the number through.
  assert.equal(convertUnit(100, 'mg/dL', 'mmol/L'), null);
  assert.equal(convertUnit(5, 'kg', 'mmHg'), null);
});

// --- labels -----------------------------------------------------------------

test('fieldTerms reads the label lead, not its guidance paragraph', () => {
  const terms = fieldTerms({
    d: 'acef-creatinine',
    l: 'Serum creatinine. Above 2 adds 1 to ACEF and 2 to ACEF II. Exactly 2 is the one value where published renderings disagree.',
    u: 'mg/dL',
  });
  assert.ok(terms.includes('serum creatinine'));
  assert.ok(terms.includes('cr'), 'chart shorthand is a term');
  assert.ok(!terms.some((t) => /\d/.test(t)), 'a number in a label is never a term');
  assert.ok(!terms.includes('adds'), 'guidance vocabulary identifies nothing');
});

// --- negation ---------------------------------------------------------------

test('isNegated sees the negator in the same clause only', () => {
  const q = 'no hemoptysis, malignancy';
  assert.equal(isNegated(q, q.indexOf('hemoptysis')), true);
  assert.equal(isNegated(q, q.indexOf('malignancy')), false, 'the comma ends the window');
  assert.equal(isNegated('denies chest pain', 'denies '.length), true);
  assert.equal(isNegated('hemoptysis', 0), false);
});

// --- compound forms ---------------------------------------------------------

test('normalizeQuery rewrites a blood pressure into its two readings', () => {
  assert.match(normalizeQuery('map 120/80'), /systolic 120 mmhg diastolic 80 mmhg/);
});

test('normalizeQuery leaves a slash pair that is not a blood pressure alone', () => {
  // Diastolic above systolic is not a reading; neither is a number out of range.
  assert.ok(!/systolic/.test(normalizeQuery('ratio 80/120')));
  assert.ok(!/systolic/.test(normalizeQuery('1/2 tablet')));
});

test('normalizeQuery converts feet and inches to centimeters', () => {
  assert.match(normalizeQuery("5'10"), /height 177\.8 cm/);
  assert.match(normalizeQuery('5 ft 10 in'), /height 177\.8 cm/);
});

// --- boolean criteria: the safety-critical path -----------------------------

test('labelThreshold pulls the comparison out of a criterion label', () => {
  assert.deepEqual(labelThreshold('Heart rate > 100 (1.5)'), { op: '>', value: 100 });
  assert.deepEqual(labelThreshold('Age >= 65'), { op: '>=', value: 65 });
  assert.equal(labelThreshold('Hemoptysis (1)'), null, 'a point value is not a threshold');
});

test('a threshold criterion is decided by the number, not by the words', () => {
  const field = { d: 'hrOver100', k: 'bool', l: 'Heart rate > 100 (1.5)' };
  assert.equal(boolHit('heart rate 110', field)?.value, true);
  assert.equal(boolHit('heart rate 80', field), null, '80 does not clear 100');
  assert.equal(boolHit('heart rate', field), null, 'no number, no verdict');
});

test('an unmentioned criterion is never filled false', () => {
  const fields = fieldsFor('wells-pe');
  const r = queryFill('wells pe, hemoptysis', fields);
  assert.equal(r.filled.hemoptysis, true);
  assert.ok(!('malignancy' in r.filled), 'silence is not evidence of absence');
});

// --- the veto ---------------------------------------------------------------

test('one field with two readings fills neither', () => {
  const fields = [{ d: 'na', k: 'number', l: 'Sodium', u: 'mEq/L', r: 1 }];
  const r = queryFill('sodium 140 then sodium 122', fields);
  assert.ok(!('na' in r.filled), 'which sodium is a question we cannot answer');
  assert.deepEqual(r.missing, ['na']);
});

test('two fields reading one fragment fill neither', () => {
  const fields = [
    { d: 'a', k: 'number', l: 'Sodium', u: 'mEq/L', r: 1 },
    { d: 'b', k: 'number', l: 'Sodium', u: 'mEq/L', r: 1 },
  ];
  const r = queryFill('sodium 140', fields);
  assert.deepEqual(r.filled, {}, 'a tie is refused, not broken arbitrarily');
});

test('a better-corroborated reading wins outright', () => {
  const fields = fieldsFor('wells-pe');
  const r = queryFill('wells pe, previous DVT', fields);
  assert.equal(r.filled.priorPeOrDvt, true, '"previous" corroborates prior, not signs');
  assert.ok(!('clinicalDvtSigns' in r.filled));
});

test('a bare number fills nothing', () => {
  assert.deepEqual(queryFill('72', fieldsFor('cockcroft-gault')).filled, {});
});

// --- missing ----------------------------------------------------------------

test('missing lists the required fields nothing filled, in declaration order', () => {
  const r = queryFill('creatinine 1.4', fieldsFor('cockcroft-gault'));
  assert.deepEqual(r.filled, { scr: 1.4 });
  assert.deepEqual(r.missing, ['age', 'w', 'sex']);
});

test('no query and no fields are both handled without throwing', () => {
  assert.deepEqual(queryFill('', fieldsFor('bmi')), { filled: {}, missing: [], unmatched: [] });
  assert.deepEqual(queryFill('bmi 80 kg', null), { filled: {}, missing: [], unmatched: [] });
});

// --- the index itself -------------------------------------------------------

test('every shard parses and carries only recognized kinds', () => {
  const KINDS = new Set(['number', 'bool', 'enum', 'string']);
  let tiles = 0;
  let fields = 0;
  for (const file of readdirSync(FIELDS_DIR)) {
    const rows = JSON.parse(readFileSync(join(FIELDS_DIR, file), 'utf8'));
    for (const [id, list] of Object.entries(rows)) {
      assert.equal(bucketFor(id), file.replace(/\.json$/, ''), `${id} is in the wrong bucket`);
      tiles += 1;
      for (const f of list) {
        fields += 1;
        assert.ok(f.d, `${id}: a field with no dom key`);
        assert.ok(KINDS.has(f.k), `${id}.${f.d}: unrecognized kind "${f.k}"`);
        if (f.k === 'enum') assert.ok(Array.isArray(f.v), `${id}.${f.d}: enum with no values`);
      }
    }
  }
  assert.ok(tiles > 1500, `expected the whole exposed catalog, got ${tiles}`);
  assert.ok(fields > 7000, `expected the whole field registry, got ${fields}`);
});

// --- the corpus -------------------------------------------------------------

test('every phrasing in test/fixtures/queries.txt resolves as written', () => {
  const text = readFileSync(join(ROOT, 'test', 'fixtures', 'queries.txt'), 'utf8');
  let checked = 0;
  for (const [i, raw] of text.split('\n').entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const [query, tileId, expectations] = line.split('|').map((p) => p.trim());
    const where = `queries.txt:${i + 1} (${tileId})`;
    const fields = fieldsFor(tileId);
    assert.ok(fields, `${where}: no field shard -- is the tile id right?`);
    const { filled } = queryFill(query, fields);
    checked += 1;

    if (expectations === '~') {
      assert.deepEqual(filled, {}, `${where}: expected nothing filled`);
      continue;
    }
    for (const token of expectations.split(/\s+/).filter(Boolean)) {
      if (token.startsWith('!')) {
        const dom = token.slice(1);
        assert.ok(!(dom in filled), `${where}: ${dom} should not have been filled (got ${filled[dom]})`);
        continue;
      }
      const [dom, want] = token.split('=');
      assert.ok(dom in filled, `${where}: ${dom} was not filled`);
      const got = filled[dom];
      if (Number.isFinite(Number(want)) && Number.isFinite(Number(got))) {
        assert.ok(
          Math.abs(Number(got) - Number(want)) < Math.max(1e-4, Math.abs(Number(want)) * 1e-4),
          `${where}: ${dom} = ${got}, expected ${want}`
        );
      } else {
        assert.equal(String(got).toLowerCase(), String(want).toLowerCase(), `${where}: ${dom}`);
      }
    }
  }
  assert.ok(checked >= 20, `expected a real corpus, ran ${checked} lines`);
});
