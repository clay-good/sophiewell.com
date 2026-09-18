// spec-v1400: the CDC congenital syphilis evaluation scenarios, for a newborn of a mother with
// reactive syphilis serology.
//
// Source:
//   Workowski KA, Bachmann LH, Chan PA, et al. Sexually Transmitted Infections Treatment
//   Guidelines, 2021. MMWR Recomm Rep. 2021;70(4):1-187. PMID 34292926. Congenital Syphilis:
//   https://www.cdc.gov/std/treatment-guidelines/congenital-syphilis.htm
//
//   1  proven or highly probable  abnormal exam consistent with congenital syphilis, OR an infant
//                                 nontreponemal titer fourfold (or greater) above the mother's, OR a
//                                 positive darkfield or PCR of placenta, cord, lesions, or fluids
//   2  possible                   normal exam, titer no more than fourfold the mother's, AND the
//                                 mother was untreated, inadequately treated, undocumented, treated
//                                 with a non-penicillin regimen, or treatment began LESS THAN 30
//                                 DAYS before delivery
//   3  less likely                normal exam, titer no more than fourfold, mother treated during
//                                 pregnancy appropriately for stage, beginning 30 OR MORE days
//                                 before delivery, with no evidence of reinfection or relapse
//   4  unlikely                   normal exam, titer no more than fourfold, mother adequately treated
//                                 BEFORE pregnancy, and her titer stayed low and stable (VDRL <=1:2,
//                                 RPR <=1:4)
//
// THE DATE IS THE REASON THE TILE EXISTS. Two newborns identical in every other way are Scenario 3
// at 35 days and Scenario 2 at 25 days, and Scenario 2 means a lumbar puncture, a CBC, long-bone
// films, and usually ten days of IV penicillin. The days are computed from the two dates entered,
// not typed as a number someone worked out.
//
// Exactly fourfold sits in both definitions ("fourfold (or greater)" and "equal to or less than
// fourfold"); it is read as Scenario 1, the direction that does not miss an infant.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const CS_NOTE = 'CDC 2021 STI Treatment Guidelines, congenital syphilis. For a newborn whose mother has reactive syphilis serology, the scenario turns on the infant exam, the infant nontreponemal titer against the mother\'s (same test), and the mother\'s treatment: whether it was penicillin, appropriate for stage, and begun 30 or more days before delivery. Dosing is per kilogram: aqueous crystalline penicillin G 50,000 units/kg IV every 12 hours for the first 7 days of life and every 8 hours after, 10 days in all; procaine penicillin G 50,000 units/kg IM daily for 10 days; benzathine penicillin G 50,000 units/kg IM once. It classifies the values entered and is not a treatment order.';

