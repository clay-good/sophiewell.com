// spec-v1605: the preventive code map. The HCPCS and CPT codes that identify a preventive service on a
// claim, so carin-eob-reader can ask about cost sharing on one (45 CFR 147.130: in network, most plans
// cover USPSTF A and B services, ACIP vaccines and the HRSA women's services without cost sharing).
//
// Read October 7, 2026 from the CMS Medicare Learning Network chart MLN006559, "Medicare Preventive
// Services" (July 2026; services.js "2026 Q3"), one page per service. Codes only, no descriptors
// (spec-v1501 §6). Kept: the codes whose own descriptor makes them screening, counseling, a vaccine or
// PrEP, so the code alone says preventive. Left out on purpose:
//   - codes billed as often for diagnosis or monitoring as for screening: the lipid panel (80061),
//     glucose and A1c (82947, 82950, 82951, 83036), bone density (76977, 77078, 77080, 77081, 77085,
//     G0130), the hepatitis B serologies (86704, 86706, 87340, 87341), the chlamydia, gonorrhea and
//     syphilis tests and the obstetric panel (80081). Flagging them would flag every diabetic's A1c;
//   - the blood-based colorectal tests (G0327, 0537U), which are not among the USPSTF's screening
//     strategies;
//   - Medicare-only benefits with no counterpart in 147.130: the wellness visits, glaucoma, prostate
//     (USPSTF grade C), diabetes self-management, medical nutrition therapy, the diabetes prevention
//     program, prolonged preventive services and the home vaccine add-on (M0201).
// The chart lists ICD-10 codes only through each NCD's coding file, so none are carried here. A match is a
// question to ask, never a finding: a screening code can still be billed for a person whose plan is
// grandfathered, out of network, or outside the recommendation's population.
//
// Pure: no DOM; the list is a dated constant read through datedValue(), so past validThrough the reader
// says the list is due for review instead of answering from it silently.

import { datedValue } from './dated-data.js';

const SRC = { label: 'the CMS chart MLN006559, Medicare Preventive Services (July 2026)', url: 'https://www.cms.gov/medicare/prevention/prevntiongeninfo/medicare-preventive-services/mps-quickreferencechart-1.html' };

// spec-v1605: the chart's own version line lives in this script, so the weekly page watcher
// (scripts/data/watch-pages.mjs) sees a quarterly code update as a changed hash.
export const WATCHED_SOURCES = [
  { route: 'B', label: 'the MLN006559 service script (its version line)', url: 'https://www.cms.gov/medicare/prevention/prevntiongeninfo/medicare-preventive-services/scripts/services.js' },
];

// service: what a reader would call it; basis: why 147.130 reaches it.
const SERVICES = [
  { service: 'unhealthy alcohol use screening and counseling', basis: 'USPSTF', codes: ['G0442', 'G0443'] },
  { service: 'behavioral counseling for cardiovascular disease prevention', basis: 'USPSTF', codes: ['G0446'] },
  { service: 'cervical cancer screening', basis: 'USPSTF', codes: ['G0476', 'G0123', 'G0124', 'G0141', 'G0143', 'G0144', 'G0145', 'G0147', 'G0148', 'P3000', 'P3001', 'Q0091'] },
  { service: 'colorectal cancer screening', basis: 'USPSTF', codes: ['G0104', 'G0105', 'G0121', 'G0328', '00812', '74263', '81528', '82270', '0464U'] },
  { service: 'depression screening', basis: 'USPSTF', codes: ['G0444'] },
  { service: 'hepatitis B screening', basis: 'USPSTF', codes: ['G0499'] },
  { service: 'hepatitis C screening', basis: 'USPSTF', codes: ['G0472', 'G0567'] },
  { service: 'HIV screening', basis: 'USPSTF', codes: ['G0432', 'G0433', 'G0435', 'G0475'] },
  { service: 'HIV pre-exposure prophylaxis (PrEP)', basis: 'USPSTF', codes: ['J0738', 'J0739', 'J0750', 'J0751', 'J0752', 'J0799', 'Q0521', 'G0011', 'G0012', 'G0013'] },
  { service: 'lung cancer screening', basis: 'USPSTF', codes: ['G0296', '71271'] },
  { service: 'screening mammography', basis: 'USPSTF', codes: ['77063', '77067'] },
  { service: 'behavioral counseling for obesity', basis: 'USPSTF', codes: ['G0447', 'G0473'] },
  { service: 'behavioral counseling to prevent sexually transmitted infections', basis: 'USPSTF', codes: ['G0445'] },
  { service: 'tobacco cessation counseling', basis: 'USPSTF', codes: ['99406', '99407'] },
  { service: 'abdominal aortic aneurysm screening', basis: 'USPSTF', codes: ['76706'] },
  { service: 'a well-woman pelvic and breast examination', basis: 'HRSA', codes: ['G0101'] },
  { service: 'a flu vaccine', basis: 'ACIP', codes: ['G0008', 'Q2039', '90653', '90656', '90657', '90658', '90660', '90661', '90662', '90673'] },
  { service: 'a pneumococcal vaccine', basis: 'ACIP', codes: ['G0009', '90670', '90671', '90677', '90684', '90732'] },
  { service: 'a hepatitis B vaccine', basis: 'ACIP', codes: ['G0010', '90739', '90740', '90743', '90744', '90746', '90747', '90759'] },
  { service: 'a COVID-19 vaccine', basis: 'ACIP', codes: ['90480', '91304', '91319', '91320', '91321', '91322', '91323'] },
];

export const DATED_PREVENTIVE_CODES = {
  'mln006559-2026-07': { edition: 'July 2026', readOn: '2026-10-07', validThrough: '2027-09-30', route: 'B', ledgerId: 'cms-preventive-services-chart', source: SRC, values: { services: SERVICES } },
};

export const BASIS_TEXT = {
  USPSTF: 'a USPSTF A or B recommendation',
  ACIP: 'an ACIP-recommended vaccine',
  HRSA: 'the HRSA women\'s preventive services guidelines',
};

// preventiveCode(code, now) -> null, or { code, service, basis, edition, expired, source }
export function preventiveCode(code, now) {
  const c = String(code || '').trim().toUpperCase();
  if (!c) return null;
  const v = datedValue('mln006559-2026-07', 'services', now, DATED_PREVENTIVE_CODES);
  const list = v.expired ? v.lastValue : v.value;
  const hit = list.find((s) => s.codes.includes(c));
  return hit ? { code: c, service: hit.service, basis: hit.basis, edition: v.edition, expired: v.expired, source: v.source } : null;
}
