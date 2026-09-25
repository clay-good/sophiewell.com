// spec-v1492: the Bolton tooth-size ratios, beside the Angle classification.
//
// Sources, read 2026-09-25:
//   Bolton WA. Disharmony in tooth size and its relation to the analysis and treatment of
//     malocclusion. Angle Orthod. 1958;28(3):113-130 (the original).
//   The ratios as stated in J Clin Med 2026 (PMC13565780): "Anterior Bolton ratio (3-3): compares the
//     6 front teeth (incisors and canines); ideal value: 77.2% (+/-1.65%). Total Bolton ratio (6-6):
//     compares 12 teeth (from the right first molar to the left first molar); ideal value: 91.3%
//     (+/-1.91%). If the computed value of this ratio is higher than the ideal value, it reflects a
//     mandibular excess ... lower than the ideal value, it reflects a maxillary excess ... The
//     difference is expressed in mm of dental substance."
//
// Each ratio is the mandibular sum of mesiodistal widths over the maxillary sum, times 100. The excess
// in mm is the width that brings the ratio to Bolton's mean. Pure: no DOM, no clock.

import { inputFault } from './num.js';

const r1 = (x) => Math.round(x * 10) / 10;
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

const SETS = [
  { key: 'anterior', name: 'Anterior ratio (canine to canine)', mean: 77.2, sd: 1.65, max: 'maxAnterior', mand: 'mandAnterior', lo: 20, hi: 80, what: 'six anterior teeth' },
  { key: 'overall', name: 'Overall ratio (first molar to first molar)', mean: 91.3, sd: 1.91, max: 'maxOverall', mand: 'mandOverall', lo: 60, hi: 140, what: 'twelve teeth' },
];

function one(set, o) {
  const maxRaw = o[set.max];
  const mandRaw = o[set.mand];
  if (blank(maxRaw) && blank(mandRaw)) return null;
  const fault = inputFault([
    [`the maxillary sum of the ${set.what}`, maxRaw, set.lo, set.hi, 'mm'],
    [`the mandibular sum of the ${set.what}`, mandRaw, set.lo * 0.7, set.hi, 'mm'],
  ]);
  if (fault) return { fault };
  const mx = Number(maxRaw);
  const md = Number(mandRaw);
  const ratio = (md / mx) * 100;
  const z = (ratio - set.mean) / set.sd;
  let excess = null;
  let text;
  if (ratio > set.mean) {
    excess = { arch: 'mandibular', mm: r1(md - mx * set.mean / 100) };
  } else if (ratio < set.mean) {
    excess = { arch: 'maxillary', mm: r1(mx - md * 100 / set.mean) };
  }
  const within = Math.abs(z) <= 1;
  if (!excess || excess.mm === 0) text = `${set.name} ${r1(ratio)}%, at Bolton's mean of ${set.mean}%.`;
  else text = `${set.name} ${r1(ratio)}% against Bolton's ${set.mean}% (SD ${set.sd}): ${within ? 'within' : 'outside'} 1 SD, a ${excess.arch} excess of ${excess.mm} mm.`;
  return { key: set.key, ratio: r1(ratio), within, excess, text, label: `${set.key} ${r1(ratio)}%` };
}

export function boltonRatio(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const res = SETS.map((s) => one(s, o));
  const bad = res.find((r) => r && r.fault);
  if (bad) return { valid: false, message: bad.fault };
  const done = res.filter(Boolean);
  if (res[0] && res[1] && (Number(o.maxAnterior) >= Number(o.maxOverall) || Number(o.mandAnterior) >= Number(o.mandOverall))) {
    return { valid: false, message: 'Enter the sums again: the six anterior teeth are part of the twelve, so each anterior sum must be smaller than its overall sum.' };
  }
  if (!done.length) return { valid: false, message: 'Enter the maxillary and mandibular sums of the tooth widths for the anterior or the overall ratio.' };
  const notes = [];
  for (let i = 0; i < SETS.length; i += 1) {
    if (!res[i]) notes.push(`The ${SETS[i].key} ratio was not computed: its sums were not entered.`);
  }
  notes.push('The anterior sums are part of the overall sums; each ratio is the mandibular sum over the maxillary sum, times 100.');
  return {
    valid: true,
    anterior: res[0] ? res[0].ratio : null,
    overall: res[1] ? res[1].ratio : null,
    abnormal: done.some((r) => !r.within),
    band: done.map((r) => r.text).join(' '),
    bandLabel: done.map((r) => r.label).join(', '),
    notes,
    note: 'Bolton WA, Angle Orthod 1958; means and SDs as stated in J Clin Med 2026. The excess is the width, in mm, that would bring the ratio to the mean; how to correct it is a clinical decision.',
  };
}
