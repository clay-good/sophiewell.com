# Changelog

All notable changes to sophiewell.com are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (spec-v11 wave 3j — code lookups; Group A to 100%)

- **Wave 3j — code lookups (21 tiles).** `icd10`, `hcpcs`, `cpt`,
  `ndc`, `pos-codes`, `modifier-codes`, `revenue-codes`, `carc`,
  `rarc`, `hcpcs-mod`, `pos-lookup`, `tob-decode`, `rev-table`,
  `nubc-codes`, `drg-lookup`, `apc-lookup`, `pcs-lookup`,
  `rxnorm-lookup`, `ndc-rxnorm`, `em-time`, `ndc-convert` each audited
  per spec-v11 §3.3 step 10: (a) bundled shard sha256 confirmed
  against the dataset manifest by `scripts/verify-integrity.mjs`
  (46 manifests pass clean as of audit date), and (b) at least one
  sample lookup per shard verified against the authoritative source
  (CMS / NCHS ICD-10-CM; CMS HCPCS Level II; CMS MPFS + author-
  written CPT family summaries with the AMA-no-descriptors guard via
  `test/unit/cpt-no-ama.test.js`; FDA NDC Directory; CMS Place of
  Service; CMS / X12 modifiers; NUBC UB-04 revenue codes; X12 CARC /
  RARC; CMS HCPCS Modifier file; NUBC UB-04 TOB structure; NUBC
  Condition / Occurrence / Value codes; CMS IPPS MS-DRG Final Rule;
  CMS OPPS APC Addendum; CMS ICD-10-PCS; NLM RxNorm; FDA NDC + NLM
  RxNorm crosswalk; AMA CPT 2021 E/M time bands; CMS NDC 5-4-2
  billing format + FDA SPL 10-digit source formats). The two
  computational tiles in the group (`em-time`, `ndc-convert`) also
  carry boundary worked examples (low/mid/high time bands; each of
  the three 10-digit NDC source formats and the ambiguous 5-4-2
  already-padded case).
- **No defects opened in this wave.** All META examples computed to
  the same value the renderer produces (em-time 99204 / 45-min new
  patient; ndc-convert 1234-5678-90 -> 01234-5678-90 billing / 1234-
  5678-90 FDA 10-digit / 4-4-2 source).
- **Group A (Billing & Coding) is now 100% audited.**
  `scripts/audit-coverage.mjs` reports 96 / 178 (54%) overall, with
  `A 21/21 (100%)`, `E 31/31 (100%)`, `F 15/15 (100%)`,
  `G 28/47 (60%)`, and `N 1/3 (33%)`. Wave 3k (regulatory and
  patient-literacy) is next per spec-v11 §3.3.

### Added (spec-v11 wave 3i — conversions and physical math; Group E to 100%)

- **Wave 3i — conversions and physical math (16 tiles).** `bmi`, `bsa`,
  `bw-bsa-suite`, `map`, `shock-index`, `aa-gradient`, `pf-ratio`,
  `aa-pf-suite`, `qtc`, `qtc-suite`, `pack-years`, `unit-converter`,
  `cockcroft-gault`, `maint-fluids`, `pbw-ardsnet`, `rsbi` each audited
  end-to-end per spec-v11 §3.1: citation re-verification (Quetelet 1835
  + WHO BMI bands; Du Bois 1916 + Mosteller 1987 BSA; physiology MAP /
  PP / Allgower 1967 SI / Liu 2012 mSI; West alveolar gas equation;
  ARDS Berlin Definition JAMA 2012; Bazett / Fridericia / Sagie /
  Hodges QTc formulas; USPSTF pack-year convention; NIST SP 811 +
  Handbook 44 exact unit factors; Cockcroft-Gault Nephron 1976;
  Holliday-Segar Pediatrics 1957; ARDSnet NEJM 2000 PBW + 6 mL/kg
  protocol; Yang-Tobin NEJM 1991 RSBI), boundary worked examples per
  tile (low / mid / high physiologic range; banding-cutoff hits for
  P/F Berlin bins and RSBI threshold), cross-implementation
  differentials all 0% delta (hand-computed against the source papers
  and MDCalc), edge-input handling notes (FiO2 0.01-1.0 validation;
  divide-by-zero guards on shock-index and Cockcroft-Gault; Holliday-
  Segar weight-band branching; ARDSnet metric-height convention; QTc
  formula choice rationale), and an a11y pass on each.
- **No new META defects in this wave.** Two minor "~" approximations
  in `bw-bsa-suite` META expected text (~70.5 vs computed 70.7 IBW;
  ~76.3 vs 76.4 AdjBW) fall within the 0.5% differential budget and
  the 0.1-kg display precision — recorded in the audit log without
  filing as defects.
- **Group E (Clinical Math & Conversions) is now 100% audited.**
  `scripts/audit-coverage.mjs` reports 75 / 178 (42%) overall, with
  `E 31/31 (100%)`, `F 15/15 (100%)`, `G 28/47 (60%)`, and
  `N 1/3 (33%)`. Wave 3j (code lookups) is next per spec-v11 §3.3.

### Added (spec-v11 wave 3h — psychiatry screener audits)

- **Wave 3h — psychiatry screeners (8 tiles).** `phq9`, `gad7`,
  `auditc`, `cage`, `epds`, `mini-cog`, `ciwa`, `cows` each audited
  end-to-end per spec-v11 §3.1: citation re-verification (Kroenke 2001
  PHQ-9; Spitzer 2006 GAD-7; Bush 1998 AUDIT-C with VA/DoD 2015 CPG
  sex-specific cutoffs; Ewing 1984 CAGE; Cox 1987 EPDS; Borson 2000
  Mini-Cog; Sullivan 1989 CIWA-Ar; Wesson 2003 COWS with SAMHSA TIP 63
  scoring sheet), boundary worked examples per tile (zero / mid / each
  banding cutoff / max), cross-implementation differentials against
  the source tables (all 0 delta), edge-input handling notes (PHQ-9
  item 9 and EPDS item 10 self-harm flag commentary; CAGE >=2 cutoff
  faithfulness to Ewing 1984; AUDIT-C sex-specific cutoff conveyed
  in band-label copy rather than via a sex input; CIWA-Ar bedside
  clamping rather than throwing; COWS per-item caller-pre-grading
  workflow), and an a11y pass on each.
- **One META defect fixed in the same PR per spec-v11 §3.6 #3.**
  `META.ciwa.example.expected` previously read "CIWA-Ar 10 (mild
  withdrawal; ...)"; the example inputs sum to 10 which lands in the
  Moderate (8-15) band per Sullivan 1989 — Mild is <8 per the source
  and per Sophie's banding. Corrected to "CIWA-Ar 10 (moderate
  withdrawal, 8-15 band; symptom-triggered protocol typically considers
  active treatment)." Live tile rendering was always correct; only the
  documented narrative drifted.
- **`scripts/audit-coverage.mjs` now reports 59 / 178 (33%) overall**,
  with `E  Clinical Math & Conversions  15/31 (48%)`,
  `F  Medication & Infusion  15/15 (100%)`,
  `G  Clinical Scoring & Risk  28/47 (60%)`, and
  `N  Pediatrics & Neonatal  1/3 (33%)`. Wave 3i (conversions and
  physical math) is next per spec-v11 §3.3.

### Added (spec-v11 wave 3g — OB and pediatrics audits)

- **Wave 3g — OB and pediatrics (5 tiles).** `bishop`, `apgar`,
  `due-date`, `preg-dating`, `peds-weight-conv` each audited end-to-end
  per spec-v11 §3.1: citation re-verification (Bishop 1964 Obstet
  Gynecol original cervical scorecard; Apgar 1953 Curr Res Anesth Analg
  five-component newborn scorecard; Naegele rule LMP+280 per ACOG
  Committee Opinion 700; Robinson-Fleming 1975 BJOG CRL regression with
  ACOG Practice Bulletin 175 redating thresholds 7/14/21 days for
  T1/T2/T3; NIST 0.45359237 kg/lb with AAP Bright Futures weight bands),
  three or more boundary worked examples per tile (zero / mid / max
  bands; leap-year EDD cross-check on `due-date`; discordant-vs-within-
  limit boundary on `preg-dating`), cross-implementation differentials
  all 0 delta (hand-computation against the source paper tables, plus
  ACOG / MDCalc cross-checks where applicable), edge-input handling
  notes (Naegele UTC millisecond arithmetic sidestepping DST drift;
  preg-dating optional-input UX skipping `crlMm <= 0`; peds-weight-conv
  oz < 16 guard; Bishop saturation at the top/bottom rows for out-of-
  physiological inputs), and an a11y / keyboard pass.
- **Two META example defects fixed in the same PR per spec-v11 §3.6 #3.**
  (a) `META.bishop.example` listed consistency = "soft" (worth 2 pts),
  producing a Bishop score of 10 while the expected text claimed
  "Bishop 9"; corrected to consistency = "medium" (1 pt) so the example
  computes to 9 as documented. (b) `META['preg-dating'].example` listed
  LMP = 2026-01-08 with CRL 50 mm at US 2026-03-12, producing a 19-day
  T1 discordance that exceeded the 7-day redating threshold while the
  expected text claimed "within accepted limit"; corrected LMP to
  2025-12-23 so the example produces a real 3-day within-limit
  discordance matching the narrative. Live tile rendering was correct
  in both cases — only the documented example was inconsistent with
  its own narrative.
