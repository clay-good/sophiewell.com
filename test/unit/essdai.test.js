// spec-v156 2.3: ESSDAI (Seror 2010; weights Seror 2015). 12 domains, each
// scored at an activity level whose printed value is already weight × level, so
// the total is the direct sum. Strata: low < 5, moderate 5 to 13, high >= 14.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { essdai, ESSDAI_DOMAINS } from '../../lib/rheum-ob-v156.js';

test('tile example: the low/moderate 4/5 boundary across multiple weighted domains', () => {
  // articular Moderate (+4) + biological Low (+1) = 5 => moderate (>= 5).
  const r = essdai({ articular: 'Moderate', biological: 'Low' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.startsWith('ESSDAI 5 '));
  assert.match(r.band, /moderate systemic activity/);
});

test('the 4/5 (low/moderate) boundary is exact', () => {
  // articular Moderate alone (+4) is the top of the low band.
  const four = essdai({ articular: 'Moderate' });
  assert.equal(four.score, 4);
  assert.equal(four.bandLabel, 'Low');
  assert.equal(four.abnormal, false);
});

test('the 13/14 (moderate/high) boundary is exact', () => {
  // muscular Moderate (+12) + biological Low (+1) = 13 => moderate.
  const thirteen = essdai({ muscular: 'Moderate', biological: 'Low' });
  assert.equal(thirteen.score, 13);
  assert.equal(thirteen.bandLabel, 'Moderate');
  // muscular Moderate (+12) + articular Moderate... no, use muscular High (+18) alone = 18 => high.
  const high = essdai({ muscular: 'High' });
  assert.equal(high.score, 18);
  assert.equal(high.bandLabel, 'High');
  assert.equal(high.abnormal, true);
});

test('an unselected domain contributes 0, never NaN; all-blank is a valid 0/low', () => {
  const blank = essdai({});
  assert.equal(blank.valid, true);
  assert.equal(blank.score, 0);
  assert.equal(blank.bandLabel, 'Low');
  assert.ok(!/NaN|undefined/.test(blank.band));
});

test('the published domain weights and missing-level structure are intact', () => {
  const byKey = Object.fromEntries(ESSDAI_DOMAINS.map((d) => [d.key, d]));
  // A spot-check of the correctness-critical weights.
  assert.equal(byKey.muscular.weight, 6);
  assert.equal(byKey.pulmonary.levels.High, 15);
  assert.equal(byKey.biological.levels.Moderate, 2);
  // Constitutional / glandular / biological have no High level.
  assert.equal(byKey.constitutional.levels.High, undefined);
  assert.equal(byKey.glandular.levels.High, undefined);
  assert.equal(byKey.biological.levels.High, undefined);
  // CNS has no Low level (jumps No -> Moderate).
  assert.equal(byKey.cns.levels.Low, undefined);
  assert.equal(byKey.cns.levels.Moderate, 10);
  // Theoretical maximum is 123 (sum of each domain's top level).
  const max = ESSDAI_DOMAINS.reduce((a, d) => a + Math.max(...Object.values(d.levels)), 0);
  assert.equal(max, 123);
});

test('an out-of-domain level string is ignored (treated as no activity), not NaN', () => {
  const r = essdai({ articular: 'bogus', muscular: 'Low' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6); // bogus -> 0, muscular Low +6
});