export const EXAM = [
  { value: 'normal', text: 'Normal' },
  { value: 'abnormal', text: 'Consistent with congenital syphilis' },
];
export const DIRECT = [
  { value: 'no', text: 'Negative or not done' },
  { value: 'yes', text: 'Positive darkfield or PCR' },
];
export const MATERNAL_TREATMENT = [
  { value: 'none', text: 'None, or not documented' },
  { value: 'inadequate', text: 'Inadequate for the stage' },
  { value: 'non-penicillin', text: 'Non-penicillin regimen (for example erythromycin)' },
  { value: 'penicillin-pregnancy', text: 'Penicillin, appropriate for stage, during pregnancy' },
  { value: 'penicillin-before', text: 'Penicillin, adequate, before pregnancy' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

export const CS_DAYS_CUT = 30;
const DOSE_PER_KG = 50000;

const EVALUATION = 'CSF analysis for VDRL, cell count, and protein; CBC with differential and platelets; long-bone radiographs; and other tests as clinically indicated.';

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function isPowerOfTwo(n) {
  return Number.isInteger(n) && n >= 1 && (n & (n - 1)) === 0;
}
function parseDate(v) {
  const s = String(v ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const t = Date.parse(s + 'T00:00:00Z');
  if (!Number.isFinite(t)) return null;
  // Reject rollovers such as 2026-02-31, which Date.parse accepts in some engines.
  if (new Date(t).toISOString().slice(0, 10) !== s) return null;
  return t;
}
function units(n) {
  return Math.round(n).toLocaleString('en-US');
}

function titerFault(label, raw, allowZero) {
  const fault = inputFault([[label, raw, allowZero ? 0 : 1, 65536, '']]);
  if (fault) return fault;
  const n = Number(String(raw).trim());
  if (allowZero && n === 0) return null;
  if (!isPowerOfTwo(n)) return `${label.charAt(0).toUpperCase()}${label.slice(1)} must be a doubling dilution (1, 2, 4, 8, ...), entered as the number after "1:"${allowZero ? ', or 0 for nonreactive' : ''}. Check the value entered.`;
  return null;
}

function doses(weightKg) {
  const perKg = `${units(DOSE_PER_KG)} units/kg`;
  if (weightKg === null) {
    return {
      aqueous: `Aqueous crystalline penicillin G ${perKg} IV every 12 hours for the first 7 days of life, then every 8 hours, for 10 days in all.`,
      procaine: `Procaine penicillin G ${perKg} IM once daily for 10 days.`,
      benzathine: `Benzathine penicillin G ${perKg} IM as a single dose.`,
    };
  }
  const dose = units(DOSE_PER_KG * weightKg);
  return {
    aqueous: `Aqueous crystalline penicillin G ${dose} units (${perKg} at ${weightKg} kg) IV every 12 hours for the first 7 days of life, then every 8 hours, for 10 days in all.`,
    procaine: `Procaine penicillin G ${dose} units (${perKg} at ${weightKg} kg) IM once daily for 10 days.`,
    benzathine: `Benzathine penicillin G ${dose} units (${perKg} at ${weightKg} kg) IM as a single dose.`,
  };
}

export function congenitalSyphilisScenario(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.exam)) {
    return { valid: false, message: 'Enter the infant exam: normal, or consistent with congenital syphilis. A blank is not a normal exam.' };
  }

  let weightKg = null;
  if (!isBlank(o.weightKg)) {
    const f = inputFault([['the infant weight', o.weightKg, 0.3, 10, 'kg']]);
    if (f) return { valid: false, message: f };
    weightKg = Number(String(o.weightKg).trim());
  }
  const d = doses(weightKg);
  const weightNote = weightKg === null ? 'Enter the infant weight to print each dose in units.' : null;

  const scenario1 = (reason) => ({
    valid: true, scenario: 1, abnormal: true,
    bandLabel: 'Scenario 1: proven or highly probable',
    band: `Scenario 1, proven or highly probable congenital syphilis: ${reason}.`,
    evaluation: EVALUATION,
    regimens: [d.aqueous, 'or ' + d.procaine],
    alternative: null,
  });

  const finish = (r, extra = {}) => ({
    ...r,
    weightNote,
    ...extra,
    postureNote: 'Decision support, not an order. The scenario and regimen are CDC\'s; the infant\'s care stays with the treating team and pediatric infectious disease.',
    note: CS_NOTE,
  });

  if (o.exam === 'abnormal') return finish(scenario1('an exam consistent with congenital syphilis'));
  if (o.direct === 'yes') return finish(scenario1('a positive darkfield test or PCR'));

  // Titers.
  if (isBlank(o.infantTiter) || isBlank(o.maternalTiter)) {
    return { valid: false, message: 'Enter the infant and maternal nontreponemal titers from the same test (the number after "1:", or 0 if the infant is nonreactive). The infant titer against the mother\'s is one of the Scenario 1 criteria.' };
  }
  let f = titerFault('the infant titer', o.infantTiter, true);
  if (f) return { valid: false, message: f };
  f = titerFault('the maternal titer', o.maternalTiter, false);
  if (f) return { valid: false, message: f };
  const infant = Number(String(o.infantTiter).trim());
  const maternal = Number(String(o.maternalTiter).trim());
  const ratio = infant / maternal;
  if (ratio >= 4) {
    return finish(scenario1(`an infant titer of 1:${infant}, fourfold or more above the maternal 1:${maternal}`), { ratio });
  }

  if (isBlank(o.maternalTreatment)) {
    return { valid: false, message: 'Enter the mother\'s treatment. With a normal exam and a titer under fourfold, the scenario turns on it.' };
  }

  const scenario2 = (reason) => finish({
    valid: true, scenario: 2, abnormal: true,
    bandLabel: 'Scenario 2: possible',
    band: `Scenario 2, possible congenital syphilis: normal exam and a titer no more than fourfold the mother's, but ${reason}.`,
    evaluation: EVALUATION,
    regimens: [d.aqueous, 'or ' + d.procaine, 'or ' + d.benzathine],
    alternative: 'The single benzathine dose is an option only when the full evaluation is normal and follow-up is certain. If any part of the evaluation is abnormal, not done, or uninterpretable, give the 10-day course.',
  }, { ratio });

  if (o.maternalTreatment === 'none') return scenario2('the mother was not treated or her treatment is not documented');
  if (o.maternalTreatment === 'inadequate') return scenario2('the mother\'s treatment was inadequate for the stage');
  if (o.maternalTreatment === 'non-penicillin') return scenario2('the mother was treated with a non-penicillin regimen');

  if (isBlank(o.reinfection)) {
    return { valid: false, message: 'Answer whether the mother has evidence of reinfection or relapse (for example a fourfold rise in her titer). Adequate treatment counts only without it.' };
  }
  if (o.reinfection === 'yes') return scenario2('the mother has evidence of reinfection or relapse');

  if (o.maternalTreatment === 'penicillin-before') {
    if (isBlank(o.maternalLowStable)) {
      return { valid: false, message: 'Answer whether the mother\'s titer stayed low and stable (VDRL 1:2 or less, RPR 1:4 or less) before and during pregnancy. Scenario 4 depends on it.' };
    }
    if (o.maternalLowStable !== 'yes') {
      return finish({
        valid: true, scenario: null, abnormal: true,
        bandLabel: 'Outside Scenario 4',
        band: 'The mother was treated before pregnancy, but her titer did not stay low and stable, so Scenario 4 does not apply. CDC defines no scenario for this combination; a titer that is not low and stable raises reinfection or relapse. Discuss with pediatric infectious disease.',
        evaluation: null,
        regimens: [],
        alternative: null,
      }, { ratio });
    }
    return finish({
      valid: true, scenario: 4, abnormal: false,
      bandLabel: 'Scenario 4: unlikely',
      band: 'Scenario 4, congenital syphilis unlikely: normal exam, a titer no more than fourfold the mother\'s, adequate treatment before pregnancy, and a maternal titer that stayed low and stable.',
      evaluation: 'No evaluation is recommended.',
      regimens: ['No treatment is required.'],
      alternative: `${d.benzathine} This can be considered, particularly if follow-up is uncertain.`,
    }, { ratio });
  }

  // Penicillin during pregnancy: the dates decide between Scenarios 2 and 3.
  const start = parseDate(o.treatmentStart);
  const delivery = parseDate(o.delivery);
  if (start === null || delivery === null) {
    return { valid: false, message: 'Enter the date the mother\'s treatment began and the delivery date (YYYY-MM-DD). The scenario turns on whether treatment began 30 or more days before delivery.' };
  }
  const days = Math.round((delivery - start) / 86400000);
  if (days < 0) {
    return { valid: false, message: 'The treatment start date is after the delivery date. Treatment begun after delivery is not maternal treatment during pregnancy; choose "None" for the mother\'s treatment, or check the dates.' };
  }
  if (days > 300) {
    return { valid: false, message: `The treatment started ${days} days before delivery, longer than a pregnancy. For treatment before pregnancy choose that option, or check the dates.` };
  }

  const dayNote = `Treatment began ${days} days before delivery; the cut is ${CS_DAYS_CUT} days.`;
  if (days < CS_DAYS_CUT) {
    return { ...scenario2(`treatment began only ${days} days before delivery, under the ${CS_DAYS_CUT} days that count as adequate`), days, dayNote };
  }
  return finish({
    valid: true, scenario: 3, abnormal: false,
    bandLabel: 'Scenario 3: less likely',
    band: `Scenario 3, congenital syphilis less likely: normal exam, a titer no more than fourfold the mother's, and penicillin appropriate for the stage begun ${days} days before delivery, with no evidence of reinfection or relapse.`,
    evaluation: 'No evaluation is recommended.',
    regimens: [d.benzathine],
    alternative: 'Alternatively, if follow-up is certain, no treatment with close serologic follow-up every 2 to 3 months for 6 months.',
  }, { ratio, days, dayNote });
}
