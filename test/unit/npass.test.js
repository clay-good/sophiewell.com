import { test } from 'node:test';
import assert from 'node:assert/strict';
import { npass } from '../../lib/scoring-v4.js';

test('npass all zero at term -> no pain, no sedation (tile example)', () => {
  const r = npass({ crying: 0, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 38 });
  assert.equal(r.painScore, 0);
  assert.equal(r.sedationScore, 0);
  assert.equal(r.pretermAdjust, 0);
  assert.equal(r.painBand, 'no significant pain');
  assert.equal(r.sedationBand, 'no sedation');
});

test('npass pain 3 at term -> below intervention threshold', () => {
  const r = npass({ crying: 1, behavior: 1, facial: 1, extremities: 0, vitals: 0, gestationalAgeWeeks: 40 });
  assert.equal(r.painScore, 3);
  assert.equal(r.painBand, 'no significant pain');
});

test('npass pain 4 at term -> intervention indicated', () => {
  const r = npass({ crying: 1, behavior: 1, facial: 1, extremities: 1, vitals: 0, gestationalAgeWeeks: 40 });
  assert.equal(r.painScore, 4);
  assert.equal(r.painBand, 'pain/agitation present');
});

test('npass preterm 26 wk adds +4 to pain side', () => {
  const r = npass({ crying: 1, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 26 });
  assert.equal(r.pretermAdjust, 4);
  assert.equal(r.painScore, 5);
  assert.equal(r.painBand, 'pain/agitation present');
});

test('npass max pain at 40 wk -> 10', () => {
  const r = npass({ crying: 2, behavior: 2, facial: 2, extremities: 2, vitals: 2, gestationalAgeWeeks: 40 });
  assert.equal(r.painScore, 10);
  assert.equal(r.sedationScore, 0);
});

test('npass sedation -3 -> deep sedation', () => {
  const r = npass({ crying: -1, behavior: -1, facial: -1, extremities: 0, vitals: 0, gestationalAgeWeeks: 38 });
  assert.equal(r.sedationScore, -3);
  assert.equal(r.sedationBand, 'deep sedation');
});

test('npass sedation -5 -> over-sedation', () => {
  const r = npass({ crying: -1, behavior: -1, facial: -1, extremities: -1, vitals: -1, gestationalAgeWeeks: 38 });
  assert.equal(r.sedationScore, -5);
  assert.equal(r.sedationBand, 'over-sedation');
});

test('npass sedation -1 -> light sedation', () => {
  const r = npass({ crying: -1, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 38 });
  assert.equal(r.sedationScore, -1);
  assert.equal(r.sedationBand, 'light sedation');
});

test('npass mixed pain and sedation items', () => {
  const r = npass({ crying: 2, behavior: -1, facial: 1, extremities: -1, vitals: 0, gestationalAgeWeeks: 40 });
  assert.equal(r.painScore, 3);
  assert.equal(r.sedationScore, -2);
});

test('npass rejects out-of-range item', () => {
  assert.throws(() => npass({ crying: 3, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 38 }));
  assert.throws(() => npass({ crying: -3, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 38 }));
});

test('npass rejects non-integer item and out-of-range GA', () => {
  assert.throws(() => npass({ crying: 1.5, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 38 }));
  assert.throws(() => npass({ crying: 0, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 15 }));
  assert.throws(() => npass({ crying: 0, behavior: 0, facial: 0, extremities: 0, vitals: 0, gestationalAgeWeeks: 50 }));
});
