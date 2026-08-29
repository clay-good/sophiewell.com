import test from 'node:test';
import assert from 'node:assert/strict';
import { homeOxygen as h, SUPPORTING_FINDINGS, PAO2_QUALIFY, SPO2_QUALIFY, SPO2_BORDERLINE } from '../../lib/home-oxygen-v889.js';

const ok = { roomAir: true, clinicallyStable: true };

test('home-oxygen: the published thresholds and supporting findings', () => {
  assert.equal(PAO2_QUALIFY, 55);
  assert.equal(SPO2_QUALIFY, 88);
  assert.equal(SPO2_BORDERLINE, 89);
  assert.deepEqual(SUPPORTING_FINDINGS.map((s) => s.key), ['dependentEdema', 'pulmonaryHypertension', 'polycythemia']);
});

test('home-oxygen: the outright band, read strictly on both measures', () => {
  assert.equal(h({ ...ok, spo2: 88 }).group, 'one');
  assert.equal(h({ ...ok, spo2: 89 }).group, 'two-unsupported');
  assert.equal(h({ ...ok, pao2: 55 }).group, 'one');
  assert.equal(h({ ...ok, pao2: 56 }).group, 'two-unsupported');
  // Either measure alone can qualify the case.
  assert.equal(h({ ...ok, pao2: 70, spo2: 85 }).group, 'one');
});

test('home-oxygen: the borderline band needs a supporting finding', () => {
  const borderline = { ...ok, spo2: 89 };
  assert.equal(h(borderline).qualifies, false);
  assert.match(h(borderline).band, /qualifies only alongside a supporting finding/);
  for (const s of SUPPORTING_FINDINGS) {
    assert.equal(h({ ...borderline, [s.key]: true }).group, 'two', s.key);
    assert.equal(h({ ...borderline, [s.key]: true }).qualifies, true, s.key);
  }
  assert.match(h(borderline).borderlineNote, /one point from 88 percent/);
  assert.equal(h({ ...ok, spo2: 85 }).borderlineNote, null);
  // The tension band behaves the same way.
  assert.equal(h({ ...ok, pao2: 58, pulmonaryHypertension: true }).group, 'two');
});

test('home-oxygen: supporting findings do nothing outside the borderline band', () => {
  assert.equal(h({ ...ok, spo2: 95, dependentEdema: true }).group, 'three');
  assert.equal(h({ ...ok, spo2: 80, dependentEdema: true }).group, 'one');
});

test('home-oxygen: the measurement conditions are inputs and are named when missing', () => {
  // The reason the tile exists.
  assert.match(h({ spo2: 87, clinicallyStable: true }).conditionsNote, /taken on room air/);
  assert.match(h({ spo2: 87, roomAir: true }).conditionsNote, /clinically stable/);
  assert.match(h({ spo2: 87 }).conditionsNote, /commonest reason a prescription is later found not to have been supportable/);
  assert.match(h({ ...ok, spo2: 87 }).conditionsNote, /Recorded as taken on room air/);
});

test('home-oxygen: coverage is not evidence, and these are resting criteria', () => {
  for (const input of [{ ...ok, spo2: 87 }, { ...ok, spo2: 95 }]) {
    assert.match(h(input).evidenceNote, /not the same question/);
    assert.match(h(input).evidenceNote, /does not recommend it for moderate resting hypoxemia/);
    assert.match(h(input).exertionNote, /nocturnal desaturation, are assessed separately/);
  }
});

test('home-oxygen: a missing or out-of-range measurement is refused', () => {
  assert.equal(h({ ...ok }).valid, false);
  assert.match(h({ ...ok }).message, /Enter an arterial oxygen tension/);
  assert.equal(h({ ...ok, spo2: 39 }).valid, false);
  assert.equal(h({ ...ok, spo2: 101 }).valid, false);
  assert.equal(h({ ...ok, pao2: 9 }).valid, false);
});

test('home-oxygen: the documented example', () => {
  const r = h({ spo2: '89', roomAir: true, clinicallyStable: true, dependentEdema: true });
  assert.equal(r.group, 'two');
  assert.equal(r.supporting.length, 1);
  assert.equal(r.qualifies, true);
});
