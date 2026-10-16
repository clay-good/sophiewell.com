// spec-v1635 tool 33: pediatric administered activity (North American consensus guidelines, 2024).
//
// Source: Treves ST, Fahey FH, et al. "2024 Update of the North American Consensus Guidelines for
// Pediatric Administered Radiopharmaceutical Activities." J Nucl Med Technol 2025;53:193-197
// (doi 10.2967/jnmt.125.270161), Table 2, and the authors' poster of the same table (the article's
// Supplemental Figure 1). Both were read from the journal's PDFs on October 16, 2026. The 2024 table
// replaces the 2016 one, whose values must not be used.
//   Every MBq figure agrees with its mCi figure (1 mCi = 37 MBq) except one: the article's table prints
//   Tc-99m MAG3 without a flow study as "7 MBq/kg (0.10 mCi/kg)". 0.10 mCi/kg is 3.7 MBq/kg, and the
//   poster prints "3.7 MBq/kg (0.10 mCi/kg)", so 3.7 is used and the result says the article misprints it.
//   Tc-99m MAA: both documents print the 14.8 MBq minimum on the row without a Tc-99m ventilation
//   study only, so it is applied there only. Rows with no minimum or maximum print none.
//   Table note: for patients over 70 kg the maximum should not exceed weight x the weight-based
//   activity; where no maximum is printed "some practitioners may choose" the adult package insert or
//   70 x the weight-based activity. Neither is applied: the first is said, the second shown as a figure.
// Licensing (spec-v1628 section 6, society guidelines): numbers with attribution, one protocol at a
// time; the table itself is not reproduced. SNMMI's JNMT permissions page allows non-commercial reuse
// of tables with credit and a link.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const MBQ_PER_MCI = 37;
// [value, text, MBq/kg (number, [lo, hi] range, or null for no weight-based dose), mCi/kg as printed,
//  minimum [MBq, mCi] or null, maximum [MBq, mCi] or null, table note letter or '']
const T = [
  ['n-13-ammonia', 'N-13 ammonia, cardiac', 10.4, '0.28', [74, 2], null, ''],
  ['f-18-fdg-body', 'F-18 FDG, body', [2.96, 5.2], '0.08 to 0.14', [26, 0.7], [370, 10], 'A'],
  ['f-18-fdg-brain', 'F-18 FDG, brain', [1.85, 3.7], '0.05 to 0.10', [14, 0.37], [148, 4], 'A'],
  ['f-18-fdopa', 'F-18 FDOPA', [2.96, 5.92], '0.08 to 0.16', [29.6, 0.8], [222, 6], ''],
  ['f-18-naf', 'F-18 sodium fluoride', 1.85, '0.05', [18.5, 0.5], [148, 4], ''],
  ['ga-68-dotatate', 'Ga-68 DOTATATE', 2.0, '0.054', [14, 0.38], [200, 5.4], ''],
  ['ga-68-dotatoc', 'Ga-68 DOTATOC', 1.59, '0.043', [11.1, 0.30], [111, 3], ''],
  ['rb-82', 'Rb-82, cardiac', 7.4, '0.2', [370, 10], null, ''],
  ['tc-99m-mdp', 'Tc-99m MDP', 9.3, '0.25', [37, 1.0], [740, 20], ''],
  ['tc-99m-dmsa', 'Tc-99m DMSA', 1.85, '0.05', [18.5, 0.5], [100, 2.7], ''],
  ['tc-99m-mag3-no-flow', 'Tc-99m MAG3, without a flow study', 3.7, '0.10', [37, 1.0], [148, 4.0], 'B'],
  ['tc-99m-mag3-flow', 'Tc-99m MAG3, with a flow study', 5.55, '0.15', [37, 1.0], [148, 4.0], 'B'],
  ['tc-99m-ida', 'Tc-99m IDA', 1.85, '0.05', [18.5, 0.5], null, ''],
  ['tc-99m-maa-vent', 'Tc-99m MAA, with a Tc-99m ventilation study', 2.59, '0.07', null, null, ''],
  ['tc-99m-maa-no-vent', 'Tc-99m MAA, without a Tc-99m ventilation study', 1.11, '0.03', [14.8, 0.4], null, ''],
  ['tc-99m-meckel', 'Tc-99m pertechnetate, Meckel diverticulum', 1.85, '0.05', [9.25, 0.25], [296, 8], ''],
  ['tc-99m-cystography', 'Tc-99m cystography', null, '', null, [37, 1.0], 'C'],
  ['tc-99m-sc-liquid', 'Tc-99m sulfur colloid, liquid gastric emptying', null, '', [18.5, 0.5], [37, 1.0], 'D'],
  ['tc-99m-sc-solid', 'Tc-99m sulfur colloid, solid gastric emptying', null, '', [9.25, 0.25], [18.5, 0.5], 'D'],
  ['tc-99m-hmpao-ecd', 'Tc-99m HMPAO or ECD, brain perfusion', 11.1, '0.3', [185, 5], [740, 20], ''],
  ['tc-99m-mpi-first', 'Tc-99m sestamibi or tetrofosmin, single scan or first of 2 same-day scans', 5.55, '0.15', [185, 5], [370, 10], ''],
  ['tc-99m-mpi-second', 'Tc-99m sestamibi or tetrofosmin, second of 2 same-day scans', 16.7, '0.45', [185, 5], [1110, 30], ''],
  ['tc-99m-thyroid', 'Tc-99m pertechnetate, thyroid', 1.1, '0.03', [7, 0.19], [93, 2.5], ''],
  ['tc-99m-rbc', 'Tc-99m red blood cells, blood pool', 11.8, '0.32', [74, 2], [740, 20], ''],
  ['tc-99m-wbc', 'Tc-99m white blood cells, infection', 7.4, '0.2', [74, 2], [555, 15], ''],
  ['i-123-mibg', 'I-123 MIBG', 5.2, '0.14', [37, 1.0], [370, 10.0], ''],
  ['i-123-nai-thyroid', 'I-123 sodium iodide, thyroid', 0.28, '0.0075', [1, 0.027], [11, 0.3], ''],
  ['i-123-nai-cancer', 'I-123 sodium iodide, thyroid cancer', 3.7, '0.10', [74, 2], [148, 4], 'E'],
];
export const PROTOCOLS = T.map(([value, text, perKg, mciPerKg, min, max, noteLetter]) => ({
  value, text, perKg, mciPerKg,
  min: min ? { mbq: min[0], mci: min[1] } : null,
  max: max ? { mbq: max[0], mci: max[1] } : null,
  noteLetter,
}));

