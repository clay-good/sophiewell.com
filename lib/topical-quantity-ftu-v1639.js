// spec-v1639 tool 2: topical quantity by fingertip units, adults.
//
// Sources, re-read October 12, 2026:
//   Long CC, Finlay AY. The finger-tip unit: a new practical measure. Clin Exp Dermatol.
//     1991;16(6):444-447 (PMID 1806320), abstract: "Thirty adult-patients treated various
//     anatomical regions ... The number of FTU's required was: face and neck 2.5 (s.d. +/- 0.8);
//     front of trunk 6.7 (s.d. +/- 1.7); back of trunk 6.8 (s.d. +/- 1.2); arm and forearm 3.3
//     (s.d. +/- 1.0); hand 1.2 (s.d. +/- 0.4); leg and thigh 5.8 (s.d. +/- 1.7); foot 1.8 (s.d.
//     +/- 0.6)."
//   Gram weights: one fingertip unit "corresponds to 0.49 g (for males; 0.43 g for females)", as
//     restated in an open-access paper (PMC5874822) that cites Long and Finlay 1991 and Long,
//     Finlay and Averill 1992. The 1991 paper's full text was not read.
// These are means measured in 30 adults, not a prescribing rule. The children's table (1998) was
// not read and is not built.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const AREAS = [
  { arg: 'faceNeck', dom: 'ftu-face', label: 'Face and neck', ftu: 2.5, sd: 0.8, max: 1 },
  { arg: 'frontTrunk', dom: 'ftu-front', label: 'Front of trunk', ftu: 6.7, sd: 1.7, max: 1 },
  { arg: 'backTrunk', dom: 'ftu-back', label: 'Back of trunk', ftu: 6.8, sd: 1.2, max: 1 },
  { arg: 'arms', dom: 'ftu-arms', label: 'Arm and forearm', ftu: 3.3, sd: 1.0, max: 2 },
  { arg: 'hands', dom: 'ftu-hands', label: 'Hand', ftu: 1.2, sd: 0.4, max: 2 },
  { arg: 'legs', dom: 'ftu-legs', label: 'Leg and thigh', ftu: 5.8, sd: 1.7, max: 2 },
  { arg: 'feet', dom: 'ftu-feet', label: 'Foot', ftu: 1.8, sd: 0.6, max: 2 },
];
export const SEXES = [{ value: 'male-ftu', text: 'Male (0.49 g a unit)' }, { value: 'female-ftu', text: 'Female (0.43 g a unit)' }];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;

export function topicalQuantityFtu(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = SEXES.find((s) => s.value === String(o.sex ?? '').trim());
  if (!sex) return { valid: false, message: 'Choose the sex: the paper weighed a fingertip unit at 0.49 g in men and 0.43 g in women.' };
  const chosen = [];
  for (const a of AREAS) {
    if (blank(o[a.arg])) continue;
    const f = inputFault([[`the number of ${a.label.toLowerCase()} areas`, o[a.arg], 0, a.max, '']]);
    if (f) return { valid: false, message: f };
    const n = Number(o[a.arg]);
    if (!Number.isInteger(n)) return { valid: false, message: `Enter the ${a.label.toLowerCase()} count as a whole number (0${a.max === 2 ? ', 1 or 2' : ' or 1'}).` };
    if (n > 0) chosen.push({ ...a, n });
  }
  if (!chosen.length) return { valid: false, message: 'Enter at least one body area treated (1 for an area; 1 or 2 for a limb, hand or foot).' };
  const f = inputFault([['the applications per day', o.applicationsPerDay, null, 12, ''], ['the days of treatment', o.days, null, 365, 'days']]);
  if (f) return { valid: false, message: f };
  const gramsPerUnit = sex.value === 'male-ftu' ? 0.49 : 0.43;
  const units = chosen.reduce((s, a) => s + a.ftu * a.n, 0);
  const gramsPerApplication = units * gramsPerUnit;
  const total = gramsPerApplication * Number(o.applicationsPerDay) * Number(o.days);
  const notes = chosen.map((a) => `${a.label}${a.n > 1 ? ` x ${a.n}` : ''}: ${r1(a.ftu * a.n)} fingertip units (the paper's mean ${a.ftu}, standard deviation ${a.sd}, for one).`);
  notes.push(`Per application: ${r1(units)} fingertip units x ${gramsPerUnit} g = ${r2(gramsPerApplication)} g. Over ${Number(o.applicationsPerDay)} application${Number(o.applicationsPerDay) === 1 ? '' : 's'} a day for ${Number(o.days)} days: ${r1(total)} g.`);
  const out = { valid: true, unitsPerApplication: r1(units), gramsPerApplication: r2(gramsPerApplication), totalGrams: r1(total) };
  if (!blank(o.tubeGrams)) {
    const g = inputFault([['the tube size', o.tubeGrams, null, 5000, 'g']]);
    if (g) return { valid: false, message: g };
    out.tubes = Math.ceil(total / Number(o.tubeGrams) - 1e-9);
    notes.push(`In ${Number(o.tubeGrams)} g tubes: ${out.tubes} tube${out.tubes === 1 ? '' : 's'}, rounded up.`);
  } else notes.push('No tube size was entered, so no tube count is shown.');
  notes.push('A fingertip unit is the ointment squeezed from a tube with a 5 mm nozzle, from the last skin crease to the tip of the index finger. These are means measured in 30 adults, with wide spread; they are not a prescribing rule, and the prescriber\'s directions decide the amount. Adults only: the children\'s table is not built.');
  return { ...out, flag: 'quantity', abnormal: false, band: `${r1(total)} g for the course; ${r2(gramsPerApplication)} g an application.`, bandLabel: out.tubes !== undefined ? `${out.tubes} tube${out.tubes === 1 ? '' : 's'}` : `${r1(units)} fingertip units an application`, notes, note: notes.join(' ') };
}
