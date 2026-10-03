// spec-v1601 tool 1: preventive-owed. The USPSTF A and B recommendations (data/uspstf, the descriptions verbatim)
// a non-grandfathered private plan must cover in network with no cost sharing (45 CFR 147.130(a)(1)(i)), filtered
// to the person, with the one-year rule: a recommendation binds plan years beginning on or after the date one
// year after it is issued (147.130(b)(1)). The list gives the release month only, so a plan year beginning
// inside the anniversary month "depends on the exact issue date".
//
// A blank answer is never "no": a recommendation conditioned on something not answered (age, sex, pregnancy or a
// risk) is listed under "depends on" with the question to answer, never dropped. Pure: the caller passes the
// records and the as-of plan year start.

import { inputFault } from './num.js';
import { parseIsoStrict } from './deadline.js';

export const PLANS = [
  { value: 'private', text: 'Private plan, not grandfathered (job-based or Marketplace)' },
  { value: 'grandfathered', text: 'Grandfathered private plan (in place since before March 23, 2010)' },
  { value: 'medicaid-expansion', text: 'Medicaid expansion adult coverage' },
  { value: 'medicare', text: 'Medicare' },
];
export const SEXES = [{ value: 'female', text: 'Female' }, { value: 'male', text: 'Male' }];
export const PREGNANCY = [
  { value: 'pregnant', text: 'Pregnant' },
  { value: 'postpartum', text: 'Postpartum (recently gave birth)' },
  { value: 'no', text: 'Neither' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

// The questions a recommendation's population turns on, in the USPSTF's terms.
export const RISKS = {
  'ever-smoked': 'Have they ever smoked?',
  'preeclampsia-high-risk': 'Are they at high risk for preeclampsia?',
  'brca-history': 'Do they have a personal or family history of breast, ovarian, tubal or peritoneal cancer, or an ancestry associated with BRCA1/2 gene mutations?',
  'breast-cancer-increased-risk': 'Are they at increased risk for breast cancer?',
  'sti-screening-risk': 'Are they sexually active and 24 or younger, or 25 or older and at increased risk for infection?',
  'fall-risk': 'Do they live in the community and are they at increased risk for falls?',
  'could-become-pregnant': 'Do they plan to, or could they, become pregnant?',
  'cvd-risk-factors': 'Do they have cardiovascular disease risk factors?',
  'hbv-risk': 'Are they at increased risk for hepatitis B infection?',
  'high-bmi-child': 'Is their BMI at or above the 95th percentile for age and sex?',
  'reproductive-age': 'Are they of reproductive age?',
  'ltbi-risk': 'Are they at increased risk of latent tuberculosis infection?',
  'lung-smoking-history': 'Do they have a 20 pack-year smoking history, and currently smoke or quit within the past 15 years?',
  'postmenopausal-osteoporosis-risk': 'Are they postmenopausal with 1 or more risk factors for osteoporosis?',
  'perinatal-depression-risk': 'Are they at increased risk of perinatal depression?',
  'overweight-obesity': 'Do they have overweight or obesity?',
  'hiv-risk': 'Are they at increased risk of HIV?',
  'fluoride-deficient-water': 'Is their water supply deficient in fluoride?',
  'rh-negative-unsensitized': 'Are they Rh(D)-negative and unsensitized?',
  'sti-counseling-risk': 'Are they a sexually active adolescent, or an adult at increased risk for sexually transmitted infections?',
  'fair-skin': 'Do they have a fair skin type?',
  'statin-cvd-risk': 'Do they have 1 or more cardiovascular risk factors and an estimated 10-year cardiovascular disease risk of 10% or greater?',
  'syphilis-risk': 'Are they at increased risk for syphilis infection?',
  'school-aged-no-tobacco': 'Are they a school-aged child or adolescent who has not started to use tobacco?',
  'bmi-30': 'Is their BMI 30 or higher?',
};

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (ym) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
const firstOf = (y, m) => new Date(Date.UTC(y, m - 1, 1));

// binding(released 'YYYY-MM', planStart Date) -> 'yes' | 'no' | 'month' (inside the anniversary month).
export function binding(released, planStart) {
  const y = Number(released.slice(0, 4)); const m = Number(released.slice(5, 7));
  if (planStart >= firstOf(y + 1, m + 1)) return 'yes';
  if (planStart < firstOf(y + 1, m)) return 'no';
  return 'month';
}

export function preventiveOwed(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const records = Array.isArray(o.records) ? o.records : [];
  if (!PLANS.some((p) => p.value === o.plan)) return { valid: false, message: 'Choose the kind of coverage.' };
  if (o.plan === 'grandfathered') return { valid: true, band: 'A grandfathered plan is not required to cover these recommendations without cost sharing (45 CFR 147.140), so no list applies.', owed: [], depends: [], notYet: [], bandLabel: 'No list', notes: [] };
  if (!records.length) return { valid: false, message: 'The USPSTF list could not be loaded.' };
  let age = null;
  if (!blank(o.age)) { const f = inputFault([['the age in years', o.age, 0, 120, 'years']]); if (f) return { valid: false, message: f }; age = Number(o.age); }
  let planStart;
  try { planStart = parseIsoStrict(String(o.planYearStart ?? '').trim()); } catch { return { valid: false, message: 'Enter the date the plan year starts (YYYY-MM-DD).' }; }
  const sex = SEXES.some((s) => s.value === o.sex) ? o.sex : null;
  const preg = PREGNANCY.some((s) => s.value === o.pregnancy) ? o.pregnancy : null;
  const answers = o.risks && typeof o.risks === 'object' ? o.risks : {};
  const owed = []; const depends = []; const notYet = [];
  for (const r of records) {
    const open = [];
    if (r.sexes) { if (!sex) open.push('What is their sex at birth?'); else if (!r.sexes.includes(sex)) continue; }
    if (r.ageMin != null || r.ageMax != null) {
      if (age == null) open.push('How old are they?');
      else if ((r.ageMin != null && age < r.ageMin) || (r.ageMax != null && Math.floor(age) > r.ageMax)) continue;
    }
    if (r.pregnancy) {
      const okStates = { pregnant: ['pregnant'], 'pregnant-or-postpartum': ['pregnant', 'postpartum'], 'not-pregnant': ['postpartum', 'no'] }[r.pregnancy];
      if (!preg) open.push(r.pregnancy === 'not-pregnant' ? 'Are they pregnant?' : 'Are they pregnant or postpartum?');
      else if (!okStates.includes(preg)) continue;
    }
    let ruledOut = false;
    for (const k of r.risks || []) {
      const a = answers[k];
      if (a === 'no') { ruledOut = true; break; }
      if (a !== 'yes') open.push(RISKS[k] || k);
    }
    if (ruledOut) continue;
    const b = binding(r.released, planStart);
    const firstPlanYear = `plan years beginning on or after the first anniversary of its ${monthName(r.released)} issue`;
    const item = { key: r.key, topic: r.topic, population: r.population, grade: r.grade, description: r.description, released: r.released, releasedLabel: monthName(r.released), url: r.url, binds: firstPlanYear, questions: [...new Set(open)] };
    // A row marked * replaced an earlier A or B recommendation, which binds until this one does.
    if (b === 'no' && r.priorGradeAOrB) depends.push({ ...item, questions: [...item.questions, `This ${monthName(r.released)} version is not yet required for this plan year; the earlier A or B version it replaced is, and its population or method may differ. Check the earlier version on its page.`] });
    else if (b === 'no') notYet.push(item);
    else if (open.length) depends.push(item);
    else if (b === 'month') depends.push({ ...item, questions: [`Was it issued before your plan year's start in ${monthName(`${Number(r.released.slice(0, 4)) + 1}${r.released.slice(4)}`)}? Check its issue date on its page.`] });
    else owed.push(item);
  }
  const notes = ['Covered without cost sharing when an in-network provider delivers it (45 CFR 147.130(a)(1)); the plan may use reasonable medical management for frequency, method and setting, and an office visit billed separately can carry cost sharing.'];
  if (o.plan === 'medicaid-expansion') notes.unshift('Medicaid expansion adult coverage (an alternative benefit plan) includes preventive and wellness services, but its cost sharing follows Medicaid rules, not 147.130; ask the state Medicaid agency about a specific service.');
  if (o.plan === 'medicare') notes.unshift('Medicare does not follow this list: it covers preventive services under its own rules (the Welcome to Medicare visit, the annual wellness visit and the services Medicare names). Ask Medicare or the plan about a specific service.');
  const band = `${owed.length.toLocaleString('en-US')} USPSTF recommendation${owed.length === 1 ? '' : 's'} your plan must cover at $0 in network${depends.length ? `; ${depends.length.toLocaleString('en-US')} more depend${depends.length === 1 ? 's' : ''} on an answer below` : ''}${notYet.length ? `; ${notYet.length.toLocaleString('en-US')} not yet required for this plan year` : ''}.`;
  return { valid: true, band, bandLabel: `${owed.length} owed${depends.length ? `, ${depends.length} depend on an answer` : ''}`, owed, depends, notYet, notes };
}
