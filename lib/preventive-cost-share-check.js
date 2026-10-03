// spec-v1601 tool 2: should I have paid anything for this preventive care?
//
// Walks the federal rule for non-grandfathered private health plans (PHS Act
// 2713; 45 CFR 147.130, with the same text at 29 CFR 2590.715-2713 and 26 CFR
// 54.9815-2713) and the Departments' FAQs that settled specific services.
// Every rule below was read in the source on September 29, 2026:
//
//   45 CFR 147.130(a)(2) office visits: (i) a preventive item billed
//     separately from the visit -- cost sharing may be imposed on the visit;
//     (ii) not billed separately and the visit's primary purpose is the
//     preventive item -- none on the visit; (iii) not billed separately and
//     the primary purpose is something else -- the visit may carry it.
//   45 CFR 147.130(a)(3) out of network: (i) not required, and cost sharing
//     may be imposed; (ii) unless the plan has no in-network provider who can
//     provide the item, in which case it is covered out of network with none.
//   FAQs Part XII (Feb. 20, 2013) Q5: polyp removal during a screening
//     colonoscopy is integral to it.
//   FAQs Part XXVI (May 11, 2015) Q7: anesthesia for a preventive colonoscopy.
//   FAQs Part XXIX (Oct. 23, 2015) Q7: a required specialist consultation
//     before the screening; Q8: pathology on a polyp biopsy.
//   FAQs Part 31 (Apr. 20, 2016) Q1: bowel preparation medication.
//   FAQs Part 47 (July 19, 2021): PrEP and its baseline and monitoring
//     services (HIV, hepatitis B and C, creatinine, pregnancy and STI testing,
//     adherence counseling).
//   FAQs Part 51 (Jan. 10, 2022) Q7-Q8: the follow-up colonoscopy after a
//     positive stool-based or direct-visualization screening test, for plan
//     years beginning on or after May 31, 2022; Q9: contraception.
//   45 CFR 147.130(a)(1)(iv): HRSA women's preventive services guidelines
//     (the well-woman visit and contraception); 147.131-147.133 hold the
//     religious and moral exemptions for contraceptive coverage.
//   45 CFR 147.140: a grandfathered plan is not subject to 147.130.
//
// It never says "you owe this": where the $0 rule does not apply, it says so
// and why, and leaves what is owed to the plan's own terms.
//
// Pure: no DOM, no clock.

export const PLANS = [
  { value: 'private', text: 'Employer or individual (Marketplace) plan, not grandfathered' },
  { value: 'grandfathered', text: 'Grandfathered plan (in place since before March 23, 2010, and says so)' },
  { value: 'public', text: 'Medicare or Medicaid' },
];

export const SERVICES = [
  { value: 'screening', text: 'A screening or other service the USPSTF rates A or B' },
  { value: 'followup-colonoscopy', text: 'Colonoscopy after a positive stool test (FIT, Cologuard) or sigmoidoscopy' },
  { value: 'polyp-removal', text: 'Polyp removal during a screening colonoscopy' },
  { value: 'polyp-pathology', text: 'Pathology on a polyp removed during a screening colonoscopy' },
  { value: 'anesthesia', text: 'Anesthesia for a screening colonoscopy' },
  { value: 'bowel-prep', text: 'Bowel preparation medicine for a screening colonoscopy' },
  { value: 'specialist-consult', text: 'A required specialist visit before a screening colonoscopy' },
  { value: 'prep', text: 'HIV PrEP, or its required tests and counseling' },
  { value: 'contraception', text: 'Birth control (an FDA-approved method) and its counseling' },
  { value: 'well-woman', text: 'A well-woman preventive visit' },
];

export const NETWORK = [
  { value: 'in', text: 'In network' },
  { value: 'out', text: 'Out of network' },
  { value: 'out-none', text: 'Out of network, because the plan has no in-network provider for it' },
];

export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const PART = {
  xii: 'FAQs about ACA Implementation Part XII (Feb. 20, 2013), Q5',
  xxvi: 'FAQs about ACA Implementation Part XXVI (May 11, 2015), Q7',
  xxix7: 'FAQs about ACA Implementation Part XXIX (Oct. 23, 2015), Q7',
  xxix8: 'FAQs about ACA Implementation Part XXIX (Oct. 23, 2015), Q8',
  p31: 'FAQs about ACA Implementation Part 31 (Apr. 20, 2016), Q1',
  p47: 'FAQs about ACA Implementation Part 47 (July 19, 2021)',
  p51: 'FAQs about ACA Implementation Part 51 (Jan. 10, 2022), Q7 and Q8',
  p51c: 'FAQs about ACA Implementation Part 51 (Jan. 10, 2022), Q9',
};

