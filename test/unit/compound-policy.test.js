// spec-v1629 tools 24 and 25: FDA's section 503A "essentially a copy" check and anticipatory compounding limit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compoundCopyCheck as cc, MONTHLY_LIMIT, GUIDANCE as COPY } from '../../lib/compound-copy-check-v1629.js';
import { compoundAnticipatoryLimit as ca, GUIDANCE as ANTICIPATORY } from '../../lib/compound-anticipatory-limit-v1629.js';
import { META } from '../../lib/meta.js';

const base = { sameApi: 'yes', availability: 'marketed', compoundedStrength: 45, commercialStrength: 50, sameRoute: 'yes', determination: 'no', priorCount: 0 };

test('copy check: the 10% is taken on the commercial strength, and exactly 10% counts as within', () => {
  const r = cc(base);
  assert.deepEqual([r.essentiallyACopy, r.strength, r.percentDifference], [true, 'similar', 10]);
  assert.match(r.notes.join(' '), /does not say whether exactly 10% is "within 10%"; counting it as within is this tool's reading/);
  const off = cc({ ...base, compoundedStrength: 44.95 });
  assert.deepEqual([off.essentiallyACopy, off.strength, off.percentDifference], [false, 'different', 10.1]);
  assert.match(off.notes.join(' '), /the guidance gives no number/);
  // 55 against a commercial 50 is 10%, not 5 / 55 = 9.1%.
  assert.equal(cc({ ...base, compoundedStrength: 55 }).percentDifference, 10);
  assert.equal(cc({ ...base, compoundedStrength: 50 }).strength, 'same');
});

test('copy check: a whole multiple is easily substitutable (the guidance\'s 50 mg against 25 mg)', () => {
  const r = cc({ ...base, compoundedStrength: 50, commercialStrength: 25 });
  assert.deepEqual([r.essentiallyACopy, r.strength], [true, 'easily substitutable']);
  assert.equal(cc({ ...base, compoundedStrength: 40, commercialStrength: 25 }).strength, 'different');
});

test('copy check: the fifth uncounted prescription crosses the line; one with a determination does not', () => {
  assert.equal(MONTHLY_LIMIT, 4);
  const fourth = cc({ ...base, priorCount: 3 });
  assert.deepEqual([fourth.countedThisMonth, fourth.overMonthlyLimit], [4, false]);
  const fifth = cc({ ...base, priorCount: 4 });
  assert.deepEqual([fifth.countedThisMonth, fifth.overMonthlyLimit, fifth.abnormal], [5, true, true]);
  const documented = cc({ ...base, priorCount: 4, determination: 'yes' });
  assert.deepEqual([documented.essentiallyACopy, documented.countedThisMonth, documented.overMonthlyLimit], [false, 4, false]);
  assert.match(documented.notes.join(' '), /documents the determination is not counted/);
});

test('copy check: a product in shortage or discontinued is not commercially available', () => {
  for (const availability of ['shortage', 'discontinued']) {
    const r = cc({ ...base, availability });
    assert.deepEqual([r.essentiallyACopy, r.commerciallyAvailable], [false, false]);
    assert.match(r.band, /not commercially available/);
  }
  assert.match(cc({ ...base, sameRoute: 'no' }).band, /cannot be used by the route prescribed/);
  assert.match(cc({ ...base, sameApi: 'no' }).band, /active ingredient differs/);
});

test('copy check: every answer is required and nothing is defaulted', () => {
  assert.equal(cc({}).valid, false);
  for (const k of Object.keys(base)) {
    const r = cc({ ...base, [k]: '' });
    assert.equal(r.valid, false, k);
    assert.ok(r.message.length <= 280, k);
  }
  assert.match(cc({ ...base, priorCount: 1.5 }).message, /whole number/);
  assert.match(cc({ ...base, commercialStrength: 0 }).message, /commercial strength/);
});

const rx = '2026-01-20, 200\n2026-02-10, 300\n2026-03-25, 100\n2025-09-01, 900\n2026-11-01, 50';

test('anticipatory limit: the highest 30-day window crosses a month boundary', () => {
  const r = ca({ prescriptions: rx, asOf: '2026-10-11', onHand: 120 });
  assert.deepEqual([r.ceiling, r.windowFrom, r.windowThrough, r.room, r.overCeiling], [500, '2026-01-20', '2026-02-18', 380, false]);
  // No calendar month holds more than 300.
  assert.match(r.band, /^380 more units may be made under the policy/);
});

test('anticipatory limit: prescriptions older than a year, or dated after the as-of date, are ignored', () => {
  const r = ca({ prescriptions: rx, asOf: '2026-10-11' });
  assert.deepEqual([r.counted, r.ignoredOld, r.ignoredFuture], [3, 1, 1]);
  assert.match(r.notes.join(' '), /No units on hand were entered, so only the ceiling is given/);
  // A prescription received exactly a year before the as-of date is inside the year.
  assert.equal(ca({ prescriptions: '2025-10-11, 7', asOf: '2026-10-11' }).ceiling, 7);
  assert.match(ca({ prescriptions: '2025-10-10, 7', asOf: '2026-10-11' }).message, /No prescription falls in the year ending 2026-10-11/);
});

test('anticipatory limit: the 30th day is in the window and the 31st is not', () => {
  assert.equal(ca({ prescriptions: '2026-03-01, 10\n2026-03-30, 5', asOf: '2026-10-11' }).ceiling, 15);
  assert.equal(ca({ prescriptions: '2026-03-01, 10\n2026-03-31, 5', asOf: '2026-10-11' }).ceiling, 10);
});

test('anticipatory limit: the guidance\'s 500-unit example, and stock above the ceiling', () => {
  const at = ca({ prescriptions: '2026-06-01, 500', asOf: '2026-10-11', onHand: 500 });
  assert.deepEqual([at.room, at.overCeiling], [0, false]);
  const over = ca({ prescriptions: '2026-06-01, 500', asOf: '2026-10-11', onHand: 620 });
  assert.deepEqual([over.room, over.overCeiling, over.abnormal], [-120, true, true]);
  assert.match(over.band, /620 units on hand is 120 above the 500-unit ceiling/);
});

test('anticipatory limit: a blank as-of date is the caller\'s today; bad lines are refused by number', () => {
  assert.equal(ca({ prescriptions: '2026-10-01, 40' }, new Date('2026-10-11T12:00:00Z')).ceiling, 40);
  assert.match(ca({ prescriptions: '2026-10-01, 40\n2026-13-01, 5', asOf: '2026-10-11' }).message, /Prescription line 2/);
  assert.match(ca({ prescriptions: '2026-10-01', asOf: '2026-10-11' }).message, /Prescription line 1/);
  assert.match(ca({ prescriptions: '2026-10-01, 0', asOf: '2026-10-11' }).message, /line 1/);
  assert.match(ca({ prescriptions: '2026-10-01, 4', asOf: 'today' }).message, /as-of date/);
  assert.equal(ca({}).valid, false);
});

test('both guidance pages are under the page watch', () => {
  for (const g of [COPY, ANTICIPATORY]) {
    assert.equal(g.route, 'B');
    assert.match(g.source.url, /^https:\/\/www\.fda\.gov\/regulatory-information\/search-fda-guidance-documents\//);
  }
});

// spec-v1629 tool 23 is build-gated: FDA enforces neither the 5% limit nor the 50% threshold today.
test('the interstate-share tool stays out of the catalog until its gate opens', () => {
  assert.equal(META['compound-interstate-share'], undefined);
});
