// spec-v1601 route B: the HRSA-supported Women's Preventive Services Guidelines, the second list 45 CFR
// 147.130(a)(1)(iv) makes a non-grandfathered plan cover at $0 in network, for preventive-owed.
//
// Read October 9, 2026 from HRSA's page (www.hrsa.gov/womens-guidelines; reviewed December 2025), and each
// version's acceptance date from the HRSA notice that announced it in the Federal Register. A guideline is
// issued on the day the HRSA Administrator accepts it (87 FR 1764, January 12, 2022), so 147.130(b)(1)
// binds it for plan years beginning on or after that date one year on. Unlike the USPSTF list, the day
// is known, so there is no "depends on the exact issue date" month.
//
// The descriptions are ours, shortened from HRSA's wording; each row links to the guideline. Where the
// current version replaced an earlier one whose text was read, the earlier one is carried, and it is the
// one owed until the current version binds. Where it was not read (the 2021 to 2023 revisions), a plan
// year before the current version binds is "depends", never owed or dropped.
//
// HRSA's page refuses scripted requests, so the page watcher (scripts/data/watch-pages.mjs) watches the
// Federal Register's list of HRSA's notices on these guidelines instead: a new notice changes its hash.
// The page itself is held in HRSA_PAGE (not a `url:` literal) so the watcher does not report it as
// unreachable every week.
//
// Pure: no DOM; the list is a dated constant read through datedValue(), so past validThrough the tool
// says the list is due for review.

import { datedValue } from './dated-data.js';

export const HRSA_PAGE = 'https://www.hrsa.gov/womens-guidelines';
const FR = (doc) => `https://www.federalregister.gov/d/${doc}`;

export const WATCHED_SOURCES = [
  { route: 'B', label: 'the Federal Register list of HRSA notices on the Women\'s Preventive Services Guidelines', url: 'https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22Women%27s+Preventive+Services+Guidelines%22&conditions%5Bagencies%5D%5B%5D=health-resources-and-services-administration&fields%5B%5D=document_number&order=newest&per_page=5' },
];

// The questions these guidelines turn on that the USPSTF list does not already ask (preventive-owed RISKS).
export const HRSA_RISKS = {
  'adolescent-or-adult': 'Are they an adolescent or an adult (not a younger child)?',
  'sti-increased-risk': 'Are they sexually active and at increased risk for STIs (for example younger than 25, a recent STI, a new partner or more than one)?',
  'gdm-history-no-t2d': 'Have they had gestational diabetes, and never been diagnosed with type 2 diabetes?',
  'bmi-18-5-to-29-9': 'Is their BMI between 18.5 and 29.9 (normal or overweight)?',
  'cervical-average-risk': 'Are they at average risk for cervical cancer?',
  'breast-or-cervical-screening': 'Are they due for breast or cervical cancer screening, or for follow-up after one?',
};