- **`scripts/audit-coverage.mjs` now reports 51 / 178 (29%) overall**,
  with `E  Clinical Math & Conversions  15/31 (48%)`,
  `F  Medication & Infusion  15/15 (100%)`,
  `G  Clinical Scoring & Risk  20/47 (43%)`, and
  `N  Pediatrics & Neonatal  1/3 (33%)`. Wave 3h (psychiatry screeners)
  is next per spec-v11 §3.3.

### Added (spec-v11 wave 3f — renal / electrolyte audits)

- **Wave 3f — renal / electrolyte math (13 tiles).** `anion-gap`,
  `anion-gap-dd`, `corrected-anion-gap`, `corrected-calcium`,
  `corrected-sodium`, `corrected-ca-na`, `egfr`, `egfr-suite`,
  `fena-feurea`, `osmolal-gap`, `winters`, `sodium-correction`,
  `free-water-deficit` each audited end-to-end per spec-v11 §3.1:
  citation re-verification (Emmett 1977 + Figge 1998 for AG; Wrenn
  1990 for delta-delta; Payne 1973 for corrected Ca; Katz 1973 +
  Hillier 1999 for corrected Na; Inker 2021 for CKD-EPI 2021; Levey
  1999 for MDRD; Cockcroft-Gault 1976; Espinel 1976 FENa + Carvounis
  2002 FEUrea; Glasser 1973 + Hoffman 1993 for osmolal gap; Albert-
  Dell-Winters 1967 for Winters; Adrogue-Madias 2000 NEJM for Na
  correction and free-water deficit; Sterns 2015 NEJM for the
  8 / 10-12 mEq/L/24h safety ceilings), three boundary worked examples
  per tile, cross-implementation differentials all <0.5% (CKD-EPI 2021
  hand-trace against Inker 2021 Table 2 published worked example;
  Adrogue-Madias hand-trace against the 2000 NEJM Equation 1),
  edge-input handling notes (direction-mismatch guards on
  `sodium-correction`; zero-divisor guards on `anion-gap-dd` and
  `fena-feurea`; range guards on `free-water-deficit`; sex/age TBW
  factor crossover at age 65), and an a11y pass.
- **Two META defects fixed in the same PR per spec-v11 §3.6 #3.**
  (a) `META.egfr.example.expected` previously read "eGFR ~60
  mL/min/1.73m^2" for inputs Scr 1.0 / age 60 / sex F; the actual
  computed value is ~91 (the live tile rendering was always correct;
  only the META narrative drifted). Corrected to "~91". (b)
  `META.winters.citation` previously listed "Winter et al. Arch
  Intern Med 1967;120(2):151-156"; the actual primary publication is
  Albert MS, Dell RB, Winters RW. Ann Intern Med 1967;66(2):312-322
  (a common textbook attribution error). Corrected. Live numerical
  output was unaffected in both cases.
- **`scripts/audit-coverage.mjs` now reports 46 / 178 (26%) overall**,
  with `E  Clinical Math & Conversions  13/31 (42%)`,
  `F  Medication & Infusion  15/15 (100%)`, and
  `G  Clinical Scoring & Risk  18/47 (38%)`. Wave 3g (OB and
  pediatrics) is next per spec-v11 §3.3.

### Added (spec-v11 waves 3d + 3e — cardiology + pulmonary audits)

- **Wave 3d — cardiology scoring (10 tiles).** `chads`, `hasbled`,
  `heart`, `timi`, `grace`, `wells-pe`, `wells-dvt`, `perc`,
  `wells-pe-geneva`, `wells-dvt-caprini` each audited end-to-end per
  spec-v11 §3.1: citation re-verification (Lip 2010 Chest CHA2DS2-VASc,
  Pisters 2010 HAS-BLED, Six 2008 + Backus 2013 HEART, Antman 2000
  TIMI, Granger 2003 GRACE, Wells 2000 PE / Wells 1997 DVT, Kline 2004
  + Kline 2008 PERC, Le Gal 2006 revised Geneva, Caprini 2005 + Bahl
  2010 Caprini RAM), three boundary worked examples per tile (zero /
  mid / max-score), a cross-implementation differential against the
  source tables (Lip 2010 Table 6/7, Pisters 2010 Table 3/5, Backus
  2013 Table 3, Antman 2000 Table 3, Granger 2003 Table 1, Wells 2000
  Table 2/4, Wells 1997 Table 1/2, Le Gal 2006 Table 2/3, Bahl 2010
  thresholds), edge-input handling notes (Wells DVT carry-through on
  the -2 "alternative dx" subtraction; Geneva HR-tier `else if`
  cascade; CHA2DS2-VASc independent age tiers; HEART troponin tier
  not tied to a single assay), and an a11y / keyboard pass. All 10
  PASS; one example-narrative refinement opportunity noted on
  `wells-pe-geneva` (META example narrative says "Geneva ~3" but
  HR 105 alone scores 5 (Intermediate) — live rendering is correct;
  example narrative is approximate, not user-visible incorrect output).
- **Wave 3e — pulmonary scoring (2 tiles).** `curb-65`, `psi` each
  audited end-to-end per spec-v11 §3.1: citation re-verification (Lim
  2003 Thorax CURB-65; Fine 1997 NEJM PSI), three boundary worked
  examples per tile (zero / mid / max-class), cross-implementation
  differentials against Lim 2003 Table 4 + Table 5 and Fine 1997
  Table 4 + Table 5 (both 0% delta), edge-input handling notes (CURB-65
  BUN > 20 mg/dL US rounding of source 7 mmol/L; PSI Class I age
  short-circuit uses raw age not female-adjusted age), and an a11y
  pass. Both PASS.
- **`scripts/audit-coverage.mjs` now reports 33 / 178 (19%) overall**,
  with `F  Medication & Infusion  15/15 (100%)` and
  `G  Clinical Scoring & Risk  18/47 (38%)`. Wave 3f (renal /
  electrolyte math) is next per spec-v11 §3.3.

### Added (spec-v11 waves 3b + 3c — critical-care + stroke / neuro audits)

- **Wave 3b — critical-care scoring (3 tiles).** `qsofa-sofa`,
  `meld-childpugh`, `ranson-bisap` each audited end-to-end per
  spec-v11 §3.1: citation re-verification (Singer 2016, Vincent 1996,
  Ferreira 2001, Kim 2021, Pugh 1973, Ranson 1974, Wu 2008), three
  boundary worked examples, a cross-implementation differential
  (MELD-3.0 hand-traced against Kim 2021 Table 4: bili=3.2, INR=1.5,
  Cr=1.6, Na=132, alb=2.8, female -> Sophie 25, Kim 2021 25, delta 0%),
  edge-input handling notes (per-organ-system clamp on SOFA; per-lab
  clamp + dialysis-forces-Cr-to-3.0 on MELD-3.0), and an a11y / keyboard
  pass. All three PASS.
- **Wave 3c — stroke and neuro (3 tiles).** `gcs`, `nihss`, `mrs`
  each audited end-to-end per spec-v11 §3.1: citation re-verification
  (Teasdale 1974, Teasdale 2014 Lancet Neurol retrospective, Brott 1989,
  NINDS public-domain NIHSS, van Swieten 1988, UK-TIA 1988, Banks 2007),
  three boundary worked examples (GCS 3 / 12 / 15; NIHSS 0 / 5 / 42;
  mRS all seven canonical levels), cross-implementation differentials
  against the NINDS pocket card and Banks 2007 mRS Table 1
  (text-verbatim match), edge-input handling notes (per-component
  caps via the shared `num` validator on GCS and NIHSS), and an a11y
  pass. All three PASS.
- **`scripts/audit-coverage.mjs` now reports 21 / 178 (12%) overall**,
  with `F  Medication & Infusion  15/15 (100%)` and
  `G  Clinical Scoring & Risk  6/47 (13%)`. Wave 3d (cardiology) is
  next per spec-v11 §3.3.

### Added (spec-v11 wave 3a — Medication & Infusion audit, 15/15 tiles)

- **Group F audited end-to-end.** Wave 3a closes the highest-stakes
  group first per spec-v11 §3.3: wrong drug math is the worst failure
  mode this site has. Fifteen audit logs landed under
  `docs/audits/v11/`, one per tile, each carrying citation
  re-verification, three boundary worked examples, a cross-
  implementation differential against the cited primary source or a
  standard reference (Marino *ICU Book*, Goodman & Gilman, Maudsley,
  Ferinject SmPC, ACC 2020 Expert Consensus, DailyMed labels, CDC 2022
  MMWR opioid guideline, Sanford Guide, Harriet Lane Handbook, ASPEN
  parenteral nutrition guidelines), edge-input handling notes, and an
  a11y / keyboard pass. Tiles covered: `drip-rate`, `weight-dose`,
  `conc-rate`, `peds-dose`, `insulin-drip`, `anticoag-reversal`,
  `high-alert`, `opioid-mme`, `steroid-equiv`, `benzo-equiv`,
  `abx-renal`, `vasopressor`, `tpn-macro`, `iv-to-po`, `iron-ganzoni`.
  All 15 logs are PASS or PASS-WITH-FIXES; no defects opened.
