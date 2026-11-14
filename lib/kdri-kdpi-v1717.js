// spec-v1717 (transplant-allocation-scores tool 1): the Kidney Donor Risk Index and Kidney Donor Profile Index.
//
// Source: OPTN, A Guide to Calculating and Interpreting the Kidney Donor Profile Index (KDPI), updated April 23, 2026
// (SHA-256 7e6f39ad...), read November 7, 2026: Table 1's eight-factor refit without race and HCV (October 31,
// 2024), Xβ summed as printed, KDRI_RAO = e^Xβ, KDRI_SCALED = KDRI_RAO / the prior year's median (the scaling factor),
// and KDPI = the cumulative percentage from the KDRI-to-KDPI mapping table (lib/optn-kdpi.js, 2025 reference year,
// which also carries the scaling factor in use and the shares used for unknown diabetes and hypertension). The
// OPTN KDPI calculator page: "If diabetes or hypertension statuses are unknown, the calculator will assume the donor
// has the same chance as a randomly selected donor having the condition", so an unknown status enters at that share.
//
// Pure: no DOM, no network; `now` is passed in (or the SOPHIEWELL_NOW pin) for the table's re-read date.

import { measured } from './num.js';
import { todayUtc, parseDate, diffDays } from './pa/date.js';
import { KDPI_TABLE as T, UPPERS } from './optn-kdpi.js';

