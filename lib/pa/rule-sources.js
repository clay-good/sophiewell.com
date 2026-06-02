// spec-v52 §4.5.6: structured per-rule source metadata.
//
// Each pa-lint rule is anchored to an external authority whose freshness
// the maintainer tracks in `pa-staleness-ledger.json` (spec-v52 §8.3).
// Until this module, the linkage lived only in two places that were easy
// to drift apart: the rule's free-text `citation` string (human-readable,
// not machine-iterable) and the ledger's per-source `rules` arrays (which
// list only the *representative* anchor rules, not every rule a source
// backs). The deferred `scripts/refresh-pa-rules.mjs` (§4.5.6) needs to go
// the other way -- from a rule to the source URL(s) it must re-fetch and
// re-hash -- for *every* rule, so it needs a total, machine-readable map.
//
// `ruleSourceIds(id)` is that map, as a pure function of the rule id. It
// returns the ledger source id(s) a rule is anchored to, or `[]` for a
// "structural" rule -- a payer-agnostic completeness / heuristic check
// (patient name present, signature present, dates consistent, ...) that
// consumes no external reference dataset and so has nothing to go stale.
// rules.js attaches the result as each rule's `sources` field at load.
//
// Honesty discipline (why these specific assignments):
//   - This metadata is build/maintenance plumbing. It never enters a
//     finding or the user-facing report (engine.js copies only id /
//     severity / description / citation / status / evidence / note), so an
//     over-association fails safe: it only makes the future refresh script
//     re-verify one extra already-tracked CMS/AMA/etc. URL.
//   - The core code-set assignments are the exact inverse of the ledger's
//     maintainer-vetted per-source `rules` arrays -- zero new judgement.
//   - The overlay assignments are by id prefix to the one source that
//     backs that family, with the CMS-FFS family's two sources split by
//     the citation each rule already carries (CMS IOM Pub 100-08 program-
//     integrity rules vs. NCD/LCD coverage-policy rules).
//
// Pure: no I/O, no clock, no import from rules.js (so there is no cycle;
// rules.js imports this module, not the reverse).

// Core (payer-agnostic) rules that consume a bundled reference dataset.
// This object is the inverse of the ledger's core-source `rules` arrays
// (ama-cpt / cms-hcpcs / cms-icd10cm / cms-pos / cms-ncci / nppes-npi);
// see pa-staleness-ledger.json. Every other core rule is structural.
export const CORE_RULE_SOURCES = Object.freeze({
  'R-PA-007': ['ama-cpt', 'cms-hcpcs'], // >=1 CPT or HCPCS code present
  'R-PA-008': ['ama-cpt'], //              CPT current for service date (deleted-codes table)
  'R-PA-009': ['cms-hcpcs'], //            HCPCS current for service date
  'R-PA-010': ['cms-icd10cm'], //          >=1 ICD-10-CM code present
  'R-PA-011': ['cms-icd10cm'], //          ICD-10 current for service date
  'R-PA-012': ['cms-ncci'], //             CPT/ICD CCI pairing
  'R-PA-013': ['cms-pos'], //              POS code valid (bundled POS list)
  'R-PA-014': ['ama-cpt'], //              modifier set valid for CPT
  'R-PA-016': ['nppes-npi'], //            ordering NPI Luhn-valid
  'R-PA-019': ['nppes-npi'], //            servicing NPI Luhn-valid
  'R-PA-051': ['ama-cpt'], //              procedure descriptor vs CPT short descriptor
  'R-PA-054': ['cms-ncci'], //             modifier 25 / 59 documentation
});

// CMS Medicare FFS rules anchored to the IOM Pub 100-08 (Program Integrity)
// manual rather than the NCD/LCD coverage database: the Standard Written
// Order / Detailed Written Order rules, proof of delivery, and the supplier
// PTAN / enrollment check. Every other R-PA-CMS-* rule is an NCD/LCD
// coverage-policy rule (cms-ncd-lcd).
const CMS_IOM_RULES = new Set([
  'R-PA-CMS-002', // Standard Written Order present + dated (IOM Pub 100-08 ch.5)
  'R-PA-CMS-003', // SWO required elements complete (IOM Pub 100-08 ch.5)
  'R-PA-CMS-004', // proof of delivery retained (IOM Pub 100-08 ch.4 §4.26)
  'R-PA-CMS-009', // supplier PTAN / Medicare enrollment record (program integrity)
]);

// Overlay families: one ledger source backs each family. Prefix -> source.
const OVERLAY_PREFIX_SOURCES = [
  ['R-PA-MA-', 'cms-ma-422'],
  ['R-PA-MCD-', 'medicaid-core'],
  ['R-PA-RAD-', 'acr-appropriateness'],
  ['R-PA-INF-', 'fda-labeling'],
  ['R-PA-SURG-', 'surgical-indication-policy'],
  ['R-PA-BH-', 'dsm-5-tr'],
  ['R-PA-GEN-', 'nccn-acmg-genetic'],
  ['R-PA-AETNA-', 'aetna-precert'], //   commercial overlay (wave 52-7), §4.5.7
  ['R-PA-UHC-', 'uhc-precert'], //       commercial overlay (wave 52-8), §4.5.8
  ['R-PA-ANTHEM-', 'anthem-precert'], // commercial overlay (wave 52-9), §4.5.9
  ['R-PA-CIGNA-', 'cigna-precert'], //   commercial overlay (wave 52-10), §4.5.10
  ['R-PA-HUMANA-', 'humana-precert'], // commercial overlay (wave 52-11), §4.5.11
];

// ruleSourceIds(id) -> string[] : the ledger source id(s) a rule is anchored
// to, in deterministic (declared) order, or [] for a structural rule. Pure.
export function ruleSourceIds(id) {
  const ruleId = String(id || '');
  if (ruleId.startsWith('R-PA-CMS-')) {
    return [CMS_IOM_RULES.has(ruleId) ? 'cms-iom-100-08' : 'cms-ncd-lcd'];
  }
  for (const [prefix, source] of OVERLAY_PREFIX_SOURCES) {
    if (ruleId.startsWith(prefix)) return [source];
  }
  if (Object.prototype.hasOwnProperty.call(CORE_RULE_SOURCES, ruleId)) {
    return CORE_RULE_SOURCES[ruleId].slice();
  }
  return [];
}
