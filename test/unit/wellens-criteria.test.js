// spec-v1441: Wellens criteria (de Zwaan 1982; Rhinehardt 2002; criteria as commonly listed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wellensCriteria as w } from '../../lib/wellens-criteria-v1441.js';

const MET = { tWave: 'deep', st: 'minimal', qWaves: 'no', rProgression: 'preserved', angina: 'yes', painFree: 'yes', markers: 'normal' };

test('all criteria met: type from the T-wave pattern', () => {
  assert.equal(w(MET).met, true);
  assert.equal(w(MET).type, 'B');
  assert.equal(w({ ...MET, tWave: 'biphasic' }).type, 'A');
});

test('each failed criterion is named', () => {
  const r = w({ ...MET, qWaves: 'yes', rProgression: 'poor' });
  assert.equal(r.met, false);
  assert.match(r.band, /precordial Q waves; poor R-wave progression/);
  assert.ok(r.notes.some((n) => /does not rule out an acute coronary syndrome/.test(n)));
});

test('the marker disagreement is shown, not resolved silently', () => {
  const r = w({ ...MET, markers: 'mild' });
  assert.equal(r.met, true);
  assert.ok(r.notes.some((n) => /no consensus/.test(n)));
  assert.equal(w({ ...MET, markers: 'marked' }).met, false);
});

test('a miss from ST elevation or raised markers stays flagged', () => {
  assert.equal(w({ ...MET, st: 'elevated' }).abnormal, true);
  assert.equal(w({ ...MET, markers: 'marked' }).abnormal, true);
  assert.equal(w({ ...MET, tWave: 'neither' }).abnormal, false);
});

test('a blank finding is asked for, never read as normal', () => {
  assert.match(w({ ...MET, qWaves: '' }).message, /precordial Q waves is still needed/);
  assert.equal(w({}).valid, false);
});
