// spec-v57 §2.8: Canadian Syncope Risk Score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canadianSyncope } from '../../lib/scoring-v5.js';

test('heart disease + troponin -> +3 medium', () => {
  const r = canadianSyncope({ heartDisease: true, tropElevated: true });
  assert.equal(r.score, 3); assert.match(r.band, /Medium/);
});
test('vasovagal predisposition + ED vasovagal dx -> -3 very low', () => {
  const r = canadianSyncope({ vasovagalPredisp: true, edxVasovagal: true });
  assert.equal(r.score, -3); assert.match(r.band, /Very low/);
});
test('cardiac dx + QTc + SBP extreme + troponin -> +8 very high', () => {
  const r = canadianSyncope({ edxCardiac: true, qtcProlonged: true, sbpExtreme: true, tropElevated: true });
  assert.equal(r.score, 8); assert.match(r.band, /Very high/);
});
test('all false -> 0 low risk', () => {
  assert.equal(canadianSyncope({}).score, 0);
  assert.match(canadianSyncope({}).band, /Low risk/);
});
