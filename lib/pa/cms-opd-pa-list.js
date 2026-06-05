// spec-v52 §4.5.2.1 (wave 52-45): the CMS Hospital Outpatient Department (OPD)
// Prior Authorization required-services list -- the FIRST real bundled
// prior-authorization-list membership test in the linter.
//
// Every `-004`-family rule to date ("requested service is on the payer's
// prior-authorization list") ships vacuous: it passes with a pointer because no
// list is bundled (spec-v52 §4.5.1 R-PA-053 and the per-overlay -004 rules). The
// CMS OPD PA program is the cleanest first list to bundle for real: it is a
// single, federally published, stable CPT list (not 50 state variations), it is
// re-verified on the §4.5.6 maintenance cadence against one authoritative CMS
// page, and Medicare requires prior authorization (with a Unique Tracking Number,
// UTN, on the claim) BEFORE these services are furnished in the hospital
// outpatient department.
//
// Source: CMS, "Prior Authorization for Certain Hospital Outpatient Department
// (OPD) Services" -- the Required Prior Authorization List. Tracked in the
// staleness ledger as `cms-opd-pa-list` and re-verified on the maintenance
// cadence (docs/pa-maintenance.md). The list below covers the program's
// published service categories as expanded through the 2023 addition of facet
// joint interventions:
//   - 2020-07-01: blepharoplasty, botulinum toxin injection, panniculectomy,
//                 rhinoplasty, vein ablation
//   - 2021-07-01: cervical fusion with disc removal, implanted spinal
//                 neurostimulators
//   - 2023-07-01: facet joint interventions
//
// Codes are the CPT procedure codes in each category, in the exact string form
// the extractor emits (5-digit CPT; see lib/pa/extract.js extractCptHcpcs). The
// drug J-codes sometimes billed alongside botulinum toxin are deliberately NOT
// included -- the OPD PA list gates on the procedure code, and excluding the
// drug codes keeps the membership test conservative.
//
// `lastVerified` is mirrored in the staleness ledger entry; bump both together
// when re-verifying against the CMS page (the maintainer flow re-points the URL
// and the codes in the same pass).

export const CMS_OPD_PA_CATEGORIES = {
  'blepharoplasty / blepharoptosis / brow ptosis repair': [
    '15820', '15821', '15822', '15823',
    '67900', '67901', '67902', '67903', '67904', '67906', '67908', '67911',
  ],
  'botulinum toxin injection (chemodenervation)': [
    '64612', '64615', '64616', '64617',
    '64642', '64643', '64644', '64645', '64646', '64647',
  ],
  'panniculectomy / excess skin removal': [
    '15830', '15847', '15877',
  ],
  'rhinoplasty': [
    '30400', '30410', '30420', '30430', '30435', '30450', '30460', '30462',
  ],
  'vein ablation': [
    '36473', '36474', '36475', '36476', '36478', '36479', '36482', '36483',
  ],
  'cervical fusion with disc removal': [
    '22551', '22552',
  ],
  'implanted spinal neurostimulators': [
    '63650', '63655', '63685', '63688',
  ],
  'facet joint interventions': [
    '64490', '64491', '64492', '64493', '64494', '64495',
    '64633', '64634', '64635', '64636',
  ],
};

// Flat lookup: CPT string -> category label. Built once at module load.
const CODE_TO_CATEGORY = new Map();
for (const [category, codes] of Object.entries(CMS_OPD_PA_CATEGORIES)) {
  for (const code of codes) CODE_TO_CATEGORY.set(code, category);
}

// Set of every CPT on the OPD PA list, for O(1) membership tests.
export const CMS_OPD_PA_CODES = new Set(CODE_TO_CATEGORY.keys());

// opdPaCategoryFor(cpt) -> category label, or undefined if the code is not on
// the OPD PA list. Lets a finding name the category in its evidence.
export function opdPaCategoryFor(cpt) {
  return CODE_TO_CATEGORY.get(cpt);
}
