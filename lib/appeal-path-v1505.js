// spec-v1505 tool 1: which coverage-request and appeal rules apply.
//
// The triage most errors start from: a request filed under the wrong rule set. Each branch names the rules
// and the catalog tool that counts them; every window below is one those tools already verify:
//   Part D (standalone or Medicare Advantage with drug coverage, pharmacy drugs): 42 CFR 423 subpart M,
//     redetermination within 60 days of receiving the notice (423.582).
//   Medicare Advantage medical items, services and Part B drugs: 42 CFR 422 subpart M, reconsideration within
//     60 days of receiving the notice (422.582).
//   Original Medicare: 42 CFR 405 subpart I, redetermination within 120 days of receiving the notice
//     (405.942).
//   Medicaid managed care: plan appeal within 60 days of the notice (42 CFR 438.402(c)); fee-for-service:
//     a state fair hearing, requested within the state's window of up to 90 days (431.221(d)).
//   Employer plans: ERISA claims rules (29 CFR 2560.503-1), at least 180 days to appeal; external review under
//     45 CFR 147.136 (federal for self-funded plans, the state's process for insured plans that meet it).
//   Marketplace and other individual plans: 45 CFR 147.136 internal appeal (the ERISA rules as that section
//     amends them) and external review.
//
// Pure: no DOM, no clock.

export const COVERAGE = [
  { value: 'original', text: 'Original Medicare' },
  { value: 'ma', text: 'Medicare Advantage' },
  { value: 'pdp', text: 'Standalone Part D plan' },
  { value: 'medicaid-ffs', text: 'Medicaid fee-for-service' },
  { value: 'medicaid-mco', text: 'Medicaid managed care' },
  { value: 'erisa-self', text: 'Employer plan, self-funded' },
  { value: 'erisa-insured', text: 'Employer plan, insured' },
  { value: 'marketplace', text: 'Marketplace or other individual plan' },
  { value: 'other', text: 'Other (TRICARE, VA, FEHB, and so on)' },
];
export const ITEMS = [
  { value: 'pharmacy', text: 'A drug on the pharmacy benefit' },
  { value: 'medical-drug', text: 'A drug on the medical benefit (given in a clinic or infusion center)' },
  { value: 'service', text: 'A service, test or equipment' },
];

const PARTD = {
  rules: 'Part D coverage determination and appeal rules (42 CFR 423 subpart M)',
  first: 'A coverage decision within 72 hours of the request (24 hours expedited); after a denial, a redetermination request within 60 days of receiving the notice (42 CFR 423.582).',
  tools: ['Part D Coverage Decision Clock', 'Part D Appeal Ladder'],
};
const MA = {
  rules: 'Medicare Advantage organization determination and appeal rules (42 CFR 422 subpart M)',
  first: 'A decision within 7 days for prior authorization, 14 days otherwise, 72 hours for a Part B drug; after a denial, a reconsideration request within 60 days of receiving the notice (42 CFR 422.582).',
  tools: ['Medicare Advantage Coverage Decision Clock', 'Medicare Advantage Appeal Ladder'],
};

export function whichAppealPath(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const cov = COVERAGE.some((c) => c.value === o.coverage) ? o.coverage : null;
  if (!cov) return { valid: false, message: 'Choose the coverage type.' };
  const item = ITEMS.some((c) => c.value === o.item) ? o.item : null;
  if (!item) return { valid: false, message: 'Choose what is being requested: a pharmacy drug, a medical-benefit drug, or a service.' };
  const notes = [];
  let path;
  if (cov === 'other') {
    return { valid: true, path: null, band: 'TRICARE, VA, the Federal Employees Health Benefits Program and similar coverage run their own appeal rules, which these tools do not count; the plan\'s denial notice states them.', bandLabel: 'Not covered here', notes, note: 'Triage only; the denial notice states the rules that apply.' };
  }
  if (cov === 'pdp') {
    path = item === 'pharmacy' ? PARTD : {
      rules: 'Original Medicare claim appeal rules (42 CFR 405 subpart I), because a standalone Part D plan covers only pharmacy drugs',
      first: 'After a denial on the Medicare Summary Notice, a redetermination request within 120 days of receiving it (42 CFR 405.942).',
      tools: ['Medicare Appeal-Level Deadline Calculator'],
    };
  } else if (cov === 'original') {
    path = item === 'pharmacy' ? { ...PARTD, rules: `${PARTD.rules}, through the person's Part D plan: Original Medicare does not cover pharmacy drugs` } : {
      rules: 'Original Medicare claim appeal rules (42 CFR 405 subpart I)',
      first: 'After a denial on the Medicare Summary Notice, a redetermination request within 120 days of receiving it (42 CFR 405.942).',
      tools: ['Medicare Appeal-Level Deadline Calculator'],
    };
    if (item !== 'pharmacy') notes.push('Prior authorization in Original Medicare applies only to a few programs (certain hospital outpatient services, some equipment); its decision clock is in the Prior-Authorization Decision-Deadline Clock.');
  } else if (cov === 'ma') {
    path = item === 'pharmacy' ? { ...PARTD, rules: `${PARTD.rules}, because the plan's drug coverage is Part D` } : MA;
  } else if (cov === 'medicaid-mco') {
    path = { rules: 'Medicaid managed care appeal rules (42 CFR 438 subpart F)', first: 'A plan appeal within 60 days of the notice, with continued benefits if asked within 10 days (42 CFR 438.402, 438.420); then a state fair hearing.', tools: ['Medicaid Managed Care Appeal Clock'] };
  } else if (cov === 'medicaid-ffs') {
    path = { rules: 'Medicaid fair hearing rules (42 CFR 431 subpart E): there is no plan appeal', first: 'A state fair hearing request within the state\'s window, at most 90 days from the notice mailing date (42 CFR 431.221(d)).', tools: ['Medicaid Managed Care Appeal Clock'] };
  } else if (cov === 'erisa-self' || cov === 'erisa-insured') {
    path = {
      rules: `ERISA claims procedure rules (29 CFR 2560.503-1), then ${cov === 'erisa-self' ? 'federal external review (45 CFR 147.136)' : 'the state\'s external review process for insured plans (federal if the state\'s does not meet the standards)'}`,
      first: 'A pre-service decision within 15 days (72 hours if urgent); after a denial, at least 180 days to appeal (29 CFR 2560.503-1(h)(3)(i)); external review within 4 months of the final denial.',
      tools: ['Employer Plan Claim and Appeal Clock (ERISA)', 'External Review Clock (Marketplace and Employer Plans)'],
    };
    notes.push('A government or church plan is not under ERISA: its appeal rules come from state law or the plan itself.');
  } else {
    path = { rules: 'Individual-market internal appeal and external review rules (45 CFR 147.136)', first: 'After a denial, at least 180 days to file the internal appeal; external review within 4 months of the final denial (45 CFR 147.136).', tools: ['External Review Clock (Marketplace and Employer Plans)'] };
  }
  notes.push(`Use: ${path.tools.join(' and ')}.`);
  return { valid: true, path: path.rules, band: `${path.rules}. ${path.first}`, bandLabel: path.tools[0], notes, note: 'Triage only; the denial notice states the rules that apply and controls.' };
}
