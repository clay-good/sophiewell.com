// spec-v1443: de Winter pattern (de Winter 2008; features as stated in open reports).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deWinterPattern as dw } from '../../lib/de-winter-pattern-v1443.js';

const PATTERN = { stDepression: 'yes', tallT: 'yes', stElevation: 'no', avr: 'yes' };

test('upsloping J-point depression + tall T waves, no ST elevation: present', () => {
  const r = dw(PATTERN);
  assert.equal(r.present, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /STEMI equivalent/);
  assert.equal(dw({ ...PATTERN, avr: 'no' }).present, true); // aVR supports, not required
});

test('contiguous ST elevation routes to STEMI criteria, still flagged', () => {
  const r = dw({ ...PATTERN, stElevation: 'yes' });
  assert.equal(r.present, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /STEMI criteria/);
});

test('a missing core feature is named, and absence does not rule out occlusion', () => {
  const r = dw({ ...PATTERN, tallT: 'no' });
  assert.equal(r.present, false);
  assert.match(r.band, /tall, symmetrical T waves is missing/);
  assert.ok(r.notes.some((n) => /does not rule out/.test(n)));
});

test('a blank finding is asked for', () => {
  assert.match(dw({ ...PATTERN, stElevation: '' }).message, /contiguous precordial ST elevation is still needed/);
  assert.equal(dw({}).valid, false);
});
