// spec-v1633 tool 10: the IV iron course from five labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivIronCourse as d, LABELS, REGIMENS } from '../../lib/iv-iron-course-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const run = (i) => d(i, now);
const mgs = (r) => r.doses.map((x) => x.mg);
const mls = (r) => r.doses.map((x) => x.mL);

test('the five labels answer, and every regimen names one', () => {
  for (const l of Object.values(LABELS)) assert.equal(labelRow(l.setId, now).answers, true, l.brand);
  assert.equal(REGIMENS.length, 12);
});

test('Injectafer for iron deficiency anemia: 750 mg twice at 50 kg, 15 mg/kg twice below it', () => {
  const r = run({ regimen: 'injectafer-ida', weightKg: 50, startDate: '2026-10-12' });
  assert.deepEqual([mgs(r), mls(r), r.totalMg], [[750, 750], [15, 15], 1500]);
  assert.deepEqual(r.doses.map((x) => x.when), ['2026-10-12', 'no sooner than 2026-10-19']);
  assert.deepEqual(mgs(run({ regimen: 'injectafer-ida', weightKg: 49.9 })), [748.5, 748.5]);
  assert.deepEqual(mgs(run({ regimen: 'injectafer-ida', weightKg: 40 })), [600, 600]);
  assert.deepEqual(mgs(run({ regimen: 'injectafer-ida-single', weightKg: 60 })), [900]);
  assert.deepEqual(mgs(run({ regimen: 'injectafer-ida-single', weightKg: 80 })), [1000]); // capped
  assert.equal(run({ regimen: 'injectafer-ida-single', weightKg: 45 }).flag, 'no-recommendation-given');
});

test('Injectafer in heart failure: Table 1 by weight and hemoglobin', () => {
  const t = (weightKg, hb) => mgs(run({ regimen: 'injectafer-hf', weightKg, hb }));
  assert.deepEqual([t(69, 9.9), t(69, 10), t(69, 14), t(69, 14.5)], [[1000, 500], [1000], [1000], [500]]);
  assert.deepEqual([t(70, 9.9), t(70, 10), t(70, 14), t(70, 14.9)], [[1000, 1000], [1000, 500], [1000, 500], [500]]);
  const none = run({ regimen: 'injectafer-hf', weightKg: 80, hb: 15 });
  assert.deepEqual([none.flag, none.doses], ['no-recommendation-given', undefined]);
  const dated = run({ regimen: 'injectafer-hf', weightKg: 65, hb: 9, startDate: '2026-10-12' });
  assert.equal(dated.doses[1].when, '2026-11-23'); // week 6
  assert.match(dated.notes.join(' '), /ferritin is below 100 ng\/mL/);
  assert.match(run({ regimen: 'injectafer-hf', weightKg: 65 }).message, /^Enter the hemoglobin/);
});

test('Venofer: the adult courses and the pediatric maintenance dose', () => {
  const hdd = run({ regimen: 'venofer-hdd' });
  assert.deepEqual([mgs(hdd), mls(hdd), hdd.totalMg, hdd.sessions], [[100], [5], 1000, 10]);
  const ndd = run({ regimen: 'venofer-ndd', startDate: '2026-10-12' });
  assert.deepEqual([mgs(ndd), ndd.totalMg], [[200, 200, 200, 200, 200], 1000]);
  assert.match(ndd.band, /between 2026-10-12 and 2026-10-25/);
  const pdd = run({ regimen: 'venofer-pdd', startDate: '2026-10-12' });
  assert.deepEqual([mgs(pdd), pdd.totalMg, pdd.doses.map((x) => x.when)], [[300, 300, 400], 1000, ['2026-10-12', '2026-10-26', '2026-11-09']]);
  assert.deepEqual(mgs(run({ regimen: 'venofer-pediatric-hdd', weightKg: 30 })), [15]);
  assert.deepEqual(mgs(run({ regimen: 'venofer-pediatric-ndd-pdd', weightKg: 250 })), [100]); // not to exceed 100 mg
  assert.match(run({ regimen: 'venofer-pediatric-hdd', weightKg: 30 }).band, /every two weeks for 12 weeks/);
  assert.match(run({ regimen: 'venofer-pediatric-ndd-pdd', weightKg: 30 }).band, /every four weeks for 12 weeks/);
  assert.match(run({ regimen: 'venofer-pediatric-hdd', weightKg: 30 }).notes.join(' '), /replacement in these pediatric patients has not been established/);
});

