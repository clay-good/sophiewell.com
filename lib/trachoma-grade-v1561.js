// spec-v1561 tool 10: the WHO simplified trachoma grading system, amended 2020: which of the five signs one
// eye shows.
//
// Source: Solomon AW, Kello AB, Bangert M, et al. The simplified trachoma grading system, amended. Bull World
// Health Organ. 2020;98(10):698-705 (PMC7652564; CC BY 3.0 IGO, facts restated). Read October 6, 2026:
// trachomatous trichiasis (TT), at least one upper-lid eyelash touching the eyeball or evidence of recent
// epilation of in-turned upper-lid lashes (the 2018 amendment excludes trichiasis of the lower lid only);
// corneal opacity (CO), easily visible opacity dense enough to blur at least part of the pupil margin;
// trachomatous inflammation-follicular (TF), five or more follicles, each at least 0.5 mm, in the central
// upper tarsal conjunctiva; trachomatous inflammation-intense (TI), pronounced inflammatory thickening that
// obscures more than half of the normal deep tarsal vessels; trachomatous scarring (TS), easily visible
// scarring of the upper tarsal conjunctiva. Each sign is present or absent independently in each eye; TF and
// TI are active trachoma. Elimination needs TT unknown to the health system under 0.2% in people 15 or older.
// The S of SAFE is surgery for trichiasis.
//
// Stated rather than hidden: the number of mass azithromycin rounds by TF prevalence is not built (no
// current WHO document stating it was read), and the TF elimination threshold was not in this source.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows the WHO simplified trachoma grading system as amended in 2020 (Solomon et al., Bull WHO). Grade each eye separately.';
const k = (v) => v === 'yes' || v === 'no';

export function trachomaGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let tf = null;
  if (String(o.follicles ?? '').trim() !== '') {
    const f = inputFault([['the number of follicles', o.follicles, 0, 200, 'follicles']]);
    if (f) return { valid: false, message: f };
    tf = Number(o.follicles) >= 5;
  }
  if (![o.tt, o.co, o.ti, o.ts].some(k) && tf === null) return { valid: false, message: 'Choose at least one sign, or enter the follicle count.' };
  const signs = [];
  if (o.tt === 'yes') signs.push('TT (trachomatous trichiasis)');
  if (o.co === 'yes') signs.push('CO (corneal opacity)');
  if (tf) signs.push('TF (trachomatous inflammation-follicular)');
  if (o.ti === 'yes') signs.push('TI (trachomatous inflammation-intense)');
  if (o.ts === 'yes') signs.push('TS (trachomatous scarring)');
  const open = [k(o.tt) ? null : 'TT', k(o.co) ? null : 'CO', tf === null ? 'TF (follicle count)' : null, k(o.ti) ? null : 'TI', k(o.ts) ? null : 'TS'].filter(Boolean);
  const notes = [];
  if (open.length && signs.length) notes.push(`Not assessed: ${open.join(', ')}.`);
  if (o.tt === 'yes') notes.push('Trichiasis: refer for surgery (the S of SAFE). Lower-lid-only trichiasis is not graded as TT.');
  if (o.co === 'yes') notes.push('Measure visual acuity if possible: CO is meant to catch opacities that impair vision.');
  if (tf || o.ti === 'yes') notes.push('TF or TI is active trachoma, usually with conjunctival C. trachomatis infection.');
  if (tf === false && Number(o.follicles) > 0) notes.push('Fewer than five follicles of 0.5 mm or more in the central upper tarsal conjunctiva is not TF.');
  notes.push('Program use: elimination as a public health problem needs TT unknown to the health system below 0.2% in people aged 15 or older.');
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (signs.length) return out(`Signs present in this eye: ${signs.join(', ')}.`, signs.map((s) => s.split(' ')[0]).join(', '), true);
  if (open.length) return out(`No sign found so far, but not assessed: ${open.join(', ')}.`, 'Not fully graded', false);
  return out('None of the five trachoma signs in this eye.', 'No signs', false);
}
