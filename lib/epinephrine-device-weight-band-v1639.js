// spec-v1639 tool 13: the labeled strength of an epinephrine auto-injector or nasal spray at a weight.
//
// Sources, re-read October 12, 2026 (DailyMed, section 2 of each label):
//   EpiPen and EpiPen Jr (Viatris; set id 7560c201-9246-487c-a13b-6295db04274a, version 37):
//     "Patients greater than or equal to 30 kg (approximately 66 pounds or more): EpiPen 0.3 mg.
//     Patients 15 kg to 30 kg (33 pounds to 66 pounds): EpiPen Jr 0.15 mg". "consider using other
//     forms of injectable epinephrine if doses lower than 0.15 mg are deemed necessary."
//   Auvi-Q (Kaleo; 6180fb40-7fca-4602-b3da-ce62b8cd2470, version 21), Table 1: "30 kg or greater
//     AUVI-Q 0.3 mg; 15 kg to less than 30 kg AUVI-Q 0.15 mg; 7.5 kg to less than 15 kg AUVI-Q
//     0.1 mg". "a second dose of AUVI-Q may be administered with a second autoinjector starting 5
//     minutes after the first dose."
//   neffy (ARS; a1758142-a905-401d-8961-05829f51023a, version 7), Table 1: "30 kg or Greater: One
//     spray of neffy 2 mg; 15 kg to less than 30 kg: One spray of neffy 1 mg". "a second dose of
//     neffy may be administered in the same nostril with a second nasal spray starting 5 minutes
//     after the first dose."
//   All three: more than two sequential doses of epinephrine under direct medical supervision.
//
// The EpiPen label puts exactly 30 kg (and 66 lb) in both of its bands; both are shown. The tool
// names each label's strength. It does not select a product or tell the reader to give a dose.
//
// Pure: no DOM, no network. `now` is read only to check that each label edition still stands.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const EPIPEN = '7560c201-9246-487c-a13b-6295db04274a';
export const AUVIQ = '6180fb40-7fca-4602-b3da-ce62b8cd2470';
export const NEFFY = 'a1758142-a905-401d-8961-05829f51023a';
export const UNITS = [{ value: 'lb', text: 'lb' }, { value: 'kg', text: 'kg' }];
const POSTURE = 'This is what each label states for this weight. It is not advice for a particular patient, and it does not select a product.';
const r2 = (n) => Math.round(n * 100) / 100;

