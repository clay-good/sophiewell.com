// spec-v676: Lund-Kennedy endoscopic score for chronic rhinosinusitis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { lundKennedy } from '../../lib/lund-kennedy-v676.js';

// Six required core variables (polyps/edema/discharge x left/right).
const CORE = { polL: '1', polR: '1', edeL: '1', edeR: '1', disL: '1', disR: '1' };

test('modified total sums the 6 core variables (0-12)', () => {
  const r = lundKennedy(CORE);
  assert.equal(r.valid, true);
  assert.equal(r.modifiedTotal, 6);
  assert.equal(r.originalTotal, 6); // no scarring/crusting entered
  assert.equal(r.postopExtra, 0);
});

test('scarring/crusting are optional and extend the original total to 0-20', () => {
  const r = lundKennedy({ ...CORE, scaL: '2', scaR: '2', cruL: '1', cruR: '1' });
  assert.equal(r.modifiedTotal, 6);
  assert.equal(r.postopExtra, 6);
  assert.equal(r.originalTotal, 12);
});

test('all-zero core -> 0/12 and 0/20', () => {
  const r = lundKennedy({ polL: '0', polR: '0', edeL: '0', edeR: '0', disL: '0', disR: '0' });
  assert.equal(r.modifiedTotal, 0);
  assert.equal(r.originalTotal, 0);
  assert.equal(r.abnormal, false);
});

test('max scores: modified 12, original 20', () => {
  const r = lundKennedy({ polL: '2', polR: '2', edeL: '2', edeR: '2', disL: '2', disR: '2', scaL: '2', scaR: '2', cruL: '2', cruR: '2' });
  assert.equal(r.modifiedTotal, 12);
  assert.equal(r.originalTotal, 20);
});

test('abnormal flag set when any variable is severe (score 2)', () => {
  assert.equal(lundKennedy(CORE).abnormal, false); // all 1s
  assert.equal(lundKennedy({ ...CORE, disR: '2' }).abnormal, true);
});

test('META example: polyps 2/1, edema 1/1, discharge 1/0 -> modified 6/12', () => {
  const r = lundKennedy({ polL: '2', polR: '1', edeL: '1', edeR: '1', disL: '1', disR: '0' });
  assert.equal(r.modifiedTotal, 6);
  assert.match(r.band, /modified 6\/12/);
});

test('core variables required; optional post-op default to 0', () => {
  assert.equal(lundKennedy({}).valid, false);
  assert.equal(lundKennedy({}).code, 'MISSING_INPUT');
  assert.equal(lundKennedy({ ...CORE, polL: '3' }).field, 'polL');
  // omitting scarring/crusting is valid (defaults to 0)
  assert.equal(lundKennedy(CORE).valid, true);
});
