// spec-v1631 tool 9 and spec-v1634 tool 2, built on the owner's decisions of October 17, 2026.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valproateAlbuminNormalized as v } from '../../lib/valproate-albumin-normalized-v1631.js';
import { whoUmcCausality as w } from '../../lib/who-umc-causality-v1634.js';

test('valproate: the spec\'s cases, from Hermida-Tutor Table 1 and CN = aH x CH / 6.5', () => {
  const r = v({ totalLevel: '45', albumin: '2.5', albuminUnit: 'g-dl' });
  assert.deepEqual([r.freeFraction, r.normalizedLevel, r.freeLevel], [21.6, 149.5, 9.7]);
  assert.equal(v({ totalLevel: '45', albumin: '4.2', albuminUnit: 'g-dl' }).normalizedLevel, 45, 'the reference albumin leaves the level unchanged');
  assert.equal(v({ totalLevel: '45', albumin: '25', albuminUnit: 'g-l' }).normalizedLevel, 149.5, 'g/L and g/dL agree');
  assert.match(v({ totalLevel: '45', albumin: '1.7', albuminUnit: 'g-dl' }).message, /table ends at 18 g\/L/);
  assert.match(v({ totalLevel: '45', albumin: '4.5', albuminUnit: 'g-dl' }).message, /table ends at 42 g\/L/);
  assert.match(v({ totalLevel: '90', albumin: '3', albuminUnit: 'g-dl' }).band, /^Above 75 mg\/L total, the paper found this method unreliable/);
  assert.match(v({ albumin: '3', albuminUnit: 'g-dl' }).message, /^Enter the total valproic acid level/);
  assert.match(v({ totalLevel: '45', albumin: '3' }).message, /albumin unit/);
});

test('WHO-UMC: first category met, in the source\'s order; the spec\'s two cases', () => {
  const base = { time: 'plausible', alternative: 'none', withdrawal: 'plausible', definitive: 'yes', rechallenge: 'not-done', moreData: 'no', insufficient: 'no' };
  assert.equal(w(base).category, 'Certain', 'rechallenge not done is still Certain ("if necessary")');
  assert.equal(w({ ...base, withdrawal: 'unclear' }).category, 'Possible', 'missing withdrawal information caps at Possible');
  assert.equal(w({ ...base, definitive: 'no' }).category, 'Probable / Likely');
  assert.equal(w({ ...base, time: 'improbable', alternative: 'plausible' }).category, 'Unlikely');
  assert.equal(w({ ...base, time: 'improbable', alternative: 'possible', moreData: 'yes' }).category, 'Conditional / Unclassified');
  assert.equal(w({ ...base, time: 'improbable', insufficient: 'yes' }).category, 'Unassessable / Unclassifiable');
  assert.equal(w({ ...base, time: 'improbable' }).category, null, 'no category fits: said, not guessed');
  assert.match(w({ ...base, definitive: 'no' }).notes.join(' '), /Certain is not reached: event definitive/);
  assert.match(w({}).message, /^Choose the time relationship/);
});
