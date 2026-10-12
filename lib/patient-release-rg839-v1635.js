// spec-v1635 tool 27: patient release under 10 CFR 35.75, by NRC Regulatory Guide 8.39.
//
// Sources: 10 CFR 35.75, read on eCFR as current October 8, 2026: release is allowed if the dose to
// any other individual "is not likely to exceed 5 mSv (0.5 rem)" (a); instructions, including written
// ones, are required if it "is likely to exceed 1 mSv (0.1 rem)" (b); a record of the basis for
// release is kept under 35.2075(a) (c).
// NRC Regulatory Guide 8.39, Revision 1 (April 2020; ADAMS ML19232A081), re-read from the PDF on
// October 11, 2026. A U.S. government work.
//   Table 1: activity (GBq, mCi) and dose rate at 1 meter (mSv/h, mrem/h) at or below which a patient
//   may be released. Table 2: the same above which instructions are required. Both stored as printed.
//   Equations 2 and 3, dose to total decay at 1 meter:
//     D(infinity), rem = 34.6 x Gamma x Q0 x Tp x E / (100 cm)^2
//     E = 0.25 for a physical half-life over 1 day (Equation 2), 1.0 for 1 day or less (Equation 3);
//     Gamma in R.cm2/(mCi.h), Q0 in mCi, Tp in days; 1 roentgen taken as 1 rem.
//   Equation B-5, I-131 with biological elimination (Table B-1; Gamma 2.2 and Tp 8.04 days from
//   Table A-1), with k = exp(-0.693 x 0.33 / Tp):
//     D = [34.6 x Gamma x Q0 / (100 cm)^2] x { E1 x Tp x 0.8 x (1 - k) + k x E2 x F1 x T1eff
//                                              + k x E2 x F2 x T2eff }
//     hyperthyroidism F1 0.20, T1eff 0.32 d, F2 0.80, T2eff 5.2 d;
//     post-thyroidectomy for thyroid cancer F1 0.95, T1eff 0.32 d, F2 0.05, T2eff 7.3 d.
//   The equation text does not survive in the PDF's text layer; its form was confirmed by reproducing
//   the guide's Example 2 (200 mCi, thyroid cancer, E1 0.75, E2 0.25: 0.453 rem) and Example 3
//   (55 mCi, hyperthyroidism, same factors: 0.486 rem). Both are tests.
// The tool chooses no occupancy factor: both are the reader's, and the guide ties factors below the
// defaults to patient-specific instructions and a record.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// [value, text, release GBq, release mCi, release mrem/h, instructions GBq, instructions mCi, instructions mrem/h]
const T = [
  ['ag-111', 'Ag-111', 19, 520, 8, 3.8, 100, 2], ['au-198', 'Au-198', 3.5, 93, 21, 0.69, 19, 4], ['cr-51', 'Cr-51', 4.8, 130, 2, 0.96, 26, 0.4],
  ['cu-64', 'Cu-64', 8.4, 230, 27, 1.7, 45, 5], ['cu-67', 'Cu-67', 14, 390, 22, 2.9, 77, 4], ['ga-67', 'Ga-67', 8.7, 240, 18, 1.7, 47, 4],
  ['i-123', 'I-123', 6.0, 160, 26, 1.2, 33, 5], ['i-125', 'I-125', 0.25, 7, 1, 0.05, 1, 0.2], ['i-125-implant', 'I-125 implant', 0.33, 9, 1, 0.074, 2, 0.2],
  ['i-131', 'I-131', 1.2, 33, 7, 0.24, 7, 2], ['in-111', 'In-111', 2.4, 64, 20, 0.47, 13, 4], ['ir-192-implant', 'Ir-192 implant', 0.074, 2, 0.8, 0.011, 0.3, 0.2],
  ['pd-103-implant', 'Pd-103 implant', 1.5, 40, 3, 0.3, 8, 0.7], ['re-186', 'Re-186', 28, 770, 15, 5.7, 150, 3], ['re-188', 'Re-188', 29, 790, 20, 5.8, 160, 4],
  ['sc-47', 'Sc-47', 11, 310, 17, 2.3, 62, 3], ['se-75', 'Se-75', 0.089, 2, 0.5, 0.018, 0.5, 0.1], ['sm-153', 'Sm-153', 26, 700, 30, 5.2, 140, 6],
  ['sn-117m', 'Sn-117m', 1.1, 29, 4, 0.21, 6, 0.9], ['tc-99m', 'Tc-99m', 28, 760, 58, 5.6, 150, 12], ['tl-201', 'Tl-201', 16, 430, 19, 3.1, 85, 4],
  ['yb-169', 'Yb-169', 0.37, 10, 2, 0.073, 2, 0.4],
];
export const NUCLIDES = [
  ...T.map(([value, text, rG, rM, rD, iG, iM, iD]) => ({ value, text, release: { gbq: rG, mci: rM, mremH: rD }, instructions: { gbq: iG, mci: iM, mremH: iD } })),
  { value: 'p-32', text: 'P-32 (limits do not apply)', pureBeta: true },
  { value: 'sr-89', text: 'Sr-89 (limits do not apply)', pureBeta: true },
  { value: 'other', text: 'Another radionuclide (type its exposure rate constant and half-life)' },
];
export const UNITS = [{ value: 'mci', text: 'mCi', perMci: 1 }, { value: 'gbq', text: 'GBq', perMci: 0.037 }];
export const CONDITIONS = [
  { value: 'hyperthyroidism', text: 'Hyperthyroidism', f1: 0.20, t1: 0.32, f2: 0.80, t2: 5.2 },
  { value: 'thyroid-cancer', text: 'Post-thyroidectomy for thyroid cancer', f1: 0.95, t1: 0.32, f2: 0.05, t2: 7.3 },
];
const NOTE = 'The tables and equations are the NRC guide\'s methods for showing that the dose to another person is not likely to exceed 0.5 rem; they do not cover a breastfed infant, internal dose, or a patient whose situation differs from the guide\'s assumptions. The tool picks no occupancy factor. Releasing on a measured dose rate, a patient-specific calculation or an occupancy factor below the default needs a record of the basis (10 CFR 35.75(c)). Agreement State rules may differ.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 });

