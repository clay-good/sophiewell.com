// spec-v808: 2024 ADQI/ICA HRS-AKI diagnostic criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { hrsAki } from '../../lib/hrs-aki-v808.js';

const ALL = {
  cirrhosisWithAscites: true,
  akiPresent: true,
  noImprovementAfterVolume: true,
  noAlternativeCause: true,
};

test('nothing selected -> not met, and all four are named', () => {
  const r = hrsAki({});
  assert.equal(r.valid, true);
  assert.equal(r.diagnosis, false);
  assert.equal(r.missing.length, 4);
});

test('all four criteria -> met', () => {
  const r = hrsAki(ALL);
  assert.equal(r.diagnosis, true);
  assert.equal(r.criteriaMet, 4);
  assert.deepEqual(r.missing, []);
});

test('every one of the four is genuinely required', () => {
  for (const k of Object.keys(ALL)) {
    const o = { ...ALL };
    delete o[k];
    assert.equal(hrsAki(o).diagnosis, false, k);
    assert.equal(hrsAki(o).missing.length, 1, k);
  }
});

test('the 2015 exclusions do NOT exclude the diagnosis now', () => {
  const withAll = hrsAki({ ...ALL, proteinuria: true, microhematuria: true, abnormalUltrasound: true });
  assert.equal(withAll.diagnosis, true, 'still met with all three old exclusions present');
  assert.equal(withAll.nonExcluding.length, 3);
  assert.match(withAll.note2015, /2015/);
  assert.match(withAll.note2015, /do not/);
});

test('each old exclusion alone is recorded and still does not exclude', () => {
  for (const k of ['proteinuria', 'microhematuria', 'abnormalUltrasound']) {
    const r = hrsAki({ ...ALL, [k]: true });
    assert.equal(r.diagnosis, true, k);
    assert.equal(r.nonExcluding.length, 1, k);
  }
});

test('with none of them present there is no 2015 note to show', () => {
  const r = hrsAki(ALL);
  assert.equal(r.note2015, null);
  assert.deepEqual(r.nonExcluding, []);
});
