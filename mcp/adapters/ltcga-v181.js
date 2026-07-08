// spec-v183 MCP wave 53: adapters for the two lib/ltcga-v181.js long-term-care
// infection-surveillance / stewardship tiles — the Revised McGeer surveillance
// definitions and the Loeb minimum criteria for initiating antibiotics.
//
// Both are SITE-BRANCHED: the input carries the suspected infection site plus a
// set of yes/no findings, and the lib only reads the findings that belong to the
// selected site. The adapter exposes the site enum plus the UNION of every
// criterion key across all sites as flat boolean fields (dom `mcg-<key>` /
// `loeb-<key>`, matching views/group-v181.js and META.example.fields). The
// default toArgs maps site + each present key straight through; findings that do
// not belong to the chosen site are simply ignored by the compute function.
//
// The keys, labels, and site values are read from the lib's own MCGEER_SITES /
// LOEB_SITES tables so the schema can never drift from the criteria logic.

import * as F from '../../lib/ltcga-v181.js';

// Build the site enum + the deduped union of criterion fields for one table.
function siteAdapter(prefix, sites) {
  const siteValues = sites.map((s) => s.value);
  const seen = new Map(); // key -> first label encountered
  for (const s of sites) {
    for (const cr of s.criteria) if (!seen.has(cr.key)) seen.set(cr.key, cr.label);
  }
  const fields = [
    { dom: `${prefix}-site`, arg: 'site', kind: 'enum', values: siteValues, required: true, label: 'Suspected infection site' },
    ...[...seen].map(([key, label]) => ({ dom: `${prefix}-${key}`, arg: key, kind: 'bool', label })),
  ];
  return fields;
}

export default [
  {
    id: 'mcgeer-criteria',
    summary: 'Revised McGeer criteria (Stone 2012): surveillance case definitions of infection in long-term care. Pick the suspected site, check the findings present → MEETS / DOES NOT MEET the surveillance definition (a counting definition for tracking/reporting, not a diagnosis or treatment trigger).',
    compute: F.mcgeerCriteria,
    fields: siteAdapter('mcg', F.MCGEER_SITES),
  },
  {
    id: 'loeb-minimum-criteria',
    summary: 'Loeb minimum criteria (2001): the consensus minimum threshold to initiate antibiotics in a long-term-care resident. Pick the suspected site, check the findings present → minimum criteria MET / NOT MET (stewardship decision support, not an order).',
    compute: F.loebMinimumCriteria,
    fields: siteAdapter('loeb', F.LOEB_SITES),
  },
];
