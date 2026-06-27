// spec-v158 2.2: LA volume (biplane area-length) & LAVI, with the ASE severity
// bands. The area-length division by L is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { laVolumeIndex } from '../../lib/echo-v158.js';

test('tile example: area-length volume and mild enlargement', () => {
  // 0.85 * 21 * 21 / 5.0 = 74.97 -> 75.0 mL; /2.0 = 37.5 mL/m² -> mild (35-41)
  const r = laVolumeIndex({ a1: 21, a2: 21, l: 5.0, bsa: 2.0 });
  assert.equal(r.valid, true);
  assert.equal(r.volume, 75);
  assert.equal(r.lavi, 37.5);
  assert.equal(r.bandLabel, 'Mildly enlarged');
  assert.equal(r.abnormal, true);
});

test('LAVI 34/35 normal→mild boundary', () => {
  // Target LAVI 34.0 (normal) then 35.x (mild) by nudging BSA.
  const normal = laVolumeIndex({ a1: 20, a2: 20, l: 5.0, bsa: 2.0 }); // 0.85*400/5=68 ; /2.0 = 34.0
  assert.equal(normal.lavi, 34);
  assert.equal(normal.bandLabel, 'Normal');
  assert.equal(normal.abnormal, false);
  const mild = laVolumeIndex({ a1: 20, a2: 20, l: 5.0, bsa: 1.9 }); // 68 / 1.9 = 35.8 -> mild
  assert.ok(mild.lavi >= 35 && mild.lavi <= 41);
  assert.equal(mild.bandLabel, 'Mildly enlarged');
});

test('severe enlargement above 48 mL/m²', () => {
  const r = laVolumeIndex({ a1: 30, a2: 28, l: 5.0, bsa: 2.0 }); // 0.85*840/5=142.8 ; /2.0=71.4
  assert.ok(r.lavi > 48);
  assert.equal(r.bandLabel, 'Severely enlarged');
});

test('blank inputs render a complete-the-fields fallback; L>0 guarded', () => {
  assert.equal(laVolumeIndex({}).valid, false);
  assert.equal(laVolumeIndex({ a1: 20, a2: 20, bsa: 2.0 }).valid, false); // no L
  assert.equal(laVolumeIndex({ a1: 20, a2: 20, l: 0, bsa: 2.0 }).valid, false); // L=0 guarded
  assert.match(laVolumeIndex({}).message, /A4C/);
});