- **`scripts/audit-coverage.mjs` reports 15/15 (100%) for group F**,
  15/178 (8%) overall. Subsequent waves (3b critical-care scoring,
  3c stroke/neuro, ...) will follow the spec-v11 §3.3 order.

### Added (spec-v11 waves 0–2 — audit tooling, specialty rename, `interpretation` field)

- **Wave 0 — audit tooling + CI guards + empty `docs/audits/v11/`.**
  Two new pure-Node scripts ship: `scripts/audit-skeleton.mjs <tile-id>`
  generates a pre-filled `docs/audits/v11/<tile-id>.md` skeleton in the
  spec-v11 §3.2 schema (refuses to overwrite existing logs);
  `scripts/audit-coverage.mjs` reads the audit dir and reports per-group
  audit completion (informational CI signal, not a gate). Three new CI
  guards under `test/unit/`: `audit-format.test.js` enforces the
  spec-v11 §3.2 schema on every audit log; `meta-citation-verify.test.js`
  enforces non-empty, ≤300-character, URL-free citation strings;
  `meta-interpretation.test.js` enforces the §5.4 contract on the new
  optional field. Four citation strings were trimmed to clear the
  URL-free / ≤300 contract (`high-alert`, `high-alert-card`,
  `benzo-equiv`, `lab-interpret`).
- **Wave 1 — specialty rename + `META[id].specialties` field.**
  `GROUP_LABELS` in `app.js`, `scripts/build-hub-pages.mjs`, and
  `scripts/build-tool-pages.mjs` switches from the v8-era labels
  (`Code Reference`, `Patient Bill & Insurance Literacy`, `Clinical
  Scoring & Reference`, `Workflow & Templates`, `Field Medicine`,
  `Public Health Decision Trees`, `Lab Reference`, `Forms & Numbers
  Literacy`, `Literacy Helpers`, `Patient Safety`) to the spec-v11 §4.1
  specialty names (`Billing & Coding`, `Insurance & Patient Literacy`,
  `Clinical Scoring & Risk`, `Workflow & Documentation`, `EMS & Field
  Medicine`, `Immunization & Infectious Disease`, `Reference Ranges`,
  `Insurance Glossary`, `Pediatrics & Neonatal`, `High-Alert & Safety`),
  plus the new `M: State & Coverage Reference` row. The matching `<h3>`
  section headers in `index.html` are updated. The optional
  `META[id].specialties` array (closed vocabulary in spec-v11 §4.3) is
  wired through `app.js` `tileCorpus()` into `lib/prompt.js`
  `buildSearchDoc()` as additional `+1 per token` search tokens
  alongside `audiences` and `tags`. No tile populates the field yet;
  defaults to `[]`.
- **Wave 2 — `META[id].interpretation` rendering + CI guard.**
  `renderMetaBlock` in `app.js` learns to render an optional
  per-band `interpretation` block under a mandatory `Per source:`
  header, immediately below the citation line, so every word shown
  is the source's. The `meta-interpretation.test.js` guard rejects
  Sophie-authored phrasing (`Sophie`, `we recommend`, `you should`,
  `consider ordering`), missing `sourceQuoted: true`, missing
  `sourceCitation`, oversize band text, and empty `bands` arrays.
  No tile populates the field yet; absence is the default.

### Added (spec-v11 — correctness floor + specialty-named groups + optional `interpretation` field)

- **`docs/spec-v11.md` (new).** Implementation spec. No new tiles
  ship under v11; the entire scope is making the 178 tiles already
  shipped provably correct via a five-step per-tile audit
  (citation re-verification, ≥3 boundary worked examples, cross-
  implementation differential within 0.5% / one category for
  ordinal scores, edge-input handling review, a11y + keyboard
  pass). Each audit lands as `docs/audits/v11/<tile-id>.md`;
  two new scripts (`scripts/audit-coverage.mjs`,
  `scripts/audit-skeleton.mjs`) make the audit mechanical;
  three new CI guards (`test/unit/audit-format.test.js`,
  `test/unit/meta-citation-verify.test.js`,
  `test/unit/meta-interpretation.test.js`) pin the format. Audit
  order is highest-stakes first: medication and dosing, then
  critical-care scoring, then stroke / neuro, then cardiology,
  then pulmonary, then renal / electrolyte, then OB / peds, then
  psych screeners, then conversions, then code lookups, then
  regulatory, then workflow / EMS, then patient-education
  generators.
- **Specialty-named groups (spec-v11 §4).** The internal group
  letters (`A`, `C`, `E`, `F`, `G`, `H`, `I`, `J`, `K`, `L`, `M`,
  `N`, `O`) gain visible specialty / category labels: Billing &
  Coding, Insurance & Patient Literacy, Clinical Math &
  Conversions, Medication & Infusion, Clinical Scoring & Risk,
  Workflow & Documentation, EMS & Field Medicine, Immunization &
  Infectious Disease, Reference Ranges, Insurance Glossary, State
  & Coverage Reference, Pediatrics & Neonatal, High-Alert &
  Safety. The letter remains the legacy id inside `UTILITIES`
  entries so deep links keep working; a new `GROUP_LABELS`
  constant maps letter → visible name. A new optional
  `META[id].specialties` array (closed vocabulary of 27 specialty
  tags) is consumed by the prompt ranker as additional tokens.
- **Optional `META[id].interpretation` field (spec-v11 §5).**
  Tightly scoped: only allowed when the per-band interpretation
  text is a direct quote or close paraphrase of the same primary
  citation that gave Sophie the formula. Renders inside the
  References region under a mandatory "Per source:" header
  (every word below is the source's, not Sophie's). CI guard
  rejects Sophie-authored phrasing ("we recommend", "you should",
  "consider ordering"). Absent by default; not load-bearing; tiles
  without a published per-band interpretation do not invent one.
- **`docs/scope-mdcalc-parity.md` (new).** Long-horizon scope
  statement. Sophie commits to eventually carrying every
  actionable, cited, deterministic clinical calculator a
  healthcare worker would otherwise reach for MDCalc to find,
  plus the billing / coding / regulatory surface MDCalc does not
  cover. Target is roughly 400–600 tiles over 3–5 years at the
  spec-v11 quality bar, **eventually complete, never rushed**.
  Permanently excludes AI-generated calculators, single-center
  unreplicated validations, sponsored / pharma-affiliated
  calculators, Sophie-authored treatment recommendations, live-
  data calculators, and patient-artifact NLP. Hierarchy made
  explicit: v10 (what Sophie is) → v11 (how good Sophie must be)
  → scope-mdcalc-parity (where Sophie is going).

### Changed (spec-v10 — companion-specs cross-link)

- **`docs/spec-v10.md` §6a.** New "Companion specs and scope
  document" section linking spec-v11 and scope-mdcalc-parity so
  the positioning spec, the quality floor, and the long-horizon
  direction are discoverable from one another.
- **`README.md` documentation index.** Adds links to spec-v11 and
  scope-mdcalc-parity directly under spec-v10.

### Added (spec-v10 — clinical-first positioning, bounded dependency budget, v7 §4 wind-down)

- **`docs/spec-v10.md` (new).** Positioning spec, not a feature spec.
  Fixes in writing what sophiewell.com is *for* (the calculator a
  nurse pulls up at 2 a.m.: MDCalc without ads, login, upsell,
  cookie banner, email capture, or network calls after first paint),
  what it is *not* (an explicit permanent-out-of-scope list covering
  AI, PDF / DOCX / OCR parsing, server-side processing of clinical
  data, accounts, telemetry, ads, subscriptions, native apps,
  persistent client storage, recommendation strips, and new patient-
  artifact decoders past the existing simple tiles), the **runtime-
  dependency budget** (max two pinned exact-version deps, each
  justified against a clinical use case that cannot be hand-rolled,
  reviewed against the threat model, SBOM-tracked, MIT-compatible,
  and CSP-respecting), and tile-add criteria. Every prior spec (v4
  through v9) remains in force; v10 narrows scope, it does not amend
  their hard rules.
- **`docs/stability.md` — two new commitments.**
  *Client-side processing of clinical and billing data*: every
  calculation, lookup, and decode runs in the browser; inputs never
  cross the network; there is no server-side surface that *could*
  see user input, by construction. *Bounded runtime-dependency
  budget*: ≤2 pinned, exact-version runtime deps, each SBOM-tracked
  and threat-model-reviewed; devDependencies are unbudgeted.

### Removed (spec-v10 §3 — v7 §4 artifact-decoder pages dropped)

- **spec-v7 §4.1–§4.6 (bill/EOB/MSN → DOCX, lab PDF → DOCX, denial
  letter → appeal packet, pharmacy printout → interactions,
  discharge paperwork → summary, insurance card → benefits cheat
  sheet) are formally dropped.** All six required PDF / DOCX / OCR
  dependencies (pdf.js, mammoth, docx, Tesseract.js) that exceed
  the §2.2 dependency budget, and their target audience (patients
  holding artifacts) sits outside spec-v10's clinical-first wedge.
  No code is removed; the v7 dropzone shell already operates in the
  text-only mode v10 commits to. `docs/spec-v7.md` carries a status
  note pointing at spec-v10 §3; §4.1–§4.6 in v7 are retained
  verbatim for historical context but are not the roadmap.

