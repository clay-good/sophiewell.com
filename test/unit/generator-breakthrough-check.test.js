// spec-v1635 tool 26: generator breakthrough (10 CFR 35.204, 35.3204; Technelite and Cardiogen-82 labels).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatorBreakthroughCheck as check, GENERATORS } from '../../lib/generator-breakthrough-check-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const d = (i, table) => check(i, now, table);

test('both label rows answer', () => {
  for (const g of GENERATORS) assert.equal(labelRow(g.label.setId, now).answers, true, g.value);
});

test('Mo-99: the ratio at elution, its growth, and the latest administration time', () => {
  const low = d({ generator: 'tc-99m', mo99MicroCi: 20, tc99mMilliCi: 1000 });
  assert.deepEqual([low.ratioAtElution, low.exceedsAtElution, low.latestAdministrationHours], [0.02, false, 12]);
  const mid = d({ generator: 'tc-99m', mo99MicroCi: 100, tc99mMilliCi: 1000, hoursToAdministration: 6 });
  const rate = 1 / 6.02 - 1 / 66;
  assert.ok(Math.abs(mid.hoursUntilLimit - Math.log2(1.5) / rate) < 0.01);
  assert.ok(Math.abs(mid.ratioAtAdministration - 0.1 * 2 ** (6 * rate)) < 1e-5);
  assert.equal(mid.acceptableAtAdministration, false);
  assert.equal(d({ generator: 'tc-99m', mo99MicroCi: 100, tc99mMilliCi: 1000, hoursToAdministration: 3 }).acceptableAtAdministration, true);
  // Past the label's 12 hours is not acceptable even with no molybdenum measured.
  assert.equal(d({ generator: 'tc-99m', mo99MicroCi: 0, tc99mMilliCi: 1000, hoursToAdministration: 13 }).acceptableAtAdministration, false);
});

test('Mo-99: "more than" 0.15 at elution is the reportable case', () => {
  assert.equal(d({ generator: 'tc-99m', mo99MicroCi: 150, tc99mMilliCi: 1000 }).exceedsAtElution, false);
  const over = d({ generator: 'tc-99m', mo99MicroCi: 151, tc99mMilliCi: 1000 });
  assert.deepEqual([over.exceedsAtElution, over.flag], [true, 'exceeds-at-elution']);
  assert.match(over.notes.join(' '), /within 7 calendar days after discovery.*within 30 calendar days/);
  assert.equal(d({ generator: 'tc-99m', mo99MicroCi: 20, tc99mMilliCi: 1000, aluminumMcgPerMl: 10 }).aluminumExceeds, false);
  assert.equal(d({ generator: 'tc-99m', mo99MicroCi: 20, tc99mMilliCi: 1000, aluminumMcgPerMl: 10.1 }).aluminumExceeds, true);
});

test('Sr-82 and Sr-85: the rule and the label side by side', () => {
  assert.equal(d({ generator: 'rb-82', sr82: 0.001, sr85: 0.01, cumulativeVolumeL: 5, daysSinceCalibration: 20 }).flag, 'within-limits');
  assert.equal(d({ generator: 'rb-82', sr82: 0.002, sr85: 0.01 }).flag, 'label-alert');
  assert.equal(d({ generator: 'rb-82', sr82: 0.001, sr85: 0.01, cumulativeVolumeL: 14 }).flag, 'label-alert');
  assert.equal(d({ generator: 'rb-82', sr82: 0.01, sr85: 0.01 }).flag, 'label-expiration');
  assert.equal(d({ generator: 'rb-82', sr82: 0.001, sr85: 0.1 }).flag, 'label-expiration');
  assert.equal(d({ generator: 'rb-82', sr82: 0.001, sr85: 0.01, cumulativeVolumeL: 17 }).flag, 'label-expiration');
  assert.equal(d({ generator: 'rb-82', sr82: 0.001, sr85: 0.01, daysSinceCalibration: 60 }).flag, 'label-expiration');
  assert.equal(d({ generator: 'rb-82', sr82: 0.02, sr85: 0.2 }).exceedsRule, false); // "more than"
  const over = d({ generator: 'rb-82', sr82: 0.021, sr85: 0.01 });
  assert.deepEqual([over.exceedsRule, over.flag], [true, 'exceeds-rule']);
  assert.match(d({ generator: 'rb-82', sr82: 0.001, sr85: 0.01 }).notes.join(' '), /not entered, so those limits were not checked/);
});

test('a superseded label withholds its figures and keeps the rule', () => {
  const tc = GENERATORS[0].label.setId; const rb = GENERATORS[1].label.setId;
  const dead = { ...LABEL_EDITIONS, [tc]: { ...LABEL_EDITIONS[tc], supersededOn: '2026-10-10' }, [rb]: { ...LABEL_EDITIONS[rb], supersededOn: '2026-10-10' } };
  const t = d({ generator: 'tc-99m', mo99MicroCi: 20, tc99mMilliCi: 1000, aluminumMcgPerMl: 50 }, dead);
  assert.deepEqual([t.exceedsAtElution, t.latestAdministrationHours, t.aluminumExceeds, t.abnormal], [false, undefined, undefined, true]);
  const r = d({ generator: 'rb-82', sr82: 0.012, sr85: 0.01 }, dead);
  assert.deepEqual([r.exceedsRule, r.labelExpirationLimitReached, r.abnormal], [false, undefined, true]);
  assert.match(r.band, /stricter limits are withheld/);
});

test('refusals', () => {
  assert.match(d({}).message, /^Choose the generator/);
  assert.match(d({ generator: 'tc-99m' }).message, /^Enter the molybdenum-99 activity/);
  assert.match(d({ generator: 'tc-99m', mo99MicroCi: 20 }).message, /^Enter the technetium-99m activity/);
  assert.match(d({ generator: 'rb-82', sr82: 0.001 }).message, /^Enter the strontium-85 level/);
  assert.equal(d({ generator: 'tc-99m', mo99MicroCi: 20, tc99mMilliCi: 0 }).valid, false);
  assert.equal(check(null, now).valid, false);
});
