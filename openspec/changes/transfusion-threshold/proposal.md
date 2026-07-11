# Change: Restrictive transfusion threshold decision aid (AABB 2023)

## Why

The spec-v285–v290 search-quality program surfaced a catalog gap it could not rank around:
**"when should i transfuse for anemia" has no right answer.** Every transfusion tile is a
massive-transfusion score (ABC, TASH, RABT, ETS, MTP tracker) or a peds volume calculator —
nothing answers the far more common bedside question: *is this hemoglobin below the threshold
for this patient?* A nurse checking whether an Hgb of 6.8 g/dL warrants calling for blood in a
stable medical patient gets routed to trauma scores.

The AABB 2023 guideline (Carson et al., JAMA) publishes population-specific restrictive
thresholds — exactly the reproducible, citable, band-shaped content the catalog is built from.

## What Changes

- **One new clinical tile, `transfusion-threshold` (group G):** inputs = hemoglobin
  (`unitField`, g/dL canonical with g/L toggle) + a patient-population select (stable
  hospitalized adult incl. critically ill / orthopedic surgery or preexisting cardiovascular
  disease / cardiac surgery / acute coronary syndrome / stable critically ill child) +
  a symptomatic-anemia checkbox. Output = the population's AABB threshold, whether the entered
  Hgb sits below it (transfusion indicated) or above it (restrictive strategy: do not
  transfuse on the number alone), and the ACS/symptomatic carve-outs where the guideline makes
  no numeric recommendation.
- **Pure lib compute** (`M.transfusionThreshold()`) so the tile is Class-A MCP-adaptable; a
  follow-up MCP wave exposes it.
- Catalog count 1144 → 1145 across every count surface; META example, bands, citation, and
  the standard test battery per the shipping checklist in `tasks.md`.

## Why this passes the spec-v29 §3 one-line test

It is not a googleable static table: the tile computes a per-patient decision from two inputs
("Hgb 6.8, stable ICU patient → below the 7 g/dL restrictive threshold — transfusion
indicated per AABB 2023"), the same shape as the shipped KDIGO-AKI staging or CURB-65 band
tiles. The population carve-outs (ACS has *no* recommended numeric threshold) are exactly the
nuance a flat reference table gets wrong.

## Impact

- Affected specs: new `transfusion-threshold` capability (this change's `specs/` folder).
- Affected code at build: one lib module function, one view renderer, `lib/meta.js` entry,
  count surfaces, `data/synonyms.json` row ("when to transfuse", "transfusion threshold",
  "hemoglobin transfusion trigger"), golden-set probe promotion ("when should i transfuse for
  anemia" — currently documented as unanswerable in `test/mcp/mcp-search-relevance.test.js`).
- **Docs-only proposal** (propose-first, per the spec-v279 / v264–v266 precedent). Every
  threshold in `design.md` must be re-verified against the AABB 2023 publication at build
  (spec-v97 discipline); the sketch is not a source.
