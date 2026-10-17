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

// --- label noise that is not label -------------------------------------------

test('spec-v763: a qualifier that discriminates is kept when it has to be', () => {
  // AKIN compares current creatinine against baseline. Strip the qualifier from
  // both and they are the same field, veto each other, and neither fills.
  const fields = [
    { d: 'cur', k: 'number', l: 'Current creatinine', u: 'mg/dL', r: 1 },
    { d: 'base', k: 'number', l: 'Baseline creatinine', u: 'mg/dL', r: 1 },
  ];
  const r = queryFill('current creatinine 2.4, baseline creatinine 0.9', fields);
  assert.equal(r.filled.cur, 2.4);
  assert.equal(r.filled.base, 0.9);
});

test('spec-v763: a qualifier is still noise when nothing collides', () => {
  // One creatinine field on the tile: "serum creatinine 1.4" must still fill it
  // without the reader saying "total" or "current".
  const fields = [{ d: 'scr', k: 'number', l: 'Total serum creatinine', u: 'mg/dL', r: 1 }];
  assert.equal(queryFill('creatinine 1.4', fields).filled.scr, 1.4);
});

test('spec-v763: an enum is not identified by its own glossary', () => {
  // Adapters document an enum for agents by listing it in brackets. Every one of
  // those option words is a word the field must NOT be identified by: read as
  // terms, the glossary's first option wins over the value actually given.
  const fields = [{
    d: 'cell', k: 'enum', v: ['low', 'moderate', 'high'],
    l: 'Cellularity, operator-dependent [low = under 2 per field; moderate = 2 to 5; high = over 5]',
  }];
  assert.equal(queryFill('cellularity moderate', fields).filled.cell, 'moderate');
  assert.equal(queryFill('cellularity high', fields).filled.cell, 'high');
});

test('spec-v764: a multi-word term matches across the words it dropped', () => {
  // Terms are built by dropping stopwords from the label, but the query still
  // HAS them: "Bend over and pick up" becomes the term "bend pick up", which can
  // never match contiguously. A third of every miss in the catalog was this.
  const fields = [{ d: 'a3', k: 'number', l: 'Bend over and pick up a slipper', u: '%', r: 1 }];
  assert.equal(queryFill('bend over and pick up 60 %', fields).filled.a3, 60);
});

test('spec-v764: the gap does not reach across a clause', () => {
  // Looser matching must stay bounded, or a term reaches past its own phrase and
  // claims a number belonging to something else.
  const fields = [{ d: 'x', k: 'number', l: 'Bend over and pick up a slipper', u: '%', r: 1 }];
  const far = queryFill('bend down, then after a long unrelated aside about something else, pick up 60', fields);
  assert.ok(!('x' in far.filled), 'a term must not span an arbitrary distance');
});

test('spec-v764: a negation can be the only discriminator', () => {
  // abc-scale asks about an escalator "holding the rail" and "NOT holding the
  // rail". Drop `not` and they are one field, veto each other, and neither fills.
  const fields = [
    { d: 'a14', k: 'number', l: 'Ride an escalator holding the rail', u: '%' },
    { d: 'a15', k: 'number', l: 'Ride an escalator not holding the rail', u: '%' },
  ];
  const r = queryFill('ride an escalator holding the rail 80, ride an escalator not holding the rail 40', fields);
  assert.equal(r.filled.a14, 80);
  assert.equal(r.filled.a15, 40);
});

test('spec-v764: an enum value ending in punctuation still matches', () => {
  // "O-", "3+", "63+" have no word boundary after them, so a trailing \\b can
  // never match.
  const blood = [{ d: 'bc', k: 'enum', l: 'Recipient blood type', v: ['O-', 'O+', 'A-', 'A+'] }];
  assert.equal(queryFill('recipient blood type O-', blood).filled.bc, 'O-');

  const band = [{ d: 'ab', k: 'enum', l: 'Age band', v: ['under-50', '50-62', '63+'] }];
  assert.equal(queryFill('age band 63+', band).filled.ab, '63+');
});

