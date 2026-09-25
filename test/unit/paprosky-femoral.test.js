// spec-v1420: Paprosky femoral bone loss, derived from the findings (Ibrahim & Fernando 2017, Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paproskyFemoral as ppf } from '../../lib/paprosky-femoral-v1420.js';

test('every Table 1 row derives its own type and is concordant', () => {
  const rows = [
    ['I', { metaphysis: 'minimal', diaphysis: 'minimal' }],
    ['II', { metaphysis: 'extensive', diaphysis: 'minimal', isthmus: 'supportive' }],
    ['IIIA', { metaphysis: 'extensive', diaphysis: 'extensive', isthmus: 'supportive', intact: 'ge4' }],
    ['IIIB', { metaphysis: 'extensive', diaphysis: 'extensive', isthmus: 'supportive', intact: 'lt4' }],
    ['IV', { metaphysis: 'extensive', diaphysis: 'extensive', isthmus: 'nonsupportive' }],
  ];
  for (const [type, input] of rows) {
    const r = ppf(input);
    assert.equal(r.type, type, type);
    assert.equal(r.concordant, true, type);
    assert.equal(r.bandLabel, `Type ${type}`);
  }
  assert.equal(ppf(rows[0][1]).abnormal, false);
  assert.equal(ppf(rows[4][1]).abnormal, true);
});

test('the exact band for IIIB', () => {
  assert.equal(ppf({ metaphysis: 'extensive', diaphysis: 'extensive', isthmus: 'supportive', intact: 'lt4' }).band,
    'Paprosky femoral type IIIB: extensive metaphyseal and diaphyseal bone loss with less than 4 cm of intact diaphyseal bone for a scratch fit.');
});

test('a nonsupportive isthmus makes type IV whatever the intact length, and says so', () => {
  const r = ppf({ metaphysis: 'extensive', diaphysis: 'extensive', isthmus: 'nonsupportive', intact: 'ge4' });
  assert.equal(r.type, 'IV');
  assert.equal(r.concordant, false);
  assert.match(r.notes[0], /4 cm or more of intact diaphysis was entered/);
});

test('findings off the table are reported, not forced', () => {
  const off = ppf({ metaphysis: 'minimal', diaphysis: 'extensive' });
  assert.equal(off.valid, true);
  assert.equal(off.type, null);
  assert.equal(off.bandLabel, 'No single type');
  const r = ppf({ metaphysis: 'extensive', diaphysis: 'minimal', isthmus: 'nonsupportive' });
  assert.equal(r.type, 'II');
  assert.equal(r.concordant, false);
  assert.match(r.notes[0], /only in type IV/);
});

test('every answer carries the underestimation and reliability caveats', () => {
  const r = ppf({ metaphysis: 'minimal', diaphysis: 'minimal' });
  assert.ok(r.notes.some((n) => /12% of hips/.test(n)));
  assert.ok(r.notes.some((n) => /0\.12 to 0\.80/.test(n)));
});

test('missing findings are asked for only when they decide the type', () => {
  assert.match(ppf({}).message, /metaphyseal/);
  assert.match(ppf({ metaphysis: 'extensive' }).message, /diaphyseal/);
  assert.match(ppf({ metaphysis: 'extensive', diaphysis: 'extensive' }).message, /isthmus/);
  assert.match(ppf({ metaphysis: 'extensive', diaphysis: 'extensive', isthmus: 'supportive' }).message, /4 cm/);
  assert.equal(ppf({ metaphysis: 'extensive', diaphysis: 'minimal' }).valid, true);
});
