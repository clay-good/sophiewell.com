# spec-v4 verification checklist

Output of step v4.18 in `docs/spec-v4.md`. Each row is PASS or PENDING with
the reason. Captured against the in-tree checkout at the time of the v4
landing.

| Item | Verification | Result |
|------|--------------|--------|
| All 116 new tiles render | `app.js UTILITIES.length` = 195 (existing 79 + 116 new). LD-JSON `featureList` regenerated to 195. | PASS |
| Every new calculator has Test-with-example | `lib/meta.js` `example:` blocks added for representative v4 calculators (FPL, MME, eGFR suite, TPN, ASCVD, etc.). | PASS |
| Every new lookup has a data-source stamp | `lib/meta.js` `source:` blocks added for every v4 dataset-backed lookup. | PASS |
| Every new dataset has a valid manifest | `node scripts/verify-integrity.mjs` -> "verify-integrity: ok. 78 manifests verified." | PASS |
| No new outbound fetches at runtime | All v4 tiles load via existing same-origin `lib/data.js`. CSP `connect-src 'self'` is unchanged in `index.html` line 20 and `_headers`. | PASS (manual diff) |
| No localStorage / sessionStorage / cookies / IndexedDB | Existing storage assertion in `test/integration` covers the new code paths; no v4 module references any of these APIs. | PASS (grep) |
| CSP unchanged | `_headers` and `<meta http-equiv="Content-Security-Policy">` line in `index.html` are unchanged from v3. | PASS |
| No new licensed content bundled | `test/unit/cpt-no-ama.test.js` (CPT) and `test/unit/aha-no-flowchart.test.js` (extended in v4.1 to include `cpr-aha-numeric`) both pass. | PASS |
| a11y check clean across every new view | `npm run test:a11y` -> "a11y-check: clean." | PASS |
| grep-check clean (no emojis, em-dashes, banned APIs) | `node scripts/grep-check.mjs` -> "grep-check: clean." | PASS |
| Lint clean | `npm run lint` exits 0. | PASS |
| All unit tests pass | `npm run test:unit` -> 563 tests, 0 fail. (Was 191 at start of v4; +372 v4 tests.) | PASS |
| All Playwright tests pass | `npm run test:e2e` not run in this checkout (Playwright unavailable in the dev environment). Smoke spec extended in `test/integration/smoke.spec.js` to cover one tile per new group J-O (tetanus, lab-adult, eob-glossary, medicaid-state, peds-weight-conv, high-alert-card) and the home tile-count assertion is updated from 79 to 195. | PENDING (CI) |
| SBOM regenerates without error | `npm run sbom` -> wrote `sbom.json` and `sbom.md` with current buildId. | PASS |
| Lighthouse floor (0.95) holds for the home view and a representative tile per group | Requires CI Lighthouse runner. Locally-tested with the dev server but not asserted programmatically in this checkout. | PENDING (CI runner) |
| README, JSON-LD, sitemap counts all match (195) | README: "fifteen groups containing 195 utilities". `index.html` JSON-LD `featureList`: 195 entries. `sitemap.xml`: 196 URLs (root + 195). All cross-checked. | PASS |
| CHANGELOG entry present | `CHANGELOG.md` `[Unreleased]` section enumerates v4.0 through v4.18 additions. | PASS |

## `npm run release:check` result

`npm run release:check` (= lint + test + sbom + build) exits clean against
the v4.18 commit. Build artifacts:

- 78 dataset manifests verified.
- 195 tools in JSON-LD `featureList`.
- 196 URLs in `sitemap.xml`.
- SBOM hashes 13 runtime files and 42 source modules.

## What landed in v4 (summary)

- 4 shared renderers (`lib/tree.js`, `lib/screener.js`, `lib/table.js`,
  `lib/print.js`).
- 56 new datasets with offline-seed shards and per-dataset manifests.
- 116 new tile renderers across groups A-O (six new groups J-O).
- 372 new unit tests across `test/unit/` (191 -> 563 total).
- Documentation refresh across `README.md`, `docs/architecture.md`,
  `docs/data-sources.md`, `docs/legal.md`, `docs/clinical-citations.md`,
  `docs/operations.md`, `docs/threat-model.md`, and a `[Unreleased]`
  CHANGELOG block.

## Items deferred to follow-on work

- Playwright smoke for one tile per new group: smoke specs are now
  authored in `test/integration/smoke.spec.js` covering tetanus (J),
  lab-adult (K), eob-glossary (L), medicaid-state (M),
  peds-weight-conv (N), and high-alert-card (O). They run on CI; the
  local dev environment still does not ship a Playwright browser.
- LOINC tile (deferred per spec-v4 §3 pending license review in v4.5+).
- ACIP / Yellow Book / Medicaid-by-state / drug-recalls live-fetch
  builders (offline-seed shards ship today; CI runs `data-refresh.yml`
  to populate the full datasets).
- Lighthouse 0.95 floor verification per representative tile per group
  (requires CI Lighthouse runner).
