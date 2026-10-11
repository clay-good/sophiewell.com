// spec-v1633 tool 3: fentanyl patch starting dose from a prior opioid, as the label's one-way tables give it.
//
// One label row (spec-v1628 section 1): fentanyl transdermal system, SpecGx (DailyMed version 58),
// re-read on October 11, 2026. No brand (Duragesic) label is on DailyMed.
//   Section 1: "Patients considered opioid-tolerant are those who are taking, for one week or longer,
//     at least 60 mg morphine per day, 25 mcg transdermal fentanyl per hour, 30 mg oral oxycodone per
//     day, 8 mg oral hydromorphone per day, 25 mg oral oxymorphone per day, 60 mg oral hydrocodone per
//     day, or an equianalgesic dose of another opioid."
//   Section 2.3, Table 1 (eight prior analgesics to 25, 50, 75 and 100 mcg/hour) and Table 2 (24-hour
//     oral morphine, 60 to 1,124 mg/day, to 25 through 300 mcg/hour).
//   "These are not tables of equianalgesic doses. ... The tables cannot be used to convert from
//     fentanyl transdermal system to another opioid because these conversions will result in an
//     overestimation of the dose of the new opioid ... and may result in fatal overdosage."
//   "titrate patients upwards (no more frequently than 3 days after the initial dose and every 6 days
//     thereafter)".
//
// One way only: there is no reverse mode, and the result says why. A value in a gap the label prints
// (oral oxycodone 67.2 mg/day sits between 30-67 and 67.5-112) returns the bands either side.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { brand: 'fentanyl transdermal system (SpecGx)', setId: 'e15a7e9b-8025-49dd-9a6d-bafcccf1959f' };
const P4 = [25, 50, 75, 100];
const row = (ranges, patches = P4) => ranges.map(([lo, hi], i) => ({ lo, hi, patch: patches[i] }));
// Table 2 carries oral morphine on from 100 mcg/hour in 90-mg bands.
const MORPHINE = [[60, 134], [135, 224], [225, 314], [315, 404], [405, 494], [495, 584], [585, 674], [675, 764], [765, 854], [855, 944], [945, 1034], [1035, 1124]];
// The values join route and drug with a dot, not a hyphen. The search index reads hyphen-separated
// enum words as the things a tool answers for and keeps a word only while at most two tools carry
// it; `hydromorphone` and `oxycodone` already sit on opioid-mme and opioid-conversion, and a third
// tool carrying them would unindex the word for all three.
export const DRUGS = [
  { value: 'oral.morphine', text: 'Oral morphine', name: 'oral morphine', bands: row(MORPHINE, MORPHINE.map((_, i) => 25 * (i + 1))) },
  { value: 'iv.morphine', text: 'Intramuscular or intravenous morphine', name: 'intramuscular or intravenous morphine', bands: row([[10, 22], [23, 37], [38, 52], [53, 67]]) },
  { value: 'oral.oxycodone', text: 'Oral oxycodone', name: 'oral oxycodone', bands: row([[30, 67], [67.5, 112], [112.5, 157], [157.5, 202]]) },
  { value: 'oral.codeine', text: 'Oral codeine', name: 'oral codeine', bands: row([[150, 447]]) },
  { value: 'oral.hydromorphone', text: 'Oral hydromorphone', name: 'oral hydromorphone', bands: row([[8, 17], [17.1, 28], [28.1, 39], [39.1, 51]]) },
  { value: 'iv.hydromorphone', text: 'Intravenous hydromorphone', name: 'intravenous hydromorphone', bands: row([[1.5, 3.4], [3.5, 5.6], [5.7, 7.9], [8, 10]]) },
  { value: 'im.meperidine', text: 'Intramuscular meperidine', name: 'intramuscular meperidine', bands: row([[75, 165], [166, 278], [279, 390], [391, 503]]) },
  { value: 'oral.methadone', text: 'Oral methadone', name: 'oral methadone', bands: row([[20, 44], [45, 74], [75, 104], [105, 134]]) },
];
export const TOLERANT = [{ value: 'yes', text: 'Yes, meets the label\'s definition' }, { value: 'no', text: 'No' }];
export const TOLERANCE_DEFINITION = 'The label counts as opioid tolerant a patient taking, for one week or longer, at least 60 mg of morphine a day, 25 mcg of transdermal fentanyl an hour, 30 mg of oral oxycodone a day, 8 mg of oral hydromorphone a day, 25 mg of oral oxymorphone a day, 60 mg of oral hydrocodone a day, or an equianalgesic dose of another opioid.';
const ONE_WAY = 'One way only. The label: these are not tables of equianalgesic doses, and they cannot be used to convert from the fentanyl patch to another opioid, because that overestimates the new opioid and may result in fatal overdosage. This tool has no reverse mode.';
const NOTE = 'This reports what the label gives for these inputs. It does not prescribe. The label says it is safer to underestimate the 24-hour fentanyl dose and provide rescue medication than to overestimate it.';
const TITRATION = 'Titration, by the label: no more frequently than 3 days after the initial dose, and every 6 days thereafter. Each system is worn for up to 72 hours.';
const range = (b) => `${b.lo.toLocaleString('en-US')} to ${b.hi.toLocaleString('en-US')} mg/day`;

