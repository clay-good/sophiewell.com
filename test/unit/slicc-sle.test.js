// spec-v160 2.3: SLICC 2012 SLE classification (Petri 2012). >=4 criteria with
// >=1 clinical AND >=1 immunologic, OR biopsy lupus nephritis + ANA/anti-dsDNA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliccSle } from '../../lib/rheum-v160.js';

test('tile example: 3 clinical + 1 immunologic classifies', () => {
  const r = sliccSle({ acuteCutaneous: true, synovitis: true, renal: true, ana: true });
  assert.equal(r.valid, true);
  assert.equal(r.classifies, true);
  assert.equal(r.clinical, 3);
  assert.equal(r.immunologic, 1);
});

test('4 clinical with 0 immunologic does NOT classify (distribution rule)', () => {
  const r = sliccSle({ acuteCutaneous: true, synovitis: true, renal: true, serositis: true });
  assert.equal(r.total, 4);
  assert.equal(r.classifies, false); // no immunologic criterion
});

test('biopsy pathway classifies with < 4 total criteria', () => {
  const r = sliccSle({ biopsyNephritis: true, ana: true });
  assert.equal(r.classifies, true);
  assert.match(r.band, /biopsy-proven lupus nephritis/);
  // ...but biopsy nephritis without ANA/anti-dsDNA does not take the shortcut.
  assert.equal(sliccSle({ biopsyNephritis: true }).classifies, false);
});

test('nothing selected does not classify', () => {
  const r = sliccSle({});
  assert.equal(r.valid, true);
  assert.equal(r.classifies, false);
  assert.equal(r.total, 0);
});