// The rule that makes each service $0, and what it covers.
const SERVICE_RULE = {
  screening: { rule: '45 CFR 147.130(a)(1)', what: 'the preventive service itself' },
  'followup-colonoscopy': { rule: PART.p51, what: 'the follow-up colonoscopy, which completes the screening (for plan years beginning on or after May 31, 2022)' },
  'polyp-removal': { rule: PART.xii, what: 'the polyp removal, which is part of the screening colonoscopy' },
  'polyp-pathology': { rule: PART.xxix8, what: 'the pathology exam on the polyp biopsy' },
  anesthesia: { rule: PART.xxvi, what: 'the anesthesia for the screening colonoscopy' },
  'bowel-prep': { rule: PART.p31, what: 'the bowel preparation medicine' },
  'specialist-consult': { rule: PART.xxix7, what: 'the required specialist consultation before the screening' },
  prep: { rule: PART.p47, what: 'PrEP and its baseline and monitoring services: HIV, hepatitis B and C, creatinine, pregnancy and STI testing, and adherence counseling' },
  contraception: { rule: `45 CFR 147.130(a)(1)(iv) and ${PART.p51c}`, what: 'an FDA-approved contraceptive method and its counseling, under the HRSA women\'s guidelines' },
  'well-woman': { rule: '45 CFR 147.130(a)(1)(iv)', what: 'the well-woman preventive visit, under the HRSA women\'s guidelines' },
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function preventiveCostShareCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plan = pick(PLANS, o.plan);
  if (!plan) return { valid: false, message: 'Choose the kind of plan.' };
  const service = pick(SERVICES, o.service);
  if (!service) return { valid: false, message: 'Choose the service you were charged for.' };
  const network = pick(NETWORK, o.network);
  if (!network) return { valid: false, message: 'Choose whether the provider was in network.' };
  const visitSeparate = o.visitSeparate === '' || o.visitSeparate == null ? null : pick(YES_NO, o.visitSeparate);
  const primaryPurpose = o.primaryPurpose === '' || o.primaryPurpose == null ? null : pick(YES_NO, o.primaryPurpose);
  let charged = null;
  if (String(o.charged ?? '').trim() !== '') {
    charged = Number(o.charged);
    if (!Number.isFinite(charged) || charged < 0 || charged > 1e7) return { valid: false, message: 'Enter the amount charged in dollars, or leave it blank.' };
  }
  const notes = [];
  const note = 'This checks the federal rule for private plans. It is not a bill review: it takes the facts as you give them, and the plan decides a claim.';

  if (plan === 'grandfathered') {
    return { valid: true, verdict: 'does-not-apply', band: 'The $0 preventive rule does not apply to a grandfathered plan (45 CFR 147.140 exempts it from 147.130). That is not a finding that you owe this: your plan\'s own terms decide what it covers.', bandLabel: 'Rule does not apply', abnormal: false, notes: ['A plan that claims grandfathered status must say so in its plan materials.'], note };
  }
  if (plan === 'public') {
    return { valid: true, verdict: 'does-not-apply', band: 'Medicare and Medicaid cover preventive services under their own rules, not this one. That is not a finding that you owe this: ask the program, or check the Medicare preventive services list for your service.', bandLabel: 'Rule does not apply', abnormal: false, notes, note };
  }
  if (network === 'out') {
    return { valid: true, verdict: 'does-not-apply', band: 'The $0 rule does not require a plan to cover preventive care out of network, and it may charge cost sharing there (45 CFR 147.130(a)(3)(i)). That is not a finding that you owe this: your plan\'s out-of-network terms decide it.', bandLabel: 'Rule does not apply', abnormal: false, notes: ['If the plan has no in-network provider who can do this service, it must cover it out of network with no cost sharing (147.130(a)(3)(ii)): choose that answer instead.'], note };
  }
  const s = SERVICE_RULE[service];
  if (network === 'out-none') notes.push('With no in-network provider able to do it, the plan must cover it out of network with no cost sharing (45 CFR 147.130(a)(3)(ii)).');
  if (service === 'prep') notes.push('A plan may use reasonable medical management, for example covering the generic at $0 and charging for a brand, but must waive it when your provider says the generic is medically inappropriate (Part 47).');
  if (service === 'contraception') notes.push('A plan may charge for one brand when an equivalent is covered at $0, but must have an exceptions process when your provider says a specific product is medically necessary. Some religious employers are exempt (45 CFR 147.131-147.133).');
  if (service === 'followup-colonoscopy' || service === 'screening') notes.push('The rule covers people in the recommendation\'s population, for example colorectal screening at ages 45 to 75.');
  let band = `Cost sharing is not allowed for ${s.what} (${s.rule}).`;
  // The office-visit rule, 45 CFR 147.130(a)(2). An unanswered question is
  // its own outcome ("not assessed"), never read as yes or no.
  let verdict;
  let label;
  if (visitSeparate === 'yes') {
    band += ' An office visit billed separately may carry cost sharing (147.130(a)(2)(i)).';
    verdict = 'visit-allowed'; label = 'Not allowed for the service; the visit may be charged';
  } else if (visitSeparate === 'no' && primaryPurpose === 'yes') {
    band += ' The office visit may not either: it was not billed separately and its primary purpose was the preventive service (147.130(a)(2)(ii)).';
    verdict = 'not-allowed'; label = 'Not allowed, visit included';
  } else if (visitSeparate === 'no' && primaryPurpose === 'no') {
    band += ' The office visit may carry cost sharing: its primary purpose was something else (147.130(a)(2)(iii)).';
    verdict = 'visit-allowed'; label = 'Not allowed for the service; the visit may be charged';
  } else if (visitSeparate === 'no') {
    notes.push('Whether the office visit may carry cost sharing depends on its primary purpose: answer that question.');
    verdict = 'visit-depends'; label = 'Not allowed for the service; the visit depends on its purpose';
  } else {
    notes.push('If an office visit was billed too, answer whether it was billed separately and what its primary purpose was.');
    verdict = 'service-only'; label = 'Not allowed for the service; the visit not assessed';
  }
  if (charged !== null && charged > 0) notes.push(`If ${money(charged)} was charged for ${s.what.replace(/,.*$/, '').replace(/ \(.*$/, '')}, the plan should reprocess it at $0.`);
  notes.push('Ask the plan to reprocess the claim, citing the rule above; if it refuses, file an internal appeal (Which Appeal Rules Apply? gives the deadline).');
  return { valid: true, verdict, band, bandLabel: label, abnormal: true, notes, note };
}
