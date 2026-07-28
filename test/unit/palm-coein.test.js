// spec-v545: FIGO PALM-COEIN.
// Worked-example tests: all nine categories reported for every patient, the THREE-valued cells including
// "not yet assessed", the leiomyoma secondary tier being required when L is present, the explicit 2018
// edition, and the guards. Categories and notation transcribed from Munro and colleagues 2011/2018
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  palmCoein, PALM_COEIN_CATEGORIES, CATEGORY_VALUES, LEIOMYOMA_SECONDARY, LEIOMYOMA_TYPES,
} from '../../lib/palm-coein-v545.js';

function allZero(over = {}) {
  const args = {};
  for (const c of PALM_COEIN_CATEGORIES) args[c.key] = '0';
  return palmCoein({ ...args, ...over });
}

test('nine categories, split PALM and COEIN', () => {
  assert.equal(PALM_COEIN_CATEGORIES.length, 9);
  assert.deepEqual(PALM_COEIN_CATEGORIES.map((c) => c.letter), ['P', 'A', 'L', 'M', 'C', 'O', 'E', 'I', 'N']);
  assert.equal(PALM_COEIN_CATEGORIES.filter((c) => c.group === 'PALM').length, 4);
  assert.equal(PALM_COEIN_CATEGORIES.filter((c) => c.group === 'COEIN').length, 5);
});

test('EVERY category is reported for every patient, TNM-style', () => {
  const r = allZero();
  assert.equal(r.notation, 'AUB P0 A0 L0 M0 - C0 O0 E0 I0 N0');
  for (const c of PALM_COEIN_CATEGORIES) assert.match(r.notation, new RegExp(`${c.letter}0`));
});

test('cells are THREE-valued: 0 absent, 1 present, ? not yet assessed', () => {
  assert.deepEqual(CATEGORY_VALUES, ['0', '1', '?']);
  const r = allZero({ coagulopathy: '?', malignancy: '?' });
  assert.match(r.notation, /M\?/);
  assert.match(r.notation, /C\?/);
  assert.deepEqual(r.unassessed, ['M', 'C']);
  assert.match(r.band, /recorded as unknown, not as absent/);
});

test('a "?" is not the same as a 0', () => {
  const unknown = allZero({ coagulopathy: '?' });
  const absent = allZero({ coagulopathy: '0' });
  assert.notEqual(unknown.notation, absent.notation);
  assert.deepEqual(absent.unassessed, []);
});

test('leiomyoma present REQUIRES the secondary SM/O classification', () => {
  const missing = allZero({ leiomyoma: '1' });
  assert.equal(missing.valid, false);
  assert.match(missing.message, /SM \(submucosal, involving the endometrial cavity\) or O/);
  assert.match(missing.message, /carries the clinical weight/);

  const ok = allZero({ leiomyoma: '1', leiomyomaSecondary: 'SM' });
  assert.equal(ok.valid, true);
  assert.equal(ok.leiomyomaSecondary, 'SM');
  assert.match(ok.notation, /L1\(SM\)/);
});

test('the tertiary type is optional and appears when given (the META example)', () => {
  const withType = allZero({ leiomyoma: '1', leiomyomaSecondary: 'SM', leiomyomaType: '2', ovulatory: '1' });
  assert.match(withType.notation, /L1\(SM type 2\)/);
  assert.equal(withType.leiomyomaType, '2');
  assert.deepEqual(withType.positives, ['L', 'O']);
  assert.equal(withType.abbreviated, 'AUB-LSM; O');
  assert.equal(LEIOMYOMA_TYPES.length, 9); // 0 through 8
});

test('more than one category can be positive at once', () => {
  const r = allZero({ leiomyoma: '1', leiomyomaSecondary: 'O', ovulatory: '1', coagulopathy: '1' });
  assert.deepEqual(r.positives, ['L', 'C', 'O']);
  assert.match(r.note, /assuming a visible structural lesion is the cause is a known error/);
});

test('the 2018 edition is stated, with both differences from 2011', () => {
  const r = allZero();
  assert.equal(r.edition, '2018');
  assert.match(r.band, /type 3 leiomyomas sit inside the submucous group/);
  assert.match(r.band, /anticoagulant-associated bleeding is AUB-I rather than AUB-C/);
  assert.match(r.band, /not directly comparable/);
  const sm = LEIOMYOMA_SECONDARY.find((x) => x.value === 'SM');
  assert.match(sm.text, /2018 revision this spans types 0 to 3/);
});

test('the copy refuses the diagnosis and malignancy-exclusion readings', () => {
  const n = allZero().note;
  assert.match(n, /not a diagnosis/);
  assert.match(n, /does not exclude malignancy/);
  assert.match(n, /before endometrial sampling/);
  assert.match(n, /pregnancy, which must be excluded first/);
  assert.match(allZero().band, /does not exclude malignancy/);
});

test('the guards', () => {
  assert.equal(palmCoein({}).valid, false);
  const partial = palmCoein({ polyp: '0' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /Every category is addressed for every patient/);
  assert.equal(allZero({ polyp: '2' }).valid, false);
  assert.equal(allZero({ leiomyoma: '1', leiomyomaSecondary: 'X' }).valid, false);
  assert.equal(allZero({ leiomyoma: '1', leiomyomaSecondary: 'SM', leiomyomaType: '9' }).valid, false);
});
