// spec-v1639 tool 10: a child's dose looked up in the chart printed on the Drug Facts label.
//
// Sources, re-read October 12, 2026. Drug Facts "Directions" on DailyMed for eleven products (the
// set ids are in PRODUCTS below): Children's and Infants' Tylenol and Children's Tylenol chewables
// (Kenvue); Children's Motrin suspension and chewables and Infants' Motrin drops (Kenvue);
// Children's Benadryl Allergy liquid (Kenvue); Delsym (Reckitt); Imodium A-D caplets and liquid
// (Kenvue); pyrantel pamoate chewable (Bionpharma, a monograph product whose weight bands match 21
// CFR 357.150(d)(1): 125 mg at 25 to 37 lb up to 1,000 mg at 188 lb and over).
//   The weight-and-age charts say: "find right dose on chart below. If possible, use weight to
//     dose; otherwise, use age."
//   FDA, OTC Monograph M013 (posted October 14, 2022), section M013.50(d)(2): acetaminophen by AGE
//     only: 2 to under 4 years, 160 to 162.5 mg; 4 to under 6, 240 to 243.8 mg; 6 to under 9, 320
//     to 325 mg; 9 to under 11, 320 to 406.3 mg; 11 to under 12, 320 to 487.5 mg; "every 4 hours
//     while symptoms persist, not to exceed 5 doses"; under 2 years: consult a doctor.
//
// The tool looks a child up in the chart on the carton and does nothing a parent holding the
// carton is not asked to do. It has no mg/kg mode, scales no other concentration, and returns "ask
// a doctor" and "do not use" rows as the answer. Where weight and age land on different rows both
// are shown with the label's sentence; the tool does not choose.
//
// Pure: no DOM, no network. `now` is read only to check that the label edition still stands.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const Y = 12; const INF = Infinity;
// Each row: w = [low, high] in whole pounds as printed (high null = "under" the next row's low);
// a = [from, to) in months; out = what the chart prints; mg = milligrams in that dose.
const BANDS5 = (unit, per, doses) => [
  { w: [0, 23.999], a: [0, 2 * Y], wSay: 'under 24 lb', aSay: 'under 2 years', stop: 'ask a doctor' },
  ...[[24, 35, 2, 4, '2-3 years'], [36, 47, 4, 6, '4-5 years'], [48, 59, 6, 9, '6-8 years'], [60, 71, 9, 11, '9-10 years'], [72, 95, 11, 12, '11 years']]
    .map(([lo, hi, a0, a1, aSay], i) => ({ w: [lo, hi], a: [a0 * Y, a1 * Y], wSay: `${lo}-${hi} lb`, aSay, out: `${doses[i]} ${unit === 'tablets' && doses[i] === '1' ? 'tablet' : unit}`, mg: per * [1, 1.5, 2, 2.5, 3][i] })),
];
const TYL = 'repeat dose every 4 hours while symptoms last; do not give more than 5 times in 24 hours';
const MOT = 'if needed, repeat dose every 6-8 hours; do not use more than 4 times a day';
const ML = ['5 mL', '7.5 mL', '10 mL', '12.5 mL', '15 mL'].map((x) => x.replace(' mL', ''));
const TABS = ['1', '1½', '2', '2½', '3'];
const USE_WEIGHT = 'If possible, use weight to dose; otherwise, use age.';
export const PRODUCTS = [
  { value: 'kids-tylenol-160mg-in-5ml', text: 'Children\'s Tylenol suspension, acetaminophen 160 mg per 5 mL', brand: 'Children\'s Tylenol suspension', setId: '3162733b-9382-39f1-e063-6294a90ac420', drug: 'acetaminophen', by: 'both', rows: BANDS5('mL', 160, ML), repeat: TYL },
  { value: 'infant-tylenol-160mg-in-5ml', text: 'Infants\' Tylenol suspension, acetaminophen 160 mg per 5 mL', brand: 'Infants\' Tylenol', setId: '997b9551-c222-4a9c-8ba1-09a5f97495fa', drug: 'acetaminophen', by: 'both', rows: BANDS5('mL', 160, ML).slice(0, 2), repeat: TYL },
  { value: 'kids-tylenol-chewable-160mg', text: 'Children\'s Tylenol chewable, acetaminophen 160 mg', brand: 'Children\'s Tylenol chewables', setId: '9782fe86-d72a-4231-b1ba-d3f3b4ee49e3', drug: 'acetaminophen', by: 'both', rows: BANDS5('tablets', 160, TABS), repeat: TYL },
  { value: 'kids-motrin-100mg-in-5ml', text: 'Children\'s Motrin suspension, ibuprofen 100 mg per 5 mL', brand: 'Children\'s Motrin suspension', setId: '152189e5-391c-42d3-a03b-c8364e2de6bf', drug: 'ibuprofen', by: 'both', rows: BANDS5('mL', 100, ML), repeat: MOT },
  { value: 'kids-motrin-chewable-100mg', text: 'Children\'s Motrin chewable, ibuprofen 100 mg', brand: 'Children\'s Motrin chewables', setId: '15b0b56d-6188-4937-b541-902022e35b24', drug: 'ibuprofen', by: 'both', rows: BANDS5('tablets', 100, TABS), repeat: MOT },
  { value: 'infant-motrin-50mg-in-1-25ml', text: 'Infants\' Motrin concentrated drops, ibuprofen 50 mg per 1.25 mL', brand: 'Infants\' Motrin drops', setId: 'c2302bfe-b367-4867-b803-29f066a42dc7', drug: 'ibuprofen', by: 'both', needMonths: true, repeat: MOT,
    rows: [{ w: null, a: [0, 6], aSay: 'under 6 months', stop: 'ask a doctor' }, { w: [12, 17], a: [6, 12], wSay: '12-17 lb', aSay: '6-11 months', out: '1.25 mL', mg: 50 }, { w: [18, 23], a: [12, 24], wSay: '18-23 lb', aSay: '12-23 months', out: '1.875 mL', mg: 75 }] },
  { value: 'kids-benadryl-12-5mg-in-5ml', text: 'Children\'s Benadryl Allergy liquid, diphenhydramine 12.5 mg per 5 mL', brand: 'Children\'s Benadryl Allergy', setId: 'fc9181b9-c92d-493e-8d7c-4a4239c6c092', drug: 'diphenhydramine', by: 'age', repeat: 'take every 4 to 6 hours, or as directed by a doctor; do not take more than 6 doses in 24 hours',
    rows: [{ a: [0, 2 * Y], aSay: 'children under 2 years', stop: 'do not use' }, { a: [2 * Y, 6 * Y], aSay: 'children 2 to 5 years', stop: 'do not use unless directed by a doctor' }, { a: [6 * Y, 12 * Y], aSay: 'children 6 to 11 years', out: '5 mL to 10 mL', mgSay: '12.5 mg to 25 mg' }] },
  { value: 'delsym-30mg-in-5ml', text: 'Delsym, dextromethorphan polistirex equal to 30 mg dextromethorphan HBr per 5 mL', brand: 'Delsym', setId: 'e3e1d126-76c2-4776-8ce0-449625b7e6ba', drug: 'dextromethorphan', by: 'age', repeat: null,
    rows: [{ a: [0, 4 * Y], aSay: 'children under 4 years of age', stop: 'do not use' }, { a: [4 * Y, 6 * Y], aSay: 'children 4 to under 6 years of age', out: '2.5 mL every 12 hours, not to exceed 5 mL in 24 hours', mg: 15 }, { a: [6 * Y, 12 * Y], aSay: 'children 6 to under 12 years of age', out: '5 mL every 12 hours, not to exceed 10 mL in 24 hours', mg: 30 }, { a: [12 * Y, INF], aSay: 'adults and children 12 years of age and over', out: '10 mL every 12 hours, not to exceed 20 mL in 24 hours', mg: 60 }] },
  ...[['imodium-caplet', 'Imodium A-D caplets, loperamide 2 mg', 'Imodium A-D caplets', '01da76d0-1979-4c45-9d39-c72ae4e4ffe2', (n, h, m) => `${n} caplet${n === 1 ? '' : 's'} after the first loose stool; ${h} caplet after each subsequent loose stool; but no more than ${m} caplets in 24 hours`, [1, '1/2', 2, 3], [2, '1', 4]],
    ['imodium-1mg-in-7-5ml', 'Imodium A-D liquid, loperamide 1 mg per 7.5 mL', 'Imodium A-D liquid', '76a976d5-8bee-4158-a94d-7fbfc5544fd4', (n, h, m) => `${n} mL after the first loose stool; ${h} mL after each subsequent loose stool; but no more than ${m} mL in 24 hours`, [15, '7.5', 30, 45], [30, '15', 60]]]
    .map(([value, text, brand, setId, say, c, ad]) => ({ value, text, brand, setId, drug: 'loperamide', by: 'both', repeat: null,
      rows: [{ w: [0, 33], a: [0, 2 * Y], wSay: 'up to 33 lb', aSay: 'children under 2 years', stop: 'do not use' }, { w: [34, 47], a: [2 * Y, 6 * Y], wSay: '34 to 47 lb', aSay: 'children 2-5 years', stop: 'ask a doctor' },
        { w: [48, 59], a: [6 * Y, 9 * Y], wSay: '48-59 lb', aSay: 'children 6-8 years', out: say(c[0], c[1], c[2]), mgSay: '2 mg first, then 1 mg; not more than 4 mg in 24 hours' }, { w: [60, 95], a: [9 * Y, 12 * Y], wSay: '60-95 lb', aSay: 'children 9-11 years', out: say(c[0], c[1], c[3]), mgSay: '2 mg first, then 1 mg; not more than 6 mg in 24 hours' },
        { w: null, a: [12 * Y, INF], aSay: 'adults and children 12 years and over', out: say(ad[0], ad[1], ad[2]), mgSay: '4 mg first, then 2 mg; not more than 8 mg in 24 hours' }] })),
  { value: 'pyrantel-chewable', text: 'Pyrantel pamoate chewable (pinworm), 250 mg pyrantel base a tablet', brand: 'Pinworm Medicine (pyrantel pamoate), Bionpharma', setId: '5799a28e-4803-b192-e063-6294a90a53d7', drug: 'pyrantel', by: 'weight', repeat: 'take one time as a single dose; do not repeat treatment unless directed by a doctor',
    rows: [{ w: [0, 24.999], a: [0, 2 * Y], wSay: 'less than 25 pounds', aSay: 'under 2 years old', stop: 'do not use unless directed by a doctor' },
      ...[[25, 37, '½ tablet', 125], [38, 62, '1 tablet', 250], [63, 87, '1½ tablets', 375], [88, 112, '2 tablets', 500], [113, 137, '2½ tablets', 625], [138, 162, '3 tablets', 750], [163, 187, '3½ tablets', 875], [188, INF, '4 tablets', 1000]].map(([lo, hi, out, mg]) => ({ w: [lo, hi], wSay: hi === INF ? '188 pounds and over' : `${lo} to ${hi} pounds`, out, mg }))] },
];
// OTC Monograph M013.50(d)(2): acetaminophen by age only, [from, to) in years.
export const M013 = [[2, 4, '160 to 162.5 mg'], [4, 6, '240 to 243.8 mg'], [6, 9, '320 to 325 mg'], [9, 11, '320 to 406.3 mg'], [11, 12, '320 to 487.5 mg']];
export const UNITS = [{ value: 'lb', text: 'lb' }, { value: 'kg', text: 'kg' }];
const POSTURE = 'This is what the label states for these inputs. It is not advice for a particular patient.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r1 = (n) => Math.round(n * 10) / 10;
const rowSay = (r) => (r.stop ? `"${r.stop}"` : `${r.out}${r.mg ? ` (${r.mg} mg)` : r.mgSay ? ` (${r.mgSay})` : ''}`);

