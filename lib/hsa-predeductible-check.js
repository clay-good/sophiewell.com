// spec-v1601 tool 3: can an HSA-qualifying plan (an HDHP) cover this before the deductible?
//
// The safe harbors, each read in its source on September 30, 2026:
//   - preventive care, IRC 223(c)(2)(C) and Notice 2004-23 (and the ACA preventive care of Notice 2013-57);
//   - the chronic-condition list, Notice 2019-45 Appendix (effective July 17, 2019): 14 items, each
//     preventive care ONLY for a person diagnosed with its condition and only when prescribed to prevent
//     the condition worsening or a secondary condition;
//   - insulin, IRC 223(c)(2)(G) (Pub. L. 117-169 section 11408), plan years beginning after December 31, 2022,
//     any insulin product with no diagnosis needed;
//   - telehealth, IRC 223(c)(2)(E): permanent for plan years beginning after December 31, 2024
//     (Pub. L. 119-21 section 71306; Notice 2026-5 A-2, A-3), with the earlier temporary windows.
// Not preventive care: treatment of an existing condition (Notice 2004-23), and male sterilization or male
// contraceptives (Notice 2018-12, as Notice 2019-45 restates).
//
// Pure: no DOM, no clock. The appendix is a cited constant here, not a fetched dataset: one list from one
// notice, which the IRS expects to review every five to ten years.

const N1945 = 'Notice 2019-45, Appendix';

// What the plan would cover: the appendix rows first (in its order, with its condition wording), then
// the other safe harbors.
export const ITEMS = [
  { value: 'ace', text: 'ACE inhibitors', conditions: ['chf', 'diabetes', 'cad'], line: 'Congestive heart failure, diabetes, and/or coronary artery disease' },
  { value: 'antiresorptive', text: 'Anti-resorptive therapy', conditions: ['osteoporosis', 'osteopenia'], line: 'Osteoporosis and/or osteopenia' },
  { value: 'beta-blocker', text: 'Beta-blockers', conditions: ['chf', 'cad'], line: 'Congestive heart failure and/or coronary artery disease' },
  { value: 'bp-monitor', text: 'Blood pressure monitor', conditions: ['hypertension'], line: 'Hypertension' },
  { value: 'ics', text: 'Inhaled corticosteroids', conditions: ['asthma'], line: 'Asthma' },
  { value: 'glucose-agent', text: 'Glucose-lowering agents other than insulin', conditions: ['diabetes'], line: 'Diabetes (the row "Insulin and other glucose lowering agents")' },
  { value: 'retinopathy', text: 'Retinopathy screening', conditions: ['diabetes'], line: 'Diabetes' },
  { value: 'peak-flow', text: 'Peak flow meter', conditions: ['asthma'], line: 'Asthma' },
  { value: 'glucometer', text: 'Glucometer', conditions: ['diabetes'], line: 'Diabetes' },
  { value: 'a1c', text: 'Hemoglobin A1c testing', conditions: ['diabetes'], line: 'Diabetes' },
  { value: 'inr', text: 'INR testing', conditions: ['liver', 'bleeding'], line: 'Liver disease and/or bleeding disorders' },
  { value: 'ldl', text: 'LDL testing', conditions: ['heart'], line: 'Heart disease' },
  { value: 'ssri', text: 'SSRIs', conditions: ['depression'], line: 'Depression' },
  { value: 'statin', text: 'Statins', conditions: ['heart', 'diabetes'], line: 'Heart disease and/or diabetes' },
  { value: 'insulin', text: 'Insulin (any type or dosage form)' },
  { value: 'telehealth', text: 'A telehealth service on Medicare\'s telehealth list' },
  { value: 'telehealth-extra', text: 'An in-person service, equipment or a drug furnished with a telehealth visit' },
  { value: 'exam', text: 'A periodic health evaluation, such as an annual physical, and its routine tests' },
  { value: 'prenatal', text: 'Routine prenatal or well-child care' },
  { value: 'immunization', text: 'A child or adult immunization' },
  { value: 'tobacco', text: 'A tobacco cessation program' },
  { value: 'obesity', text: 'An obesity weight-loss program' },
  { value: 'screening', text: 'A screening on the Notice 2004-23 list (cancer, heart, infectious disease and others)' },
  { value: 'aca', text: 'Preventive care the ACA requires plans to cover' },
  { value: 'male-contraception', text: 'Male sterilization or male contraceptives' },
  { value: 'treatment', text: 'Treatment of an existing illness, injury or condition, not listed here' },
];
export const CHRONIC = ITEMS.filter((i) => i.conditions);

