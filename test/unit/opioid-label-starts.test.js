// spec-v1633 tools 3 to 5: one-way opioid starting doses, each from its own label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fentanylPatchInitialDose as fent, DRUGS, LABEL as FENT_LABEL } from '../../lib/fentanyl-patch-initial-dose-v1633.js';
import { methadoneLabelConversion as meth, LABEL as METH_LABEL, ROWS } from '../../lib/methadone-label-conversion-v1633.js';
import { erOpioidLabelStart as er, PRODUCTS, HYSINGLA_FACTORS, HYSINGLA_TABLETS } from '../../lib/er-opioid-label-start-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const all = (r) => `${r.band} ${r.notes.join(' ')}`;

test('the five labels answer', () => {
  for (const id of [FENT_LABEL.setId, METH_LABEL.setId, ...PRODUCTS.map((p) => p.setId)]) assert.equal(labelRow(id, now).answers, true, id);
});

// --- fentanyl patch ---
const f = (i) => fent({ tolerant: 'yes', ...i }, now);
test('fentanyl: Table 1 rows and the Table 2 extension for oral morphine', () => {
  const patch = (drug, dailyMg) => f({ drug, dailyMg }).patchMcgHr;
  assert.deepEqual([60, 134, 135, 224, 225, 314, 315, 404].map((m) => patch('oral.morphine', m)), [25, 25, 50, 50, 75, 75, 100, 100]);
  assert.deepEqual([405, 494, 495, 1035, 1124].map((m) => patch('oral.morphine', m)), [125, 125, 150, 300, 300]);
  assert.deepEqual([patch('iv.morphine', 10), patch('iv.morphine', 67)], [25, 100]);
  assert.deepEqual([patch('oral.oxycodone', 30), patch('oral.oxycodone', 67.5), patch('oral.oxycodone', 202)], [25, 50, 100]);
  assert.equal(patch('oral.codeine', 447), 25);
  assert.deepEqual([patch('oral.hydromorphone', 8), patch('oral.hydromorphone', 17.1), patch('oral.hydromorphone', 51)], [25, 50, 100]);
  assert.deepEqual([patch('iv.hydromorphone', 1.5), patch('iv.hydromorphone', 8)], [25, 100]);
  assert.deepEqual([patch('im.meperidine', 75), patch('im.meperidine', 503)], [25, 100]);
  assert.deepEqual([patch('oral.methadone', 20), patch('oral.methadone', 134)], [25, 100]);
  assert.equal(DRUGS.length, 8);
});
test('fentanyl: below, above and between the printed bands give no patch', () => {
  const low = f({ drug: 'oral.morphine', dailyMg: 59 });
  assert.deepEqual([low.flag, low.patchMcgHr, low.abnormal], ['below-table', undefined, true]);
  assert.match(low.band, /not opioid tolerant by the label's definition/);
  const gap = f({ drug: 'oral.oxycodone', dailyMg: 67.2 });
  assert.deepEqual([gap.flag, gap.rows, gap.patchMcgHr], ['between-bands', [25, 50], undefined]);
  assert.match(gap.band, /does not cover this value/);
  assert.equal(f({ drug: 'oral.codeine', dailyMg: 448 }).flag, 'above-table');
  assert.match(f({ drug: 'oral.codeine', dailyMg: 448 }).band, /convert the 24-hour requirement to oral morphine/);
  assert.equal(f({ drug: 'oral.morphine', dailyMg: 1125 }).flag, 'above-table');
});
test('fentanyl: tolerance is asked for, a "no" reports nothing, and there is no reverse mode', () => {
  assert.match(fent({ drug: 'oral.morphine', dailyMg: 100 }, now).message, /opioid tolerant/);
  const no = f({ drug: 'oral.morphine', dailyMg: 100, tolerant: 'no' });
  assert.deepEqual([no.flag, no.patchMcgHr], ['not-opioid-tolerant', undefined]);
  const r = f({ drug: 'oral.morphine', dailyMg: 100 });
  assert.match(all(r), /cannot be used to convert from the fentanyl patch to another opioid/);
  assert.match(all(r), /no more frequently than 3 days after the initial dose, and every 6 days/);
  assert.match(all(r), /37\.5 and 62\.5 mcg\/hour/);
  assert.equal(DRUGS.some((d) => /fentanyl/.test(d.value)), false);
  assert.match(fent({}, now).message, /^Choose the current opioid/);
  assert.match(f({ drug: 'oral.morphine' }).message, /^Enter the total dose/);
});

// --- methadone ---
const m = (i) => meth({ mode: 'oral-opioid', ...i }, now);
test('methadone: the label\'s percentage rows, as a range, rounded down to whole tablets', () => {
  assert.deepEqual(ROWS.map((r) => r.pct), [[20, 30], [10, 20], [8, 12], [5, 10], [null, 5]]);
  // The label's example sits inside the range: 100 mg at 15% is 15 mg a day, 7.5 mg per dose, rounded down to 5 mg.
  const ex = m({ morphineEquivalentMg: 100, dosesPerDay: 2, tabletMg: '5' });
  assert.equal(ex.rows.length, 1);
  assert.deepEqual([ex.rows[0].dailyLowMg, ex.rows[0].dailyHighMg, ex.rows[0].perDoseLowMg, ex.rows[0].perDoseHighMg], [10, 20, 5, 10]);
  assert.ok(ex.rows[0].perDoseLowMg <= 5 && ex.rows[0].perDoseHighMg >= 5);
  assert.match(all(ex), /7\.5 mg, rounded down to 5 mg every 12 hours/);
  const below = m({ morphineEquivalentMg: 99, dosesPerDay: 3, tabletMg: '5' });
  assert.deepEqual([below.rows[0].percentLow, below.rows[0].perDoseLowMg, below.rows[0].perDoseHighMg], [20, 5, 5]);
});
test('methadone: 300 and 600 are printed in two rows and both show; over 1,000 has no lower figure', () => {
  for (const edge of [300, 600]) {
    const r = m({ morphineEquivalentMg: edge, dosesPerDay: 2, tabletMg: '5' });
    assert.equal(r.rows.length, 2, String(edge));
    assert.match(r.band, /in two rows, and both are shown/);
  }
  assert.equal(m({ morphineEquivalentMg: 100, dosesPerDay: 2, tabletMg: '5' }).rows.length, 1); // "< 100" excludes 100
  assert.equal(m({ morphineEquivalentMg: 1000, dosesPerDay: 2, tabletMg: '5' }).rows[0].percentHigh, 10); // "> 1,000" excludes 1,000
  const top = m({ morphineEquivalentMg: 1200, dosesPerDay: 3, tabletMg: '10' });
  assert.deepEqual([top.rows[0].percentLow, top.rows[0].dailyLowMg, top.rows[0].dailyHighMg, top.rows[0].perDoseHighMg], [null, null, 60, 10]);
  assert.match(top.bandLabel, /^At most 10 mg/);
  assert.equal(m({ morphineEquivalentMg: 40, dosesPerDay: 3, tabletMg: '10' }).bandLabel, 'Below one tablet per dose');
});
test('methadone: parenteral to oral is 1:2; one way; nothing defaulted', () => {
  assert.equal(meth({ mode: 'parenteral-methadone', parenteralMg: 5 }, now).oralDailyMg, 10);
  assert.match(all(m({ morphineEquivalentMg: 100, dosesPerDay: 2, tabletMg: '5' })), /cannot be used to convert from methadone to another opioid/);
  assert.match(meth({}, now).message, /^Choose what the patient is coming from/);
  assert.match(m({ dosesPerDay: 2, tabletMg: '5' }).message, /morphine-equivalent/);
  assert.match(m({ morphineEquivalentMg: 100, tabletMg: '5' }).message, /number of methadone doses/);
  assert.match(m({ morphineEquivalentMg: 100, dosesPerDay: 2.5, tabletMg: '5' }).message, /whole number/);
  assert.match(m({ morphineEquivalentMg: 100, dosesPerDay: 2 }).message, /tablet strength/);
});

// --- Hysingla ER, Butrans, Belbuca ---
const e = (i) => er(i, now);
test('Hysingla ER: factors, less 25%, rounded down to a tablet, never under 20 mg', () => {
  assert.deepEqual(HYSINGLA_FACTORS.map((x) => x.factor), [0.15, 4, 1.5, 0.5, 1, 2, 0.1]);
  assert.deepEqual(HYSINGLA_TABLETS, [20, 30, 40, 60, 80, 100]);
  assert.deepEqual([e({ product: 'hysingla', oxycodoneMg: 40 }).reducedMg, e({ product: 'hysingla', oxycodoneMg: 40 }).startMg], [30, 30]);
  assert.deepEqual([e({ product: 'hysingla', oxycodoneMg: 50 }).reducedMg, e({ product: 'hysingla', oxycodoneMg: 50 }).startMg], [37.5, 30]); // the label's example
  const floor = e({ product: 'hysingla', morphineMg: 30 });
  assert.deepEqual([floor.reducedMg, floor.startMg], [11.25, 20]);
  assert.match(floor.band, /initiate at 20 mg/);
  assert.equal(e({ product: 'hysingla', morphineMg: 60, tramadolMg: 200 }).calculatedHydrocodoneMg, 50);
  assert.equal(e({ product: 'hysingla', hydromorphoneMg: 30 }).startMg, 80); // 30 x 4 x 0.75 = 90
  assert.match(all(e({ product: 'hysingla', hydromorphoneMg: 30 })), /80 mg or more for opioid-tolerant/);
  const over = e({ product: 'hysingla', oxycodoneMg: 200 });
  assert.deepEqual([over.flag, over.startMg], ['no-recommendation-given', undefined]);
  assert.match(e({ product: 'hysingla' }).message, /at least one prior oral opioid/);
  assert.match(e({ product: 'hysingla', oxycodoneMg: 0 }).message, /is 0/);
  assert.match(all(e({ product: 'hysingla', methadoneMg: 20 })), /particular care converting from methadone/);
});
test('Butrans: 5 mcg/hour under 30 mg, taper then 10 at 30 to 80, an alternate analgesic above 80', () => {
  const at = (v) => e({ product: 'butrans', morphineEquivalentMg: v });
  assert.deepEqual([at(29).startMcgHr, at(29).flag], [5, 'dose']);
  assert.deepEqual([at(30).startMcgHr, at(30).flag, at(80).startMcgHr], [10, 'taper-first', 10]);
  assert.deepEqual([at(81).flag, at(81).startMcgHr, at(81).abnormal], ['alternate-analgesic', undefined, true]);
  assert.match(all(at(29)), /maximum Butrans dose is 20 mcg\/hour.*72 hours/);
  assert.match(at(40).band, /taper .* for up to 7 days to no more than 30 mg/);
});
test('Belbuca: Table 1 rows, the gap between 89 and 90, and the taper first', () => {
  const at = (v) => e({ product: 'belbuca', morphineEquivalentMg: v });
  assert.deepEqual([at(29).startMcg, at(30).startMcg, at(89).startMcg, at(90).startMcg, at(160).startMcg], [75, 150, 150, 300, 300]);
  assert.deepEqual([at(161).flag, at(161).startMcg], ['alternate-analgesic', undefined]);
  assert.deepEqual([at(89.5).flag, at(89.5).rows], ['between-bands', [150, 300]]);
  assert.match(all(at(60)), /taper to no more than 30 mg/);
  assert.match(all(at(60)), /maximum of 900 mcg every 12 hours/);
  assert.match(e({ product: 'belbuca' }).message, /^Enter the prior total daily dose/);
  assert.match(e({}).message, /^Choose the product/);
});

test('a superseded label withholds its numbers', () => {
  const sup = (setId) => ({ [setId]: { label: 'x', splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } });
  const a = fent({ drug: 'oral.morphine', dailyMg: 100, tolerant: 'yes' }, now, sup(FENT_LABEL.setId));
  assert.deepEqual([a.withheld, a.patchMcgHr], [true, undefined]);
  const b = meth({ mode: 'oral-opioid', morphineEquivalentMg: 100, dosesPerDay: 2, tabletMg: '5' }, now, sup(METH_LABEL.setId));
  assert.deepEqual([b.withheld, b.rows], [true, undefined]);
  const c = er({ product: 'butrans', morphineEquivalentMg: 20 }, now, sup(PRODUCTS[1].setId));
  assert.deepEqual([c.withheld, c.startMcgHr], [true, undefined]);
});