const NOTES = {
  A: 'Table note A: consider the low end of the range for smaller patients; the activity may consider patient mass and the time available on the PET scanner.',
  B: 'Table note B: the activities assume image data reframed at 1 minute per image and may be reduced at a longer time per image.',
  C: 'Table note C: Tc-99m sulfur colloid, pertechnetate, DTPA or possibly other Tc-99m agents may be used, and many techniques work with lower activities.',
  D: 'Table note D: the activity depends on the child\'s age, the volume fed and the time per frame.',
  E: 'Table note E: assumes prior treatment for thyroid cancer by surgery or radionuclide therapy.',
};
const MAG3_NOTE = 'The article\'s Table 2 prints this row as 7 MBq/kg beside 0.10 mCi/kg; 0.10 mCi/kg is 3.7 MBq/kg, and the authors\' poster of the same table prints 3.7 MBq/kg, which is used here.';
const MAA_NOTE = 'The table prints the 14.8 MBq (0.4 mCi) minimum on the row without a Tc-99m ventilation study only, so no minimum is applied on this row.';
const CITE = 'Treves ST, et al. 2024 Update of the North American Consensus Guidelines for Pediatric Administered Radiopharmaceutical Activities. J Nucl Med Technol 2025;53:193-197, Table 2. © SNMMI.';
const NOTE = 'A guideline, not an order: local practice may vary with equipment and protocol, and the nuclear medicine practitioner may adjust the activity.';

const r1 = (n) => String(Math.round(n * 10) / 10);
const r2 = (n) => String(Math.round(n * 100) / 100);
const act = (mbq) => `${r1(mbq)} MBq (${r2(mbq / MBQ_PER_MCI)} mCi)`;
const printed = (p) => `${p.mbq} MBq (${p.mci} mCi)`; // as the table prints it, unrounded

function bound(p, w) {
  const raw = p.perKg * w;
  if (p.min && raw < p.min.mbq) return { mbq: p.min.mbq, raw, by: 'minimum' };
  if (p.max && raw > p.max.mbq) return { mbq: p.max.mbq, raw, by: 'maximum' };
  return { mbq: raw, raw, by: null };
}

