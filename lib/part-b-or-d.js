// spec-v1505 tool 2: does Medicare Part B or Part D cover this drug?
//
// The categories are Social Security Act §1861(s), read at Cornell LII on October 1, 2026, with the CMS
// "Medicare Parts B/D Coverage Issues" chart for the pharmacy-setting rules:
//   (s)(2)(A)/(B) drugs not usually self-administered, furnished incident to a physician's service in an
//       office or hospital outpatient department -- unless the MAC's self-administered drug list excludes it;
//   (s)(6) drugs that need covered DME (a nebulizer or infusion pump), for a beneficiary at home;
//   (s)(10)(A) pneumococcal, influenza and COVID-19 vaccines; (s)(10)(B) hepatitis B vaccine for those at
//       high or intermediate risk (42 CFR 410.63(a), which from January 1, 2025 includes anyone who never
//       completed the series or whose history is unknown);
//   (s)(2)(J) immunosuppressants after a Medicare-paid transplant; (s)(2)(Q) oral anticancer drugs with the
//       same active ingredient and indication as a covered injectable; (s)(2)(T) oral antiemetics used
//       within 48 hours of chemotherapy as a full replacement for IV antiemetics; (s)(2)(O) erythropoietin
//       for dialysis; (s)(2)(Z) IVIG at home for primary immune deficiency; blood clotting factors for
//       hemophilia (42 CFR 410.63(b)); and parenteral nutrition for a permanent digestive dysfunction
//       (the prosthetic benefit, (s)(8)).
// Everything else is Part D, if the plan's formulary covers it. An unanswered question that decides the
// answer is asked for, never assumed.
//
// Pure: no DOM, no clock.

