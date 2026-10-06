// spec-v1554 tool 4: cryptococcal antigen (CrAg) screening before ART in advanced HIV disease, and
// fluconazole for a positive screen without meningitis or where screening is unavailable.
//
// Sources, read October 6, 2026 (CC BY-NC-SA 3.0 IGO, facts restated):
//   - AHD25: WHO. Guidelines on the management of advanced HIV disease, December 2025 (IRIS 10665/384543),
//     recommendations summary and Table 2: screen adults and adolescents before starting or restarting ART at
//     CD4 below 100 (strong) and consider it below 200 (conditional); a positive screen gets careful
//     evaluation for meningitis and lumbar puncture if feasible; without screening, fluconazole primary
//     prophylaxis below 100 (strong), considered below 200 (conditional). No routine screening under 10.
//     Adolescent 10-19 years, adult older than 19.
//   - CRYPTO22: WHO. Guidelines for diagnosing, preventing and managing cryptococcal disease, 2022 (IRIS
//     10665/357088), section 2.2.2 (pp. 6-7): pre-emptive fluconazole 800-1,200 mg/day for adults and
//     12 mg/kg/day for adolescents for 2 weeks, then consolidation and maintenance as for treatment;
//     consolidation 800 mg/day adults, 6-12 mg/kg/day children and adolescents (maximum 800 mg) for 8 weeks;
//     maintenance 200 mg/day adults, 6 mg/kg/day adolescents and children, until CD4 above 200 with a
//     suppressed viral load. Primary prophylaxis duration is a national decision (trials: 100 mg daily for
//     12 weeks; 200 mg three times a week until CD4 reached 200).
//
// Stated rather than hidden: AHD25's summary prints the conditional screening threshold as ">200"; its own
// Table 2 and CRYPTO22 say below 200, which this uses. WHO gives no prophylaxis dose, so none is printed as a
// recommendation; the trial doses are named as trial doses.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const CRAG_OPTIONS = [
  { value: 'pos', text: 'Positive' },
  { value: 'neg', text: 'Negative' },
  { value: 'na', text: 'Screening not available' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s 2025 advanced HIV disease and 2022 cryptococcal disease guidelines.';
const round = (x) => Math.round(x);

export function cragScreenFluconazole(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 120, 'years'], ['the CD4 count', o.cd4, 0, 5000, 'cells/mm3']]);
  if (f) return { valid: false, message: f };
  const years = Number(o.age);
  const cd4 = Number(o.cd4);
  const out = (band, label, abnormal, notes) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (years < 10) return out('No routine cryptococcal antigen screening under 10 years: cryptococcal disease is rare in children. Investigate a child with signs of meningitis.', 'Not under 10', false, []);
  if (cd4 >= 200) return out(`No cryptococcal antigen screening at CD4 ${cd4}: WHO screens below 200 (strongly below 100).`, 'Not indicated', false, []);
  const strong = cd4 < 100;
  const crag = CRAG_OPTIONS.find((x) => x.value === o.crag);
  if (!crag) return { valid: false, message: `Choose the cryptococcal antigen result: positive, negative, or screening not available. At CD4 ${cd4} screening is ${strong ? 'strongly recommended' : 'one to consider'} before ART.` };

  if (crag.value === 'na') {
    return out(`No screening available: ${strong ? 'give' : 'consider'} fluconazole primary prophylaxis (CD4 ${cd4}, ${strong ? 'below 100: strong' : '100 to 199: conditional'} recommendation).`, strong ? 'Fluconazole prophylaxis' : 'Consider prophylaxis', true,
      ['WHO sets no prophylaxis dose or duration; national guidelines decide. The supporting trials used 100 mg daily for 12 weeks, or 200 mg three times a week until CD4 reached 200.', 'Screening followed by pre-emptive therapy is preferred where available.']);
  }
  if (crag.value === 'neg') return out(`Cryptococcal antigen negative: no pre-emptive fluconazole. Start ART without delay.`, 'Negative', false, []);

  if (!YES_NO.some((x) => x.value === o.meningitis)) return { valid: false, message: 'Choose whether there are signs or symptoms of meningitis (headache, confusion, neck stiffness, seizures): a positive screen turns on it.' };
  if (o.meningitis === 'yes') {
    return out('Positive with signs of meningitis: do a lumbar puncture now (CSF cryptococcal antigen, or India ink) and treat as cryptococcal meningitis if confirmed. Defer ART.', 'Evaluate for meningitis', true,
      ['The preferred induction is a single dose of liposomal amphotericin B 10 mg/kg with 14 days of flucytosine 100 mg/kg/day and fluconazole 1,200 mg/day (children and adolescents 12 mg/kg/day, maximum 800 mg).']);
  }

  const adult = years >= 20;
  let dose;
  if (adult) {
    dose = ['Pre-emptive: fluconazole 800 to 1,200 mg a day for 2 weeks.', 'Then consolidation: 800 mg a day for 8 weeks.', 'Then maintenance: 200 mg a day until CD4 is above 200 with a suppressed viral load on ART.'];
    if (String(o.weight ?? '').trim() !== '') dose.push('Adult doses are fixed: the weight is not used.');
  } else {
    const fw = inputFault([['the weight', o.weight, 3, 150, 'kg']]);
    if (fw) return { valid: false, message: `${fw} The adolescent doses are per kg.` };
    const w = Number(o.weight);
    dose = [
      `Pre-emptive: fluconazole 12 mg/kg a day = ${round(12 * w).toLocaleString('en-US')} mg a day for 2 weeks (the adult dose is 800 to 1,200 mg).`,
      `Then consolidation: 6 to 12 mg/kg a day = ${round(6 * w)} to ${Math.min(800, round(12 * w))} mg a day (maximum 800 mg) for 8 weeks.`,
      `Then maintenance: 6 mg/kg a day = ${round(6 * w)} mg a day until CD4 is above 200 with a suppressed viral load on ART.`,
    ];
  }
  return out(`Positive, no signs of meningitis: do a lumbar puncture where feasible to exclude meningitis, then give pre-emptive fluconazole (${adult ? 'adult' : 'adolescent'} doses below).`, 'Pre-emptive fluconazole', true, dose);
}
