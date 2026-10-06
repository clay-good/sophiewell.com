// spec-v1562 tool 3: a community decision: how often to give schistosomiasis preventive chemotherapy
// (praziquantel mass treatment) by community prevalence (WHO 2022). A program decision, not a treatment
// decision for one person.
//
// Source: WHO guideline on control and elimination of human schistosomiasis, 2022 (IRIS 10665/351856; CC
// BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026, glossary (pp. ix, xv) and recommendations 1-3
// (pp. xvi-xviii):
//   - Rec 1 (strong): prevalence 10% or more, yearly single-dose praziquantel at 75% coverage or more, all
//     ages from 2 years, including adults, pregnant women after the first trimester and lactating women.
//     The 10% is by duplicate Kato-Katz or single 10 mL urine filtration; 30% by urine POC-CCA (S. mansoni)
//     counts as 10%. Under 2 years: individual clinical decision only.
//   - Rec 2 (conditional): under 10%, either continue regular preventive chemotherapy at the same or a lower
//     frequency (where there has been a program), or test and treat (where there has not).
//   - Rec 3 (conditional): 10% or more with no appropriate response to annual rounds despite 75% coverage
//     (a fall of less than one third from baseline after two annual rounds), consider twice-yearly
//     treatment, prioritized where baseline prevalence in school-age children is 50% or more.
//   - Settings: low under 10% (under 30% POC-CCA), moderate 10-49% (30-74%), high 50% or more (75% or more).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const METHOD_OPTIONS = [
  { value: 'kk', text: 'Kato-Katz (stool)' },
  { value: 'uf', text: 'Urine filtration' },
  { value: 'cca', text: 'Urine POC-CCA (S. mansoni)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'A program decision for a community, following WHO\'s 2022 schistosomiasis guideline; it is not a treatment decision for one person.';
const r1 = (x) => Math.round(x * 10) / 10;

export function schistoCommunityTreatment(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the community prevalence', o.prevalence, 0, 100, '%']]);
  if (f) return { valid: false, message: f };
  const p = Number(o.prevalence);
  const m = METHOD_OPTIONS.find((x) => x.value === o.method);
  if (!m) return { valid: false, message: 'Choose how prevalence was measured: Kato-Katz, urine filtration or POC-CCA (30% by POC-CCA counts as 10%).' };
  const cca = m.value === 'cca';
  const cut = cca ? 30 : 10;
  const high = cca ? 75 : 50;
  const setting = p >= high ? 'high' : p >= cut ? 'moderate' : 'low';
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (p < cut) {
    const way = o.priorProgram === 'yes'
      ? 'continue preventive chemotherapy at the same or a lower frequency, towards interrupting transmission'
      : o.priorProgram === 'no'
        ? 'test and treat individuals rather than mass treatment'
        : 'continue at the same or a lower frequency where there has been a program, or test and treat where there has not (prior program: not entered)';
    notes.push('Keep close watch: sentinel-site surveys or a mid-term evaluation every 3 years.');
    return out(`Low prevalence (${p}%${cca ? ' by POC-CCA, under 30%' : ', under 10%'}): ${way}.`, 'Under the threshold', false);
  }

  notes.push('Everyone from 2 years: adults, pregnant women after the first trimester and breastfeeding women included. Under 2 years only as an individual clinical decision.');
  notes.push('Re-survey after 5 rounds (or a mid-term evaluation after 3), and monitor coverage and drug efficacy.');
  let twice = false;
  if (String(o.baseline ?? '').trim() !== '') {
    const fb = inputFault([['the baseline prevalence', o.baseline, 0.1, 100, '%']]);
    if (fb) return { valid: false, message: fb };
    const b = Number(o.baseline);
    const fall = (b - p) / b;
    if (o.rounds !== 'yes' && o.rounds !== 'no') notes.push('Two annual rounds at 75% coverage: not entered. The twice-yearly rule needs both.');
    if (o.rounds === 'yes' && fall < 1 / 3) {
      twice = true;
      notes.push(`Prevalence fell ${r1(fall * 100)}% from the ${b}% baseline after two annual rounds at 75% coverage: less than one third, so this is a persistent hot spot.`);
      if (b < high) notes.push('WHO prioritizes twice-yearly treatment where baseline prevalence in school-age children was 50% or more (75% by POC-CCA); in moderate settings yearly may be enough.');
    } else if (o.rounds === 'yes') {
      notes.push(`Prevalence fell ${r1(fall * 100)}% from the ${b}% baseline: an appropriate response, so stay yearly.`);
    } else if (o.rounds === 'no') {
      notes.push('Reach 75% coverage for two yearly rounds before judging the response.');
    }
  }
  if (twice) return out(`Consider praziquantel twice a year (${setting} prevalence, ${p}%), with rounds equally spaced, instead of yearly.`, 'Consider twice yearly', true);
  return out(`Yearly mass treatment with single-dose praziquantel at 75% coverage or more (${setting} prevalence, ${p}%${cca ? ' by POC-CCA' : ''}).`, 'Yearly mass treatment', true);
}
