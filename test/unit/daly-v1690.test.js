// spec-v1690: DALYs as YLL + YLD. The loss-function figures asserted here are WHO's own
// (Global Health Estimates technical paper GHE/2026.3, September 2026, Table 2.1).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daly, LOSS_FUNCTION, AGE_RANGES } from '../../lib/daly-v1690.js';

test('DALY is the two sides added, each reported with its own arithmetic', () => {
  // 100 deaths at 50-54 (40.61 standard years) = 4,061 YLL.
  // 2,000 people at a disability weight of 0.133 = 266 YLD.
  const r = daly({ deaths: '100', ageRange: '50-54', prevalentCases: '2000', disabilityWeight: '0.133' });
  assert.equal(r.valid, true);
  assert.equal(r.yll, 4061);
  assert.equal(r.yld, 266);
  assert.equal(r.daly, 4327);
  assert.match(r.band, /4,327 DALYs/);
  assert.ok(r.notes.some((n) => /40\.61 standard years/.test(n)));
  assert.ok(r.notes.some((n) => /disability weight of 0\.133/.test(n)));
});

test("the loss function is WHO's Table 2.1, including the cell its own table mistypes", () => {
  // Every figure here is read off Table 2.1's WHO GHE column.
  const years = (k) => LOSS_FUNCTION.find((r) => r.key === k).years;
  assert.equal(years('neonatal'), 92.65);
  assert.equal(years('1-4'), 89.74);
  assert.equal(years('50-54'), 40.61);
  assert.equal(years('85+'), 7.28);
  // The source prints "17,19" for 75-79, with a comma for the decimal point.
  assert.equal(years('75-79'), 17.19);
  // And the column must fall monotonically, which is what makes 17.19 the only reading.
  const ys = LOSS_FUNCTION.map((r) => r.years);
  for (let i = 1; i < ys.length; i += 1) {
    assert.ok(ys[i] < ys[i - 1], `the loss function must fall with age: ${ys[i - 1]} then ${ys[i]}`);
  }
  assert.equal(LOSS_FUNCTION.length, 20);
  assert.equal(AGE_RANGES.length, 20);
});

test('the years lost depend on the age at death, so the age range is required', () => {
  const r = daly({ deaths: '100' });
  assert.equal(r.valid, false);
  assert.match(r.message, /age range/);
  // And the refusal names the span, so the reader can see why it matters.
  assert.match(r.message, /92\.65/);
  assert.match(r.message, /7\.28/);
});

test('a blank half is not a zero: each side alone says what it is missing', () => {
  const fatalOnly = daly({ deaths: '10', ageRange: '70-74' });
  assert.equal(fatalOnly.valid, true);
  assert.equal(fatalOnly.yld, 0);
  assert.equal(fatalOnly.yll, 216.2);
  assert.ok(fatalOnly.notes.some((n) => /fatal side only/.test(n)),
    'a DALY without the disability side must not read as the whole burden');

  const nonFatalOnly = daly({ prevalentCases: '500', disabilityWeight: '0.2' });
  assert.equal(nonFatalOnly.valid, true);
  assert.equal(nonFatalOnly.yll, 0);
  assert.equal(nonFatalOnly.yld, 100);
  assert.ok(nonFatalOnly.notes.some((n) => /disability side only/.test(n)));

  const neither = daly({});
  assert.equal(neither.valid, false);
  assert.match(neither.message, /blank half is not a zero/);
});

test('the comorbidity adjustment WHO makes and this cannot is stated whenever a YLD is shown', () => {
  const r = daly({ prevalentCases: '500', disabilityWeight: '0.2' });
  assert.ok(r.notes.some((n) => /independent comorbidity/.test(n) && /overstates the total/.test(n)),
    'an unadjusted YLD must say it is unadjusted');
  // Not claimed where there is no YLD to adjust.
  const fatalOnly = daly({ deaths: '10', ageRange: '70-74' });
  assert.ok(!fatalOnly.notes.some((n) => /independent comorbidity/.test(n)));
});

test('no discounting and no age weights, and the result says the standard is normative', () => {
  const r = daly({ deaths: '1', ageRange: 'neonatal' });
  // A neonatal death is the full 92.65 years: discounting or age weights would cut it to about 33,
  // which is what the old WHO standard reported (section 2, "a death in infancy corresponds to 33 DALYs").
  assert.equal(r.yll, 92.65);
  assert.notEqual(Math.round(r.yll), 33);
  assert.match(r.note, /no time discounting and no age weights/);
  assert.match(r.note, /not the life expectancy where the death happened/);
  assert.ok(r.notes.some((n) => /not directly comparable with earlier WHO DALY estimates/.test(n)));
});

test('a disability weight is a 0-to-1 fraction, and the bounds are enforced', () => {
  assert.equal(daly({ prevalentCases: '100', disabilityWeight: '1' }).yld, 100);
  assert.equal(daly({ prevalentCases: '100', disabilityWeight: '0' }).yld, 0);
  for (const w of ['1.5', '-0.1', '13']) {
    const r = daly({ prevalentCases: '100', disabilityWeight: w });
    assert.equal(r.valid, false, `a disability weight of ${w} should be refused`);
  }
  // Prevalence without a weight cannot be turned into years.
  assert.equal(daly({ prevalentCases: '100' }).valid, false);
});

test('nothing is banded, because the paper sets no threshold for a DALY count', () => {
  const r = daly({ deaths: '100000', ageRange: 'neonatal' });
  assert.equal(r.abnormal, false);
  const all = [r.band, r.bandLabel, r.note, ...r.notes].join(' ');
  assert.ok(!/\b(high|low|severe|acceptable|target|threshold) burden\b/i.test(all),
    'a DALY total is a quantity, not a graded verdict');
});

test('counts are guarded, and whitespace is not a measured zero', () => {
  assert.equal(daly({ deaths: '  ', ageRange: '50-54', prevalentCases: '  ' }).valid, false);
  assert.equal(daly({ deaths: '-5', ageRange: '50-54' }).valid, false);
  assert.match(daly({ deaths: 'ten', ageRange: '50-54' }).message, /deaths/);
});
