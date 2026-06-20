// spec-v149 2.3: draw-up volume = ordered dose (mg) / stock concentration
// (mg/mL), with an optional weight x per-kg-dose derivation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doseVolume } from '../../lib/ems-v149.js';

test('25 mg from 50 mg/mL -> 0.5 mL', () => {
  const r = doseVolume({ doseMg: 25, concentration: 50 });
  assert.equal(r.valid, true);
  assert.equal(r.volumeMl, 0.5);
  assert.match(r.band, /Draw 0\.5 mL: 25 mg from a 50 mg\/mL concentration\./);
});

test('weight + per-kg derives the ordered dose', () => {
  const r = doseVolume({ concentration: 10, weightKg: 20, doseMgPerKg: 1 });
  assert.equal(r.doseMg, 20);
  assert.equal(r.volumeMl, 2);
  assert.match(r.derivation, /1 mg\/kg x 20 kg = 20 mg/);
});

test('volume over 50 mL raises the large-draw flag', () => {
  const r = doseVolume({ doseMg: 600, concentration: 10 });
  assert.equal(r.volumeMl, 60);
  assert.equal(r.abnormal, true);
  assert.ok(r.flags.some((f) => /very large draw/.test(f)));
});

test('tiny volume raises the tuberculin-syringe flag', () => {
  const r = doseVolume({ doseMg: 0.04, concentration: 1 });
  assert.equal(r.abnormal, true);
  assert.ok(r.flags.some((f) => /tuberculin-syringe/.test(f)));
});

test('zero or negative concentration -> invalid', () => {
  assert.equal(doseVolume({ doseMg: 25, concentration: 0 }).valid, false);
  assert.equal(doseVolume({ doseMg: 25, concentration: -5 }).valid, false);
});

test('explicitly zeroed dose prompts, never draws 0 mL', () => {
  const r = doseVolume({ doseMg: 0, concentration: 50 });
  assert.equal(r.valid, false);
  assert.match(r.band, /greater than zero/);
});

test('no dose and no weight/per-kg -> invalid prompt', () => {
  const r = doseVolume({ concentration: 50 });
  assert.equal(r.valid, false);
  assert.doesNotMatch(r.band, /NaN/);
});