// key, topic, population, issued (the acceptance date), source (the Federal Register notice), the age band
// (inclusive; ageMax null is open), pregnancy as preventive-owed reads it, risks (each must be yes), and
// earlier: the version it replaced, when that version's text was read.
const GUIDELINES = [
  { key: 'hrsa-well-woman', topic: 'Well-woman preventive visits', population: 'adolescent and adult women', issued: '2021-12-30', notice: '2022-00465', risks: ['adolescent-or-adult'], revised: true,
    description: 'At least one preventive care visit a year, from adolescence on, to deliver the recommended preventive services; it includes preconception, prenatal, postpartum and interpregnancy visits, and may be spread over several visits.' },
  { key: 'hrsa-breast-cancer-screening', topic: 'Breast cancer screening for women at average risk', population: 'women aged 40 and older', issued: '2024-12-20', notice: '2024-31228', ageMin: 40,
    description: 'Mammography starting no earlier than 40 and no later than 50, at least every 2 years and as often as every year, through at least 74 (age alone is not a reason to stop), and the additional imaging and pathology needed to complete the screening.',
    earlier: { issued: '2016-12-20', notice: '2016-31129', description: 'Mammography starting no earlier than 40 and no later than 50, at least every 2 years and as often as every year, through at least 74 (age alone is not a reason to stop).' } },
  { key: 'hrsa-patient-navigation', topic: 'Patient navigation for breast and cervical cancer screening', population: 'women due for breast or cervical cancer screening or its follow-up', issued: '2024-12-20', notice: '2024-31228', risks: ['breast-or-cervical-screening'],
    description: 'Person-to-person navigation through breast and cervical cancer screening and follow-up, fitted to what the patient needs: assessment and planning, help through the health system, referrals (language, transport, social services) and education.' },
  { key: 'hrsa-cervical-cancer-screening', topic: 'Cervical cancer screening', population: 'women aged 21 to 65 at average risk', issued: '2025-12-29', notice: '2025-24235', ageMin: 21, ageMax: 65, risks: ['cervical-average-risk'],
    description: 'From 21 to 29, a Pap test every 3 years. From 30 to 65, primary HPV testing every 5 years (preferred) or co-testing every 5 years, or a Pap test alone every 3 years where HPV testing is not available; a self-collected HPV test is offered as an option; and the further testing needed to complete the screening (a Pap test, biopsy, colposcopy or genotyping).',
    earlier: { issued: '2016-12-20', notice: '2016-31129', description: 'From 21 to 29, a Pap test every 3 years. From 30 to 65, co-testing (Pap and HPV) every 5 years or a Pap test alone every 3 years; no more often than every 3 years at average risk.' } },
  { key: 'hrsa-ipv-screening', topic: 'Screening and counseling for intimate partner and domestic violence', population: 'adolescent and adult women', issued: '2024-12-20', notice: '2024-31228', risks: ['adolescent-or-adult'],
    description: 'Screening at least once a year, and providing or referring to intervention services when needed (counseling, education, harm reduction and support).',
    earlier: { issued: '2016-12-20', notice: '2016-31129', description: 'Screening at least once a year, and providing or referring to initial intervention services when needed.' } },
  { key: 'hrsa-anxiety-screening', topic: 'Screening for anxiety', population: 'adolescent and adult women, including those pregnant or postpartum', issued: '2019-12-17', notice: '2020-00035', risks: ['adolescent-or-adult'],
    description: 'Screening for anxiety; how often is left to clinical judgment.' },
  { key: 'hrsa-midlife-obesity', topic: 'Obesity prevention in midlife women', population: 'women aged 40 to 60 with a BMI of 18.5 to 29.9', issued: '2021-12-30', notice: '2022-00465', ageMin: 40, ageMax: 60, risks: ['bmi-18-5-to-29-9'],
    description: 'Counseling to keep weight steady or limit weight gain, which may include individual advice on eating and physical activity.' },
  { key: 'hrsa-breastfeeding', topic: 'Breastfeeding services and supplies', population: 'women who are pregnant or postpartum', issued: '2021-12-30', notice: '2022-00465', pregnancy: 'pregnant-or-postpartum', revised: true,
    description: 'Lactation support before and after birth (consultation, counseling, education and peer support) and equipment and supplies, including a double electric breast pump and milk storage supplies; the pump does not require a manual pump to have failed first.' },
  { key: 'hrsa-contraception', topic: 'Contraception', population: 'adolescent and adult women', issued: '2021-12-30', notice: '2022-00465', risks: ['adolescent-or-adult'], revised: true,
    description: 'The full range of FDA-approved, granted or cleared contraceptives, including sterilization surgery for women and emergency contraception, with screening, education, counseling and follow-up care (removal, changes and continuation).', note: 'A plan sponsor with a religious or moral exemption need not cover it (45 CFR 147.132 and 147.133).' },
  { key: 'hrsa-sti-counseling', topic: 'Counseling for sexually transmitted infections', population: 'sexually active adolescent and adult women at increased risk', issued: '2021-12-30', notice: '2022-00465', risks: ['sti-increased-risk'], revised: true,
    description: 'Behavioral counseling, after a review of sexual history and risk factors, to lower the risk of STIs.' },
  { key: 'hrsa-hiv', topic: 'Screening for HIV infection', population: 'adolescent and adult women aged 13 and older', issued: '2021-12-30', notice: '2022-00465', ageMin: 13, revised: true,
    description: 'Risk assessment and prevention education from 13; a screening test at least once from 15, and earlier or more often by risk; a test at the start of prenatal care, and a rapid test in labor when HIV status is unknown.' },
  { key: 'hrsa-diabetes-in-pregnancy', topic: 'Screening for diabetes in pregnancy', population: 'pregnant women', issued: '2022-12-30', notice: '2022-28662', pregnancy: 'pregnant', revised: true,
    description: 'Screening for gestational diabetes after 24 weeks (preferably 24 to 28), and before 24 weeks, ideally at the first prenatal visit, when there are risk factors for type 2 or gestational diabetes.' },
  { key: 'hrsa-diabetes-after-pregnancy', topic: 'Screening for diabetes after pregnancy', population: 'women with a history of gestational diabetes, not pregnant and never diagnosed with type 2 diabetes', issued: '2022-12-30', notice: '2022-28662', pregnancy: 'not-pregnant', risks: ['gdm-history-no-t2d'], revised: true,
    description: 'A test for type 2 diabetes, ideally in the first year after birth (from 4 to 6 weeks), then at least every 3 years for at least 10 years after a negative result or a missed first-year test.' },
  { key: 'hrsa-urinary-incontinence', topic: 'Screening for urinary incontinence', population: 'women', issued: '2023-12-28', notice: '2023-28970', risks: ['adolescent-or-adult'], revised: true,
    description: 'Screening every year for urinary incontinence and how it affects activities and quality of life, with further evaluation and treatment arranged when needed.' },
].map((g) => ({ ...g, url: HRSA_PAGE, noticeUrl: FR(g.notice), ...(g.earlier ? { earlier: { ...g.earlier, noticeUrl: FR(g.earlier.notice) } } : {}) }));

export const DATED_HRSA_WOMENS = {
  'hrsa-wpsg-2025-12': { edition: 'December 2025', readOn: '2026-10-09', validThrough: '2027-12-31', route: 'B', source: { label: 'HRSA\'s Women\'s Preventive Services Guidelines page', href: HRSA_PAGE }, values: { guidelines: GUIDELINES } },
};

// hrsaWomensGuidelines(now) -> { guidelines, edition, expired }
export function hrsaWomensGuidelines(now) {
  const v = datedValue('hrsa-wpsg-2025-12', 'guidelines', now, DATED_HRSA_WOMENS);
  return { guidelines: v.expired ? v.lastValue : v.value, edition: v.edition, expired: v.expired };
}
