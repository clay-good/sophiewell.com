# Tasks — IV alteplase eligibility tile

> Docs-only proposal. Before building, re-verify every time window, exclusion criterion, and
> threshold in `design.md` against the AHA/ASA 2019 guideline (Powers 2019) + ECASS-III + the
> alteplase package insert (spec-v97 discipline), and grep-verify id absence
> (`grep -c "id: 'tpa-eligibility'" app.js` == 0, `grep -rn "'tpa-eligibility'" mcp/adapters/`).
> Both confirmed 0 at proposal time (2026-07-11). This is a HIGH-STAKES tile — do not ship with
> any unverified criterion.

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
      AHA/ASA 2019 guideline. Confirm the AHA/ASA issuer vs `ISSUER_PATTERN`: `AHA` IS in the
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
      author `docs/spec-v*.md` recording the tile and the AHA/ASA 2019 criteria verification.
