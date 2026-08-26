// spec-v799: Caine criteria for Wernicke encephalopathy.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { caineWernicke } from '../../lib/caine-wernicke-v799.js';

const SIGNS = ['dietaryDeficiency', 'oculomotor', 'cerebellar', 'mentalOrMemory'];

test('no signs -> not met, and it says so without excluding the diagnosis', () => {
  const r = caineWernicke({});
  assert.equal(r.valid, true);
  assert.equal(r.signCount, 0);
  assert.equal(r.met, false);
  assert.match(r.band, /does NOT exclude/);
});

test('one sign is not enough; two is', () => {
  assert.equal(caineWernicke({ dietaryDeficiency: true }).met, false);
  assert.equal(caineWernicke({ dietaryDeficiency: true, mentalOrMemory: true }).met, true);
});

test('any two of the four signs meet the criteria', () => {
  for (let i = 0; i < SIGNS.length; i += 1) {
    for (let j = i + 1; j < SIGNS.length; j += 1) {
      const r = caineWernicke({ [SIGNS[i]]: true, [SIGNS[j]]: true });
      assert.equal(r.met, true, `${SIGNS[i]} + ${SIGNS[j]}`);
      assert.equal(r.signCount, 2, `${SIGNS[i]} + ${SIGNS[j]}`);
    }
  }
});

test('every sign carries equal weight, with no required one', () => {
  for (const s of SIGNS) {
    assert.equal(caineWernicke({ [s]: true }).signCount, 1, s);
  }
});

test('all four signs -> met, 4 of 4', () => {
  const o = {};
  for (const s of SIGNS) o[s] = true;
  const r = caineWernicke(o);
  assert.equal(r.signCount, 4);
  assert.equal(r.met, true);
});

test('a met result points toward thiamine rather than away from it', () => {
  const r = caineWernicke({ oculomotor: 'true', cerebellar: 'true' });
  assert.match(r.band, /thiamine/i);
});
