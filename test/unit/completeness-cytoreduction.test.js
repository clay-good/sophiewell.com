// spec-v655: Completeness of Cytoreduction (CC) score of Sugarbaker.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { completenessCytoreduction } from '../../lib/completeness-cytoreduction-v655.js';

test('size binning: 0 = CC-0, <2.5 = CC-1, 2.5-25 = CC-2, >25 = CC-3', () => {
  assert.equal(completenessCytoreduction({ residualMm: '0' }).cc, 0);
  assert.equal(completenessCytoreduction({ residualMm: '2' }).cc, 1);
  assert.equal(completenessCytoreduction({ residualMm: '10' }).cc, 2);
  assert.equal(completenessCytoreduction({ residualMm: '30' }).cc, 3);
});

test('boundary: 2.5 mm is CC-2 (not CC-1); 25 mm is CC-2; just over 25 is CC-3', () => {
  assert.equal(completenessCytoreduction({ residualMm: '2.4' }).cc, 1);
  assert.equal(completenessCytoreduction({ residualMm: '2.5' }).cc, 2);
  assert.equal(completenessCytoreduction({ residualMm: '25' }).cc, 2);
  assert.equal(completenessCytoreduction({ residualMm: '25.1' }).cc, 3);
});

test('complete cytoreduction is CC-0 and CC-1 only', () => {
  assert.equal(completenessCytoreduction({ residualMm: '0' }).complete, true);
  assert.equal(completenessCytoreduction({ residualMm: '2' }).complete, true);
  assert.equal(completenessCytoreduction({ residualMm: '10' }).complete, false);
  assert.equal(completenessCytoreduction({ residualMm: '30' }).complete, false);
});

test('confluence forces CC-3 regardless of size', () => {
  const r = completenessCytoreduction({ residualMm: '0', confluence: true });
  assert.equal(r.cc, 3);
  assert.equal(r.code, 'CC-3');
  assert.equal(r.complete, false);
  assert.equal(r.confluence, true);
});

test('META example: 2 mm residual = CC-1, complete', () => {
  const r = completenessCytoreduction({ residualMm: '2' });
  assert.equal(r.code, 'CC-1');
  assert.equal(r.complete, true);
  assert.match(r.bandLabel, /CC-1/);
});

test('residual size required when no confluence; negative rejected', () => {
  assert.equal(completenessCytoreduction({}).valid, false);
  assert.equal(completenessCytoreduction({}).code, 'MISSING_INPUT');
  assert.equal(completenessCytoreduction({ residualMm: '-1' }).valid, false);
  assert.equal(completenessCytoreduction({ residualMm: '-1' }).code, 'OUT_OF_RANGE');
});
