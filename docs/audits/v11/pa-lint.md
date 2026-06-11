# v11 audit - Prior-Auth Packet Linter (`pa-lint`)

- Auditor: CG
- Date: 2026-06-11 (initial v11 audit; group P tile, added after the Waves 3a-3n closeout)
- Citation re-verified against: This tile lints (it does not author clinical or legal advice). Its 876 deterministic rules are anchored to 60 named authority sources tracked in `pa-staleness-ledger.json` (warn at 90 days, fail at 365 days). Core code-set rules cite the bundled shards (AMA CPT, CMS HCPCS, CMS ICD-10-CM, CMS POS, CMS NCCI, NPPES NPI) via `lib/pa/rule-sources.js`; CMS prior-authorization scope cites the OPD master list (`lib/pa/cms-opd-pa-list.js`) and the FFS / Medicare Advantage policy families (NCD/LCD, IOM 100-08, 42 CFR 422); commercial-payer and state-Medicaid overlays each cite their own payer policy source. The freshness contract — not a single static reference — is the citation, enforced by `scripts/check-pa-staleness.mjs` in CI. Re-verified clean on the audit date (60 fresh, 0 warn, 0 fail; 876 rules shipped, 828 source-anchored, 0 ledger orphans, 0 coverage gaps).

## Boundary examples added

`pa-lint` does not compute a numeric value, so its boundary cases are
classification/finding boundaries exercised by the 46 committed golden fixtures
(`test/fixtures/pa-lint/`), each diffed byte-for-byte against its expected report
by `scripts/audit-pa.mjs`. Representative endpoints:

- **Empty packet** (0 documents / 0 bytes): pipeline returns a fully populated
  bundle with zero findings rather than throwing (`lib/pa/engine.js` `buildBundle`
  coerces null/empty fields to safe defaults; `test/unit/pa-stress.test.js`
  confirms empty-text input does not throw). PASS.
- **Unparseable file** (encrypted PDF, or non-PDF bytes labeled `.pdf`): the view
  pushes a stub document carrying `parseError` rather than dropping the file, so
  the engine still fires R-PA-043 (password/encrypted) and R-PA-044 (parse
  error / zero extractable content) deterministically (`views/pa-lint.js:386-440`).
  PASS.
- **Scanned/image-only PDF**: `lib/pa/ocr.js` `looksLikeScan()` flags <16 chars/page
  and the view offers user-triggered on-device OCR (never automatic, never
  networked). PASS.
- **Clock-relative date rules** at their thresholds: R-PA-005 (retro-auth window,
  90 days back) and R-PA-006 (future-dated service ceiling, 365 days forward)
  evaluate against `lib/pa/date.js` `todayUtc()`. With `SOPHIEWELL_NOW` pinned to
  the fixture-seed date (`2026-05-29`), both reproduce their committed findings
  exactly; null/unparseable dates are skipped (`if (!dt) continue`,
  `lib/pa/rules.js:245-289`). PASS.
- **Payer-overlay self-gating**: per-payer fixtures (BCBS plans, state Medicaid FL/GA/NC/OH/PA/MI/AZ/IN/NJ, CMS DME/OPD, telehealth POS-10) each fire only their
  detected payer's overlay; the happy-path and missing-NPI fixtures bound the
  no-overlay and core-rule cases. PASS (all 46 fixtures match golden).

## Cross-implementation differential

- **N/A as a single numeric reference** — this is a document linter, not a
  calculator, so the v11 §3.2 differential is reframed as a determinism + golden
  differential: *does the same input produce byte-identical report output, and do
  the committed goldens still match the live pipeline?* `scripts/audit-pa.mjs`
  runs `buildBundle -> runEngine -> buildJsonReport` over all 46 fixtures and
  diffs each against `test/fixtures/pa-lint/expected/<name>.report.json`. Result:
  **46/46 byte-identical** on the audit date.
- **Determinism basis**: the compute path contains no `Date.now()`, `Math.random()`,
  or `fetch` (`lib/pa/extract.js`, `lib/pa/engine.js`, `lib/pa/report.js`); the DOCX
  writer zeroes DOS date/time on every zip entry (`lib/pa/docx.js`); the only
  `new Date()` is captured at report-download click in the view layer and passed in
  as an opt, never entering the rule engine (`views/pa-lint.js:321-345`). So the
  golden differential is reproducible on any machine and any calendar day.
- **Rule-source bidirectional coverage**: `lib/pa/rule-sources.js` `ruleSourceIds()`
  maps every rule to its ledger source(s); `scripts/check-pa-staleness.mjs` proves
  the mapping is orphan-free in both directions (no rule without a source, no
  ledger source without a rule) — the linter analog of a reference cross-check.

## Edge-input handling notes

- **DoS / ReDoS resistance**: every extractor is hard-capped
  (`EXTRACT_MATCH_CAP = 200`, `lib/pa/extract.js:126`; the generic `uniqueMatches`
  caps at 50) and every redaction pattern uses bounded `{0,n}` quantifiers
  (`lib/pa/redact.js`). `test/unit/pa-stress.test.js` drives multi-MB date/address
  "bombs" and a 500k-replacement-char binary blob through the full pipeline under a
  4000 ms budget; all pass.
- **Size ceilings**: 50 MB per file and 200 MB per packet are enforced in the view
  before parsing (`views/pa-lint.js:34-35,356,367`); over-ceiling files render a
  finding rather than hanging.
- **Non-UTF-8 / mojibake**: TXT inputs are pre-gated on a U+FFFD replacement-char
  ratio (>30% -> "binary or non-UTF8 content", text cleared, `parseError` set)
  via `lib/pa/extract.js` `countReplacementChars()`.
- **Invalid dates**: `lib/pa/date.js` `parseDate()` returns null on any
  unparseable / NaN date and the date rules skip nulls, so a garbage date never
  produces a spurious window finding.
- Audit logs under `docs/audits/**` are exempt from the `grep-check` and
  `check-citations` URL/citation guards by design (`scripts/grep-check.mjs:175`),
  so this file's source-URL references do not trip a guard.

## A11y / keyboard notes

- The dropzone is a `role="button" tabindex="0"` element with an explicit
  `aria-label`; Enter/Space open the file picker, so the upload has a full
  keyboard path, not drag-drop only (`views/pa-lint.js:563-608`).
- The offscreen `<input type="file">` carries `aria-label="Upload
  prior-authorization files (PDF, DOCX, TXT, or image)"` (added 2026-06-11,
  commit 970eb3e — the recent unlabeled-control fix; the catalog-wide
  accessible-name guard in `test/integration/all-tools.spec.js` now prevents
  regression).
- Progress and OCR status use `role="status" aria-live="polite"`; the roles list,
  findings list, and download group are all `aria-label`-named with
  visually-hidden per-item labels. `npm run test:a11y` clean.

## Defects opened

- none. The pipeline was already covered by 13 dedicated unit-test modules
  (extract, date, engine, redact, docx, ocr, staleness, classify, property,
  rule-sources, report, stress, refresh), the 46-fixture `audit-pa` golden
  harness, and the `check-pa-staleness` ledger gate before this audit; the audit
  confirmed those guards hold and added no fixes. This log closes the one
  remaining v11 coverage gap (group P), bringing `audit-coverage` to 337/337.

## Status
- PASS