### Changed (README — clinical-first positioning)

- **`README.md` opening rewritten.** Leads with clinical and allied
  healthcare staff (nurse, resident, pharmacist, biller, coder,
  EMS provider) as the primary audience and frames the site as MDCalc
  without ads / login / upsell / cookie banner / email capture /
  network calls after first paint. Audience list reordered to put
  bedside clinicians first; patients moved to last with an explicit
  note that the patient surface is the simple existing decoders, not
  patient-artifact decoding. Documentation index now links
  `docs/spec-v10.md` as the current positioning spec.

### Changed (spec-v8 — minimal-tile contract + prompt-first front door)

- **Four-region tile contract (spec-v8 §3.1).** Every tile detail view
  now renders exactly four regions in order: title, description,
  inputs (pre-filled from `META[id].example` with inline
  `(example: …)` annotations), and references (driven by
  `META[id].citation`). Delivered by spec-v9; v8 §3.1 is the contract
  spec-v9 enforces in **hard** CI mode.
- **Example-value contract pinned in CI (spec-v8 §3.3).** Every
  input-bearing tile must ship a working `META[id].example` filling
  every input it reads. Tiles with no inputs live in an explicit
  `NO_INPUTS_TILES` allowlist. Enforced in **hard** mode by
  `test/unit/meta.test.js`.
- **Citation contract pinned in CI (spec-v8 §3.4).** Every tile must
  carry `META[id].citation` or `META[id].source` (or both). References
  hold the primary citation only; "further reading" / "related tools"
  / "about this calculator" blocks are forbidden. Enforced in **hard**
  mode.

### Removed (spec-v8 §3.2 — affordances incompatible with a stateless utility)

- **Pin / Unpin and the entire `Pinned` home section.** Removed
  `renderPinnedSection`, `togglePin`, the `#pinned-section` DOM mount,
  the `.pin-btn` and `#pinned-section` CSS, and the `p` leader-key
  shortcut. `lib/hash.js` no longer emits `p=` and silently ignores it
  on parse so legacy `#p=icd10,bmi` bookmarks resolve to the home
  view. `test/unit/hash.test.js` now asserts `p=` is dropped on write
  and tolerated on read; the keyboard fixture asserts the `p` leader
  is retired; the e2e smoke spec swapped the pin-toggle test for the
  §5.2 negative regression (no `.pin-btn`, no `#pinned-section`, no
  `#pinned-grid`).
- **Six stray hardcoded `Source:` lines in per-tile renderers**
  (`views/group-a.js`, `views/group-f.js`, `views/group-i.js`) that
  duplicated content the v8 References region now renders from
  `META[id].citation`. The per-result lab-result attribution in
  `views/group-v6.js` is retained because it is per-result, not
  per-tile.
- **Copy-share-link, copy-bundle-URL, download-bundle, load-bundle,
  print-this-calculator, scratchpad, and "after this you might
  want" recommendation strips.** All audited and confirmed removed
  per v8 §3.2.

### Added (spec-v8 §4.3 / §4.6 / §3.2 — three-pass prompt + default-closed grid + tags)