export function fentanylPatchInitialDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the current opioid and route. The label\'s table has a row for each.' };
  const f = inputFault([['the total dose over 24 hours', o.dailyMg, null, 5000, 'mg']]);
  if (f) return { valid: false, message: f };
  const tolerant = String(o.tolerant ?? '').trim();
  if (tolerant !== 'yes' && tolerant !== 'no') return { valid: false, message: `Say whether the patient is opioid tolerant. ${TOLERANCE_DEFINITION}` };
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: 'The fentanyl patch label\'s conversion tables are withheld, so no starting patch is reported.', bandLabel: 'Withheld', notes: [`The label rows are withheld: ${lr.why}.`, 'Read the starting dose from the label in hand.'], note: NOTE };
  const mg = Number(o.dailyMg);
  const base = { valid: true, drug: drug.value, dailyMg: mg, labelUrl: lr.url, note: NOTE };
  const tail = [ONE_WAY, `Label: ${lr.edition}.`];
  if (tolerant === 'no') {
    return { ...base, flag: 'not-opioid-tolerant', abnormal: true, band: 'The label indicates the fentanyl patch only for patients who are already opioid tolerant, and says not to begin it in a patient who is not. No starting patch is reported.', bandLabel: 'Not opioid tolerant', notes: [TOLERANCE_DEFINITION, ...tail] };
  }
  const bands = drug.bands; const first = bands[0]; const last = bands[bands.length - 1];
  if (mg < first.lo) {
    const band = drug.value === 'oral.morphine'
      ? `${mg} mg/day of oral morphine is below 60 mg/day: not opioid tolerant by the label's definition, and the label does not give a starting patch.`
      : `${mg} mg/day of ${drug.name} is below the lowest dose in the label's table (${first.lo} mg/day). The label gives no starting patch for it.`;
    return { ...base, flag: 'below-table', abnormal: true, band, bandLabel: 'Below the table', notes: [TOLERANCE_DEFINITION, ...tail] };
  }
  if (mg > last.hi) {
    const band = drug.value === 'oral.morphine'
      ? `${mg.toLocaleString('en-US')} mg/day of oral morphine is above the last band of the label's Table 2 (1,035 to 1,124 mg/day, 300 mcg/hour). The label gives no starting patch for it.`
      : `${mg} mg/day of ${drug.name} is above the last band the label's Table 1 prints for it (${range(last)}, ${last.patch} mcg/hour). For doses not listed, the label's method is to convert the 24-hour requirement to oral morphine with a reliable reference and read Table 2.`;
    return { ...base, flag: 'above-table', abnormal: true, band, bandLabel: 'Above the table', notes: tail };
  }
  const hit = bands.find((b) => mg >= b.lo && mg <= b.hi);
  if (!hit) {
    const below = [...bands].reverse().find((b) => b.hi < mg); const above = bands.find((b) => b.lo > mg);
    return { ...base, flag: 'between-bands', abnormal: true, rows: [below.patch, above.patch], band: `${mg} mg/day of ${drug.name} falls between two bands as the label prints them: ${range(below)} (${below.patch} mcg/hour) and ${range(above)} (${above.patch} mcg/hour). The label does not cover this value; both bands are shown.`, bandLabel: `${below.patch} or ${above.patch} mcg/hour`, notes: [TITRATION, ...tail] };
  }
  const notes = [TITRATION];
  if (hit.patch > 100) notes.push('Above 100 mcg/hour the label says several transdermal systems may be used.');
  notes.push('The label adds that 37.5 and 62.5 mcg/hour systems are available as intermediate strengths and may be considered during conversion or titration; they were not used in the clinical studies.');
  notes.push('In mild to moderate hepatic or renal impairment the label starts with one-half the usual starting dose.');
  return { ...base, flag: 'dose', abnormal: false, patchMcgHr: hit.patch, bandLow: hit.lo, bandHigh: hit.hi, band: `The label's table gives ${hit.patch} mcg/hour for ${range(hit)} of ${drug.name}; ${mg.toLocaleString('en-US')} mg/day is in that band.`, bandLabel: `${hit.patch} mcg/hour`, notes: [...notes, ...tail] };
}