export function pediatricAdministeredActivity(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PROTOCOLS.find((x) => x.value === String(o.protocol ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the radiopharmaceutical and protocol from the 2024 table.' };
  const notes = [];
  if (p.value === 'tc-99m-mag3-no-flow') notes.push(MAG3_NOTE);
  if (p.value === 'tc-99m-maa-vent') notes.push(MAA_NOTE);
  if (p.noteLetter) notes.push(NOTES[p.noteLetter]);

  if (p.perKg === null) {
    const range = p.value === 'tc-99m-cystography'
      ? `no more than ${printed(p.max)} for each bladder-filling cycle`
      : `${printed(p.min)} to ${printed(p.max)}`;
    notes.push(CITE);
    return {
      valid: true, protocol: p.value, weightBased: false, activityMbq: null, minMbq: p.min ? p.min.mbq : null, maxMbq: p.max.mbq,
      flag: 'fixed', abnormal: false,
      band: `${p.text}: no weight-based dose; the table gives ${range}.`, bandLabel: 'Fixed range', notes, note: NOTE,
    };
  }

  const f = inputFault([['the weight', o.weightKg, null, 200, 'kg']]);
  if (f) return { valid: false, message: f };
  const w = Number(String(o.weightKg).trim());
  const range = Array.isArray(p.perKg);
  const parts = (range ? p.perKg : [p.perKg]).map((k) => bound({ ...p, perKg: k }, w));
  const perKgText = range ? `${r2(p.perKg[0])} to ${r2(p.perKg[1])} MBq/kg (${p.mciPerKg} mCi/kg)` : `${r2(p.perKg)} MBq/kg (${p.mciPerKg} mCi/kg)`;
  const amount = range
    ? (parts[0].mbq === parts[1].mbq ? act(parts[0].mbq) : `${r1(parts[0].mbq)} to ${r1(parts[1].mbq)} MBq (${r2(parts[0].mbq / MBQ_PER_MCI)} to ${r2(parts[1].mbq / MBQ_PER_MCI)} mCi)`)
    : act(parts[0].mbq);
  const by = parts.map((x) => x.by).filter(Boolean);
  notes.unshift(`${perKgText} × ${r1(w)} kg = ${range ? `${r1(parts[0].raw)} to ${r1(parts[1].raw)}` : r1(parts[0].raw)} MBq.`);
  if (by.includes('minimum')) notes.push(`Raised to the table's minimum of ${printed(p.min)}.`);
  if (by.includes('maximum')) notes.push(`Lowered to the table's maximum of ${printed(p.max)}.`);
  if (!p.min && p.value !== 'tc-99m-maa-vent') notes.push('The table prints no minimum for this row.');
  if (!p.max) {
    const top = (range ? p.perKg[1] : p.perKg) * 70;
    notes.push(`The table prints no maximum for this row. Its note says some practitioners set one from the adult package insert or at 70 times the weight-based activity, which is ${act(top)}; none is applied here.`);
  }
  if (w > 70) notes.push('Over 70 kg: the table\'s note recommends that the maximum not exceed the weight times the weight-based activity.');
  notes.push(CITE);
  const flag = by.length ? (by.includes('maximum') ? 'maximum' : 'minimum') : 'weight-based';
  const whole = !range || parts[0].by === parts[1].by;
  const suffix = !by.length ? '' : whole
    ? (flag === 'minimum' ? ', the table\'s minimum' : ', the table\'s maximum')
    : (parts[0].by === 'minimum' ? ', the low end raised to the table\'s minimum' : ', the high end lowered to the table\'s maximum');
  return {
    valid: true, protocol: p.value, weightBased: true,
    activityMbq: range ? null : Math.round(parts[0].mbq * 10) / 10,
    activityRangeMbq: range ? parts.map((x) => Math.round(x.mbq * 10) / 10) : null,
    minMbq: p.min ? p.min.mbq : null, maxMbq: p.max ? p.max.mbq : null,
    flag, abnormal: false,
    band: `${p.text} at ${r1(w)} kg: ${amount}${suffix}.`,
    bandLabel: flag === 'minimum' ? 'Minimum applies' : flag === 'maximum' ? 'Maximum applies' : 'Weight-based',
    notes, note: NOTE,
  };
}