test('spec-v764: a label made only of stopwords falls back to its key', () => {
  // "Value" identifies nothing. The dom key usually carries a word that does.
  const fields = [{ d: 'cp-val', k: 'number', l: 'Value' }];
  assert.equal(queryFill('val 1000', fields).filled['cp-val'], 1000);
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

// Found October 17, 2026: a blood gas written the usual way filled almost nothing.
test('digits inside a label word are part of its name; "pH" is a term; a unit guess does not take a named number', () => {
  const rows = [
    { d: 'pH', k: 'number', l: 'Arterial pH', r: 1 },
    { d: 'paco2', k: 'number', l: 'PaCO2', u: 'mmHg', r: 1 },
    { d: 'hco3', k: 'number', l: 'HCO3', u: 'mEq/L', r: 1 },
    { d: 'pao2', k: 'number', l: 'PaO2 (optional, enables oxygenation indices)', u: 'mmHg' },
  ];
  assert.deepEqual(queryFill('ph 7.3 paco2 30 hco3 14', rows).filled, { pH: 7.3, paco2: 30, hco3: 14 });
  // PaCO2 read "30 mmHg" by name; PaO2's unit fallback must not read it too.
  assert.deepEqual(queryFill('pH 7.30, PaCO2 30 mmHg, HCO3 14 mEq/L', rows).filled, { pH: 7.3, paco2: 30, hco3: 14 });
  assert.deepEqual(queryFill('paco2 30 mmhg, pao2 85 mmhg', rows).filled, { paco2: 30, pao2: 85 });
  // A standalone number in a label is still the source's threshold, not a word.
  assert.deepEqual(fieldTerms({ d: 'x', k: 'number', l: 'Creatinine above 2 adds 1 point' }).includes('2'), false);
  assert.ok(fieldTerms({ d: 'x', k: 'number', l: 'SpO2' }).includes('spo2'));
});

test('one filler word the label dropped may sit between name and value, from a closed list only', () => {
  const rows = [{ d: 'score', k: 'number', l: 'Total coronary artery calcium  score', r: 1 }];
  assert.deepEqual(queryFill('total coronary artery calcium score 250', rows).filled, { score: 250 });
  const cr = [{ d: 'cr', k: 'number', l: 'Serum creatinine', u: 'mg/dL', r: 1 }];
  assert.deepEqual(queryFill('creatinine level 1.4', cr).filled, { cr: 1.4 });
  assert.deepEqual(queryFill('creatinine was checked twice 1.4', cr).filled, {}, 'not an open gap');
});

test('a label typed back with its own comma fills; a label\'s leading item number is never its value', () => {
  const mrc = [
    { d: 'shl', k: 'number', l: 'Shoulder abduction, left (0-5)', r: 1 },
    { d: 'shr', k: 'number', l: 'Shoulder abduction, right (0-5)', r: 1 },
  ];
  assert.deepEqual(queryFill('Shoulder abduction, left 4, Shoulder abduction, right 3', mrc).filled, { shl: 4, shr: 3 });
  // NIHSS item 5 read "5 Motor arm, sum of left + right 2" as 5: the number before the name was the label's.
  const nihss = [{ d: '5', k: 'number', l: '5 Motor arm, sum of left + right (0-8)', r: 1 }];
  assert.notEqual(queryFill('5 Motor arm, sum of left + right 2', nihss).filled['5'], 5);
});

test('numbered sibling items fill: the value is not taken for a sibling\'s distinguishing word', () => {
  const items = Array.from({ length: 10 }, (_, i) => ({ d: `i${i + 1}`, k: 'number', l: `Item ${i + 1} (0-10)`, r: 1 }));
  assert.deepEqual(queryFill('Item 1 2, Item 2 3, Item 3 4, Item 10 5', items).filled, { i1: 2, i2: 3, i3: 4, i10: 5 });
  assert.deepEqual(queryFill('Item 1 1, Item 2 2', items).filled, { i1: 1, i2: 2 });
});

test('spaced dashes and colons separate a label; subscript digits are digits; a reading inside another field\'s match yields', () => {
  const masi = [
    { d: 'fA', k: 'number', l: 'Forehead \u2014 Area', r: 1 },
    { d: 'fD', k: 'number', l: 'Forehead \u2014 Darkness', r: 1 },
  ];
  assert.deepEqual(queryFill('Forehead \u2014 Area 4, Forehead \u2014 Darkness 2', masi).filled, { fA: 4, fD: 2 });
  const qp = [{ d: 'sao2', k: 'number', l: 'Systemic-arterial SaO₂', u: '%', r: 1 }];
  assert.deepEqual(queryFill('sao2 95', qp).filled, { sao2: 95 });
  const groups = [
    { d: 'a', k: 'number', l: 'Group 1 (treated or exposed): events', r: 1 },
    { d: 'c', k: 'number', l: 'Group 2 (comparison): events', r: 1 },
  ];
  // Group 2's bare "events 141" lies inside Group 1's match and must not fill Group 2 with 141.
  assert.deepEqual(queryFill('Group 1 : events 141', groups).filled, { a: 141 });
  assert.deepEqual(queryFill('Group 1 : events 141, Group 2 : events 928', groups).filled, { a: 141, c: 928 });
});

// Found October 17, 2026 once the example sweep compared recovered inputs by dom key (it had compared by
// argument name, which skipped most tools): a number inside a word and a label's own number were read.
test('a number inside a word, or a word-and-number pair the label prints, is never the value', () => {
  const cd4 = [{ d: 'cd4', k: 'number', l: 'CD4 count, cells/mm³', r: 1 }];
  assert.deepEqual(queryFill('CD4 count, cells/mm³ 150', cd4).filled, {}, 'not 4');
  assert.deepEqual(queryFill('cd4 count 150', cd4).filled, { cd4: 150 });
  const il6 = [{ d: 'il6', k: 'number', l: 'IL-6, pg/mL' }, { d: 'sofa', k: 'number', l: 'SOFA score', r: 1 }];
  assert.deepEqual(queryFill('SOFA score 6, IL-6 0', il6).filled.il6, undefined, 'not 6');
  const step = [{ d: 'fr', k: 'number', l: 'Final rate, step 12', u: 'mL/h', r: 1 }];
  assert.deepEqual(queryFill('final rate, step 12 80', step).filled, {}, 'not 12');
  const scale = [{ d: 's', k: 'number', l: 'Severity (0-10)', r: 1 }];
  assert.deepEqual(queryFill('severity 10', scale).filled, { s: 10 }, 'a value equal to a range end still fills');
  const pop = [{ d: 'c', k: 'number', l: 'Point C', u: 'cm', r: 1 }];
  assert.deepEqual(queryFill('point c -2 cm', pop).filled, { c: -2 }, 'a minus sign after a space still reads');
});

// Found October 17, 2026 by writing every mixed page example (numbers, choices, yes/no) as a question.
test('choices and yes/no: longest value, trailing and in-name negation, terms do not cross list items', () => {
  const region = [{ d: 'r', k: 'enum', l: 'Risk region', v: ['low', 'moderate', 'high', 'very-high'] }];
  assert.deepEqual(queryFill('risk region very high', region).filled, { r: 'very-high' });
  assert.deepEqual(queryFill('risk region high', region).filled, { r: 'high' });
  const unit = [{ d: 'u', k: 'enum', l: 'Dose unit', v: ['mg-m2', 'mg'] }];
  assert.deepEqual(queryFill('dose unit mg m2', unit).filled, { u: 'mg-m2' });
  const hx = [{ d: 'hx', k: 'bool', l: 'History of PONV or motion sickness' }];
  assert.deepEqual(queryFill('history of ponv: no', hx).filled, {}, 'a trailing no is a no');
  const both = [{ d: 'b', k: 'bool', l: 'Clinical and EEG improvement after IV antiseizure medication' }];
  assert.deepEqual(queryFill('no clinical and EEG improvement after IV antiseizure medication', both).filled, {});
  const surfaces = Array.from({ length: 4 }, (_, i) => ({ d: `s${i + 1}`, k: 'enum', l: `Surface ${i + 1} ICDAS code`, v: ['0', '1', '2', '3', '4', '5', '6'] }));
  assert.deepEqual(queryFill('surface 1 icdas code 0, surface 2 icdas code 2, surface 3 icdas code 3, surface 4 icdas code 1', surfaces).filled, { s1: '0', s2: '2', s3: '3', s4: '1' });
});

// Found October 17, 2026 by writing every page example after each curated search phrase.
test('a criterion negated anywhere stays unfilled, and the start of a range is not a reading', () => {
  const vte = [{ d: 'vte', k: 'bool', l: 'Prior VTE (3)' }];
  assert.deepEqual(queryFill('vte prophylaxis risk, active cancer, no prior VTE', vte).filled, {}, 'the phrase\'s "vte" does not outvote "no prior VTE"');
  assert.deepEqual(queryFill('vte prophylaxis risk, prior VTE', vte).filled, { vte: true });
  const sizes = [{ d: 'size', k: 'bool', l: 'Change in size' }, { d: 'shape', k: 'bool', l: 'Change in shape' }, { d: 'color', k: 'bool', l: 'Change in color' }];
  assert.deepEqual(queryFill('change in size, no change in shape, change in color', sizes).filled, { size: true, color: true },
    'a negated item that only shares a word does not veto its neighbors');
  const grade = [{ d: 'g', k: 'enum', l: 'MRC muscle-power grade', v: ['0', '1', '2', '3', '4', '5'] }];
  assert.deepEqual(queryFill('power grade 0 to 5, grade 3', grade).filled, { g: '3' });
  assert.deepEqual(queryFill('grade 2-4', grade).filled, {}, 'a hyphenated range is not a value');
  assert.deepEqual(queryFill('grade 4', grade).filled, { g: '4' });
});