export function otcChildLabelDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product. Only the listed products and strengths are covered; another concentration is not scaled.' };
  let lb = null;
  if (!blank(o.weight)) {
    const unit = UNITS.find((u) => u.value === String(o.weightUnit ?? '').trim());
    if (!unit) return { valid: false, message: 'Choose whether the weight is in lb or kg.' };
    const f = inputFault([['the weight', o.weight, null, unit.value === 'lb' ? 700 : 320, unit.value]]);
    if (f) return { valid: false, message: f };
    lb = unit.value === 'lb' ? Number(o.weight) : Number(o.weight) * 2.20462262;
  }
  let months = null;
  if (!blank(o.ageYears) || !blank(o.ageMonths)) {
    const f = inputFault([['the age', blank(o.ageYears) ? 0 : o.ageYears, 0, 120, 'years'], ['the extra months of age (0 to 11)', blank(o.ageMonths) ? 0 : o.ageMonths, 0, 11, '']]);
    if (f) return { valid: false, message: f };
    const y = blank(o.ageYears) ? 0 : Number(o.ageYears); const m = blank(o.ageMonths) ? 0 : Number(o.ageMonths);
    if (!Number.isInteger(y) || !Number.isInteger(m)) return { valid: false, message: 'Enter the age as whole years and whole months.' };
    if (p.needMonths && y === 0 && blank(o.ageMonths)) return { valid: false, message: 'Enter the age in months: this chart\'s rows are in months.' };
    months = y * 12 + m;
  }
  if (p.by === 'age' && months === null) return { valid: false, message: `Enter the child's age: the ${p.brand} chart is by age only.` };
  if (p.by === 'weight' && lb === null) return { valid: false, message: `Enter the weight: the ${p.brand} chart is by weight.` };
  if (lb === null && months === null) return { valid: false, message: 'Enter the child\'s weight, age, or both.' };
  const lr = labelRow(p.setId, now, table);
  const base = { valid: true, product: p.value, labelUrl: lr.url };
  if (!lr.answers) {
    const w = [`The ${p.brand} chart is withheld: ${lr.why}.`, 'Read the chart on the carton in hand.', POSTURE];
    return { ...base, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} chart is withheld, so no row is shown.`, bandLabel: 'Withheld', notes: w, note: w.join(' ') };
  }
  const notes = [`${p.text}.`];
  const ageText = months === null ? null : months < 24 ? `${months} month${months === 1 ? '' : 's'}` : `${Math.floor(months / 12)} years${months % 12 ? ` and ${months % 12} month${months % 12 === 1 ? '' : 's'}` : ''}`;
  // Weight row.
  let wRow = null; let wNote = null;
  const wRows = p.rows.filter((r) => r.w);
  if (lb !== null && p.by !== 'age') {
    if (String(o.weightUnit).trim() === 'kg') notes.push(`${Number(o.weight)} kg is ${r1(lb)} lb; the chart is in pounds.`);
    wRow = wRows.find((r) => lb >= r.w[0] && lb <= r.w[1]) || null;
    if (!wRow) {
      const last = wRows[wRows.length - 1]; const firstW = wRows[0];
      if (lb < firstW.w[0]) wNote = `The chart has no weight row below ${firstW.w[0]} lb.`;
      else if (lb > last.w[1]) {
        const byAge = p.rows.find((r) => !r.w && r.a && r.a[1] === INF);
        wNote = byAge ? `${r1(lb)} lb is above the chart's last weight row (${last.wSay}); its last row, "${byAge.aSay}", is by age.` : `${r1(lb)} lb is above the chart's last weight row (${last.wSay}); the chart ends there.`;
      }
      else { const below = [...wRows].reverse().find((r) => r.w[1] < lb); const above = wRows.find((r) => r.w[0] > lb); wNote = `${r1(lb)} lb falls between two rows, which the chart prints in whole pounds: ${below.wSay} (${rowSay(below)}) and ${above.wSay} (${rowSay(above)}). The chart does not say which applies.`; }
    }
  } else if (lb !== null) notes.push(`The ${p.brand} chart is by age only; the weight is not used.`);
  // Age row.
  let aRow = null; let aNote = null;
  const aRows = p.rows.filter((r) => r.a);
  if (months !== null && (p.by !== 'weight' || months < 24)) {
    aRow = aRows.find((r) => months >= r.a[0] && months < r.a[1]) || null;
    if (!aRow) aNote = `At ${ageText} the child is past the chart's last age row (${aRows[aRows.length - 1].aSay}); the chart ends there.`;
  }
  if (p.by === 'weight' && months !== null && months >= 24) notes.push('The chart is by weight; the age is used only for its "under 2 years old" line.');
  if (wRow) notes.push(`By weight (${r1(lb)} lb), the chart row is ${wRow.wSay}: ${rowSay(wRow)}.`);
  if (wNote) notes.push(wNote);
  if (aRow) notes.push(`By age (${ageText}), the chart row is ${aRow.aSay}: ${rowSay(aRow)}.`);
  if (aNote) notes.push(aNote);
  const differ = wRow && aRow && wRow !== aRow;
  const rows = [wRow, aRow].filter(Boolean);
  if (differ) notes.push(p.by === 'both' ? `Weight and age land on different rows. The label says: "${USE_WEIGHT}" Both rows are shown; the tool does not choose.` : 'Weight and age land on different lines of the chart; both are shown.');
  else if (p.by === 'both' && rows.length === 1 && lb === null) notes.push(`Only the age was entered. The label says: "${USE_WEIGHT}"`);
  if (p.repeat && rows.some((r) => !r.stop)) notes.push(`The label: ${p.repeat}.`);
  if (rows.some((r) => r.stop)) notes.push('That line is the label\'s answer; no dose is computed in its place.');
  if (p.drug === 'acetaminophen') {
    if (months !== null) {
      const y = months / 12; const m = M013.find(([a, b]) => y >= a && y < b);
      notes.push(m ? `Separately, the federal monograph doses acetaminophen by age only: ${m[0]} to under ${m[1]} years, ${m[2]} every 4 hours while symptoms persist, not to exceed 5 doses in 24 hours (OTC Monograph M013.50(d)(2)). The weight bands are the manufacturer's chart.` : y < 2 ? 'The federal monograph (M013.50(d)(2)) says: children under 2 years, consult a doctor.' : 'The federal monograph\'s children\'s rows (M013.50(d)(2)) end under 12 years.');
    } else notes.push('The weight bands are the manufacturer\'s chart; the federal monograph (M013) doses acetaminophen by age only, and no age was entered.');
  } else if (p.drug === 'ibuprofen') notes.push('Ibuprofen is sold under an approved application, not the M013 monograph; the chart is the manufacturer\'s.');
  else if (p.drug === 'pyrantel') notes.push('The label states the rule behind its bands: a single dose of 5 mg of pyrantel base per pound, or 11 mg per kilogram, not to exceed 1 gram (4 tablets); the bands match 21 CFR 357.150(d)(1).');
  notes.push('A product at another strength (a store brand, a different concentration) is not covered: nothing here is scaled.');
  notes.push(`Label: ${lr.edition}.`);
  notes.push(POSTURE);
  const stop = rows.some((r) => r.stop); const none = rows.length === 0;
  const flag = none ? 'no-chart-row' : differ ? 'weight-and-age-rows-differ' : stop ? 'label-says-stop' : 'chart-row';
  const band = none ? 'The chart has no row for these inputs.' : differ ? `By weight: ${rowSay(wRow)}. By age: ${rowSay(aRow)}.` : rows[0].stop ? `The label says: ${rows[0].stop}.` : `${rows[0].out}${rows[0].mg ? ` (${rows[0].mg} mg)` : rows[0].mgSay ? ` (${rows[0].mgSay})` : ''}.`;
  return { ...base, weightLb: lb === null ? undefined : r1(lb), ageMonths: months === null ? undefined : months, weightRow: wRow ? wRow.wSay : undefined, ageRow: aRow ? aRow.aSay : undefined, flag, abnormal: none || differ || stop, band, bandLabel: none ? 'No chart row' : differ ? 'Weight and age rows differ' : stop ? 'No dose on this row' : (wRow ? wRow.wSay : aRow.aSay), notes, note: notes.join(' ') };
}
