// Group A: Code Lookup.
//
// spec-v29 wave 29-2: all 19 code-reference lookup renderers removed
// (icd10, hcpcs, cpt, ndc, pos-codes, modifier-codes, revenue-codes,
// carc, rarc, hcpcs-mod, pos-lookup, tob-decode, rev-table, nubc-codes,
// drg-lookup, apc-lookup, pcs-lookup, rxnorm-lookup, ndc-rxnorm).
// Surviving Group A calculators (em-time, ndc-convert) live in
// views/group-v5.js. The router's removed-id redirect (app.js
// REMOVED_V29_IDS) sends old permalinks to the home view with a
// one-line removed-note per spec-v29 sec 2.7.

export const renderers = {};