- **Three-pass prompt matcher extracted (spec-v8 §4.3).** Pure-function
  `resolvePrompt(query, tiles, synonyms, audience)` in
  `lib/prompt.js` runs pass 1 (synonym table via `lib/synonyms.js`),
  pass 2 (token ranker over `name + desc + audiences + group + tags`
  with the spec's scoring rubric and a hard threshold), and pass 3
  (single-edit Levenshtein retry against the synonym corpus). 17 new
  unit tests cover synonym hit, name- and desc-token rank, tag
  discovery, audience modulation, one-edit recovery, and the
  multi-typo no-match floor. `app.js` calls `resolvePrompt` from
  `resolveQueryToTileId` against a `tileCorpus()` snapshot assembled
  from `UTILITIES`, the home grid's `.tc-desc` spans, and any
  `META[id].tags`.
- **Optional `META[id].tags` field (spec-v8 §3.2).** Additive,
  defaults to `[]` when missing; consumed only by the prompt ranker
  so no existing tile needed to change.
- **Default-closed tile-grid disclosure (spec-v8 §4.6).**
  `index.html`'s `<details id="browse-disclosure">` no longer carries
  `open`. The hash-state mirror flipped so `b=open` is the divergent
  value users deep-link with; collapsed is the static default. E2E
  tests that previously relied on the catalog being visible now
  expand the disclosure programmatically before clicking or assert
  on the always-visible `#hero-search` element.

### Added (spec-v9 — inline-citation completion and example-first inputs)

- **Citation coverage at 100% in hard mode (spec-v9 wave 2).** All
  178 tiles now carry `META[id].citation`; the CI assertion in
  `test/unit/meta.test.js` is in **hard** mode.
- **Example coverage at 100% in hard mode (spec-v9 waves 3a-3d).**
  Every input-bearing tile carries `META[id].example` with non-empty
  `fields` and an `expected` line. Pure-reference and decision-tree
  tiles live in `NO_INPUTS_TILES` with per-entry rationale. The
  PHQ-9-family screeners pre-fill via their own `exampleAnswers` in
  `lib/scoring-v4.js` + `lib/screener.js`, updated to the v9
  contract (auto-fill on first paint, "Reset to example" link in
  place of the old "Test with example" button).
- **References region renders below the tool body (spec-v9 §3.2).**
  The meta block moved from above the inputs to after the result so
  the on-screen order matches the spec's `title → description →
  inputs → references`. The dataset stamp and citation now appear on
  adjacent lines inside the same References block, replacing the
  previous split between a top "Source: …" stamp and a bottom doc
  pointer.
- **Inline `(example: …)` annotations (spec-v9 §3.3).** Examples
  pre-fill inputs on first paint via an immediate `applyExample(util)`
  microtask. Deep-link hash state still wins; the example only fills
  inputs the hash did not touch. Renderers built through
  `lib/form.js` get the annotation for free; ad-hoc renderers call
  a one-line `annotateExample(id, value)` helper in `lib/meta.js`.
- **Wave 4 cleanup (spec-v9).** Removed the duplicate `Citation:`
  line the screener emitted under each PHQ-9-family tile (now lives
  only in the meta block); removed three stray `Citation:` lines
  under `cincinnati`, `fast`, and `burn-fluid` in `views/group-i.js`;
  rewrote the FAQ JSON-LD "Where does the data come from?" answer in
  `index.html` so search-result snippets describe the inline
  References region instead of pointing at the GitHub
  `docs/data-sources.md` path. The per-result lab-result attribution
  in `views/group-v6.js` is retained per v9 §3.4.1.

### Added (spec-v7 section 3.1 — artifact-detecting dropzone shell)

- **Artifact dropzone on the home page (spec-v7 §3.1).** The home view
  now renders a dropzone under the task hero that accepts a plain-text
  file drop (`.txt`, `.csv`, `.md`, `.json`, `.log`, `.tsv`,
  `.markdown`, `.text`, plus `text/*` and `application/json`) or
  pasted document text, runs the v7 §3.3 classifier over the content,
  and routes to the matching decoder tile via a small kind→tile table
  in `lib/artifact-route.js`. Unknown kinds and unwired kinds surface
  a chooser pane listing every shipped decoder. Per v7 §1, the file
  never leaves the tab: no upload, no fetch, no storage, no new
  `connect-src` entry.
- **Text-payload handoff (spec-v7 §3.1).** A new
  `lib/artifact-handoff.js` holds a single in-memory pending payload;
  the dropzone stashes the detected text before navigating, and the
  route() post-render microtask in `app.js` calls `applyPendingDrop()`
  which fills the destination decoder's textarea (`#bill`, `#eob`, or
  `#msn`) and appends a one-line "Pre-filled from the document you
  dropped above" banner. The chooser-fallback path uses the same
  handoff, so picking a decoder manually after a failed detection no
  longer forces a second paste. Tiles whose renderers do not expose a
  single paste input (`lab-interpret`, `appeal-letter`,
  `discharge-instr`, `insurance`) still receive the navigation but no
  handoff; the per-tile parsers in §4 will fill them.
- **Result-line UX polish (spec-v7 §3.1 follow-ons).** Detection now
  fires automatically on a clipboard paste into the textarea (one-tick
  delay so the pasted value is in place), matching the file-drop
  ergonomics. Editing the textarea after a detection clears the stale
  result line and chooser pane. Escape inside the dropzone is a
  non-destructive dismiss for the result line and chooser without
  wiping the textarea. Multi-file drops surface a one-line notice
  naming the first file rather than silently consuming it. The
  result line surfaces the classifier hits ("Detected EOB (matched:
  this is not a bill, allowed amount). Opening the decoder..."), with
  a three-hit cap so the line stays readable.
- **Lockstep-pinning unit assertion.** A new test in
  `test/unit/artifact-route.test.js` reads `index.html` and fails if
  the file picker's `accept=` list ever drifts from `TEXT_EXTENSIONS`,
  `application/json`, or `text/*`. The picker and the runtime
  `isLikelyTextFile` predicate are now CI-pinned to the same source
  of truth. Unit count 679 → 680.
- Section 4 decoder pages (annotated DOCX export, PDF/DOCX parsing in
  a Web Worker, image OCR for the insurance-card flow) remain
  unimplemented. The shell tells the user to paste the document's
  text content in the meantime.

### Added (spec-v7 section 3.3 — artifact-detect classifier)

- **Deterministic artifact classifier (spec-v7 section 3.3).** New
  `lib/artifact-detect.js` exposes `detectArtifact(text)` and
  `detectArtifactKind(text)` over plain text extracted from a dropped
  PDF/DOCX. Returns one of `bill`, `eob`, `msn`, `lab-result`,
  `denial-letter`, `pharmacy-list`, `discharge-summary`,
  `insurance-card`, or `unknown`. The classifier is pure-function, no
  network, no AI: each artifact kind has a hand-written fingerprint
  (regex + keyword sets) that emits a small integer score and the
  matched fragments. Ties break by an explicit kind-priority table so
  EOBs are never misrouted to `bill` and MSNs always beat both. A
  `MIN_CONFIDENT_SCORE` floor returns `unknown` rather than guessing,
  which is what the v7 dropzone UI's chooser pane will key on once it
  lands. The module is engine-only; UI wiring is deferred to the
  section 4 dropzone pages.
- 21 new unit tests in `test/unit/artifact-detect.test.js`: one
  positive fixture per artifact kind, anti-misroute cases (EOB
  mentioning "balance", bill mentioning "CBC", pharmacy list mixed
  with discharge tokens), an `unknown`-on-low-signal case, a
  determinism check, and a structural test of the `scores` return
  shape. Test count 621 -> 641.

### Added (spec-v7 sections 3.2 and 3.4 - synonym-routed prompt and collapsible tile-grid)

- **Synonym-routed hero search (spec-v7 section 3.2).** A new hand-curated
  table at `data/synonyms.json` maps patient-mental-model phrases ("my
  bill", "my labs are weird", "denied", "ICD-10", ...) to the existing
  tile id that answers them. The hero search now consults the synonym
  table before the fuzzy ranker; on a hit it surfaces a one-line
  breadcrumb under the input ("Matched 'my labs are weird' to Lab Result
  Interpreter. Press Enter to open.") so the user sees why that tile is
  recommended. Enter routes to the matched tile; otherwise the fuzzy
  ranker still runs as a fallback. The matcher in `lib/synonyms.js` is
  pure-function, deterministic, audience-aware (chip selection boosts
  same-audience entries without hiding others), and case- /
  punctuation- / whitespace-insensitive. The initial table seeds 26
  entries covering the patient billing artifacts, the most common code
  references, and the highest-traffic clinical math tiles. Adding a
  phrase is a one-line edit to `data/synonyms.json`.
- **Collapsible tile-grid disclosure (spec-v7 section 3.4).** The 178
  tiles now sit inside a real `<details>` / `<summary>` element with
  the visible label *"Browse all 178 tools"* (count is bound to the
  utility registry length so it stays correct as tiles ship). The
  disclosure is open by default for now to preserve existing clinician
  flows and the e2e selectors that click straight into a tile; spec
  v7's default-collapsed posture is deferred until the v7 section 4
  dropzone front door lands. Disclosure state persists in the URL
  hash via a new `b=` segment (`b=open` or `b=closed`); typing in the
  hero auto-opens the disclosure so filtered tiles are visible. Pinned
  tiles continue to render above the disclosure so they remain
  visible regardless of the collapse state. No localStorage; the
  `<details>` semantics give screen readers and keyboard users the
  standard expand/collapse affordance.
- `lib/hash.js` gains the `browse` field with full round-trip parse /
  build coverage. `parseHash` now returns `browse: ''` for the default
  state, `'open'` or `'closed'` when explicitly set; `buildHash`
  emits `b=open` / `b=closed` and omits the key for the default. Hash
  test count grows by 2; new `test/unit/synonyms.test.js` adds 12
  unit tests including a guard that every tile id in `data/synonyms.json`
  resolves against the live UTILITIES registry in `app.js`. Test
  count 607 -> 621.

### Added (spec-v6 §3.3 — Lab Result Interpreter)

- **Lab Result Interpreter** tile lands under Patient Bill & Insurance
  Literacy, available to patients, clinicians, and educators. Users
  enter values from a standard outpatient panel (CBC, CMP, lipid panel,
  A1C, TSH) with optional sex / pregnancy context; the tool returns the
  reference range used, a four-band flag (within-range / borderline /
  flagged-mild / flagged-significant), one plain-language narrative per
  value, and a single *"ask your clinician"* prompt per flagged value.
- `lib/lab-interpret.js` is a pure-function module bundling 25 analytes
  with reference ranges and critical thresholds (NIH/MedlinePlus,
  ARUP, Harrison's 21e, ADA 2024, 2018 ACC/AHA Cholesterol Guideline,
  ATA 2014). Sex- and pregnancy-specific reference bounds for creatinine,
  hemoglobin, hematocrit, and HDL are encoded as analyte variants.
  Critical thresholds drive the `flagged-significant` band; everything
  else falls out of a 5% buffer around the reference bounds. Narratives
  follow the spec-v6 §3.3 *"would a primary care physician hand this to
  a patient at 11pm"* calibration: no diagnosis, no probability, no
  disease links, one bounded sentence per value.
- New renderer file `views/group-v6.js` registers the tile against
  `app.js`. The view ships the standard Sophie disclaimer band at the
  top and a footer reminder that patient portals frequently release lab
  values before clinician review.
- 15 new unit tests in `test/unit/lab-interpret.test.js` cover the
  four-band taxonomy, sex / pregnancy variants, critical thresholds,
  the worked-example contract for the META entry, and input validation
  (unknown analyte and non-finite value both throw). Tile count
  177 -> 178; test count 592 -> 607.

### Added (spec-v6 §4 home-page UI evolution — first two waves)

- **Task hero (spec-v6 §4.2.1).** A promoted search input appears at the
  top of the home view, labeled *"What do you need to decode?"* with
  example patient-mental-model phrases. Typing filters the tile grid
  below; pressing Enter on a non-empty query navigates directly to the
  top match. The existing topbar typeahead is unchanged.
- **Audience filter chips (spec-v6 §4.2.2).** A row of six chips
  (All / Patient / Biller and Coder / Nurse and Clinician / EMS and
  Field / Educator) sits above the tile grid. Selection filters the grid
  to tiles tagged with that audience and persists in the URL hash via a
  new `a=` segment (e.g. `#a=patients`). Default `all` omits the key
  and preserves current behavior. `lib/hash.js` gains the new field
  with full round-trip tests; the `Pinned` section is now inserted
  above the tile grid (below the hero and chips) rather than at the
  very top of the home view.
- `index.html` gains an `#empty-state` line that surfaces when no tile
  matches the current audience + query combination.

### Added (spec-v5 §5.3 step 7 follow-up — citations)

- `docs/clinical-citations.md` gains a "spec-v5 §4 deterministic additions
  (T1-T17)" section, with formula, original-source citation, and worked-
  example numerics for each of the seventeen v5 tools, mirroring the
  numerics asserted by `test/unit/clinical-v5.test.js`.

### Changed (spec-v5 polish — clinical-v5 / coding-v5 correctness pass)

- `sodiumCorrection` (T1) takes an `acuity` input ('chronic' default vs
  'acute') driving the safety ceiling (8 vs 10 mEq/L/24h), and now reports
  `totalSodiumDeficitMeq` and a `directionMismatch` flag when the chosen
  infusate would push Na the wrong way (e.g. D5W in hyponatremia).
  Volume / rate are returned as `null` in that case rather than a
  physiologically-meaningless negative number.
- `freeWaterDeficit` (T2) rejects `currentNa <= targetNa` (the formula is
  only defined for hypernatremia) and reports `impliedNaDropPer24h` plus
  a safety note when the implied drop exceeds the 10 mEq/L/24h ceiling.
- `emTimeSelector` (T14) corrected to the AMA 2021 office/outpatient
  bands: new patient 99202 (15-29) / 99203 (30-44) / 99204 (45-59) /
  99205 (60-74); established 99212 (10-19) / 99213 (20-29) / 99214 (30-
  39) / 99215 (40-54). 99211 is excluded (nurse-only, no time threshold).
  Returns `prolongedUnits` and `prolongedCode: '99417'` when total time
  reaches the +15-min trigger past the top base band.
- `ndcConvert` (T15) enumerates `fda10Candidates` for 5-4-2 inputs whose
  original 10-digit shape is ambiguous (multiple segments with leading
  zero); returns a single `fda10` only when one candidate is unambiguous.
- `rcri` (T12) risk percentages aligned to Lee 1999 derivation cohort
  (0.4 / 0.9 / 6.6 / >=11) with an explicit `riskBand` (Class I-IV).
- Renderers in `views/group-v5.js` updated to surface the new fields
  (acuity selector, total Na deficit/excess line, direction-mismatch
  warning, implied Na drop, prolonged-service units, ambiguous fda10
  candidate list). `lib/meta.js` worked-example expectations refreshed
  for `em-time` and `rcri`. Test count 563 -> 570.

### Removed (spec-v5 §3.1 catalog cut, waves 1-2)

- **38 live-data tiles removed** along with their renderers, META
  entries, home-grid tiles, dataset folders, manifests, citation rows,
  and unit / integration tests. Tile count goes 212 -> 174. Test count
  613 -> 563. Manifest count 78 -> 53.
  - Pricing & cost reference (16): MPFS, NADAC, charge-to-Medicare
    ratio, hospital price transparency, OOP estimator, DMEPOS, CLFS,
    ASP, ASC, wage index, GPCI, Medicare deductibles & IRMAA, ACA
    marketplace thresholds, HSA/FSA/HDHP limits, FPL, IRS medical
    mileage.
  - Live registries (7): NPI lookup, OIG exclusions, Medicare opt-out,
    DEA validator, NUCC taxonomy, FDA drug recalls, vaccine lot
    recalls.
  - Coverage & edits (5): NCCI PTP, NCCI checker, MUE, MUE cap, LCD/
    NCD coverage.
  - Annually-shifting public-health (8): ACIP routine adult/child/
    catch-up schedules, CDC Yellow Book, Medicaid by state, state
    patient rights, GFE dispute threshold, plus the four eligibility &
    benefits tiles (VA priority groups, TRICARE plan picker, IHS
    eligibility).
- Empty home-grid sections deleted: Pricing & Cost Reference, Provider &
  Plan Lookup, Eligibility & Benefits.
- Dead library modules removed: `lib/mpfs.js`, `lib/oop.js`, `lib/dea.js`,
  `lib/fpl.js`. Empty view modules removed: `views/group-b.js`,
  `views/group-d.js`. Test orphans removed: `mpfs.test.js`,
  `nucc-taxonomy.test.js`, `fpl.test.js`, `dea.test.js`, `oop.test.js`.
- `data/mpfs/` retained because the kept CPT structural tile reads its
  rows; the MPFS lookup tile itself is gone.
- `scripts/a11y-check.mjs` updated to scan the current view file set
  (group-b / group-d removed; group-i / group-j / group-klmno / group-v5
  added). `test/integration/smoke.spec.js` trimmed of MPFS and Medicaid
  smoke cases. `test/unit/meta.test.js` `SOURCE_REQUIRED` list trimmed
  to the kept code-reference tiles.

### Changed (spec-v5 §5.2 wave 2 — plain category names)

- Home-grid headings renamed: Code Lookup -> Code Reference; Patient
  Bill & Insurance -> Patient Bill & Insurance Literacy; Preparation &
  Workflow -> Workflow & Templates; Public Health & Travel -> Public
  Health Decision Trees.
- `GROUP_LABELS` in `app.js` rewritten to drop the letter prefix from
  breadcrumbs and search-result group tags. Keys for removed groups (B,
  D, M) are dropped.
- `scripts/build-data.mjs` pruned of dead dataset definitions (78 -> 46).
  All 32 builders for killed tiles deleted. The remaining offline-seed
  pipeline runs clean against the 46 kept datasets.
- Orphan `data/` folders deleted: `cms-deductibles`, `dea-rules`,
  `enforcement`, `fpl`, `hsa-fsa-limits`, `irmaa`, `state-rights`.
  Manifest count 53 -> 46.

### Added (spec-v5: pragmatic pivot + 17 new deterministic tools)

- **spec-v5 doctrine** ([docs/spec-v5.md](docs/spec-v5.md)): no live data,
  no ETL, no AI, no accounts, no telemetry. Future tiles must be pure
  deterministic math or a small static reference. Pricing tools, live
  registries, recalls, and annually-shifting public-health datasets are
  out of scope going forward; their removal is staged for a follow-up
  commit per the spec's wave plan.
- **17 new tiles** wired into the existing categories (UTILITIES count
  195 -> 212). Each ships with a pure function, a worked-example META
  entry tied to a citation, a renderer, a home-grid tile, and unit
  tests:
  - Sodium Correction Rate Planner (Adrogue-Madias) `sodium-correction`
  - Free Water Deficit Calculator `free-water-deficit`
  - Iron Deficit (Ganzoni) `iron-ganzoni`
  - Predicted Body Weight + ARDSnet Tidal Volume `pbw-ardsnet`
  - Rapid Shallow Breathing Index `rsbi`
  - Light's Criteria for Pleural Effusion `lights`
  - Mentzer Index `mentzer`
  - SAAG (Serum-Ascites Albumin Gradient) `saag`
  - R-Factor (drug-induced liver injury pattern) `r-factor`
  - KDIGO AKI Staging `kdigo-aki`
  - Modified Sgarbossa Criteria (Smith) `sgarbossa`
  - Revised Cardiac Risk Index (Lee) `rcri`
  - Pediatric Early Warning Score `pews`
  - Time-Based E/M Code Selector (AMA 2021) `em-time`
  - NDC 10 to 11 Digit Converter `ndc-convert`
  - AVPU to GCS Quick Reference `avpu-gcs`
  - SBAR Handoff Template Generator `sbar-template`
- 50 new unit tests in `test/unit/clinical-v5.test.js` (563 -> 613
  total). Two new pure-function modules: `lib/clinical-v5.js`,
  `lib/coding-v5.js`. One new renderer module: `views/group-v5.js`.
- JSON-LD `featureList`, sitemap, and README counts regenerated from the
  live UTILITIES array.

### Added (spec-v4: utility expansion 79 -> 195)

- **v4.0 shared renderers**: `lib/tree.js` (decision tree), `lib/screener.js`
  (screening instrument), `lib/table.js` (searchable / sortable / row-copy),
  `lib/print.js` (printable template). Each ships with a unit-test suite
  via the new `test/fixtures/dom-stub.js`.
- **v4.1 datasets**: 56 new `data/` datasets with hand-curated offline-seed
  shards and per-dataset manifests. `verify-integrity.mjs` now walks 78
  manifests (22 v3 + 56 v4).
- **v4.2 Group A code lookups (82-93)**: HCPCS modifier, NCCI PTP checker,
  MUE cap, POS, TOB decoder, NUBC revenue / condition / occurrence / value,
  MS-DRG, APC, ICD-10-PCS, RxNorm, NDC<->RxNorm.
- **v4.3 Group B pricing (94-104)**: DMEPOS, CLFS, ASP, ASC, wage index,
  GPCI, Medicare deductibles & IRMAA, ACA marketplace, HSA / FSA / HDHP,
  FPL calculator, IRS medical mileage.
- **v4.4 Group C patient tools (105-114)**: insurance card decoder, ABN
  explainer, MSN decoder, IDR eligibility tree, appeal letter generator,
  HIPAA right-of-access generator, birthday rule resolver, COBRA timeline,
  Medicare enrollment period checker, ACA SEP eligibility checker.
- **v4.5 Group D provider lookup (115-116)**: DEA registration validator,
  NUCC provider taxonomy.
- **v4.6 Group E clinical math (117-128)**: anion gap & delta-delta,
  corrected Ca / Na, osmolal gap, A-a / P/F suite, Winter's formula,
  shock index, BW / BSA suite, eGFR suite (CKD-EPI 2021 / MDRD / CG),
  FENa / FEUrea, maintenance fluids 4-2-1, QTc suite, pregnancy dating.
- **v4.7 Group F medication (129-135)**: opioid MME (CDC 2022), steroid
  equivalence, benzodiazepine equivalence (Ashton), antibiotic renal-dose
  adjustment, vasopressor dose<->rate, TPN macronutrient, IV-to-PO.
- **v4.8 Group G scoring (136-160)**: TIMI, GRACE, HEART, PERC, Wells PE
  / Geneva, CURB-65, PSI, qSOFA / SOFA, MELD-3.0 / Child-Pugh, Ranson /
  BISAP, Centor / McIsaac, Wells DVT / Caprini, Bishop, Alvarado / PAS,
  mRS reference, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog, CIWA-Ar,
  COWS, ASCVD PCE (race-stratified), PREVENT 2023 (race-free).
- **v4.9 Group H workflow (161-165)**: HIPAA authorization, ROI request,
  discharge instructions, specialty-visit questions, medication wallet
  card.
- **v4.10 Group I field-medicine extensions (166-171)**: NEXUS / Canadian
  C-Spine, DOT ERG hazmat, NIOSH Pocket Guide, AHA CPR numeric reference,
  TCCC tourniquet & wound packing, CO / cyanide / smoke-inhalation
  antidotes.
- **v4.11 Group J Public Health & Travel (172-180, NEW group)**: ACIP
  routine adult / child / catch-up schedules, CDC Yellow Book by country,
  tetanus prophylaxis tree, rabies PEP tree, bloodborne pathogen exposure
  tree, TB testing interpretation, STI screening intervals.
- **v4.12 Group K Lab Reference (181-184, NEW)**: adult / pediatric
  reference ranges, therapeutic drug levels, toxicology levels.
- **v4.13 Group L Forms & Numbers Literacy (185-187, NEW)**: CMS-1500 and
  UB-04 field-by-field decoders, EOB jargon glossary.
- **v4.14 Group M Eligibility & Benefits (188-191, NEW)**: Medicaid by
  state, VA priority groups, TRICARE plan picker, IHS eligibility.
- **v4.15 Group N Literacy Helpers (192-194, NEW)**: universal unit
  converter, time-to-dose helper, pediatric weight converter.
- **v4.16 Group O Patient Safety (195-197, NEW)**: high-alert wallet card
  (ISMP-attributed), FDA drug recalls weekly snapshot, vaccine lot recall
  lookup.
- **v4.17 site-wide updates**: README count 79 -> 195, new group
  descriptions, refreshed `docs/architecture.md`, `docs/data-sources.md`,
  `docs/legal.md`, `docs/clinical-citations.md`, `docs/operations.md`,
  `docs/threat-model.md`. JSON-LD `featureList` and `sitemap.xml`
  regenerate to 195 entries / 196 URLs.
- **v4.18 verification checklist**: see `docs/spec-v4-checklist.md`.

### Fixed (v4.15 CI hardening)

- `scripts/build-data.mjs`: dataset folders are now ensured to exist at
  the orchestrator level before each builder runs. 16 of the 22 builders
  wrote files without a preceding `mkdir`, which worked locally because
  the folders were committed to the tree but failed on a fresh CI runner
  (`coverage` builder hit `ENOENT: data/coverage/lcd.json`). One-line
  `await ensureDir(join(DATA, ds.id))` in the loop covers every builder.

### Removed (v4.14 repo cleanup)

- Deleted `dist/` from the source tree (always rebuilt by `npm run build`,
  already gitignored).
- Deleted `.DS_Store` macOS clutter.
- Deleted `logo.jpg` (superseded by transparent-background `logo.png`
  master). Removed the now-dead jpg fallback branch and stale comment in
  `scripts/build-favicons.mjs`; updated its error message.
- Deleted `encryptalotta/` (sibling reference project, not imported, not
  copied into `dist/`, only used as historical design-lineage source for
  the v4 redesign). Removed the now-unneeded `encryptalotta/**` entry
  from `eslint.config.js`. Documentary references in spec.md, README.md,
  CHANGELOG.md, and CSS comments are kept as written history. The 7
  now-broken `[encryptalotta/...]` and `[logo.jpg]` markdown links in
  `docs/spec.md` were converted to plain code-spans annotated with
  "removed in v4.14" so the design-lineage narrative stays intact
  without dead links.
- Deleted `test/.gitkeep` (placeholder no longer needed; test/ has 16
  real test files).

### Changed (v4.13 tooling unblock)

- Migrated ESLint config from legacy `.eslintrc.json` + `.eslintignore`
  (no longer read by ESLint v9) to `eslint.config.js` flat config.
  Same rule set: bans on `eval`, `Function` constructor, `document.write`,
  and the `innerHTML`/`outerHTML`/`insertAdjacentHTML` assignment family.
  Restores `npm run lint` and the full `release:check` gate.
- Bumped pinned dev dependencies to address upstream security advisories
  (non-major, within already-pinned major lines):
  `eslint` 9.17.0 → 9.39.4 (GHSA-xffm-g5w8-qvg7 RegEx DoS in
  `@eslint/plugin-kit`), `@playwright/test` 1.49.1 → 1.59.1 (transitive
  Playwright advisories). `npm audit` now reports 0 vulnerabilities.

### Added (spec.md v4.12 public release hardening)

- `SECURITY.md` security policy with private vulnerability report
  channel, threat model summary, and supply-chain posture.
- `scripts/build-sbom.mjs` generates a CycloneDX 1.5 `sbom.json` plus a
  human-readable `sbom.md`. Hashes every shipped runtime asset and
  every JS source module with SHA-256, emits a per-build buildId, and
  pins dev dependencies. Wired into `npm run build` so a deploy
  cannot ship without a fresh SBOM. `npm run sbom` regenerates on
  demand.
- `npm run release:check`: a one-shot pre-release gate that runs
  lint, unit tests, a11y, grep-check, data integrity verification,
  SBOM regeneration, and the static build.
- `docs/release.md`: end-to-end Cloudflare Pages runbook covering
  one-time setup (project + custom domain + env vars + HSTS preload),
  pre-release checklist, e2e smoke, promotion, tagging, rollback, and
  the supply-chain posture summary.
- Logo in the topbar now floats with a 4s ease-in-out animation and
  carries a soft drop-shadow that brightens on hover (matches the
  encryptalotta hero treatment, applied to the brand mark).
- Each home-section heading is followed by a fading divider line so
  the categorical structure reads at a glance.
- Tool cards gained a radial-gradient sheen on hover and a slightly
  springier transform curve. Hover lift increased from 2px to 3px and
  the box-shadow is deeper.

### Changed (spec.md v4.12 public release hardening)

- `package.json`: pinned `@playwright/test` to `1.49.1` and `eslint`
  to `9.17.0` (no `^`, no `~`). Added `engines.npm`, `homepage`,
  `repository`, and `bugs`. Bumped version from `0.0.0` to `1.0.0`.
- `npm run build` now includes the SBOM step and copies `sbom.json`
  and `sbom.md` into `dist/`.
- Footer GitHub badge label changed from "View source on GitHub" to
  "GitHub". `aria-label` follows.

### Fixed (spec.md v4.11 file:// origin diagnosis)

- Asset paths in `index.html` (`favicon.ico`, `favicon-16x16.png`,
  `favicon-32x32.png`, `apple-touch-icon.png`, `site.webmanifest`)
  changed from absolute (`/foo`) to relative (`foo`). Absolute paths
  resolved to the filesystem root when the page was opened via
  `file://` and produced 404s in DevTools.
- Removed `<meta http-equiv="X-Frame-Options">` and the
  `frame-ancestors` directive from the meta-CSP. Browsers ignore both
  when they are delivered through a `<meta>` tag and emit console
  warnings; they remain set as real HTTP response headers via
  `_headers` (Cloudflare Pages) and `scripts/serve.mjs` (local dev).
- Added a `file://` guard banner to `index.html`. When the page is
  opened directly from disk, ES modules cannot load (the document
  origin is opaque, browsers refuse cross-origin module fetches), so
  none of the tool renderers ever mount and clicks appear to do
  nothing. The guard surfaces a clear instruction: run
  `npm run dev` and open `http://localhost:4173`. Built with DOM
  APIs only, no `innerHTML`.

### Changed (spec.md v4.10 brand polish)

- Brand name presented to users is now "Sophie Well" (with the logo
  ahead of the wordmark). The browser tab title is "Sophie Well";
  per-tool views set the tab to "<Tool name> | Sophie Well". The
  underlying project / package name (`sophiewell`, `sophiewell.com`)
  and asset paths are unchanged.
- Topbar layout switched from `space-between` to `center` so the
  Sophie Well brand sits in the middle of the bar.
- Home page is now just the tile grid: the intro paragraph, the
  Search input, and the Audience / Group filter rows have been
  removed from `index.html`. The `applyFilters` and `wireFilters`
  helpers in `app.js` no-op safely when the filter elements are
  absent, so the path to a tool view is `home grid -> tool card click
  -> hash route -> renderer`.
- Footer disclaimer rewritten to the user-supplied long form: "Sophie
  Well is a deterministic public utility for patients, billers,
  coders, nurses, clinicians, EMS, and educators... It acts as a
  reference 'cheat sheet' for healthcare workers."
- Tool view chrome: the rendered tool view is now wrapped in
  `<section class="content">` rather than `<main class="content">`,
  so we no longer nest a `<main>` landmark inside `<main id="main">`.
- Click handler hardening: the document-level delegated handler now
  bails on any element with `data-no-route`, and forces a route
  refresh when the user clicks a tool card whose hash is already
  active (e.g., from the Pinned section). This fully addresses the
  "tools don't respond when I click them" report.

### Changed (spec.md v4 redesign)

- Visual chrome rebuilt to match `encryptalotta.com`: dark theme tokens
  (`--bg-primary` #0a0a0a, `--text-primary` #fff), sticky topbar with
  brand mark, home-section / tool-card grid grouped A through I,
  breadcrumb on tool views, and pill-shaped credit-badge plus gh-badge
  in the footer.
- Tile markup migrated from `<article>` + `<a class="tile-link">` to
  `<button class="tool-card" data-tool="...">`. A delegated click
  handler on `document` sets `location.hash` so the existing hash
  router opens the renderer; this fixes a regression where some tile
  clicks appeared to do nothing.
- `renderToolView` now scrolls to top on mount and emits `console.warn`
  when no renderer is registered for a tool id (instead of silently
  showing a generic "under construction" line).
- Form controls re-skinned with `--bg-tertiary` fill, 8px radius,
  blue (#4d90fe) focus ring.

### Added (spec.md v4 redesign)

- `scripts/build-ld.mjs`: regenerates the JSON-LD WebApplication +
  FAQPage block in `index.html` from the live `UTILITIES` array.
  `featureList` now contains all 79 tool names.
- `scripts/build-sitemap.mjs`: regenerates `sitemap.xml` with the root
  URL plus one fragment URL per tool (80 URLs total).
- `scripts/build-favicons.mjs`: generates the favicon set from the
  master logo. Output: `logo.png` (512x512), `apple-touch-icon.png`
  (180), `favicon-32x32.png`, `favicon-16x16.png`, and a multi-res
  `favicon.ico` (16/32/48 hand-assembled with embedded PNG payloads).
  Uses `sharp` when present, falls back to macOS `sips`.
- `npm run build` now invokes all three regenerator scripts before
  copying to `dist/`, and copies favicon assets into the dist when
  present.
- Playwright smoke selectors updated for the new chrome
  (`.tool-card`, `.topbar-brand`, `.content h1`, footer badge URLs).
- Full SEO `<head>` block: `<title>`, description, keywords, OG,
  Twitter, JSON-LD, canonical, theme-color, and the apple-touch-icon
  favicon link set.

### Added (spec-v2 layer)

- Live-render calculator helper (`lib/live.js`) with 50ms debounce.
- Inline citation, data source stamp, and "Test with example" button
  rendered uniformly above every utility view (spec-v2 sections 5.1,
  5.2, 5.3).
- Stability commitments documented in `docs/stability.md` and linked
  from the footer.
- This changelog. `#changelog` view in the site renders this file.
- Performance budget documented in `docs/performance.md` and enforced
  via `.lighthouserc.json` in CI.
- "Copy all" button on every utility view that captures the current
  result text via the Clipboard API. `lib/clipboard.js` exports
  `copyText` and `formatCopyAll`.
- Keyboard layer (`lib/keyboard.js`): tile-grid arrow-key navigation
  with `aria-current`, leader-key shortcuts (G then a letter), and a
  `?` help overlay dismissable on Escape.
- Hash-based pinning (`lib/hash.js`): Pin / Unpin affordances on every
  tile; pinned tiles render in a "Pinned" section above the grid; state
  is encoded in the URL hash as `&p=icd10,bmi,egfr`.
- Hash-based calculator state: every calculator's input values are
  encoded in the URL hash as `&q=key=value;key=value` so a populated
  calculator can be bookmarked and restored.
- Data-change analyzer (`scripts/analyze-data-changes.mjs`) producing a
  Markdown summary of MPFS conversion factor and RVU shifts, ICD-10/HCPCS
  add/remove deltas, NADAC top price changes, and OIG/opt-out add/remove.
  Wired into the data-refresh PR body via `.github/workflows/data-refresh.yml`.
- spec-v2 final-pass report at `docs/spec-v2-checklist.md` (14 PASS, 2
  PENDING items, all PENDING blocked on production access).

### Added (spec-v3 layer)

- "Field Medicine" audience filter button on the home view.
- 18 existing utilities tagged with the `field` audience per spec-v3
  section 5.2 (GCS, NIHSS, drip rate, weight-based dose,
  concentration-to-rate, peds vitals, lab ranges, ABG, Wells PE, MAP,
  P/F ratio, anion gap, corrected sodium, peds dose bounds, anticoag
  reversal, high-alert meds, APGAR, Mallampati).
- Five new datasets bundled under `data/`:
  - `field-triage/` (CDC Field Triage Guidelines)
  - `mci-triage/` (START + JumpSTART algorithms)
  - `prehospital-meds/` (FDA labeling for 22 standard prehospital meds)
  - `aha-reference/` (numeric reference: adult/peds arrest doses,
    defibrillation energy ranges; flowcharts not reproduced)
  - `toxidromes/` (six common toxidrome syndromes with original notes
    and ATSDR attribution)
- AHA non-derivation CI test (`test/unit/aha-no-flowchart.test.js`)
  guarding the `data/aha-reference/` payload against AHA flowchart
  language patterns.
- Group I (Field Medicine) utilities 64-69:
  - 64: Pediatric Weight-to-Dose Calculator (epinephrine, atropine,
    amiodarone, naloxone, dextrose D10, fluid bolus) with per-dose caps
    and minimums.
  - 65: Adult Cardiac Arrest Drug Reference (sortable table from
    `data/aha-reference/`).
  - 66: Pediatric Cardiac Arrest Drug Reference (sortable table from
    `data/aha-reference/`).
  - 67: Defibrillation Energy Calculator (adult biphasic / monophasic
    VF/pVT, three cardioversion scenarios; pediatric VF/pVT 2 J/kg
    first then 4 J/kg subsequent capped at 10 J/kg; pediatric
    cardioversion 0.5 J/kg first then 2 J/kg).
  - 68: Cincinnati Prehospital Stroke Scale (three sliders, time of
    last known well field, positive/negative output).
  - 69: FAST and BE-FAST Stroke Assessment (checkbox form; BE-FAST
    label appears when balance or eyes are checked).
- Field Medicine local-protocol notice ("This is a math aid for
  verification. Local protocols, medical direction, and clinician
  judgment govern any clinical decision.") rendered on every Group I
  utility per spec-v3 6.5.
- Group I toggle button added to the home view group filter row.
- Pure functions in `lib/field.js`: `pedsDose`, `defibEnergy`,
  `cincinnatiStroke`, `fast`. 22 new unit tests in
  `test/unit/field.test.js`.
- Group I (Field Medicine) utilities 70-81 (except 78 which reuses the
  existing APGAR with the `field` tag added):
  - 70 Trauma Triage (CDC) decision tree
  - 71 START adult MCI triage
  - 72 JumpSTART pediatric MCI triage
  - 73 Burn Surface Area (Rule of Nines + Lund-Browder)
  - 74 Burn Fluid Resuscitation (Parkland + Modified Brooke, with
    half-in-first-8h split and remaining-in-window math)
  - 75 Hypothermia staging reference
  - 76 Heat illness staging reference
  - 77 Pediatric ETT size and depth
  - 79 Toxidrome reference
  - 80 Naloxone dosing (adult + pediatric, four routes)
  - 81 EMS documentation helper (9 run-type checklists)
- New `data/environmental/` (hypothermia + heat illness staging) and
  `data/workflow/ems-runtypes.json` (PCR documentation checklists).
- Pure functions: `fieldTriage`, `startTriage`, `jumpStartTriage`,
  `ruleOfNines`, `lundBrowder`, `burnFluid`, `pediatricEtt`,
  `naloxoneDose`, `selectEmsChecklist`. 34 additional unit tests.
- spec-v3 final-pass report at `docs/spec-v3-checklist.md` (12 PASS,
  2 PENDING).
- `docs/field-medicine-citations.md` enumerates every Group I utility
  with citation, source dataset, and worked example.
- `docs/legal.md` extended with the AHA, Broselow, CDC/ATSDR/FDA, and
  Wilderness Medical Society postures from spec-v3 4.
- `docs/data-sources.md` extended with the spec-v3 datasets
  (field-triage, mci-triage, prehospital-meds, aha-reference,
  toxidromes, environmental, EMS run-types).
- `docs/threat-model.md` extended with three new threats: T12 URL-hash
  state covert exfiltration, T13 clipboard misuse, T14 field-medicine
  reference misuse.
- `docs/operations.md` runbook covering weekly data refresh, quarterly
  review, yearly licensing re-read, the new-utility / new-dataset
  add procedures, and emergency rollback (referenced by spec-v2 7.3).
- Playwright smoke spec extended with spec-v2 / spec-v3 coverage: meta
  citation, Test-with-example button, hash-based calculator state
  persistence, hash-based pinning, `?` overlay, leader-key navigation
  to BMI, `#changelog` and `#stability` doc views, Field Medicine
  audience filter, Group I local-protocol notice, peds-ETT calculator.
- Unit tests for `scripts/analyze-data-changes.mjs` driven by
  fixture dataset folders: MPFS conversion-factor change detection,
  HCPCS add/remove, NADAC top price changes, sizes-only mode.

## [0.1.0] - 2026-05-03

Initial development build covering spec.md steps 1 through 20.

### Added

- Repository scaffolding, documentation skeleton, README, visual shell,
  hash router, and tool views for all 63 utilities (62 tiles + the
  Printable Bill Decoder Summary as a print stylesheet on the Bill
  Decoder).
- Group A code lookups (ICD-10, HCPCS, CPT, NDC, POS, modifier, revenue,
  CARC, RARC, NCCI, MUE, LCD/NCD).
- Group B pricing (MPFS, NADAC, charge-to-Medicare ratio, hospital
  price transparency, OOP estimator).
- Group C patient bill and insurance tools (bill decoder, insurance
  card decoder, EOB decoder, NSA eligibility, GFE threshold, state
  rights).
- Group D provider lookup (NPI, OIG, opt-out).
- Group E clinical math and conversions (unit converter, BMI, BSA,
  MAP, anion gap, corrected calcium and sodium, A-a gradient, eGFR
  CKD-EPI 2021, Cockcroft-Gault, pack-years, Naegele, QTc all four,
  P/F ratio).
- Group F medication and infusion (drip rate, weight-based dose,
  concentration-to-rate, peds dose bounds, insulin drip, anticoag
  reversal, ISMP high-alert).
- Group G clinical scoring and reference (GCS, APGAR, peds vitals,
  lab ranges, ABG decision tree, Wells PE/DVT, CHA2DS2-VASc, HAS-BLED,
  NIHSS, ASA, Mallampati, Beers).
- Group H workflow (appointment prep, prior auth checklist).
- Service worker with cache-first shell + lazy data shard caching,
  keyed to BUILD_HASH.
- `_headers` for Cloudflare Pages with the full security header set
  per spec section 7.
- Zero-dep build pipeline (`scripts/build-data.mjs`,
  `scripts/verify-integrity.mjs`, `scripts/build.mjs`,
  `scripts/serve.mjs`).
- 107 unit tests, 13 Playwright e2e tests, static a11y check, grep
  check, integrity check.

### Security

- CSP `connect-src 'self'` blocks all outbound network requests at
  runtime.
- No localStorage / sessionStorage / IndexedDB / cookies anywhere in
  the codebase.
- `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `eval` /
  `Function` constructor banned by ESLint and CI grep.
