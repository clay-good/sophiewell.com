// spec-v97 2.4: El-Ganzouri Risk Index for difficult intubation (Anesth Analg
// 1996). Seven factors, each 0/1/2; a total >= 4 flags difficult laryngoscopy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elGanzouri } from '../../lib/periop-v97.js';

const easy = { mouth: 'ge-4', thyromental: 'gt-6.5', mallampati: '1', neck: 'gt-90', prognath: 'yes', weight: 'under-90', history: 'none' };

test('all-low scores 0 and is below the threshold', () => {
  const r = elGanzouri(easy);
  assert.equal(r.total, 0);
  assert.equal(r.difficult, false);
});

test('threshold edge: total 3 below, total 4 at/above', () => {
  // thyromental <6 (2) + Mallampati III (1) = 3 -> below.
  const three = elGanzouri({ ...easy, thyromental: 'lt-6', mallampati: '3' });
  assert.equal(three.total, 3);
  assert.equal(three.difficult, false);
  // add mouth <4 (1) -> 4 -> at/above the >= 4 threshold.
  const four = elGanzouri({ ...easy, thyromental: 'lt-6', mallampati: '3', mouth: 'lt-4' });
  assert.equal(four.total, 4);
  assert.equal(four.difficult, true);
  assert.equal(four.threshold, 4);
});

test('maximum score is 12 (mouth and prognath cap at 1)', () => {
  const r = elGanzouri({ mouth: 'lt-4', thyromental: 'lt-6', mallampati: '4', neck: 'lt-80', prognath: 'no', weight: 'over-110', history: 'definite' });
  assert.equal(r.total, 12);
  assert.equal(r.difficult, true);
});

test('an unselected factor surfaces valid:false', () => {
  const r = elGanzouri({ mouth: 'ge-4' });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
