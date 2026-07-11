# Tasks — Restrictive transfusion threshold tile

> Docs-only proposal. Before building, re-verify every threshold in `design.md` against the
> AABB 2023 publication (spec-v97 discipline) and grep-verify id absence
> (`grep -c "id: 'transfusion-threshold'" app.js` == 0, `grep -rn "'transfusion-threshold'"
> mcp/adapters/`). Both confirmed 0 at proposal time (2026-07-10).

## 1. Lib compute
- [ ] 1.1 `M.transfusionThreshold({ hemoglobin, population, symptomatic })` in the appropriate
      `lib/*-vNNN.js` module; pure, no DOM. Returns `{ threshold, belowThreshold, band, note }`
      per Design D2 (threshold null + carve-out text for ACS).
- [ ] 1.2 Unit tests: each population's threshold + a band-flip pair (just-below vs at), the
      ACS null-threshold branch (asserts no fabricated number), and the symptomatic-override
      annotation. RangeError on impossible Hgb (<=0 or >30 g/dL).

## 2. View + meta
- [ ] 2.1 Renderer: `unitField` Hgb (g/dL canonical, g/L toggle — reuse the ALBUMIN_UNITS
      shape), population `selectField`, symptomatic `checkbox`; wire all + `-unit`.
- [ ] 2.2 `lib/meta.js` entry: clinical:true, group G, specialties, `example.fields` on a
      NUMERIC-threshold population (so the MCP round-trip asserts a number), bands text <=200
      chars, citation <=300 chars naming AABB 2023, ISSUER_PATTERN staleness ledger row.

## 3. Catalog surfaces
- [ ] 3.1 Add the tile id to `UTILITIES`; perl-bump every count surface 1144 -> 1145
      (README, mcp/README historical line, check-catalog-truth surfaces).
- [ ] 3.2 `data/synonyms.json` row -> transfusion-threshold ("when to transfuse",
      "transfusion threshold", "hemoglobin transfusion trigger", "transfusion trigger").

## 4. Search
- [ ] 4.1 Promote the golden-set note to a real probe: "when should i transfuse for anemia" ->
      ['transfusion-threshold'] in `test/mcp/mcp-search-relevance.test.js`, and delete the
      catalog-gap paragraph in the header.

## 5. MCP (follow-up wave, may be a separate commit)
- [ ] 5.1 Expose `transfusion-threshold` via a pure adapter (numeric-threshold example);
      coverage 1068 -> 1069, per the append-only MCP-wave recipe.

## 6. Ship
- [ ] 6.1 lint / test / build green; `git checkout -- data/` (build restamp) before commit;
      author `docs/spec-v*.md` recording the tile and the AABB transcription verification.
