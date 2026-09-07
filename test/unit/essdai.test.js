// spec-v156 2.3: ESSDAI (Seror 2010; weights Seror 2015). 12 domains, each
// scored at an activity level whose printed value is already weight × level, so
// the total is the direct sum. Strata: low < 5, moderate 5 to 13, high >= 14.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { essdai, ESSDAI_DOMAINS } from '../../lib/rheum-ob-v156.js';

// spec-v1109: all twelve domains rated, with the ones under test overridden.
// The assertions below used to rate one or two and let the other ten fall
// through to 'No' -- the level meaning "examined and quiet" -- which is the
// defect that wave fixed, not a test of the weights.
const rated = (o = {}) => {
  const all = {};
  for (const d of ESSDAI_DOMAINS) all[d.key] = 'No';
  return { ...all, ...o };
};

test('tile example: the low/moderate 4/5 boundary across multiple weighted domains', () => {
  // articular Moderate (+4) + biological Low (+1) = 5 => moderate (>= 5).
  const r = essdai(rated({ articular: 'Moderate', biological: 'Low' }));
  assert.equal(r.valid, true);
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.startsWith('ESSDAI 5 '));
  assert.match(r.band, /moderate systemic activity/);
});

test('the 4/5 (low/moderate) boundary is exact', () => {
  // articular Moderate alone (+4) is the top of the low band.
  const four = essdai(rated({ articular: 'Moderate' }));
  assert.equal(four.score, 4);
  assert.equal(four.bandLabel, 'Low');
  assert.equal(four.abnormal, false);
});

test('the 13/14 (moderate/high) boundary is exact', () => {
  // muscular Moderate (+12) + biological Low (+1) = 13 => moderate.
  const thirteen = essdai(rated({ muscular: 'Moderate', biological: 'Low' }));
  assert.equal(thirteen.score, 13);
  assert.equal(thirteen.bandLabel, 'Moderate');
  // muscular Moderate (+12) + articular Moderate... no, use muscular High (+18) alone = 18 => high.
  const high = essdai(rated({ muscular: 'High' }));
  assert.equal(high.score, 18);
  assert.equal(high.bandLabel, 'High');
  assert.equal(high.abnormal, true);
});

test('spec-v1109: an unrated domain is not a quiet one, and never NaN', () => {
  const blank = essdai({});
  assert.equal(blank.valid, true);
  assert.equal(blank.score, 0);
  assert.equal(blank.unrated.length, 12);
  assert.equal(blank.floorOnly, true);
  assert.ok(!/NaN|undefined/.test(blank.band));
  assert.match(blank.band, /ESSDAI at least 0 on what was rated/);
  assert.match(blank.band, /can only raise it/);
  assert.doesNotMatch(blank.band, /low systemic activity/);
  assert.doesNotMatch(blank.detail, /No active systemic domain \(total 0\)/);
  assert.match(blank.detail, /Unrated: /);

  // A fully rated quiet patient still reads as low activity.
  const quiet = essdai(rated());
  assert.equal(quiet.bandLabel, 'Low');
  assert.match(quiet.band, /ESSDAI 0 . low systemic activity/);
});

test('spec-v1109: high activity rules in even with domains unrated', () => {
  // Rule 13: an unrated domain cannot bring a floor of 18 back under 14.
  const r = essdai({ muscular: 'High' });
  assert.equal(r.score, 18);
  assert.equal(r.floorOnly, false);
  assert.equal(r.bandLabel, 'High');
  assert.match(r.band, /high systemic activity/);
});

test('spec-v1109: every ESSDAI level is >= 0, which is what makes it a floor', () => {
  for (const d of ESSDAI_DOMAINS) {
    for (const [level, points] of Object.entries(d.levels)) {
      assert.ok(points >= 0, `${d.key}.${level} is ${points}: the floor claim no longer holds`);
    }
  }
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
