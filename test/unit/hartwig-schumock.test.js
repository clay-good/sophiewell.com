// spec-v1634 tools 3 and 26, built from verified reprints (owner's rule, October 17, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hartwigAdrSeverity as hw } from '../../lib/hartwig-adr-severity-v1634.js';
import { schumockThorntonPreventability as st, SECTION_A, SECTION_B } from '../../lib/schumock-thornton-preventability-v1634.js';

const N = { death: 'no', permanentHarm: 'no', intensiveCare: 'no', longerStay: 'no', admission: 'no', drugChanged: 'no', treatment: 'no' };
const lvl = (x) => hw({ ...N, ...x }).level;

test('Hartwig and Siegel: the seven levels and their bands', () => {
  assert.equal(lvl({}), 1);
  assert.equal(lvl({ drugChanged: 'yes' }), 2);
  assert.equal(lvl({ treatment: 'yes' }), 3);
  assert.equal(lvl({ drugChanged: 'yes', treatment: 'yes' }), 3, 'and/or');
  assert.equal(lvl({ drugChanged: 'yes', longerStay: 'yes' }), 4);
  assert.equal(lvl({ admission: 'yes' }), 4);
  assert.equal(lvl({ admission: 'yes', intensiveCare: 'yes' }), 5);
  assert.equal(lvl({ permanentHarm: 'yes' }), 6);
  assert.equal(lvl({ death: 'yes', permanentHarm: 'yes' }), 7);
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map((l) => (l <= 2 ? 'mild' : l <= 4 ? 'moderate' : 'severe')), ['mild', 'mild', 'moderate', 'moderate', 'severe', 'severe', 'severe']);
  assert.equal(hw({ ...N, admission: 'yes', intensiveCare: 'yes' }).severity, 'severe');
});

test('Hartwig: intensive care or a longer stay without a level 4 basis does not raise the level, and says so', () => {
  const r = hw({ ...N, intensiveCare: 'yes' });
  assert.equal(r.level, 1);
  assert.ok(r.notes.some((n) => /does not raise the level/.test(n)));
  assert.equal(lvl({ longerStay: 'yes' }), 1);
  assert.equal(hw({ ...N, death: '' }).valid, false, 'an unanswered question is asked for');
});

const S = Object.fromEntries([...SECTION_A, ...SECTION_B].map(([k]) => [k, 'no']));
test('modified Schumock and Thornton: section A first, then B, else not preventable', () => {
  assert.equal(SECTION_A.length, 5);
  assert.equal(SECTION_B.length, 4);
  assert.equal(st({ ...S }).category, 'not preventable');
  assert.equal(st({ ...S, preventionNotGiven: 'yes' }).category, 'probably preventable', 'preventive measures sit in section B');
  assert.equal(st({ ...S, knownTreatment: 'yes' }).category, 'definitely preventable', 'a known treatment sits in section A');
  const both = st({ ...S, inappropriateDose: 'yes', interaction: 'yes' });
  assert.equal(both.section, 'A');
  assert.ok(both.notes.some((n) => /stops at the first section/.test(n)));
  assert.equal(st({ allergyHistory: 'yes' }).valid, false);
});