export function epinephrineDeviceWeightBand(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.find((u) => u.value === String(o.weightUnit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose whether the weight is in lb or kg.' };
  const lb = unit.value === 'lb';
  const f = inputFault([['the weight', o.weight, null, lb ? 700 : 320, unit.value]]);
  if (f) return { valid: false, message: f };
  const w = Number(o.weight);
  const kg = lb ? w * 0.45359237 : w;
  const notes = [lb ? `${w} lb is ${r2(kg)} kg. The Auvi-Q and neffy labels give their bands in kg only; the EpiPen label also gives pounds (33 and 66), and those are used for it.` : `Weight: ${w} kg.`];
  const out = { valid: true, weightKg: r2(kg), labelLinks: [] };
  let uncovered = 0; const strengths = [];

  const au = labelRow(AUVIQ, now, table); out.labelLinks.push({ text: 'Auvi-Q label on DailyMed', url: au.url });
  if (!au.answers) notes.push(`The Auvi-Q label row is withheld: ${au.why}.`);
  else if (kg < 7.5) { uncovered += 1; out.auviQ = null; notes.push('Auvi-Q: the label does not cover this weight. Its table starts at 7.5 kg, and it says to "use other forms of injectable epinephrine if doses lower than 0.1 mg are deemed necessary."'); }
  else { out.auviQ = kg < 15 ? '0.1 mg' : kg < 30 ? '0.15 mg' : '0.3 mg'; strengths.push(`Auvi-Q ${out.auviQ}`); notes.push(`Auvi-Q: ${out.auviQ} (label: "${kg < 15 ? '7.5 kg to less than 15 kg' : kg < 30 ? '15 kg to less than 30 kg' : '30 kg or greater'}").`); }

  const ep = labelRow(EPIPEN, now, table); out.labelLinks.push({ text: 'EpiPen label on DailyMed', url: ep.url });
  const [v, lo, hi, u] = lb ? [w, 33, 66, 'pounds'] : [w, 15, 30, 'kg'];
  if (!ep.answers) notes.push(`The EpiPen label row is withheld: ${ep.why}.`);
  else if (v < lo) { uncovered += 1; out.epiPen = null; notes.push('EpiPen and EpiPen Jr: the label does not cover this weight. Its lower band starts at 15 kg (33 pounds), and it says to "consider using other forms of injectable epinephrine if doses lower than 0.15 mg are deemed necessary."'); }
  else if (v === hi) { out.epiPen = 'EpiPen Jr 0.15 mg or EpiPen 0.3 mg'; strengths.push('EpiPen Jr 0.15 mg or EpiPen 0.3 mg (the label puts this weight in both bands)'); notes.push(`EpiPen: the label puts exactly ${hi} ${u} in both of its bands: "15 kg to 30 kg (33 pounds to 66 pounds): EpiPen Jr 0.15 mg" and "greater than or equal to 30 kg (approximately 66 pounds or more): EpiPen 0.3 mg". Both are shown; the label does not settle it.`); }
  else { const jr = v < hi; out.epiPen = jr ? 'EpiPen Jr 0.15 mg' : 'EpiPen 0.3 mg'; strengths.push(out.epiPen); notes.push(`EpiPen: ${out.epiPen} (label: "${jr ? 'Patients 15 kg to 30 kg (33 pounds to 66 pounds)' : 'Patients greater than or equal to 30 kg (approximately 66 pounds or more)'}").`); }

  const nf = labelRow(NEFFY, now, table); out.labelLinks.push({ text: 'neffy label on DailyMed', url: nf.url });
  if (!nf.answers) notes.push(`The neffy label row is withheld: ${nf.why}.`);
  else if (kg < 15) { uncovered += 1; out.neffy = null; notes.push('neffy nasal spray: the label does not cover this weight. Its recommended dosage is "for patients who weigh 15 kg or greater".'); }
  else { out.neffy = kg < 30 ? 'one spray of 1 mg' : 'one spray of 2 mg'; strengths.push(`neffy ${out.neffy}`); notes.push(`neffy nasal spray: ${out.neffy} (label: "${kg < 30 ? '15 kg to less than 30 kg' : '30 kg or Greater'}").`); }

  const second = [];
  if (au.answers) second.push('Auvi-Q: a second dose "with a second autoinjector starting 5 minutes after the first dose"');
  if (nf.answers) second.push('neffy: a second dose "in the same nostril with a second nasal spray starting 5 minutes after the first dose"');
  if (ep.answers) second.push('EpiPen: "With severe persistent anaphylaxis, repeat injections with an additional EpiPen or EpiPen Jr may be necessary"');
  if (second.length) notes.push(`Second dose, in the absence of clinical improvement or if symptoms worsen: ${second.join('; ')}. Each label read says more than two sequential doses of epinephrine are given under direct medical supervision.`);
  const editions = [au, ep, nf].filter((l) => l.answers).map((l) => l.edition);
  if (editions.length) notes.push(`Labels: ${editions.join('; ')}.`);
  notes.push(POSTURE);
  const withheld = [au, ep, nf].some((l) => !l.answers);
  return { ...out, withheld, flag: uncovered ? 'a-label-does-not-cover-this-weight' : 'labeled', abnormal: uncovered > 0, band: strengths.length ? `${strengths.join('; ')}.` : 'No label read covers this weight.', bandLabel: uncovered ? `${uncovered} label${uncovered === 1 ? ' does' : 's do'} not cover this weight` : `${r2(kg)} kg`, notes, note: notes.join(' ') };
}