export const CATEGORIES = [
  { value: 'incident', text: 'Injected or infused by a clinician in an office or hospital outpatient department' },
  { value: 'self', text: 'Taken or self-injected at home (pills, pens, self-injections)' },
  { value: 'dme', text: 'Given through equipment at home: a nebulizer or an infusion pump (including insulin)' },
  { value: 'vaccine', text: 'A vaccine' },
  { value: 'immunosuppressant', text: 'An immunosuppressant after an organ transplant' },
  { value: 'oral-anticancer', text: 'An oral cancer drug' },
  { value: 'oral-antiemetic', text: 'An oral anti-nausea drug used with chemotherapy' },
  { value: 'esa-dialysis', text: 'Erythropoietin (an ESA) for anemia' },
  { value: 'ivig-home', text: 'IVIG given at home' },
  { value: 'clotting-factor', text: 'Blood clotting factor for hemophilia' },
  { value: 'parenteral-nutrition', text: 'Parenteral (IV) nutrition' },
];
export const VACCINES = [
  { value: 'influenza', text: 'Influenza' },
  { value: 'pneumococcal', text: 'Pneumococcal' },
  { value: 'covid', text: 'COVID-19' },
  { value: 'hepb', text: 'Hepatitis B' },
  { value: 'injury', text: 'Given to treat an injury or a direct exposure (such as tetanus or rabies)' },
  { value: 'other', text: 'Another vaccine (such as shingles, RSV or Tdap)' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const SAD = [{ value: 'yes', text: 'Yes, it is on the list' }, { value: 'no', text: 'No, it is not on the list' }, { value: 'unknown', text: 'Not sure' }];

const B = 'Part B';
const D = 'Part D';
const res = (answer, band, rule, notes = []) => ({ valid: true, answer, band, rule, notes, bandLabel: answer, abnormal: false });

export function partBOrD(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cat = CATEGORIES.find((c) => c.value === o.category);
  if (!cat) return { valid: false, message: 'Choose how the drug is given, or its category.' };
  const ask = (msg) => ({ valid: false, message: msg });
  const yn = (k) => (o[k] === 'yes' ? true : o[k] === 'no' ? false : null);
  const DNOTE = 'Part D covers it only if the drug is on the plan\'s formulary (or an exception is granted).';
  switch (cat.value) {
    case 'incident': {
      if (o.sad === 'yes') return res(D, 'Part D: the MAC lists it as usually self-administered, so Part B does not cover it even when a clinician gives it (SSA §1861(s)(2)(A); the MAC\'s self-administered drug list).', 'MAC self-administered drug list', [DNOTE, 'A hospital outpatient department may bill the patient for it; Part D may cover it if obtained through a pharmacy.']);
      if (o.sad === 'no') return res(B, 'Part B: a drug not usually self-administered, given incident to a physician\'s service in an office or hospital outpatient department (SSA §1861(s)(2)(A) and (B)).', '§1861(s)(2)(A)-(B)', ['Part B pays 80% of the allowed amount after the deductible.']);
      return res('Depends on the MAC\'s self-administered drug list', 'Part B if the MAC does not list it as usually self-administered; Part D if it does. Each MAC publishes a self-administered drug exclusion list as an article in the Medicare Coverage Database. Choose whether the drug is on it.', 'MAC self-administered drug list', ['A pharmacy cannot bill Part B "incident to" a physician\'s service: a drug from a pharmacy is Part D.']);
    }
    case 'self': return res(D, 'Part D: a drug the patient takes or injects at home is a Part D drug unless a Part B category applies (choose that category instead if one does).', 'SSA §1860D-2(e)', [DNOTE]);
    case 'dme': {
      const home = yn('atHome');
      if (home === null) return ask('Choose whether the patient lives at home: a hospital or skilled nursing facility is not a home for the DME benefit.');
      if (!home) return res(D, 'Part D: a hospital, skilled nursing facility or a nursing home that mainly gives skilled care is not a home for the DME benefit, so the drug is not Part B DME there.', 'Parts B/D chart, footnote 1', [DNOTE]);
      return res(B, 'Part B: a drug that needs covered DME (a nebulizer, or an infusion pump the DME contractor finds necessary) is covered with that equipment for a patient at home (SSA §1861(s)(6)).', '§1861(s)(6)', ['Insulin through a pump: coinsurance is capped at $35 a month, with no deductible.', 'Blood glucose test strips and lancets are Part B supplies, never Part D.']);
    }
    case 'vaccine': {
      const v = VACCINES.find((x) => x.value === o.vaccine);
      if (!v) return ask('Choose the vaccine.');
      if (['influenza', 'pneumococcal', 'covid'].includes(v.value)) return res(B, `Part B: ${v.text.toLowerCase()} vaccine and its administration (SSA §1861(s)(10)(A)), with no cost sharing.`, '§1861(s)(10)(A)');
      if (v.value === 'injury') return res(B, 'Part B: a vaccine given to treat an injury or a direct exposure to a disease is covered as treatment.', 'Parts B/D chart');
      if (v.value === 'other') return res(D, 'Part D: other vaccines are Part D, and an adult vaccine the ACIP recommends has no deductible or cost sharing there (42 U.S.C. 1395w-102(b)(8)).', 'SSA §1860D-2(e)');
      const risk = yn('hepbRisk');
      if (risk === null) return ask('Choose whether the person is at high or intermediate risk for hepatitis B. Anyone who never completed the vaccine series, or whose history is unknown, counts as intermediate risk.');
      return risk
        ? res(B, 'Part B: hepatitis B vaccine for a person at high or intermediate risk (SSA §1861(s)(10)(B); 42 CFR 410.63(a)), which from 2025 includes anyone who never completed the series.', '§1861(s)(10)(B)')
        : res(D, 'Part D: hepatitis B vaccine for a person not at high or intermediate risk (for example, one who already has antibodies) is not Part B.', '42 CFR 410.63(a)(3)', [DNOTE]);
    }
    case 'immunosuppressant': {
      const paid = yn('medicareTransplant');
      if (paid === null) return ask('Choose whether Medicare paid for the transplant.');
      return paid
        ? res(B, 'Part B: immunosuppressive drugs after a transplant Medicare paid for (SSA §1861(s)(2)(J)).', '§1861(s)(2)(J)', ['A kidney recipient whose Medicare ends 36 months after the transplant can keep immunosuppressant coverage under Part B-ID (42 U.S.C. 1395o(b)).'])
        : res(D, 'Part D: immunosuppressants after a transplant Medicare did not pay for are Part D.', 'Parts B/D chart', [DNOTE]);
    }
    case 'oral-anticancer': {
      const inj = yn('sameAsInjectable');
      if (inj === null) return ask('Choose whether the oral drug has the same active ingredient, for the same indication, as an injectable cancer drug Part B covers.');
      return inj
        ? res(B, 'Part B: an oral anticancer drug with the same active ingredient and indication as a covered injectable (SSA §1861(s)(2)(Q)).', '§1861(s)(2)(Q)')
        : res(D, 'Part D: an oral cancer drug with no Part B injectable counterpart is Part D.', 'Parts B/D chart', [DNOTE]);
    }
    case 'oral-antiemetic': {
      const w = yn('within48');
      if (w === null) return ask('Choose whether it is used within 48 hours of chemotherapy as a full replacement for IV anti-nausea drugs.');
      return w
        ? res(B, 'Part B: an oral antiemetic used immediately before, at, or within 48 hours after chemotherapy as a full replacement for IV antiemetics (SSA §1861(s)(2)(T)).', '§1861(s)(2)(T)')
        : res(D, 'Part D: an oral antiemetic used outside the 48 hours, or not as a full replacement for IV therapy, is Part D.', 'Parts B/D chart', [DNOTE]);
    }
    case 'esa-dialysis': {
      const d = yn('dialysis');
      if (d === null) return ask('Choose whether the patient is on dialysis.');
      return d
        ? res(B, 'Part B: erythropoietin for anemia in a patient on dialysis (SSA §1861(s)(2)(O)); for dialysis it is part of the ESRD bundled payment.', '§1861(s)(2)(O)')
        : res(D, 'Part D from a pharmacy: an ESA for another indication is Part B only when a clinician gives it incident to a visit.', 'Parts B/D chart', [DNOTE]);
    }
    case 'ivig-home': {
      const p = yn('primaryImmuneDeficiency');
      if (p === null) return ask('Choose whether it treats a primary immune deficiency disease.');
      return p
        ? res(B, 'Part B: IVIG at home for a primary immune deficiency disease, and from January 1, 2024 the items and services to give it (SSA §1861(s)(2)(Z)).', '§1861(s)(2)(Z)')
        : res(D, 'Part D: IVIG at home for another condition is Part D.', 'SSA §1861(s)(2)(Z)', [DNOTE]);
    }
    case 'clotting-factor': return res(B, 'Part B: blood clotting factors for hemophilia that the patient gives at home (42 CFR 410.63(b)).', '42 CFR 410.63(b)');
    case 'parenteral-nutrition': {
      const perm = yn('permanent');
      if (perm === null) return ask('Choose whether the digestive tract dysfunction is permanent (expected to last a long and indefinite time).');
      return perm
        ? res(B, 'Part B: parenteral nutrition under the prosthetic device benefit for a permanent dysfunction of the digestive tract (SSA §1861(s)(8)).', '§1861(s)(8)')
        : res(D, 'Part D: parenteral nutrition for a dysfunction that is not permanent is Part D; Part D does not pay for the pump, supplies or nursing.', 'Parts B/D chart', [DNOTE]);
    }
    default: return ask('Choose how the drug is given, or its category.');
  }
}
