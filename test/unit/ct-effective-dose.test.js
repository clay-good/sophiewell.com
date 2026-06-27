// spec-v165 2.4: CT effective dose = DLP × region k. The k-factor table is the
// correctness-critical content; the multiplication is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ctEffectiveDose } from '../../lib/radiology-v165.js';

test('tile example: chest DLP 400 → 5.6 mSv (k 0.014)', () => {
  const r = ctEffectiveDose({ dlp: 400, region: 'chest' });
  assert.equal(r.valid, true);
  assert.equal(r.dose, 5.6);
  assert.equal(r.k, 0.014);
  assert.equal(r.region, 'chest');
});

test('region k factors: head, neck, abdomen', () => {
  assert.equal(ctEffectiveDose({ dlp: 1000, region: 'head' }).dose, 2.1); // 1000*0.0021
  assert.equal(ctEffectiveDose({ dlp: 1000, region: 'neck' }).dose, 5.9); // 1000*0.0059
  assert.equal(ctEffectiveDose({ dlp: 1000, region: 'abdomen' }).dose, 15); // 1000*0.015
  assert.equal(ctEffectiveDose({ dlp: 1000, region: 'abdomenpelvis' }).k, 0.015);
});

test('guards: blank DLP, missing region', () => {
  assert.equal(ctEffectiveDose({ region: 'chest' }).valid, false);
  assert.equal(ctEffectiveDose({ dlp: 400 }).valid, false);
  assert.equal(ctEffectiveDose({ dlp: 0, region: 'chest' }).valid, false);
  assert.equal(ctEffectiveDose({}).valid, false);
});
