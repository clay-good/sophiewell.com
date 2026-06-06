// spec-v57 §2.5: Ottawa Knee Rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ottawaKnee } from '../../lib/scoring-v5.js';

test('any criterion -> x-ray indicated', () => {
  assert.equal(ottawaKnee({ age55: true }).xrayIndicated, true);
  assert.equal(ottawaKnee({ cannotBearWeight: true }).xrayIndicated, true);
});
test('no criterion -> deferred', () => {
  const r = ottawaKnee({ age55: false, patellarTender: false, fibularHeadTender: false, cannotFlex90: false, cannotBearWeight: false });
  assert.equal(r.xrayIndicated, false); assert.match(r.band, /deferred/);
});
test('scalar/empty input is treated as all-absent', () => {
  assert.equal(ottawaKnee({}).xrayIndicated, false);
});
