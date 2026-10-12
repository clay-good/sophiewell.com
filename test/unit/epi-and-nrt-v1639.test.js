// spec-v1639 tools 12 and 13: nicotine replacement schedules and epinephrine device strengths.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { epinephrineDeviceWeightBand as epi, EPIPEN, AUVIQ, NEFFY } from '../../lib/epinephrine-device-weight-band-v1639.js';
import { nrtStepSchedule as nrt, PRODUCTS, HABITROL } from '../../lib/nrt-step-schedule-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const NOW = new Date('2026-10-12T12:00:00Z');
const ET = { [EPIPEN]: row('EpiPen'), [AUVIQ]: row('Auvi-Q'), [NEFFY]: row('neffy') };
const NT = { ...Object.fromEntries(PRODUCTS.map((p) => [p.setId, row(p.brand)])), [HABITROL]: row('Habitrol gum') };
const e = (o, t = ET) => epi(o, NOW, t);
const n = (o, t = NT) => nrt(o, NOW, t);

test('epinephrine: the three bands', () => {
  const a = e({ weight: 10, weightUnit: 'kg' });
  assert.deepEqual([a.auviQ, a.epiPen, a.neffy, a.abnormal], ['0.1 mg', null, null, true]);
  const b = e({ weight: 20, weightUnit: 'kg' });
  assert.deepEqual([b.auviQ, b.epiPen, b.neffy, b.abnormal], ['0.15 mg', 'EpiPen Jr 0.15 mg', 'one spray of 1 mg', false]);
  const c = e({ weight: 45, weightUnit: 'kg' });
  assert.deepEqual([c.auviQ, c.epiPen, c.neffy], ['0.3 mg', 'EpiPen 0.3 mg', 'one spray of 2 mg']);
  assert.equal(e({ weight: 7, weightUnit: 'kg' }).auviQ, null);
  assert.equal(e({ weight: 14.9, weightUnit: 'kg' }).auviQ, '0.1 mg');
  assert.equal(e({ weight: 15, weightUnit: 'kg' }).neffy, 'one spray of 1 mg');
});

test('epinephrine: exactly 30 kg is in both EpiPen bands, and 66 lb likewise', () => {
  const k = e({ weight: 30, weightUnit: 'kg' });
  assert.deepEqual([k.epiPen, k.auviQ], ['EpiPen Jr 0.15 mg or EpiPen 0.3 mg', '0.3 mg']);
  assert.match(k.note, /Both are shown; the label does not settle it/);
  // 66 lb is 29.94 kg: under 30 kg on the kg-only labels, in both bands on the EpiPen label's pounds.
  const p = e({ weight: 66, weightUnit: 'lb' });
  assert.deepEqual([p.weightKg, p.auviQ, p.neffy, p.epiPen], [29.94, '0.15 mg', 'one spray of 1 mg', 'EpiPen Jr 0.15 mg or EpiPen 0.3 mg']);
  assert.equal(e({ weight: 33, weightUnit: 'lb' }).epiPen, 'EpiPen Jr 0.15 mg');
  assert.equal(e({ weight: 32, weightUnit: 'lb' }).epiPen, null);
});

test('epinephrine: a withheld row shows nothing from that label', () => {
  const r = e({ weight: 20, weightUnit: 'kg' }, { ...ET, [NEFFY]: row('neffy', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([r.withheld, r.neffy], [true, undefined]);
  assert.doesNotMatch(r.note, /same nostril/);
  assert.match(e({ weight: 20 }).message, /lb or kg/);
  assert.match(e({ weightUnit: 'kg' }).message, /^Enter the weight/);
});

test('patch: 10 weeks above 10 cigarettes a day, 8 weeks at 10 or fewer', () => {
  const h = n({ product: 'nicotine-transdermal', age: 'age-18-or-over', cigarettesPerDay: 20, quitDate: '2026-10-12' });
  assert.deepEqual([h.startingStrength, h.endDate, h.steps.map((s) => s.patches)], ['21 mg', '2026-12-20', [42, 14, 14]]);
  assert.deepEqual(h.steps.map((s) => [s.start, s.end]), [['2026-10-12', '2026-11-22'], ['2026-11-23', '2026-12-06'], ['2026-12-07', '2026-12-20']]);
  const l = n({ product: 'nicotine-transdermal', age: 'age-18-or-over', cigarettesPerDay: 10, quitDate: '2026-10-12' });
  assert.deepEqual([l.startingStrength, l.endDate, l.steps.map((s) => s.patches)], ['14 mg', '2026-12-06', [42, 14]]);
});

test('gum and lozenge: 30 minutes decides the strength; 12 weeks; the label limits', () => {
  const g = n({ product: 'nicotine-gum', age: 'age-18-or-over', minutesToFirst: 30, quitDate: '2026-10-12' });
  assert.deepEqual([g.startingStrength, g.endDate, g.steps[0].minPieces, g.steps[0].maxPieces, g.steps[1].maxPieces], ['4 mg', '2027-01-03', 378, 1008, 504]);
  assert.match(g.note, /Habitrol gum label gives the same/);
  const z = n({ product: 'nicotine-lozenge', age: 'age-18-or-over', minutesToFirst: 31, quitDate: '2026-10-12' });
  assert.deepEqual([z.startingStrength, z.steps[0].maxPieces], ['2 mg', 840]);
  assert.match(z.note, /not more than 5 lozenges in 6 hours/);
});

test('under 18 returns the label sentence and no schedule; refusals', () => {
  const u = n({ product: 'nicotine-gum', age: 'under-age-18' });
  assert.deepEqual([u.flag, u.steps], ['ask-a-doctor', undefined]);
  assert.match(n({ product: 'nicotine-gum' }).message, /18 or older/);
  assert.match(n({ product: 'nicotine-transdermal', age: 'age-18-or-over' }).message, /cigarettes smoked per day/);
  assert.match(n({ product: 'nicotine-transdermal', age: 'age-18-or-over', cigarettesPerDay: 12 }).message, /quit date/);
  const w = n({ product: 'nicotine-transdermal', age: 'age-18-or-over', cigarettesPerDay: 12, quitDate: '2026-10-12' }, { ...NT, [PRODUCTS[0].setId]: row('NicoDerm CQ', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([w.withheld, w.steps], [true, undefined]);
});
