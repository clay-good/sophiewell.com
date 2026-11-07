# Tasks — IV alteplase eligibility tile

> **Re-verified November 7, 2026:** `design.md` now holds the criteria as read in the AHA/ASA 2026 guideline (Stroke 2026,
> doi:10.1161/STR.0000000000000513, Free Access; recommendation tables and Table 8 read from their published images) and
> its July 27, 2026 correction; the 2019 sketch was withdrawn. Before building, read the tenecteplase (TNKase) and
> alteplase (Activase) package inserts on DailyMed for their stroke indication, contraindications and dosing, and
> confirm they agree with Table 7 (spec-v97 discipline). Grep-verify id absence (`grep -c "id: 'tpa-eligibility'"
> app.js` == 0); confirmed 0 on November 7, 2026. This is a HIGH-STAKES tile: do not ship with any criterion that is
> not in `design.md`.

## 1. Lib compute
- [ ] 1.1 `M.tpaEligibility({ window, exclusions, relativeExclusions })` in a new `lib/*-vNNN.js`
      module; pure, no DOM. Returns `{ window, eligible, firedAbsolute, firedRelative, band, note }`
      per Design D1/D2 (eligible null + thrombectomy pointer for the > 4.5 h window; verdict is a
      checklist result, never an order).
- [ ] 1.2 Unit tests: the ≤ 3 h eligible path, an absolute-exclusion path (reports the fired
      criteria), the 3–4.5 h window adding a relative exclusion (relative ≠ absolute), the > 4.5 h
      null-verdict branch, and an assertion that NO band contains an imperative
      administer/give/dose verb (Design D2 safety pin).

## 2. View + meta
- [ ] 2.1 Renderer: window `selectField`, absolute-exclusion checkboxes, relative-exclusion
      checkboxes shown only for the 3–4.5 h window; wire all. Render the spec-v100 §2 clause-5 /
      spec-v11 §5.3 high-stakes second-check caveat and the spec-v50 §3 posture note.
- [ ] 2.2 `lib/meta.js` entry: clinical:true, group G, specialties (neurology, emergency-medicine,
      critical-care, nursing-ed), `example.fields` on the ≤ 3 h eligible path (so the MCP round-trip
      asserts a determinate verdict), bands text ≤ 200 chars, citation ≤ 300 chars naming the
      AHA/ASA 2026 guideline. Confirm the AHA/ASA issuer vs `ISSUER_PATTERN`: `AHA` IS in the
      pattern, so this tile REQUIRES a `citationAccessed` date AND a `docs/citation-staleness.md`
      row (unlike spec-v292's AABB, which is not in the pattern).

## 3. Catalog surfaces
- [ ] 3.1 Add the tile id to `UTILITIES`; perl-bump every count surface live → live + 1
      (README, index.html, package.json, docs, check-catalog-truth surfaces); run build-ld.
- [ ] 3.2 `data/synonyms.json` row → tpa-eligibility ("tpa eligibility", "thrombolysis checklist",
      "alteplase criteria", "is this patient a tpa candidate", "thrombolytic contraindications").

## 4. Search
- [ ] 4.1 Add a golden-set probe "is this patient a tpa candidate" → ['tpa-eligibility'] in
      `test/mcp/mcp-search-relevance.test.js` (after the MCP wave exposes it).

## 5. MCP (follow-up wave, may be a separate commit)
- [ ] 5.1 Expose `tpa-eligibility` via a pure adapter (≤ 3 h eligible example); coverage live →
      live + 1, per the append-only MCP-wave recipe.

## 6. Ship
- [ ] 6.1 lint / test / build green; `git checkout -- data/` (build restamp) before commit;
      author `docs/spec-v*.md` recording the tile and the AHA/ASA 2026 criteria verification.