export const HISTORY_OPTIONS = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
  { value: 'unknown', text: 'Unknown' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
const sig = (x, d = 4) => Number(x.toPrecision(d));

// spec-v1718: the guide's extreme-value rule, which the November 7 transcription left out. A serum creatinine
// above 8 mg/dL enters the KDRI as 8: the guide gives 8, 9, 15 and 25 as values that all compute the same KDRI,
// and OPTN's own calculator prints a note when the cap applies.
//
// It is not a tidy-up. The two creatinine terms sum to a slope of 0.2128 - 0.2199 = -0.0071 per mg/dL above
// 1.5, so the published formula FALLS as creatinine rises, and uncapped it falls without end: the guide's own
// example donor read KDPI 67% at 1.7 mg/dL and 54% at 20 -- a donor in dialysis-dependent acute kidney injury
// reported as a BETTER kidney than the same donor with a near-normal creatinine. The cap is what bounds that,
// and it bounds it in the unsafe direction.
export const CREATININE_CAP = 8;

// xBeta(donor) -> the sum of Table 1's components. hypertension and diabetes are 1, 0, or the share used for
// unknown; creatinine enters capped, as the guide's extreme-value rule states.
export function xBeta({ age, heightCm, weightKg, hypertension, diabetes, cva, creatinine: rawCreatinine, dcd }) {
  const creatinine = Math.min(rawCreatinine, CREATININE_CAP);
  return 0.0092 * (age - 40)
    + (age < 18 ? 0.0113 * (age - 18) : 0)
    + (age > 50 ? 0.0067 * (age - 50) : 0)
    - (0.0557 * (heightCm - 170)) / 10
    - (weightKg < 80 ? (0.0333 * (weightKg - 80)) / 5 : 0)
    + 0.1106 * hypertension
    + 0.2577 * diabetes
    + (cva ? 0.0743 : 0)
    + 0.2128 * (creatinine - 1)
    - (creatinine > 1.5 ? 0.2199 * (creatinine - 1.5) : 0)
    + (dcd ? 0.1966 : 0);
}

// kdpiFromScaled(scaled) -> the integer percentage: the first row whose inclusive upper bound holds the value.
export function kdpiFromScaled(scaled) {
  if (!Number.isFinite(scaled) || scaled <= 0) return null;
  for (let p = 0; p < UPPERS.length; p += 1) if (scaled <= UPPERS[p]) return p;
  return 100;
}

const FENCES = {
  age: ['Donor age', 0, 100, 'years'],
  heightCm: ['Height', 30, 250, 'cm'],
  weightKg: ['Weight', 1, 300, 'kg'],
  // spec-v1718: the guide's own entry range for creatinine, which is wider than the fence shipped in
  // spec-v1717 (0.1 to 20). With the cap above, nothing between 8 and 40 changes an answer, so the fence
  // only decided whether a real reported value was refused; it refused values OPTN accepts. A µmol/L
  // slip (150) is still well outside it.
  creatinine: ['Serum creatinine', 0.01, 40, 'mg/dL'],
};

export function kdriKdpi(input = {}, now = undefined) {
  const o = input && typeof input === 'object' ? input : {};
  if (diffDays(todayUtc(now), parseDate(T.validThrough)) > 0) {
    return { valid: false, message: `The OPTN KDPI mapping table this tool holds (${T.referenceYear} reference year, read ${T.readOn}) is past its re-read date; OPTN updates it each spring. Use the OPTN KDPI calculator until it is read again.` };
  }
  const v = {};
  for (const [key, [name, lo, hi, unit]] of Object.entries(FENCES)) {
    const raw = o[key];
    const x = typeof raw === 'number' || typeof raw === 'string' ? measured(raw) : null;
    if (x === null) return { valid: false, message: `Enter the ${name.toLowerCase()} (${unit}).` };
    if (x < lo || x > hi) return { valid: false, message: `${name} must be from ${lo} to ${hi} ${unit}.` };
    v[key] = x;
  }
  if (!Number.isInteger(v.age)) return { valid: false, message: 'Enter the donor age in whole years, as the guide does.' };
  const pick = (key, label, opts) => {
    const s = String(o[key] ?? '').trim();
    return opts.some((x) => x.value === s) ? s : { message: `Answer ${label}.` };
  };
  const htn = pick('hypertension', 'history of hypertension (yes, no or unknown)', HISTORY_OPTIONS);
  const dm = pick('diabetes', 'history of diabetes (yes, no or unknown)', HISTORY_OPTIONS);
  const cva = pick('cva', 'whether the cause of death was cerebrovascular (CVA)', YES_NO);
  const dcd = pick('dcd', 'whether the donor was recovered after circulatory death (DCD)', YES_NO);
  for (const x of [htn, dm, cva, dcd]) if (typeof x !== 'string') return { valid: false, message: x.message };

  const share = (s, unknownShare) => (s === 'yes' ? 1 : s === 'no' ? 0 : unknownShare);
  const xb = xBeta({ ...v, hypertension: share(htn, T.hypertensionShare), diabetes: share(dm, T.diabetesShare), cva: cva === 'yes', dcd: dcd === 'yes' });
  const rao = Math.exp(xb);
  const scaled = rao / T.scalingFactor;
  const kdpi = kdpiFromScaled(scaled);
  if (kdpi === null || !Number.isFinite(rao)) return { valid: false, message: 'These values give no KDRI; check them.' };

  const notes = [
    `Xβ ${sig(xb, 6)}; KDRI_RAO = e^Xβ = ${sig(rao, 6)} (relative to the reference donor of Rao et al.).`,
    `KDRI scaled = ${sig(rao, 6)} ÷ ${T.scalingFactor} (the median KDRI_RAO of ${T.referenceYear} donors) = ${sig(scaled, 6)}: ${sig(scaled, 3)} times the graft-failure risk of the median ${T.referenceYear} donor.`,
    `KDPI ${kdpi}%: the estimated risk of graft failure is higher than that of ${kdpi}% of kidney donors recovered in ${T.referenceYear} (OPTN mapping table, ${T.referenceYear} reference population).`,
  ];
  if (v.creatinine > CREATININE_CAP) {
    notes.push(`Serum creatinine ${v.creatinine} mg/dL entered the KDRI as ${CREATININE_CAP} mg/dL: the guide caps it there, so every value above ${CREATININE_CAP} gives the same KDRI and the same KDPI.`);
  }
  const imputed = [];
  if (htn === 'unknown') imputed.push(`hypertension at ${sig(100 * T.hypertensionShare, 4)}%`);
  if (dm === 'unknown') imputed.push(`diabetes at ${sig(100 * T.diabetesShare, 4)}%`);
  if (imputed.length) notes.push(`Unknown history entered as the share of ${T.referenceYear} donors with it, as OPTN's calculator does: ${imputed.join(', ')}.`);
  if (v.age < 18) notes.push('Under 18: the age term adds 0.0113 × (age − 18), as Table 1 prints.');
  if (kdpi <= 20) notes.push('KDPI 20% or less: these kidneys are offered with priority to candidates whose EPTS is 20% or less (longevity matching), within the allocation rules.');
  notes.push('The guide\'s cautions: the KDPI\'s c-statistic is about 0.60, so it separates donors far apart better than donors close together; it should not be turned into a yes/no cutoff; and it should never alone rule a kidney in. It leaves out biopsy findings, kidney-specific anatomy and infectious risk.');

  return {
    valid: true, kdpi, kdriScaled: sig(scaled, 6), kdriRao: sig(rao, 6), xBeta: sig(xb, 6), abnormal: false,
    band: `KDPI ${kdpi}%; KDRI ${sig(scaled, 3)} (scaled to the median ${T.referenceYear} donor).`,
    bandLabel: `KDPI ${kdpi}%`,
    notes,
    note: `The donor-only KDRI and its KDPI from OPTN's guide (April 23, 2026) and mapping table (${T.referenceYear} reference year). A summary of donor factors, not an organ-acceptance decision.`,
  };
}