export const CONDITIONS = [
  { value: 'chf', text: 'Congestive heart failure' },
  { value: 'cad', text: 'Coronary artery disease' },
  { value: 'heart', text: 'Heart disease' },
  { value: 'diabetes', text: 'Diabetes' },
  { value: 'hypertension', text: 'Hypertension' },
  { value: 'asthma', text: 'Asthma' },
  { value: 'osteoporosis', text: 'Osteoporosis' },
  { value: 'osteopenia', text: 'Osteopenia' },
  { value: 'liver', text: 'Liver disease' },
  { value: 'bleeding', text: 'A bleeding disorder' },
  { value: 'depression', text: 'Depression' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const NOT = 'Not in a safe harbor: a plan that covers it before the deductible is not a high deductible health plan, and no one it covers can contribute to an HSA.';
const yes = (verdict, band, basis) => ({ valid: true, verdict, band, bandLabel: verdict === 'applies' ? 'Safe harbor applies' : verdict === 'depends' ? 'Depends' : 'Not in a safe harbor', basis, abnormal: verdict === 'not' });
// Lowercase a name's first letter mid-sentence, but never an acronym (ACE, LDL, SSRIs).
const lc = (t) => (/^[A-Z][a-z]/.test(t) ? `${t[0].toLowerCase()}${t.slice(1)}` : t);
const truthy = (v) => v === true || v === 1 || ['1', 'true', 'on', 'yes'].includes(String(v ?? '').trim().toLowerCase());

export function hsaPredeductibleCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const item = ITEMS.find((i) => i.value === o.item);
  if (!item) return { valid: false, message: 'Choose what the plan would cover before the deductible.' };
  let year = null;
  if (String(o.planYear ?? '').trim()) {
    year = Number(o.planYear);
    if (!Number.isInteger(year) || year < 2004 || year > 2100) return { valid: false, message: 'The plan year must be between 2004 and 2100. Check the value entered.' };
  }
  const notes = [];
  const noYear = 'No plan year was entered, so this is the rule for plan years beginning in 2025 or later.';
  const chronic = CHRONIC.find((c) => c.value === item.value);
  let r;

  if (chronic) {
    const has = CONDITIONS.filter((c) => truthy(o[c.value]));
    const match = chronic.conditions.filter((c) => has.some((h) => h.value === c));
    if (year != null && year < 2019) r = yes('not', `The chronic-condition list, which includes ${lc(chronic.text)}, took effect July 17, 2019 (${N1945}). ${NOT}`, 'IRC 223(c)(2)(C)');
    else if (!match.length) {
      const names = chronic.conditions.map((c) => CONDITIONS.find((x) => x.value === c).text.toLowerCase());
      r = yes('not', `On the chronic-condition list, the row for ${lc(chronic.text)} is preventive care only for a person diagnosed with ${names.join(' or ')} (${N1945}: ${chronic.line}). None of those was checked. ${NOT}`, N1945);
      if (chronic.conditions.includes('heart')) notes.push('The notice does not define heart disease. If the diagnosis is a form of it, such as coronary artery disease, check Heart disease too.');
    } else if (o.purpose === 'no') {
      r = yes('not', `On the chronic-condition list, an item counts only when prescribed to prevent the condition worsening or a secondary condition (${N1945}). ${NOT}`, N1945);
    } else {
      r = yes('applies', `Safe harbor applies: ${lc(chronic.text)} for a person diagnosed with ${match.map((c) => CONDITIONS.find((x) => x.value === c).text.toLowerCase()).join(' and ')} (${N1945}: ${chronic.line}). The plan can cover it before the deductible.`, N1945);
      if (o.purpose !== 'yes') notes.push('Why it was prescribed was not entered: it counts only when prescribed to prevent the condition worsening or a secondary condition.');
    }
  } else if (item.value === 'insulin') {
    if (year == null || year >= 2023) {
      r = yes('applies', 'Safe harbor applies: any insulin product, with no diagnosis needed (IRC 223(c)(2)(G), plan years beginning after December 31, 2022). The plan can cover it before the deductible.', 'IRC 223(c)(2)(G)');
      if (year == null) notes.push(noYear);
    } else if (truthy(o.diabetes) && year >= 2019 && o.purpose !== 'no') {
      r = yes('applies', `Safe harbor applies: insulin for a person diagnosed with diabetes (${N1945}). The insulin rule of IRC 223(c)(2)(G) starts with plan years beginning in 2023.`, N1945);
    } else {
      r = yes('not', `Before plan years beginning in 2023, insulin was preventive care only for a person diagnosed with diabetes, from July 17, 2019 (${N1945}). ${NOT}`, N1945);
    }
  } else if (item.value === 'telehealth') {
    const y = year;
    if (y == null || y >= 2025) {
      r = yes('applies', 'Safe harbor applies: telehealth and other remote care services, made permanent for plan years beginning after December 31, 2024 (IRC 223(c)(2)(E); Notice 2026-5 A-2). The plan can cover them before the deductible.', 'IRC 223(c)(2)(E)');
      if (y == null) notes.push(noYear);
    } else if (y >= 2023 || (y >= 2020 && y <= 2021)) {
      r = yes('applies', `Safe harbor applies: the temporary telehealth relief covered plan years beginning in ${y} (IRC 223(c)(2)(E) as then in force).`, 'IRC 223(c)(2)(E)');
    } else if (y === 2022) {
      r = yes('depends', 'Depends on the month: for a plan year beginning in 2022, the telehealth relief covered months from April through December 2022 only, so January through March 2022 were not covered (IRC 223(c)(2)(E) as then in force).', 'IRC 223(c)(2)(E)');
    } else {
      r = yes('not', `There was no telehealth safe harbor for plan years beginning in ${y}; it began March 27, 2020. ${NOT}`, 'IRC 223(c)(2)(E)');
    }
    notes.push('A service on Medicare\'s yearly telehealth list qualifies; for one that is not, the Medicare telehealth rules (42 CFR 410.78) decide (Notice 2026-5 A-2).');
  } else if (item.value === 'telehealth-extra') {
    r = yes('not', `The telehealth safe harbor does not reach in-person services, equipment or drugs furnished with a telehealth visit (Notice 2026-5 A-3). ${NOT} Another safe harbor may still apply to the item itself: choose it instead.`, 'Notice 2026-5 A-3');
  } else if (item.value === 'male-contraception') {
    r = yes('not', `Male sterilization and male contraceptives are not preventive care for an HSA plan (Notice 2018-12), even where state law requires them to be covered. ${NOT}`, 'Notice 2018-12');
  } else if (item.value === 'treatment') {
    r = yes('not', `Preventive care does not include a service or benefit to treat an existing illness, injury or condition (Notice 2004-23), unless it is on the chronic-condition list. ${NOT}`, 'Notice 2004-23');
  } else if (item.value === 'aca') {
    r = yes('applies', 'Safe harbor applies: preventive care the ACA requires plans to cover is preventive care for an HSA plan too (Notice 2013-57). The plan can cover it before the deductible.', 'Notice 2013-57');
  } else {
    r = yes('applies', `Safe harbor applies: ${lc(item.text)} is preventive care (Notice 2004-23). The plan can cover it before the deductible.`, 'Notice 2004-23');
  }
  return { ...r, notes, note: 'A safe harbor lets a plan cover an item before the deductible; it does not require it to. Whether the plan does is in its documents.' };
}
