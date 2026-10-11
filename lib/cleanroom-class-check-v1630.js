// spec-v1630 tool 16: particle count and microbial sample against FDA's air classification table.
//
// FDA, Guidance for Industry: Sterile Drug Products Produced by Aseptic Processing, Current Good
// Manufacturing Practice (September 2004), Table 1 ("Air Classifications"), re-read on October 11,
// 2026:
//   Clean area class        ISO    >= 0.5 um     active air action   settling plate action level
//   (0.5 um particles/ft3)         particles/m3  level (cfu/m3)      (90 mm; cfu/4 hours)
//   100                     5      3,520         1                   1
//   1,000                   6      35,200        7                   3
//   10,000                  7      352,000       10                  5
//   100,000                 8      3,520,000     100                 50
// Footnotes: (a) classifications are "based on data measured in the vicinity of exposed
// materials/articles during periods of activity"; (c) the microbiological values "represent
// recommended levels of environmental quality" and a firm may set alternate action levels; (d) "the
// additional use of settling plates is optional"; (e) "samples from Class 100 (ISO 5) environments
// should normally yield no microbiological contaminants."
//
// The count is compared in the unit entered, because the table pairs each per-cubic-foot class with a
// rounded per-cubic-meter figure (100/ft3 is 3,531/m3 by conversion; the table says 3,520).
//
// Scope: this is FDA's cGMP table, for manufacturers and outsourcing facilities. A pharmacy under USP
// <797> has that chapter's own action levels, which are not shipped; the result says so. The tool
// reports where a number sits against the table and gives no verdict on a room or a batch. FDA's page
// for the guidance is under the weekly page watch.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SOURCE = {
  edition: 'September 2004', route: 'B', readOn: '2026-10-11',
  source: { label: 'FDA, Sterile Drug Products Produced by Aseptic Processing: Current Good Manufacturing Practice (September 2004), Table 1', url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/sterile-drug-products-produced-aseptic-processing-current-good-manufacturing-practice' },
};
export const CLASSES = [
  { iso: 5, perFt3: 100, perM3: 3520, activeAir: 1, settlingPlate: 1 },
  { iso: 6, perFt3: 1000, perM3: 35200, activeAir: 7, settlingPlate: 3 },
  { iso: 7, perFt3: 10000, perM3: 352000, activeAir: 10, settlingPlate: 5 },
  { iso: 8, perFt3: 100000, perM3: 3520000, activeAir: 100, settlingPlate: 50 },
];
export const COUNT_UNITS = [
  { value: 'm3', text: 'Particles per m³' },
  { value: 'ft3', text: 'Particles per ft³' },
];
export const INTENDED = CLASSES.map((c) => ({ value: String(c.iso), text: `ISO ${c.iso} (Class ${c.perFt3.toLocaleString('en-US')})` }));
const NOTE = 'FDA\'s cGMP table, for manufacturers and outsourcing facilities. A pharmacy under USP <797> has that chapter\'s own levels, which this tool does not carry. It reports where a number sits against the table; it gives no verdict on a room or a batch.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const show = (x) => Number(Number(x).toPrecision(9)).toLocaleString('en-US', { maximumFractionDigits: 3 });
const name = (c) => `ISO ${c.iso} (Class ${c.perFt3.toLocaleString('en-US')})`;
const against = (x, level) => (x > level ? 'over' : x === level ? 'at' : 'under');

export function cleanroomClassCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = String(o.countUnit ?? '').trim();
  if (unit !== 'm3' && unit !== 'ft3') return { valid: false, message: 'Choose the unit of the particle count: per m³ or per ft³.' };
  const key = unit === 'm3' ? 'perM3' : 'perFt3'; const ut = unit === 'm3' ? 'per m³' : 'per ft³';
  const cf = inputFault([['the particle count at 0.5 µm and larger', o.count, 0, 1e12, ut]]);
  if (cf) return { valid: false, message: cf };
  const count = Number(o.count);
  let intended = null;
  if (!blank(o.intendedClass)) {
    intended = CLASSES.find((c) => String(c.iso) === String(o.intendedClass).trim());
    if (!intended) return { valid: false, message: 'Choose the area\'s intended class: ISO 5, 6, 7 or 8.' };
  }
  const samples = [];
  for (const [arg, label, field, su] of [['activeAir', 'the active air sample', 'activeAir', 'cfu/m³'], ['settlingPlate', 'the settling plate count', 'settlingPlate', 'cfu per 4 hours']]) {
    if (blank(o[arg])) continue;
    const sf = inputFault([[label, o[arg], 0, 1e9, su]]);
    if (sf) return { valid: false, message: sf };
    samples.push({ arg, field, su, value: Number(o[arg]), label });
  }
  if (samples.length && !intended) return { valid: false, message: 'A microbial sample is read against the level for the area\'s intended class. Choose the intended class.' };

  const met = CLASSES.find((c) => count <= c[key]) || null;
  const notes = [met
    ? `Particles: ${show(count)} ${ut} is within the ${name(met)} limit of ${show(met[key])} ${ut}${met.iso > 5 ? ` and above the ${name(CLASSES[met.iso - 6])} limit of ${show(CLASSES[met.iso - 6][key])}` : ''}.`
    : `Particles: ${show(count)} ${ut} is above the ISO 8 (Class 100,000) limit of ${show(CLASSES[3][key])} ${ut}, the least clean class in the table.`];
  let abnormal = false; let particleMeetsIntended = null;
  if (intended) {
    particleMeetsIntended = count <= intended[key];
    if (!particleMeetsIntended) abnormal = true;
    notes.push(`Intended class ${name(intended)}: the limit is ${show(intended[key])} ${ut}, and the count is ${particleMeetsIntended ? 'within' : 'above'} it.`);
  }
  const out = { valid: true, isoClassMet: met ? met.iso : null, particleMeetsIntended };
  for (const s of samples) {
    const level = intended[s.field]; const where = against(s.value, level);
    if (where === 'over') abnormal = true;
    out[`${s.arg}Against`] = where;
    notes.push(`${s.arg === 'activeAir' ? 'Active air' : 'Settling plate (90 mm)'}: ${show(s.value)} ${s.su} is ${where} the recommended action level of ${show(level)} for ${name(intended)}.${intended.iso === 5 && s.value > 0 ? ' The table adds that samples from Class 100 (ISO 5) environments should normally yield no microbiological contaminants.' : ''}`);
  }
  notes.push('The table\'s footnotes: classifications are based on data measured near exposed materials and articles during periods of activity; the microbial values are recommended levels, and other action levels may suit the operation or the method; settling plates are optional.');
  const classText = met ? `meets ${name(met)}` : 'is above the ISO 8 (Class 100,000) limit';
  const sampleText = samples.map((s) => `${s.arg === 'activeAir' ? 'active air' : 'settling plate'} ${out[`${s.arg}Against`]} the action level`).join(', ');
  return {
    ...out, abnormal: abnormal || !met,
    band: `The particle count ${classText}${intended ? (particleMeetsIntended ? `, within the intended ${name(intended)}` : `, not the intended ${name(intended)}`) : ''}${sampleText ? `; ${sampleText}` : ''}.`,
    bandLabel: met ? `ISO ${met.iso}` : 'Above ISO 8',
    notes, note: NOTE,
  };
}
