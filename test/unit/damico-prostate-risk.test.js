// spec-v130 2.5: D'Amico risk classification (D'Amico 1998). Worst feature
// governs. Low = <=T2a AND PSA <=10 AND Gleason <=6; Intermediate = T2b OR
// PSA >10-20 OR Gleason 7; High = >=T2c OR PSA >20 OR Gleason >=8.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { damicoProstateRisk } from '../../lib/uro-v130.js';

test('all-low features -> Low risk', () => {
  const r = damicoProstateRisk({ psa: 6, gleason: 6, stage: 'T2a' });
  assert.equal(r.valid, true);
  assert.equal(r.risk, 'Low');
  assert.equal(r.abnormal, false);
});

test('Gleason 7 alone lifts to Intermediate (worst-feature rule)', () => {
  const r = damicoProstateRisk({ psa: 6, gleason: 7, stage: 'T1c' });
  assert.equal(r.risk, 'Intermediate');
  assert.match(r.band, /Gleason/);
  assert.equal(r.abnormal, true);
});

test('PSA boundary is strict: PSA 10 stays Low, 10.1 becomes Intermediate', () => {
  assert.equal(damicoProstateRisk({ psa: 10, gleason: 6, stage: 'T1c' }).risk, 'Low');
  assert.equal(damicoProstateRisk({ psa: 10.1, gleason: 6, stage: 'T1c' }).risk, 'Intermediate');
});

test('T2c or PSA >20 or Gleason >=8 -> High', () => {
  assert.equal(damicoProstateRisk({ psa: 6, gleason: 6, stage: 'T2c' }).risk, 'High');
  assert.equal(damicoProstateRisk({ psa: 25, gleason: 6, stage: 'T1c' }).risk, 'High');
  assert.equal(damicoProstateRisk({ psa: 6, gleason: 9, stage: 'T1c' }).risk, 'High');
});

test('blank/invalid field -> valid:false; unknown stage -> valid:false', () => {
  assert.equal(damicoProstateRisk({ psa: 6, gleason: 7 }).valid, false);
  assert.equal(damicoProstateRisk({ psa: 6, gleason: 7, stage: 'T9z' }).valid, false);
  assert.equal(damicoProstateRisk(7).valid, false);
});
