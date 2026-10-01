// spec-v52 §4.5.2.1 (wave 52-45): the CMS Hospital Outpatient Department (OPD)
// Prior Authorization required-services list -- the FIRST real bundled
// prior-authorization-list membership test in the linter.
//
// Every `-004`-family rule to date ("requested service is on the payer's
// prior-authorization list") ships vacuous: it passes with a pointer because no
// list is bundled (spec-v52 §4.5.1 R-PA-053 and the per-overlay -004 rules). The
// CMS OPD PA program is the cleanest first list to bundle for real: it is a
// single, federally published, stable code list (not 50 state variations), it is
// re-verified on the §4.5.6 maintenance cadence against one authoritative CMS
// page, and Medicare requires prior authorization (with a Unique Tracking Number,
// UTN, on the claim) BEFORE these services are furnished in the hospital
// outpatient department.
//
// Source: CMS, "Final List of Outpatient Department Services That Require Prior
// Authorization" (files/document/opd-services-require-prior-authorization.pdf,
// linked from the OPD program page). Tracked in the staleness ledger as
// `cms-opd-pa-list` and re-verified on the maintenance cadence
// (docs/pa-maintenance.md).
//
// spec-v1502 §6 re-verified it against that PDF on September 30, 2026, and the
// list kept since wave 52-45 was wrong in both directions: it still held 67911
// (removed January 7, 2022), 63685 and 63688 (temporarily removed by the CY 2021
// OPPS/ASC final rule) and 64492 and 64495 (removed August 16, 2024), held eight
// chemodenervation codes the list does not name (64616-64617, 64642-64647), and
// lacked the botulinum toxin drug codes J0585-J0588 and the related services
// 20912, 21210, 30465 and 30520. Each code now carries the date it joined and,
// for the ones taken off, the date it left, so a service date answers for its day.
//
// Codes are in the exact string form the extractor emits (lib/pa/extract.js
// extractCptHcpcs). `lastVerified` is mirrored in the staleness ledger entry;
// bump both together when re-verifying.

const LIST = [
  ['2020-07-01', 'blepharoplasty / blepharoptosis / brow ptosis repair', ['15820', '15821', '15822', '15823', '67900', '67901', '67902', '67903', '67904', '67906', '67908']],
  ['2020-07-01', 'botulinum toxin injection', ['64612', '64615', 'J0585', 'J0586', 'J0587', 'J0588']],
  ['2020-07-01', 'panniculectomy / excess skin removal', ['15830', '15847', '15877']],
  ['2020-07-01', 'rhinoplasty and related services', ['20912', '21210', '30400', '30410', '30420', '30430', '30435', '30450', '30460', '30462', '30465', '30520']],
  ['2020-07-01', 'vein ablation and related services', ['36473', '36474', '36475', '36476', '36478', '36479', '36482', '36483']],
  ['2021-07-01', 'cervical fusion with disc removal', ['22551', '22552']],
  ['2021-07-01', 'implanted spinal neurostimulators', ['63650']],
  ['2023-07-01', 'facet joint interventions', ['64490', '64491', '64493', '64494', '64633', '64634', '64635', '64636']],
];

// Codes the list names as taken off, with the day each left (the PDF's footnotes).
export const CMS_OPD_PA_REMOVED = [
  { code: '67911', category: 'blepharoplasty / blepharoptosis / brow ptosis repair', from: '2020-07-01', removed: '2022-01-07', why: 'removed January 7, 2022' },
  { code: '21235', category: 'rhinoplasty and related services', from: '2020-07-01', removed: '2020-06-10', why: 'removed June 10, 2020, before the program began' },
  { code: '63685', category: 'implanted spinal neurostimulators', from: null, removed: null, why: 'temporarily removed by the CY 2021 OPPS/ASC final rule' },
  { code: '63688', category: 'implanted spinal neurostimulators', from: null, removed: null, why: 'temporarily removed by the CY 2021 OPPS/ASC final rule' },
  { code: '64492', category: 'facet joint interventions', from: '2023-07-01', removed: '2024-08-16', why: 'removed August 16, 2024' },
  { code: '64495', category: 'facet joint interventions', from: '2023-07-01', removed: '2024-08-16', why: 'removed August 16, 2024' },
];

export const CMS_OPD_PA_LAST_VERIFIED = '2026-09-30';

export const CMS_OPD_PA_CATEGORIES = Object.fromEntries(LIST.map(([, category, codes]) => [category, codes]));

// Flat lookup: code -> { category, since }. Built once at module load.
const ENTRY = new Map();
for (const [since, category, codes] of LIST) for (const code of codes) ENTRY.set(code, { category, since });

// Set of every code on the list today, for O(1) membership tests.
export const CMS_OPD_PA_CODES = new Set(ENTRY.keys());

// opdPaCategoryFor(code) -> category label, or undefined if the code is not on
// the OPD PA list. Lets a finding name the category in its evidence.
export function opdPaCategoryFor(code) {
  const e = ENTRY.get(code);
  return e && e.category;
}

// opdPaOn(code, isoDate) -> { listed: true, category, since } when the code
// required prior authorization on that date of service; { listed: false,
// category?, since?, removed? } otherwise, with the reason a listed code did
// not apply on that day.
export function opdPaOn(code, isoDate) {
  const e = ENTRY.get(code);
  if (e) return isoDate < e.since ? { listed: false, category: e.category, since: e.since, notYet: true } : { listed: true, category: e.category, since: e.since };
  const r = CMS_OPD_PA_REMOVED.find((x) => x.code === code);
  if (!r) return { listed: false };
  if (r.from && r.removed && isoDate >= r.from && isoDate < r.removed) return { listed: true, category: r.category, since: r.from, removedLater: r.removed };
  return { listed: false, category: r.category, removed: r.why };
}
