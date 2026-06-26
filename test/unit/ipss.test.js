// spec-v153 2.1: IPSS / AUA Symptom Index (Barry 1992). Seven symptom questions
// each 0-5, summed 0-35; bands 0-7 mild, 8-19 moderate, 20-35 severe. The
// quality-of-life item (0-6) is reported alongside and NEVER summed into the
// symptom total. A partially-answered form is valid:false.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ipss } from '../../lib/urology-v153.js';

const all = (v) => ({ q1: v, q2: v, q3: v, q4: v, q5: v, q6: v, q7: v });

test('tile example: total 8 -> moderate (QoL not summed)', () => {
  const r = ipss({ q1: 2, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, qol: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 8);
  assert.equal(r.bandLabel, 'Moderate');
  assert.equal(r.qol, 2);
});

test('7/8 mild->moderate boundary, and QoL value does not change the total', () => {
  const at7 = ipss({ q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, qol: 6 });
  assert.equal(at7.score, 7);
  assert.equal(at7.bandLabel, 'Mild');
  const at8 = ipss({ q1: 2, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, qol: 0 });
  assert.equal(at8.score, 8);
  assert.equal(at8.bandLabel, 'Moderate');
  // Same symptom answers, two different QoL values -> identical 0-35 total.
  const a = ipss({ ...all(1), qol: 0 });
  const b = ipss({ ...all(1), qol: 6 });
  assert.equal(a.score, b.score);
  assert.equal(a.score, 7);
});

test('19/20 moderate->severe boundary', () => {
  const at19 = ipss({ q1: 5, q2: 5, q3: 5, q4: 2, q5: 1, q6: 1, q7: 0 });
  assert.equal(at19.score, 19);
  assert.equal(at19.bandLabel, 'Moderate');
  const at20 = ipss({ q1: 5, q2: 5, q3: 5, q4: 2, q5: 1, q6: 1, q7: 1 });
  assert.equal(at20.score, 20);
  assert.equal(at20.bandLabel, 'Severe');
});

test('all 5 -> 35 severe; all 0 -> 0 mild; QoL optional', () => {
  assert.equal(ipss(all(5)).score, 35);
  assert.equal(ipss(all(5)).bandLabel, 'Severe');
  const z = ipss(all(0));
  assert.equal(z.score, 0);
  assert.equal(z.bandLabel, 'Mild');
  assert.equal(z.qol, undefined); // QoL omitted -> not reported
});

test('partial / blank answers -> valid:false complete-the-fields', () => {
  assert.equal(ipss({ q1: 2 }).valid, false);
  assert.equal(ipss({ ...all(1), q7: '' }).valid, false);
  assert.match(ipss({ q1: 1 }).message, /Answer all 7/);
});