test('Feraheme and Monoferric', () => {
  const f = run({ regimen: 'feraheme', startDate: '2026-10-12' });
  assert.deepEqual([mgs(f), mls(f), f.doses[1].when], [[510, 510], [17, 17], 'between 2026-10-15 and 2026-10-20']);
  assert.deepEqual([mgs(run({ regimen: 'monoferric', weightKg: 50 })), mls(run({ regimen: 'monoferric', weightKg: 50 }))], [[1000], [10]]);
  assert.deepEqual(mgs(run({ regimen: 'monoferric', weightKg: 45 })), [900]);
});

test('INFeD: the label formula on lean weight, actual weight when lower, and body weight in small children', () => {
  // 5 ft 10 in male: lean 50 + 2.3 x 10 = 73 kg. 0.0442 x 6.8 x 73 + 0.26 x 73 = 40.92 mL.
  const r = run({ regimen: 'infed-deficiency', weightKg: 90, hb: 8, desiredHb: 14.8, sex: 'male', heightCm: 177.8 });
  assert.deepEqual([r.totalMl, r.totalMg, r.minimumDays], [40.92, 2046, 21]);
  assert.match(r.notes.join(' '), /not the Ganzoni formula/);
  const light = run({ regimen: 'infed-deficiency', weightKg: 60, hb: 8, desiredHb: 14.8, sex: 'male', heightCm: 177.8 });
  assert.equal(light.totalMl, Number((0.0442 * 6.8 * 60 + 0.26 * 60).toFixed(2)));
  assert.match(light.notes[0], /actual body weight, 60 kg, which is less than the lean body weight of 73 kg/);
  const f = run({ regimen: 'infed-deficiency', weightKg: 90, hb: 8, desiredHb: 14.8, sex: 'female', heightCm: 162.56 }); // 5 ft 4 in: 45.5 + 9.2
  assert.equal(f.totalMl, Number((0.0442 * 6.8 * 54.7 + 0.26 * 54.7).toFixed(2)));
  const child = run({ regimen: 'infed-deficiency', weightKg: 10, hb: 7, desiredHb: 12 });
  assert.equal(child.totalMl, 4.81); // the label's table prints 5 for 10 kg at 7 g/dL
  assert.match(run({ regimen: 'infed-deficiency', weightKg: 90, hb: 8, desiredHb: 14.8 }).message, /^Choose the sex/);
  assert.match(run({ regimen: 'infed-deficiency', weightKg: 90, hb: 8, desiredHb: 14.8, sex: 'male' }).message, /^Enter the height/);
  assert.match(run({ regimen: 'infed-deficiency', weightKg: 90, hb: 15, desiredHb: 14.8, sex: 'male', heightCm: 178 }).message, /above the observed hemoglobin/);
  assert.match(run({ regimen: 'infed-deficiency', weightKg: 4, hb: 8, desiredHb: 12 }).message, /start at a body weight of 5 kg/);
  assert.match(run({ regimen: 'infed-deficiency', weightKg: 90, hb: 8 }).message, /^Enter the desired hemoglobin/);
});

test('INFeD for blood loss reproduces the label example', () => {
  const r = run({ regimen: 'infed-blood-loss', bloodLossMl: 500, hematocrit: 20 });
  assert.deepEqual([r.totalMg, r.totalMl, r.minimumDays], [100, 2, 1]);
  assert.match(run({ regimen: 'infed-blood-loss', bloodLossMl: 500 }).message, /^Enter the hematocrit/);
});

test('nothing is defaulted, and a superseded label withholds its course', () => {
  assert.match(d({}, now).message, /^Choose the product and indication/);
  assert.match(run({ regimen: 'monoferric' }).message, /^Enter the weight/);
  assert.match(run({ regimen: 'feraheme', startDate: 'Monday' }).message, /first dose as YYYY-MM-DD/);
  const T = Object.fromEntries(Object.values(LABELS).map((l) => [l.setId, { label: l.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11' }]));
  T[LABELS.feraheme.setId].supersededOn = '2026-10-12';
  const w = d({ regimen: 'feraheme' }, now, T);
  assert.deepEqual([w.withheld, w.doses], [true, undefined]);
  assert.deepEqual(d({ regimen: 'venofer-pdd' }, now, T).totalMg, 1000);
});