// Equation B-5, in rem.
function i131Dose(mci, c, e1, e2) {
  const G = 2.2; const Tp = 8.04; const k = Math.exp((-0.693 * 0.33) / Tp);
  return ((34.6 * G * mci) / 1e4) * (e1 * Tp * 0.8 * (1 - k) + k * e2 * c.f1 * c.t1 + k * e2 * c.f2 * c.t2);
}

export function patientReleaseRg839(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const n = NUCLIDES.find((x) => x.value === String(o.nuclide ?? '').trim());
  if (!n) return { valid: false, message: 'Choose the radionuclide from the guide\'s table, or "another radionuclide".' };
  const cite = 'NRC Regulatory Guide 8.39, Revision 1 (April 2020); 10 CFR 35.75.';
  if (n.pureBeta) return { valid: true, flag: 'limits-do-not-apply', abnormal: false, band: `${n.text.replace(/ \(.*$/, '')}: the guide's activity and dose rate limits do not apply, because of the minimal exposures to members of the public from dosages normally administered.`, bandLabel: 'Limits do not apply', notes: ['Tables 1 and 2, footnotes.', cite], note: NOTE };
  const hasActivity = !blank(o.activity); const hasRate = !blank(o.doseRateMremH);
  if (!hasActivity && !hasRate) return { valid: false, message: 'Enter the administered activity, or the measured dose rate at 1 meter.' };
  let mci = null; let unit = null;
  if (hasActivity) {
    unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
    if (!unit) return { valid: false, message: 'Choose the unit of the activity: mCi or GBq.' };
    const f = inputFault([['the administered activity', o.activity, null, 1e6, unit.text]]);
    if (f) return { valid: false, message: f };
    mci = Number(o.activity) / unit.perMci;
  }
  if (hasRate) { const rf = inputFault([['the dose rate at 1 meter', o.doseRateMremH, 0, 1e5, 'mrem/h']]); if (rf) return { valid: false, message: rf }; }
  const notes = []; const out = { valid: true };
  let releasable = null; let instructions = null;
  if (n.value === 'other') {
    if (!hasActivity) return { valid: false, message: 'For a radionuclide not in the table, enter the administered activity: the guide\'s equation works from it.' };
    const f = inputFault([['the exposure rate constant', o.gamma, null, 100, 'R·cm²/(mCi·h)'], ['the physical half-life', o.halfLifeDays, null, 1e5, 'days']]);
    if (f) return { valid: false, message: f };
    const G = Number(o.gamma); const Tp = Number(o.halfLifeDays); const E = Tp > 1 ? 0.25 : 1.0;
    const perMci = (34.6 * G * Tp * E) / 1e4; const dose = perMci * mci;
    out.doseRem = Number(dose.toPrecision(4)); out.releaseActivityMci = Number((0.5 / perMci).toPrecision(4)); out.instructionActivityMci = Number((0.1 / perMci).toPrecision(4));
    releasable = dose <= 0.5 + 1e-12; instructions = dose > 0.1 + 1e-12;
    notes.push(`Equation ${Tp > 1 ? '2' : '3'} (occupancy factor ${E}, for a half-life ${Tp > 1 ? 'over 1 day' : 'of 1 day or less'}): 34.6 × ${G} × ${sig(mci)} mCi × ${Tp} days × ${E} ÷ 10,000 = ${sig(dose)} rem to total decay at 1 meter.`,
      `By the same equation, 0.5 rem corresponds to ${sig(0.5 / perMci)} mCi and 0.1 rem to ${sig(0.1 / perMci)} mCi.`);
  } else {
    const byActivity = hasActivity ? Number(o.activity) <= n.release[unit.value] + 1e-12 : null;
    const byRate = hasRate ? Number(o.doseRateMremH) <= n.release.mremH + 1e-12 : null;
    releasable = byActivity === true || byRate === true;
    const instrActivity = hasActivity ? Number(o.activity) > n.instructions[unit.value] + 1e-12 : null;
    const instrRate = hasRate ? Number(o.doseRateMremH) > n.instructions.mremH + 1e-12 : null;
    // Either measure can show the dose is below 0.1 rem; instructions are needed unless one does.
    instructions = !(instrActivity === false || instrRate === false);
    out.byActivity = byActivity; out.byDoseRate = byRate;
    if (hasActivity) notes.push(`Table 1: ${n.text} may be released at or below ${n.release.mci} mCi (${n.release.gbq} GBq); ${Number(o.activity).toLocaleString('en-US')} ${unit.text} is ${byActivity ? 'at or below' : 'above'} it. Table 2: instructions above ${n.instructions.mci} mCi (${n.instructions.gbq} GBq).`);
    if (hasRate) notes.push(`Table 1: release at or below ${n.release.mremH} mrem/h at 1 meter; ${Number(o.doseRateMremH)} mrem/h is ${byRate ? 'at or below' : 'above'} it. Table 2: instructions above ${n.instructions.mremH} mrem/h. A release based on the dose rate needs a record, because the measurement includes shielding by tissue.`);
  }
  // I-131 patient-specific calculation.
  if (n.value === 'i-131' && (!blank(o.condition) || !blank(o.occupancyFirst8h) || !blank(o.occupancyAfter))) {
    const c = CONDITIONS.find((x) => x.value === String(o.condition ?? '').trim());
    if (!c) return { valid: false, message: 'Choose the condition treated (hyperthyroidism, or post-thyroidectomy for thyroid cancer): the uptake fractions and effective half-lives differ.' };
    if (!hasActivity) return { valid: false, message: 'Enter the administered activity for the patient-specific calculation.' };
    const f = inputFault([['the occupancy factor for the first 8 hours', o.occupancyFirst8h, null, 1, ''], ['the occupancy factor after 8 hours', o.occupancyAfter, null, 1, '']]);
    if (f) return { valid: false, message: `${f} The tool does not choose an occupancy factor; the guide's examples use 0.75 and 0.25.` };
    const dose = i131Dose(mci, c, Number(o.occupancyFirst8h), Number(o.occupancyAfter));
    out.patientSpecificDoseRem = Number(dose.toPrecision(4));
    const ok = dose <= 0.5 + 1e-12;
    notes.push(`Patient-specific (Equation B-5, ${c.text.toLowerCase()}; occupancy ${Number(o.occupancyFirst8h)} for the first 8 hours and ${Number(o.occupancyAfter)} after): ${sig(dose)} rem (${sig(dose * 10)} mSv) to total decay, ${ok ? 'not above' : 'above'} 0.5 rem.${Number(o.occupancyAfter) < 0.25 || Number(o.occupancyFirst8h) < 0.75 ? ' The guide ties an occupancy factor below its defaults to patient-specific instructions and a record.' : ''}`);
    if (ok) releasable = true;
    if (dose > 0.1) instructions = true;
    out.patientSpecificReleasable = ok;
  }
  notes.push(cite);
  return {
    ...out, flag: releasable ? (instructions ? 'release-with-instructions' : 'release') : 'not-shown', abnormal: !releasable, releasable, instructionsRequired: instructions,
    band: releasable ? `The guide's method shows a dose not likely to exceed 0.5 rem, so release may be authorized${instructions ? '; instructions, including written ones, are required (dose likely above 0.1 rem)' : '; the entry is not above the level that requires instructions'}.` : 'Not shown releasable by what was entered: above the guide\'s default activity or dose rate. The guide allows holding until decay, a dose-rate measurement, or a patient-specific calculation.',
    bandLabel: releasable ? (instructions ? 'Release, with instructions' : 'Release') : 'Not shown releasable',
    notes, note: NOTE,
  };
}
