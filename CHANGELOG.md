# Changelog

All notable changes to sophiewell.com are documented here. The format
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the
project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (spec-v57 — brief screeners, decision rules, and triage scores; +14 tiles, 281 → 295)

Fourteen deterministic Group-G instruments that fill confirmed holes a bedside
team hits routinely: the ultra-brief screeners used as a pre-gate to the full
instrument, the imaging/discharge decision rules that keep the team out of
unnecessary CT, and the chest-pain / syncope / PE / pharyngitis / trauma
pathways that complement HEART, Wells, and Centor. Each consumes at least one
input and computes an output (spec-v29 §3), ships its citation inline (spec-v54),
and is covered by the object-aware fuzz harness with zero non-finite leaks. New
module `lib/scoring-v5.js` (14 compute exports) + renderers in `views/group-v9.js`.

- **Brief screeners:** `phq2-gad2` (PHQ-2 + GAD-2 pre-gates with the ≥3 flag),
  `audit-full` (WHO 10-item AUDIT with the 8/16/20 zones), `dast10` (DAST-10,
  item 3 reverse-scored), `gds15` (Geriatric Depression Scale, the
  age-appropriate alternative to PHQ-9).
- **Decision rules:** `ottawa-knee` (Ottawa Knee Rule), `nexus-chest` (NEXUS
  Chest CT instrument), `sfsr` (San Francisco Syncope Rule / CHESS),
  `canadian-syncope` (Canadian Syncope Risk Score, −3 to +11).
- **Pathways:** `edacs` (EDACS + EDACS-ADP low-risk gate), `years-pe` (YEARS
  with the variable D-dimer threshold surfaced explicitly), `feverpain`
  (FeverPAIN, NICE NG84), `stone-score` (STONE ureteral-stone probability),
  `iss-rts` (Injury Severity Score + Revised Trauma Score), `sipa` (Shock Index,
  Pediatric Age-Adjusted, age-banded cutoffs).
- **Conditional thresholds surfaced:** `years-pe` shows the 1000-vs-500 ng/mL
  D-dimer threshold that flips with the item count, and `edacs` shows the
  <16-plus-non-ischemic-ECG-plus-negative-troponins ADP gate, so the user sees
  *why* the determination flipped.
- **Robustness:** item screeners clamp each item to its declared range; `sipa`
  guards HR/SBP=0 → `null` → `fmt()` fallback and returns no cutoff (caution
  band) outside the validated 4–16 yr range; `iss-rts` clamps AIS 0–6 and the
  vitals. 74 new unit tests (≥3 boundary examples each, including the YEARS/EDACS
  threshold-flips and the SIPA age-band boundaries); 14 spec-v11 audit logs;
  fuzz harness extended to `scoring-v5.js`.
- **Provenance:** `audit-full` (WHO) and `feverpain` (NICE) carry
  `citationAccessed` + a `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces (spec-v46) all advanced 281 → 295; `UTILITIES.length`
  is 295. README gains a screeners/decision-rules cheat sheet.

### Added (spec-v56 — weight-based dosing, infusion titration, and bedside toxicology; +13 tiles, 268 → 281)

Thirteen deterministic Group-F medication/infusion calculators that fill the
high-frequency titration and reconstitution tasks a floor/ICU/ED/PACU/L&D nurse
currently does on paper. Each consumes at least one input and computes an output
(spec-v29 §3), ships its primary citation inline (spec-v54), inherits the
spec-v53 input/output-safety contract, and is covered by the object-aware fuzz
harness with zero `NaN`/`Infinity`/`undefined` leaks. New module
`lib/medication-v5.js` (13 compute exports) + renderers in `views/group-v8.js`.
**Every tile is dosing decision-support, not a prescription, and renders the
standing "verify against institutional protocol and a current reference"
notice.**

- **Infusion nomograms:** `heparin-nomogram` (weight-based heparin, Raschke 1993
  initial dosing + aPTT titration step, VTE/ACS caps, 150 kg weight cap),
  `vanc-auc` (vancomycin AUC24/MIC, first-order two-level Sawchuk-Zaske, target
  400–600), `aminoglycoside` (extended-interval Hartford dose + CrCl-set
  interval).
- **Pediatric fluids:** `peds-fluid-deficit` (Holliday-Segar 4-2-1 maintenance +
  dehydration deficit replacement), `peds-resus` (PALS 10–20 mL/kg bolus with
  the cardiac/DKA caution and adult weight cap).
- **Procedural / peri-op:** `mgso4-preeclampsia` (ACOG/Magpie load + maintenance
  with the renal-halving default), `pca-pump` (lockout-derived hourly maximum +
  1-hour-limit consistency check, no-PCA-by-proxy note), `sugammadex` (reversal
  by depth of block on actual body weight), `ketamine-propofol` (procedural
  sedation dose + re-dose increment).
- **Bedside toxicology:** `acetaminophen-nomogram` (Rumack-Matthew treatment
  line), `digoxin` (renal/age-categorical maintenance + level interpretation),
  `local-anesthetic-max` (per-agent mg/kg ceiling vs absolute cap, LAST note),
  `conc-percent` (percent ⇄ mg/mL ⇄ ratio).
- **Validity refusals (spec-v56 §3):** `acetaminophen-nomogram` refuses outside
  the 4–24 h window and `aminoglycoside` refuses dialysis / CrCl <20 — they
  throw rather than return a misleading number; both refusals are pinned by
  unit tests.
- **Deliberate substitution (correctness floor, same discipline as v55
  `ldl-calc`):** the Hartford concentration-vs-time *graph* is a proprietary
  figure with no closed form, so `aminoglycoside` sets the starting interval
  from CrCl and refers the random level to the institution's printed nomogram
  rather than fabricate a zone. Disclosed in the tile note, the META citation,
  and `docs/audits/v11/aminoglycoside.md`.
- **Robustness:** every compute function imports `r1`/`r2`/`r3`/`num`/`fmt` from
  `lib/num.js`; every denominator (TIBC analog, concentration, lockout, MIC,
  bag concentration) is guarded to return `null` → `fmt()` fallback. 65 new unit
  tests (≥3 boundary worked examples each, including the two validity-refusal
  cases); 13 spec-v11 audit logs; fuzz harness extended to `medication-v5.js`.
- **Provenance:** `vanc-auc` (IDSA), `digoxin` (ACC/AHA), `mgso4-preeclampsia`
  (ACOG), and `peds-resus` (AHA) carry `citationAccessed` + a
  `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces (spec-v46) all advanced 268 → 281; `UTILITIES.length`
  is 281.

### Added (spec-v55 — bedside hematology, renal/acid-base, and oxygenation math; +13 tiles, 255 → 268)

Thirteen deterministic Group-E calculators that fill confirmed gaps a bedside
ICU/acute-care RN, RT, or 3 a.m. resident actually reaches for. Each consumes at
least one input and computes an output (spec-v29 §3), ships its primary citation
inline (spec-v54), and is covered by the spec-v53 object-aware fuzz harness with
zero `NaN`/`Infinity`/`undefined` leaks. New module `lib/clinical-v6.js`
(13 compute exports) + renderers in `views/group-v7.js`.

- **Hematology:** `anc` (Absolute Neutrophil Count + CTCAE neutropenia grade),
  `retic-index` (corrected reticulocyte % + Reticulocyte Production Index),
  `tsat` (transferrin saturation + iron-studies pattern), `cci-platelet`
  (Corrected Count Increment for platelet refractoriness).
- **Renal / acid-base:** `ttkg` (Transtubular Potassium Gradient, with the
  surfaced interpretability guard: urine osm > plasma osm and urine Na > 25),
  `urine-anion-gap` (non-gap acidosis discriminator), `acid-base-deficit`
  (bicarbonate + sodium deficit estimates with the over-rapid-correction
  warning), `schwartz-egfr` (bedside pediatric eGFR), `eag-a1c` (estimated
  average glucose from A1c, ADAG).
- **Oxygenation / ventilation:** `cao2-do2` (arterial O₂ content + delivery),
  `oxygenation-index` (OI + OSI with PALICC-2 pediatric-ARDS bands),
  `driving-pressure` (ΔP + static/dynamic compliance with the ≤15 cmH₂O
  lung-protective target).
- **Lipids:** `ldl-calc` (calculated LDL). **Deliberate substitution:** the spec
  named Friedewald + Martin/Hopkins; Martin/Hopkins requires a 180-cell
  proprietary strata table that could not be source-verified, and the spec-v11
  correctness floor forbids shipping an unverifiable clinical table — so the
  second method is the published closed-form **NIH/Sampson 2020** equation
  (same high-TG / low-LDL use case). Disclosed in the tile note, the META
  citation, and `docs/audits/v11/ldl-calc.md`.
- **Robustness:** every compute function imports `r1`/`r2`/`r3`/`num`/`fmt` from
  `lib/num.js`; every division denominator (TIBC, plasma K, urine osm − plasma
  osm, driving pressure, serum creatinine) is guarded to return `null` →
  `fmt()` fallback, never a non-finite number to the DOM. 62 new unit tests
  (≥3 boundary worked examples each, including the zero-denominator and
  precondition-guard cases); 13 spec-v11 audit logs.
- **Provenance:** `tsat` (KDIGO) and `oxygenation-index` (PALICC-2) carry
  `citationAccessed` + a `docs/citation-staleness.md` row (spec-v54).
- Catalog-truth surfaces (spec-v46) all advanced 255 → 268; `UTILITIES.length`
  is 268.

### Hardened (spec-v54 — citation integrity: inline, current, well-wrapped; zero new tiles)

A zero-tile citation-integrity release: no new tile, no clinical formula,
threshold, or rounding precision changed (every valid-input result is
byte-identical). It defines and enforces three invariants on every clinical
tile's source citation — **inline** (visible in `META[id].citation`, not only
in a reference doc), **current or justified-stale** (a guideline tile carries an
`accessed` date and a ledger row naming the shipped vs latest edition), and
**well-formed / wrapping** (no bare URL in the citation text; the references
block wraps within the tile column at 320px). Audit log:
`docs/audits/v11/_citations-v54.md`.

- **`scripts/check-citations.mjs` (new gate, wired into `npm run lint`)** —
  five rules across all 255 tiles: (1) every `clinical: true` tile has a
  non-empty inline `citation`; (2) no raw `http(s)://` in citation text (URLs
  belong in `citationUrl`); (3) `citationUrl`, if present, is a valid `https://`
  URL; (4) every tile whose citation matches the guideline-issuer pattern (CDC |
  KDIGO | AGS | ACC | AHA | ATS | IDSA | ESC | WHO | AAP | ACOG | Joint
  Commission | SAMHSA | NICE) carries an `accessed` date **and** a row in the
  staleness ledger; (5) no unpinned phrase ("current edition" / "latest version"
  / "most recent"). The issuer pattern is case-sensitive and word-bounded so it
  matches `WHO 2014` but not the word "who" and not "ACCORD". The pure detector
  `findCitationViolations` is unit-tested with one negative fixture per rule
  (`test/unit/check-citations.test.js`, +12 tests).
- **`docs/citation-staleness.md` (new ledger)** — one row per guideline-derived
  tile (19 gate-enforced) plus the foundational instruments reviewed alongside
  them (10 documentation rows), each naming edition shipped, latest known
  edition, `accessed` date, and a justification where the shipped edition is
  deliberately behind. The single auditable answer to "is Sophie current?"
- **Unpinned editions pinned (rule 5 fixes):** `field-triage` ("current
  edition" → 2021 ACS-COT/CDC National Guideline), `tetanus` (→ 2020 ACIP MMWR
  69(3)), `rabies-pep` (→ 2010 ACIP MMWR 59(RR-2)). Each gains a
  `citationAccessed` and a ledger row.
- **`accessed` dates added** to all 19 guideline-issuer tiles via a uniform
  `META[id].citationAccessed` field (the gate also accepts `source.accessed`).
- **§3 provenance fixes:** `fib4` / `apri` gain DOI `citationUrl`s; `vis` splits
  the conflated Gaies-2010 (VIS) vs Wernovsky-1995 (IS) attribution into one
  labeled inline citation with a DOI. `docs/data-sources.md` reconciles the
  Beers entry — the retired `beers.json` shard was the standalone reference
  *table*; the live `beers-check` tile ships AGS 2023 content embedded in
  `lib/medication-v4.js`, cited inline with `citationAccessed` and a ledger row.
- **Wrapping made explicit (rule 3 / invariant 2.3):** `styles.css`
  `.tool-meta .citation` and `.citation-inline-link` get `overflow-wrap:
  anywhere`; `test/integration/citations.spec.js` pins that a long-DOI tile
  (`egfr`) renders its inline citation and the references block has no
  horizontal overflow at 320px.
- Catalog unchanged (255 tiles). No `app.js` / `UTILITIES` change.

### Hardened (spec-v53 — public-tool output safety & input bounds; zero new tiles)

A zero-tile hardening release: no new tile, no clinical formula, threshold, or
rounding precision changed (every valid-input result is byte-identical). It
defines and enforces the invariant that **no public compute path may render
`NaN` / `undefined` / `Infinity` to the user, throw anything but a validation
error, or return a non-finite number that reaches the DOM**, fixes the concrete
defects found in the v52-close audit, and adds two automated gates so the class
cannot reappear. Audit log: `docs/audits/v11/_hardening-v53.md`.

- **`lib/num.js` (new)** — single source of truth for `r1`/`r2`/`r3` and `num()`
  (previously duplicated in `clinical.js` and `clinical-v5.js`; a latent
  drift risk), plus the new **`fmt()`** display guard that substitutes a
  caller-supplied fallback for any `null` / non-finite value.
- **Class A (leaked tokens):** `views/group-e.js` shock index / modified shock
  index rendered the literal `undefined` at SBP=0; now routed through `fmt()`.
  The fuzz harness additionally found `cfs` / `rass` leaking `CFS 9 (undefined)`
  / `RASS NaN` into their rendered band for non-finite input — fixed.
- **Class B (impossible input → silent nonsense):** `lib/bounds.js` (new) plus a
  `.warn` advisory next to the result for a frankly-impossible serum creatinine
  (Cockcroft-Gault / eGFR) or height (BMI); `pbwArdsnet` now returns `null`
  tidal-volume targets (not silent `0 mL`) below the Devine floor and the
  renderer finally displays the warning it had always computed.
- **Class C:** the bare `refLow: 0` lipid analytes (`totalChol`, `ldl`,
  `triglycerides`) are now explicitly `oneSidedLow: true` (a documented choice).
- **Gate 1 — `scripts/check-output-safety.mjs`** (wired into `npm run lint`):
  bans the `)?.toFixed(` leak fingerprint in `views/`; unit-tested both ways.
- **Gate 2 — `test/unit/fuzz-tools.test.js`** (wired into `npm run test`):
  reflection-driven; drives all 245 public compute exports with an adversarial
  matrix and asserts throw-safety (only `TypeError`/`RangeError`) and no
  banned-token leak into returned strings. It surfaced — and this release fixes —
  42 functions that threw a plain `Error` for validation (normalized to
  `TypeError`/`RangeError`).
- Catalog unchanged (255 tiles). No `app.js` / `UTILITIES` change.

### Added — enforce no-horizontal-scroll across the **entire** tile catalog at 320px

The site is built for the nurse reaching for it on a phone, and "no horizontal
scroll on every view" was a stated commitment — but the automated guard only
covered seven representative views (one per shape) plus the PA linter; a
full-catalog sweep had only ever been run *manually, once*. A tile added later
could ship horizontal overflow undetected.

- `test/integration/mobile-no-hscroll.spec.js` now includes a **full-catalog
  sweep**: it discovers every tile id from `sitemap.xml` (the same catalog
  source `all-tools.spec.js` uses) and asserts no view's
  `documentElement.scrollWidth` exceeds its `clientWidth` at 320px — the
  narrowest mainstream phone width (a layout that fits at 320px fits at every
  wider width). All 255 tiles pass today; the sweep makes it a permanent CI
  regression guard. chromium-only and ~12 s for the whole catalog (SPA hash
  routes re-render in place), so the cost is negligible.
- Docs updated to reflect that the 320px no-horizontal-scroll guarantee is now
  *enforced*, not merely asserted: `docs/performance.md` (Mobile Touch Targets)
  and `docs/accessibility.md` (a new reflow checklist item).
- Housekeeping: corrected the README CLI-reference unit-test count (2,182 →
  2,381, stale) and noted the responsiveness sweep in the `test:e2e` row and the
  `styles.css` repository-layout line.

### Fixed (spec-v52 wave 52-46 — complete the CMS Place-of-Service code set; `R-PA-013` false-block on telehealth and other valid POS codes)

`R-PA-013` ("place-of-service code present and on the bundled CMS list",
**`block`** severity) tested POS codes against `POS_CODES_BUNDLED` in
`lib/pa/extract.js`, which shipped an incomplete *sample* — it omitted the entire
`01`–`10` range plus `16` / `18` / `27`. A legitimate prior-auth packet in the
most common modern care settings was therefore **falsely blocked** with "POS
code(s) not on bundled CMS list", most importantly:

- **Telehealth** — POS `02` (telehealth other than in the patient's home) and POS
  `10` (telehealth in the patient's home, added to the CMS set 2022-01-01).
- Pharmacy (`01`), school (`03`), homeless shelter (`04`), the Indian Health
  Service / Tribal 638 facilities (`05`–`08`), prison / correctional (`09`),
  temporary lodging (`16`), place of employment-worksite (`18`), and outreach
  site / street (`27`, added 2023-10-01).

Fix: `POS_CODES_BUNDLED` now holds the **complete CMS assigned POS set** (51
codes). The unassigned / reserved numbers in the gaps remain absent, so
`R-PA-013` still blocks a genuinely invalid code (`88`, exercised by the
`bad-pos` golden). New golden fixture `telehealth-pos10` (a POS 10 telehealth
behavioral-health packet that now clears `R-PA-013`); three unit tests pin the
telehealth codes, the rest of the previously-missing assigned codes, and the
still-blocked invalid / missing cases. The `cms-pos` staleness-ledger source was
re-verified against the CMS POS code set page (`lastVerified` bumped). Ruleset
count unchanged (876 — this completes bundled data, it does not add a rule);
catalog unchanged (255 tiles). 46 golden fixtures.

### Added (spec-v52 wave 52-45 — §4.5.2.1 CMS Hospital OPD Prior Authorization: the first real bundled PA-list membership test)

A different kind of wave: not another payer overlay, but the linter's **first
non-vacuous prior-authorization-list membership test**. Every "is the requested
service on the payer's PA list?" rule to date (`R-PA-053` and the per-overlay
`-004` rules) ships vacuous — it passes with a pointer because no list is
bundled. This wave flips that for one real, federally published, stable list.

- New bundled dataset `lib/pa/cms-opd-pa-list.js` — the **CMS Hospital
  Outpatient Department (OPD) Prior Authorization** required-services CPT list,
  organized by category through the 2023 facet-joint addition: blepharoplasty,
  botulinum toxin injection, panniculectomy, rhinoplasty, vein ablation (2020);
  cervical fusion with disc removal, implanted spinal neurostimulators (2021);
  facet joint interventions (2023). CPT procedure codes only (the drug J-codes
  billed alongside botulinum toxin are deliberately excluded to keep the
  membership test conservative).
- New rule `R-PA-OPD-001` (`flag`) in `lib/pa/rules.js`: for a Medicare FFS
  hospital-outpatient packet (POS 22 / 19, or an explicit outpatient-department
  anchor) requesting a listed OPD service with **no Unique Tracking Number (UTN)
  / prior-authorization reference**, it flags — Medicare requires the OPD
  authorization and the UTN on the claim before the service is furnished. It
  self-gates off for non-Medicare-FFS payers, office-based (POS 11) services, and
  non-listed CPTs. The finding names the matched CPT and its OPD category.
- New staleness-ledger source `cms-opd-pa-list` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-OPD-` →
  `cms-opd-pa-list` prefix map in `lib/pa/rule-sources.js`, anchored to the single
  authoritative CMS OPD PA program page and re-verified on the §4.5.6 cadence.
- New golden fixture `cms-opd-pa` (45 fixtures total) — a Medicare FFS
  hospital-outpatient vein-ablation packet without a UTN. Five unit tests cover
  the membership test, the UTN branch, and the payer / POS / non-listed gates.
- Catalog count unchanged (255 tiles). Ruleset rises **875 → 876**. View wave
  banner advanced to 52-45.

### Added (spec-v52 wave 52-44 — §4.5.44 Indiana Medicaid / Healthy Indiana Plan overlay for the Prior-Auth Packet Linter)

The fourteenth per-state Medicaid overlay, and the thirty-seventh named-payer
overlay overall. **Indiana Medicaid** is administered by FSSA / OMPP under the
umbrella **Indiana Health Coverage Programs** (IHCP); its expansion program is
the **Healthy Indiana Plan** (HIP), the claims system is CoreMMIS, and providers
submit through the IHCP Provider Healthcare Portal.

- New per-state payer bucket `'medicaid-in'` in `lib/pa/payer.js` (anchors
  `indiana medicaid` / `healthy indiana plan` / `indiana health coverage
  programs` / `ihcp`), placed before the generic `'medicaid'` bucket and composing
  with the §4.5.4 Medicaid core through `isMedicaid(bundle.payer)`. It is
  deliberately disjoint from the same-state commercial Blues licensee `'anthem'`
  (Anthem Blue Cross Blue Shield, headquartered in Indianapolis, §4.5.9); an
  Indiana Medicaid packet and an Anthem packet route to different overlays
  (unit-tested), and a dual-eligible "Medicare Advantage" string still wins the MA
  bucket earlier. The bare tokens `hip` and `in medicaid` are **excluded** as
  anchors (they would false-match "hip replacement" and "enrolled in medicaid"
  respectively) — both edge cases are unit-tested.
- 20 rules `R-PA-MCIN-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-in'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with IHCP submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCIN-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `in-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCIN-` →
  `in-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public IHCP provider page.
- New golden fixture `in-medicaid-precert` (44 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **855 → 875**; catalog count unchanged (255 tiles).
- Tests: +1 classify test (`medicaid-in` vs. Anthem, plus the `hip` /
  `in medicaid` anchor-safety edge cases) and the rule-count assertions (unit +
  2 e2e) advanced to 875. View wave banner advanced to 52-44.
- Docs housekeeping: refreshed `docs/pa-maintenance.md`, whose per-state Medicaid
  operator runbook had fallen four waves behind (it listed nine overlays; now
  fourteen — adds Pennsylvania, Michigan, New Jersey, Arizona, Indiana and the
  corresponding same-state-Blues disjointness pairs).

### Added (spec-v52 wave 52-43 — §4.5.43 Arizona Medicaid / AHCCCS overlay for the Prior-Auth Packet Linter)

The thirteenth per-state Medicaid overlay, and the thirty-sixth named-payer
overlay overall. **Arizona Medicaid** is run by a single state agency, **AHCCCS**
(the Arizona Health Care Cost Containment System, pronounced "access"); its
managed-care program is **AHCCCS Complete Care** and the provider portal is
**AHCCCS Online**.

- New per-state payer bucket `'medicaid-az'` in `lib/pa/payer.js` (anchors
  `arizona medicaid` / `az medicaid` / `ahcccs` / `arizona health care cost
  containment`), placed before the generic `'medicaid'` bucket and composing with
  the §4.5.4 Medicaid core through `isMedicaid(bundle.payer)`. No commercial Blues
  licensee for Arizona is modeled yet, so the unambiguous `ahcccs` brand anchors
  directly with no same-state disambiguation; a dual-eligible "Medicare Advantage"
  string still wins the MA bucket earlier.
- 20 rules `R-PA-MCAZ-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-az'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with AHCCCS Online
  submission routing and the two Medicaid reframings (transplant →
  Medicaid-designated transplant center; appeal → state fair hearing).
  `R-PA-MCAZ-004` mirrors core `R-PA-053` (no bundled prior-authorization list
  yet; vacuous pass with a pointer).
- New staleness-ledger source `az-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCAZ-` →
  `az-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public AHCCCS provider page.
- New golden fixture `az-medicaid-precert` (43 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **835 → 855**; catalog count unchanged (255 tiles).
- Tests: +1 classify routing test (`medicaid-az` / AHCCCS) and the rule-count
  assertions (unit + 2 e2e) advanced to 855. View wave banner advanced to 52-43.

### Added (spec-v52 wave 52-42 — §4.5.42 New Jersey Medicaid overlay for the Prior-Auth Packet Linter)

The twelfth per-state Medicaid overlay, and the thirty-fifth named-payer overlay
overall. **New Jersey Medicaid** is administered by the Department of Human
Services' **Division of Medical Assistance and Health Services (DMAHS)** under
the brand **NJ FamilyCare**; the fiscal-agent provider portal is **NJMMIS** (the
New Jersey Medicaid Management Information System).

- New per-state payer bucket `'medicaid-nj'` in `lib/pa/payer.js` (anchors `new
  jersey medicaid` / `nj medicaid` / `nj familycare` / `njmmis`), placed before
  the generic `'medicaid'` bucket and composing with the §4.5.4 Medicaid core
  through `isMedicaid(bundle.payer)`. It is deliberately disjoint from the
  same-state commercial Blues bucket `'horizon'` / Horizon Blue Cross Blue Shield
  of New Jersey (§4.5.20); a New Jersey Medicaid packet and a Horizon packet route
  to different overlays (unit-tested), and a dual-eligible "Medicare Advantage"
  string still wins the MA bucket earlier.
- 20 rules `R-PA-MCNJ-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-nj'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with NJMMIS submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCNJ-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `nj-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCNJ-` →
  `nj-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public DMAHS provider page.
- New golden fixture `nj-medicaid-precert` (42 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **815 → 835**; catalog count unchanged (255 tiles).
- Tests: +1 classify disjointness test (`medicaid-nj` vs. Horizon) and the
  rule-count assertions (unit + 2 e2e) advanced to 835. View wave banner advanced
  to 52-42.
- Docs housekeeping: corrected the README payer cheat-sheet prose, whose
  per-bucket precedence numbers (`anthem`, `bcbsm`, `horizon`, …) had lagged the
  renumbered table by one since the wave 52-41 insertion.

### Added (spec-v52 wave 52-41 — §4.5.41 Michigan Medicaid overlay for the Prior-Auth Packet Linter)

The eleventh per-state Medicaid overlay, and the thirty-fourth named-payer
overlay overall. **Michigan Medicaid** is administered by **MDHHS** (the Michigan
Department of Health and Human Services); the provider portal is **CHAMPS** (the
Community Health Automated Medicaid Processing System) and the Medicaid-expansion
program is branded the **Healthy Michigan Plan**.

- New per-state payer bucket `'medicaid-mi'` in `lib/pa/payer.js` (anchors
  `michigan medicaid` / `mi medicaid` / `healthy michigan plan` / `champs`),
  placed before the generic `'medicaid'` bucket and composing with the §4.5.4
  Medicaid core through `isMedicaid(bundle.payer)`. It is deliberately disjoint
  from the same-state commercial Blues bucket `'bcbsm'` / Blue Cross Blue Shield
  of Michigan (§4.5.15); a Michigan Medicaid packet and a BCBSM packet route to
  different overlays (unit-tested), and a dual-eligible "Medicare Advantage"
  string still wins the MA bucket earlier.
- 20 rules `R-PA-MCMI-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-mi'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with CHAMPS submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCMI-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `mi-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCMI-` →
  `mi-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public MDHHS provider page.
- New golden fixture `mi-medicaid-precert` (41 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **795 → 815**; catalog count unchanged (255 tiles).
- Tests: +1 classify disjointness test (`medicaid-mi` vs. BCBSM) and the
  rule-count assertions (unit + 2 e2e) advanced to 815. View wave banner advanced
  to 52-41.

### Added (spec-v52 wave 52-40 — §4.5.40 Pennsylvania Medicaid overlay for the Prior-Auth Packet Linter)

The tenth per-state Medicaid overlay, and the thirty-third named-payer overlay
overall. **Pennsylvania Medicaid** (PA DHS) brands its program **Medical
Assistance**; the fee-for-service provider portal is **PROMISe** and the
managed-care program is **HealthChoices**.

- New per-state payer bucket `'medicaid-pa'` in `lib/pa/payer.js` (anchors
  `pennsylvania medicaid` / `pa medicaid` / `pennsylvania medical assistance` /
  `healthchoices`), placed before the generic `'medicaid'` bucket and composing
  with the §4.5.4 Medicaid core through `isMedicaid(bundle.payer)`. It is
  deliberately disjoint from the same-state commercial Blues buckets `'highmark'`
  (§4.5.13) and `'ibx'` / Independence Blue Cross (§4.5.17); a Pennsylvania
  Medicaid packet and a Highmark / Independence packet route to different overlays
  (unit-tested), and a dual-eligible "Medicare Advantage" string still wins the MA
  bucket earlier.
- 20 rules `R-PA-MCPA-001..020` in `lib/pa/rules.js`, each self-gating on
  `bundle.payer === 'medicaid-pa'` and vacuously passing on every other packet.
  Structurally parallel to the other Medicaid overlays, with PROMISe submission
  routing and the two Medicaid reframings (transplant → Medicaid-designated
  transplant center; appeal → state fair hearing). `R-PA-MCPA-004` mirrors core
  `R-PA-053` (no bundled prior-authorization list yet; vacuous pass with a
  pointer).
- New staleness-ledger source `pa-medicaid-precert` (`pa-staleness-ledger.json`,
  regenerated into `lib/pa/staleness-ledger.js`) and a `R-PA-MCPA-` →
  `pa-medicaid-precert` prefix map in `lib/pa/rule-sources.js`. Anchored to the
  public PA DHS provider page.
- New golden fixture `pa-medicaid-precert` (40 fixtures total); `scripts/audit-pa.mjs`
  re-seeded. Ruleset rises **775 → 795**; catalog count unchanged (255 tiles).
- Tests: +1 classify disjointness test (`medicaid-pa` vs. Highmark / Independence)
  and the rule-count assertions (unit + 2 e2e) advanced to 795. View wave banner
  advanced to 52-40.

### Added (spec-v52 wave 52-39 — §4.3.1 optional in-browser OCR for the Prior-Auth Packet Linter)

Resolves the §2 OCR non-goal. The `pa-lint` tile gains an **optional,
user-triggered, fully on-device OCR path** for scanned PDFs and dropped images
(`image/jpeg`, `image/png`). When a dropped file is an image or a PDF that looks
like a scan (no embedded text layer), the results panel shows a single **"Run
on-device OCR"** control. Nothing loads until the user clicks it; then the
vendored OCR engine extracts the text and the deterministic rule engine re-runs
over it.

**Engine.** [tesseract.js](https://github.com/naptha/tesseract.js) 5.1.1 (+
`tesseract.js-core` 5.1.0 + the `tessdata_fast` English model), vendored under
`vendored/tesseract/` (~9 MB). It is **lazy-loaded only on the user's click**, so
idle page weight and the Lighthouse budget are unchanged; the service worker
runtime-caches it on first use for offline OCR thereafter.

**Posture.** OCR runs in a Web Worker in the tab; every asset (engine, worker,
WASM core, language data) is same-origin under `/vendored/tesseract/` — **no
network, no third-party service, no AI cloud**. The patient's image never leaves
the device (no BAA, spec-v52 §4.7 / §1.4). OCR is an **input adapter** — it
produces the text a human would otherwise type and makes no prior-authorization
determination, so the deterministic engine, the golden-fixture audit, and the
byte-determinism guarantee (§4.10) are all unchanged. tesseract is a local OCR
kernel, not an LLM-vendor dependency, so the "no AI" commitment (spec-v50 §3.6)
holds.

**CSP (the design decision).** WebAssembly compilation under a CSP needs a
`script-src` token, so `script-src` moves from `'self'` to `'self'
'wasm-unsafe-eval'` (in `_headers`, `index.html`, and `scripts/serve.mjs`).
`'wasm-unsafe-eval'` permits **only** same-origin WASM compilation — not general
`eval`, not `'unsafe-inline'`, not any third-party origin — and `connect-src
'self'` (the no-outbound-network promise) is unchanged, so "no third-party
scripts" still holds in substance. `check-commitments.mjs` already permits the
token while forbidding `unsafe-inline` / wildcards / off-origin sources.

New `lib/pa/ocr.js` (Node-safe glue + a dependency-injected `createOcrRunner`);
`views/pa-lint.js` gains the lazy loader, candidate detection, the OCR control,
scanned-PDF page rendering (canvas + the vendored pdf.js), and a `data-rule` hook
on findings rows. The /commitments page and `vendored/tesseract/_vendored.md`
disclose the vendored engine, its Apache-2.0 license, and the CSP tradeoff.
Tests: +10 unit (`test/unit/pa-ocr.test.js`, driven by a fake worker) and +1 e2e
(`test/integration/pa-lint-ocr.spec.js` — runs real OCR on an in-page PNG across
chromium/webkit/firefox and asserts zero off-origin requests). Catalog count
unchanged (255 tiles); ruleset count unchanged (775 — OCR is ingest, not a rule).

### Added (spec-v52 wave 52-38 — §4.5.38 North Carolina Medicaid per-state overlay, 20 of 20)

The ninth per-state Medicaid overlay, and the thirty-second named-payer overlay
overall. The full 20-rule `R-PA-MCNC-NNN` family is anchored to North Carolina
Medicaid's public NC DHHS / NCTracks provider pages (new ledger source
`nc-medicaid-precert`).

A new `'medicaid-nc'` payer bucket (anchors `north carolina medicaid` / `nc
medicaid` / `nctracks`) is placed before the generic `'medicaid'` bucket and
composes with the §4.5.4 Medicaid core via `isMedicaid()`. It is deliberately
distinct from the `'bcbsnc'` commercial bucket (Blue Cross NC, §4.5.19): a North
Carolina Medicaid packet and a Blue Cross NC packet route to different overlays
(unit-tested). The 20 rules mirror the established families with the Medicaid
reframings (transplant → Medicaid-designated transplant center; appeal → state
fair hearing) and NCTracks routing. Each rule self-gates on `bundle.payer ===
'medicaid-nc'` and vacuously passes on every other packet.

Coverage is now 775 rules shipped (was 755), 727 source-anchored (was 707), 47
sources (was 46), 0 ledger orphans, 0 coverage gaps. A new `nc-medicaid-precert`
golden fixture (Medicaid core all pass, MCNC-009 site-of-care flag) re-seeds
deterministically; all thirty-nine goldens re-seeded. Tests: +6 engine assertions
and +1 classify assertion. e2e pa-lint rule count 755 -> 775. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-38. Nine of the
largest state Medicaid programs by enrollment (CA, NY, TX, FL, OH, IL, WA, GA, NC)
now have overlays.

### Added (spec-v52 wave 52-37 — §4.5.37 Georgia Medicaid per-state overlay, 20 of 20)

The eighth per-state Medicaid overlay, and the thirty-first named-payer overlay
overall. The full 20-rule `R-PA-MCGA-NNN` family is anchored to Georgia
Medicaid's public Department of Community Health / GAMMIS provider pages (new
ledger source `ga-medicaid-precert`).

A new `'medicaid-ga'` payer bucket (anchors `georgia medicaid` / `gammis` /
`georgia department of community health`) is placed before the generic
`'medicaid'` bucket and composes with the §4.5.4 Medicaid core via
`isMedicaid()`. The 20 rules mirror the established families with the Medicaid
reframings (transplant → Medicaid-designated transplant center; appeal → state
fair hearing) and Georgia GAMMIS routing. Each rule self-gates on `bundle.payer
=== 'medicaid-ga'` and vacuously passes on every other packet.

Coverage is now 755 rules shipped (was 735), 707 source-anchored (was 687), 46
sources (was 45), 0 ledger orphans, 0 coverage gaps. A new `ga-medicaid-precert`
golden fixture (Medicaid core all pass, MCGA-009 site-of-care flag) re-seeds
deterministically; all thirty-eight goldens re-seeded. Tests: +5 engine
assertions and +1 classify assertion. e2e pa-lint rule count 735 -> 755. Catalog
count unchanged (255 tiles). The PA tile's wave banner advances to 52-37.

### Added (spec-v52 wave 52-36 — §4.5.36 Washington Apple Health (Medicaid) per-state overlay, 20 of 20)

The seventh per-state Medicaid overlay (after California, New York, Texas,
Florida, Ohio, and Illinois), and the thirtieth named-payer overlay overall. The
full 20-rule `R-PA-MCWA-NNN` family is anchored to Washington's public Apple
Health / Health Care Authority (HCA) / ProviderOne provider pages (new ledger
source `wa-medicaid-precert`). Washington brands its Medicaid program as Apple
Health.

A new `'medicaid-wa'` payer bucket (anchors `washington apple health` / `apple
health` / `washington medicaid` / `washington state health care authority`) is
placed before the generic `'medicaid'` bucket and composes with the §4.5.4
Medicaid core via `isMedicaid()`. The 20 rules mirror the established families
with the Medicaid reframings (transplant → Medicaid-designated transplant center;
appeal → state fair hearing) and Washington ProviderOne routing. Each rule
self-gates on `bundle.payer === 'medicaid-wa'` and vacuously passes on every other
packet.

Coverage is now 735 rules shipped (was 715), 687 source-anchored (was 667), 45
sources (was 44), 0 ledger orphans, 0 coverage gaps. A new `wa-medicaid-precert`
golden fixture (Medicaid core all pass, MCWA-009 site-of-care flag) re-seeds
deterministically; all thirty-seven goldens re-seeded. Tests: +5 engine
assertions and +1 classify assertion. e2e pa-lint rule count 715 -> 735. Catalog
count unchanged (255 tiles). The PA tile's wave banner advances to 52-36.

### Added (spec-v52 wave 52-35 — §4.5.35 Illinois Medicaid per-state overlay, 20 of 20)

The sixth per-state Medicaid overlay (after California, New York, Texas, Florida,
and Ohio), and the twenty-ninth named-payer overlay overall. The full 20-rule
`R-PA-MCIL-NNN` family is anchored to Illinois Medicaid's public HFS (Department
of Healthcare and Family Services) / IMPACT / MEDI provider pages (new ledger
source `il-medicaid-precert`).

A new `'medicaid-il'` payer bucket (anchors `illinois medicaid` / `illinois
department of healthcare and family services` / `hfs medicaid`) is placed before
the generic `'medicaid'` bucket and composes with the §4.5.4 Medicaid core via
`isMedicaid()`. It is deliberately distinct from the `'hcsc'` commercial bucket
(BCBS of Illinois, §4.5.12): an Illinois Medicaid packet and a BCBS-of-Illinois
packet route to different overlays (unit-tested). The 20 rules mirror the
established families with the Medicaid reframings (transplant → Medicaid-designated
transplant center; appeal → state fair hearing) and Illinois IMPACT / MEDI
routing. Each rule self-gates on `bundle.payer === 'medicaid-il'` and vacuously
passes on every other packet.

Coverage is now 715 rules shipped (was 695), 667 source-anchored (was 647), 44
sources (was 43), 0 ledger orphans, 0 coverage gaps. A new `il-medicaid-precert`
golden fixture (Medicaid core all pass, MCIL-009 site-of-care flag) re-seeds
deterministically; all thirty-six goldens re-seeded. Tests: +6 engine assertions
and +1 classify assertion. e2e pa-lint rule count 695 -> 715. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-35. Six of the
largest state Medicaid programs by enrollment (CA, NY, TX, FL, OH, IL) now have
overlays.

### Added (spec-v52 wave 52-34 — §4.5.34 Ohio Medicaid per-state overlay, 20 of 20)

The fifth per-state Medicaid overlay (after California, New York, Texas, and
Florida), and the twenty-eighth named-payer overlay overall. The full 20-rule
`R-PA-MCOH-NNN` family is anchored to Ohio Medicaid's public Ohio Department of
Medicaid / Provider Network Management (PNM) provider pages (new ledger source
`oh-medicaid-precert`).

A new `'medicaid-oh'` payer bucket (anchors `ohio medicaid` / `ohio department of
medicaid`) is placed before the generic `'medicaid'` bucket and composes with the
§4.5.4 Medicaid core via `isMedicaid()`. The 20 rules mirror the established
families with the Medicaid reframings (transplant → Medicaid-designated
transplant center; appeal → state fair hearing) and Ohio Medicaid PNM routing.
Each rule self-gates on `bundle.payer === 'medicaid-oh'` and vacuously passes on
every other packet.

Coverage is now 695 rules shipped (was 675), 647 source-anchored (was 627), 43
sources (was 42), 0 ledger orphans, 0 coverage gaps. A new `oh-medicaid-precert`
golden fixture (Medicaid core all pass, MCOH-009 site-of-care flag) re-seeds
deterministically; all thirty-five goldens re-seeded. Tests: +5 engine assertions
and +1 classify assertion. e2e pa-lint rule count 675 -> 695. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-34.

### Added (spec-v52 wave 52-33 — §4.5.33 Florida Medicaid per-state overlay, 20 of 20)

The fourth per-state Medicaid overlay (after California §4.5.30, New York §4.5.31,
and Texas §4.5.32), and the twenty-seventh named-payer overlay overall. The full
20-rule `R-PA-MCFL-NNN` family is anchored to Florida Medicaid's public AHCA
(Agency for Health Care Administration) / FMMIS provider pages (new ledger source
`fl-medicaid-precert`).

A new `'medicaid-fl'` payer bucket in `lib/pa/payer.js` (anchors `florida
medicaid` / `statewide medicaid managed care` / `florida agency for health care
administration`) is placed before the generic `'medicaid'` bucket and composes
with the §4.5.4 Medicaid core via `isMedicaid()`. It is deliberately distinct
from the `'florida-blue'` commercial Blues bucket (§4.5.14): a Florida Medicaid
packet and a Florida Blue packet route to different overlays (unit-tested). The
20 rules mirror the established families with the Medicaid reframings (transplant
→ Medicaid-designated transplant center; appeal → state fair hearing) and Florida
Medicaid Web Portal / FMMIS routing. Each rule self-gates on `bundle.payer ===
'medicaid-fl'` and vacuously passes on every other packet.

Coverage is now 675 rules shipped (was 655), 627 source-anchored (was 607), 42
sources (was 41), 0 ledger orphans, 0 coverage gaps. A new `fl-medicaid-precert`
golden fixture (Medicaid core all pass, MCFL-009 site-of-care flag) re-seeds
deterministically; all thirty-four goldens re-seeded. Tests: +7 engine assertions
and +1 classify assertion. e2e pa-lint rule count 655 -> 675. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-33.

### Added (spec-v52 wave 52-32 — §4.5.32 Texas Medicaid per-state overlay, 20 of 20)

The third per-state Medicaid overlay (after Medi-Cal §4.5.30 and New York
§4.5.31), and the twenty-sixth named-payer overlay overall. The full 20-rule
`R-PA-MCTX-NNN` family is anchored to Texas Medicaid's public TMHP (Texas
Medicaid & Healthcare Partnership) provider pages and manuals (new ledger source
`tx-medicaid-precert`). Texas is one of the largest state Medicaid programs by
enrollment.

A new `'medicaid-tx'` payer bucket in `lib/pa/payer.js` (anchors `texas medicaid`
/ `tmhp` / the two TMHP corporate spellings) is placed before the generic
`'medicaid'` bucket, and composes with the §4.5.4 Medicaid core through the
`isMedicaid()` predicate (a Texas Medicaid packet is checked against both the
`R-PA-MCD-NNN` core and the Texas overlay; regression-tested). The 20 rules mirror
the established families with the Medicaid reframings (transplant →
Medicaid-designated transplant center; appeal → state fair hearing) and TMHP
routing names. Each rule self-gates on `bundle.payer === 'medicaid-tx'` and
vacuously passes on every other packet.

Coverage is now 655 rules shipped (was 635), 607 source-anchored (was 587), 41
sources (was 40), 0 ledger orphans, 0 coverage gaps. A new `tx-medicaid-precert`
golden fixture (Medicaid core all pass, MCTX-009 site-of-care flag) re-seeds
deterministically; all thirty-three goldens re-seeded. Tests: +6 engine
assertions and +1 classify assertion. e2e pa-lint rule count 635 -> 655. Catalog
count unchanged (255 tiles). The PA tile's wave banner advances to 52-32. With
California, New York, and Texas shipped, the per-state Medicaid line covers the
three largest state programs by enrollment.

### Added (spec-v52 wave 52-31 — §4.5.31 New York State Medicaid per-state overlay, 20 of 20)

The second per-state Medicaid overlay (after Medi-Cal §4.5.30), and the
twenty-fifth named-payer overlay overall. The full 20-rule `R-PA-MCNY-NNN` family
is anchored to New York State Medicaid's public eMedNY provider pages and manuals
(new ledger source `ny-medicaid-precert`). New York is the second-largest state
Medicaid program by enrollment.

A new `'medicaid-ny'` payer bucket in `lib/pa/payer.js` (anchors `new york state
medicaid` / `nys medicaid` / `new york medicaid` / `emedny`) is placed before the
generic `'medicaid'` bucket, and composes with the §4.5.4 Medicaid core through
the `isMedicaid()` predicate introduced in wave 52-30 (a NY Medicaid packet is
checked against both the `R-PA-MCD-NNN` core and the NY overlay; regression-tested).
The 20 rules mirror the established families with the Medicaid reframings
(transplant → Medicaid-designated transplant center; appeal → state fair hearing)
and New-York routing names (eMedNY / ePACES submission channel). Each rule
self-gates on `bundle.payer === 'medicaid-ny'` and vacuously passes on every other
packet.

Coverage is now 635 rules shipped (was 615), 587 source-anchored (was 567), 40
sources (was 39), 0 ledger orphans, 0 coverage gaps. A new `ny-medicaid-precert`
golden fixture (Medicaid core all pass, MCNY-009 site-of-care flag) re-seeds
deterministically; all thirty-two goldens re-seeded. Tests: +6 engine assertions
and +1 classify assertion. e2e pa-lint rule count 615 -> 635. Catalog count
unchanged (255 tiles). The PA tile's wave banner advances to 52-31.

### Added (spec-v52 wave 52-30 — §4.5.30 Medi-Cal / California Medicaid: first per-state Medicaid overlay, 20 of 20)

The first **per-state Medicaid** overlay (after 23 commercial overlays), and the
twenty-fourth named-payer overlay overall. The full 20-rule `R-PA-MCAL-NNN`
family is anchored to Medi-Cal's (California Medicaid) public provider pages,
manuals, and utilization-management / pharmacy program requirements (new ledger
source `medi-cal-precert`). Medi-Cal is the largest Medicaid program in the
United States by enrollment.

**Detection.** A new `'medicaid-ca'` payer bucket in `lib/pa/payer.js` is placed
*before* the generic `'medicaid'` bucket, so a named program (Medi-Cal,
Denti-Cal, "California Medicaid") routes to its overlay while a state-agnostic
Medicaid packet still routes to the generic `'medicaid'` bucket. The `'medi-cal'`
/ `'denti-cal'` anchors move out of the generic bucket; the hyphen in `medi-cal`
prevents a false match on the common word "medical". An explicit "Medicare
Advantage" (dual-eligible) string still wins the MA bucket earlier.

**Composition with the Medicaid core (the key change).** The §4.5.4
state-agnostic Medicaid core (`R-PA-MCD-NNN`) previously gated on `bundle.payer
=== 'medicaid'`; a Medi-Cal packet routing to `'medicaid-ca'` would have silenced
it. A new `isMedicaid(bucket)` predicate (true for `'medicaid'` and every
`'medicaid-*'` bucket, exported from `lib/pa/payer.js`) now backs all ten MCD
gates, so the core and the per-state overlay compose on the same packet. A unit
regression test asserts the MCD core still fires on a `medicaid-ca` packet.

The 20 rules mirror the commercial families, with two reframed for Medicaid:
transplant (017) routes through a Medicaid-designated transplant center (not BCBS
"Blue Distinction Centers"), and appeal (019) admits the state fair-hearing
pathway. Medi-Cal routing names appear where the program uses them: the Medi-Cal
Provider Portal / eTAR Treatment Authorization Request submission channel (003),
the advanced-imaging UM program (007, 012), pharmacy management / Contract Drugs
List for step therapy (011), behavioral health (016). Each rule self-gates on
`bundle.payer === 'medicaid-ca'` and vacuously passes on every other packet.

Coverage is now 615 rules shipped (was 595), 567 source-anchored (was 547), 39
sources (was 38), 0 ledger orphans, 0 coverage gaps. A new `medi-cal-precert`
golden fixture (a complete Medi-Cal TAR — Medicaid core all pass, MCAL-009
site-of-care flag) re-seeds deterministically; the other thirty goldens gain +20
vacuous-pass findings each; all thirty-one re-seeded. Tests: +9 engine assertions
(count 615, off-bucket loop, the isMedicaid-composition regression guard,
fire/pass checks) and +2 classify assertions. e2e pa-lint rule count 595 -> 615.
Catalog count unchanged (255 tiles; Medi-Cal adds rules, not a tile). The PA
tile's wave banner advances to 52-30.

### Added (spec-v52 wave 52-29 — §4.5.29 HMSA / Blue Cross Blue Shield of Hawaii commercial overlay, 20 of 20)

The twenty-third named commercial-payer overlay, and the eighteenth "Blues plans
by state" overlay. The full 20-rule `R-PA-HMSA-NNN` family is anchored to HMSA's
(the Hawaii Medical Service Association, the Blue Cross Blue Shield licensee for
Hawaii) public provider pages, Medical Policies, and utilization-management /
pharmacy program requirements (new ledger source `hmsa-precert`). HMSA is the
dominant health plan in Hawaii and a distinct independent licensee not already
routed to an earlier bucket.

A new `'hmsa'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsla'` and
before the generic `'commercial'` fall-through. It matches the `hmsa` acronym, the
`hawaii medical service association` corporate name, and the `blue cross blue
shield of hawaii` plan name, so generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'hmsa'` and vacuously passes on every other packet.

The 20 rules mirror the prior twenty-two commercial families so the twenty-three
commercial overlays stay structurally parallel and auditable side by side, with
HMSA-specific routing names where the plan uses them: the HHIN (Hawaii Health
Information Network) submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 595 rules shipped (was 575), 547 source-anchored (was 527), 38
sources (was 37), 0 ledger orphans, 0 coverage gaps. A new `hmsa-precert` golden
fixture (hospital-outpatient knee arthroscopy under an HMSA letterhead) exercises
the on-bucket path — 009 flag, 003 info — and the other twenty-nine goldens gain
+20 vacuous-pass findings each; all thirty re-seeded deterministically. Tests: +9
engine assertions (count 595, the off-bucket loop, fire/pass checks) and +1
classify assertion. e2e pa-lint rule count 575 -> 595. Catalog count unchanged
(255 tiles; HMSA adds rules, not a tile). The PA tile's wave banner advances to
52-29.

### Added (spec-v52 wave 52-28 — §4.5.28 Blue Cross and Blue Shield of Louisiana commercial overlay, 20 of 20)

The twenty-second named commercial-payer overlay, and the seventeenth "Blues
plans by state" overlay. The full 20-rule `R-PA-BCBSLA-NNN` family is anchored to
Blue Cross and Blue Shield of Louisiana's public provider pages, Medical Policies,
and utilization-management / pharmacy program requirements (new ledger source
`bcbsla-precert`). BCBSLA is the dominant Blue Cross Blue Shield licensee in
Louisiana and one of the largest independent licensees not already routed to an
earlier bucket.

A new `'bcbsla'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsmn'` and
before the generic `'commercial'` fall-through. It matches only
definitively-Louisiana anchors (the plan name and the `bcbsla` acronym, which
carries no substring collision with the `bcbsal` Alabama or `bcbsm` Michigan
buckets), so generic `blue cross` / `blue shield` and other licensees stay in the
commercial fall-through, and an explicit "Medicare Advantage" string still wins
the MA bucket earlier. Each rule self-gates on `bundle.payer === 'bcbsla'` and
vacuously passes on every other packet.

The 20 rules mirror the prior twenty-one commercial families so the twenty-two
commercial overlays stay structurally parallel and auditable side by side, with
BCBSLA-specific routing names where the plan uses them: the iLinkBlue / Availity
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 575 rules shipped (was 555), 527 source-anchored (was 507), 37
sources (was 36), 0 ledger orphans, 0 coverage gaps. A new `bcbsla-precert` golden
fixture (hospital-outpatient knee arthroscopy under a BCBSLA letterhead) exercises
the on-bucket path — 009 flag, 003 info — and the other twenty-eight goldens gain
+20 vacuous-pass findings each; all twenty-nine re-seeded deterministically.
Tests: +9 engine assertions (count 575, the off-bucket loop, fire/pass checks) and
+1 classify assertion. e2e pa-lint rule count 555 -> 575. Catalog count unchanged
(255 tiles; BCBSLA adds rules, not a tile). The PA tile's wave banner advances to
52-28.

### Added (spec-v52 wave 52-27 — §4.5.27 Blue Cross and Blue Shield of Minnesota commercial overlay, 20 of 20)

The twenty-first named commercial-payer overlay, and the sixteenth "Blues plans
by state" overlay. The full 20-rule `R-PA-BCBSMN-NNN` family is anchored to Blue
Cross and Blue Shield of Minnesota's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsmn-precert`). BCBSMN is the dominant Blue Cross Blue Shield licensee in
Minnesota and one of the largest independent licensees not already routed to an
earlier bucket.

A new `'bcbsmn'` payer bucket in `lib/pa/payer.js` is placed after `'bluekc'`
and before the generic `'commercial'` fall-through. It matches only the
spelled-out plan name and the `blue cross of minnesota` short form — the bare
`bcbsmn` acronym is deliberately omitted, because `bcbsm` (the earlier Michigan
bucket) is a substring of `bcbsmn` and a bare-acronym packet would otherwise route
to Michigan; the spelled-out name has no such collision (a classify test asserts
Michigan still routes to `bcbsm`). Generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'bcbsmn'` and vacuously passes on every other packet.

The 20 rules mirror the prior twenty commercial families so the twenty-one
commercial overlays stay structurally parallel and auditable side by side, with
BCBSMN-specific routing names where the plan uses them: the Availity / provider
portal submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 555 rules shipped (was 535), 507 source-anchored (was 487), 36
sources (was 35), 0 ledger orphans, 0 coverage gaps. A new `bcbsmn-precert` golden
fixture (hospital-outpatient knee arthroscopy under a Blue Cross and Blue Shield
of Minnesota letterhead) exercises the on-bucket path — 009 flag, 003 info — and
the other twenty-seven goldens gain +20 vacuous-pass findings each; all
twenty-eight re-seeded deterministically. Tests: +9 engine assertions (count 555,
the off-bucket loop, fire/pass checks) and +1 classify assertion. e2e pa-lint rule
count 535 -> 555. Catalog count unchanged (255 tiles; BCBSMN adds rules, not a
tile). The PA tile's wave banner advances to 52-27.

### Added (spec-v52 wave 52-26 — §4.5.26 Blue Cross and Blue Shield of Kansas City commercial overlay, 20 of 20)

The twentieth named commercial-payer overlay, and the fifteenth "Blues plans by
state" overlay. The full 20-rule `R-PA-BLUEKC-NNN` family is anchored to Blue
Cross and Blue Shield of Kansas City's public provider pages, Medical Policies,
and utilization-management / pharmacy program requirements (new ledger source
`bluekc-precert`). Blue KC is the dominant Blue Cross Blue Shield licensee in the
greater Kansas City bistate metropolitan area and a distinct independent licensee
from HCSC and the other Blues already modeled.

A new `'bluekc'` payer bucket in `lib/pa/payer.js` is placed after `'arkbcbs'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Kansas-City anchors (the plan name and the `blue kc` short form), so
generic `blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA bucket
earlier. Each rule self-gates on `bundle.payer === 'bluekc'` and vacuously passes
on every other packet.

The 20 rules mirror the prior nineteen commercial families so the twenty
commercial overlays stay structurally parallel and auditable side by side, with
Blue KC-specific routing names where the plan uses them: the Availity Essentials /
Blue KC provider portal submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 535 rules shipped (was 515), 487 source-anchored (was 467), 35
sources (was 34), 0 ledger orphans, 0 coverage gaps. A new `bluekc-precert` golden
fixture (hospital-outpatient knee arthroscopy under a Blue KC letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-six
goldens gain +20 vacuous-pass findings each; all twenty-seven re-seeded
deterministically. Tests: +9 engine assertions (count 535, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 515 -> 535.
Catalog count unchanged (255 tiles; Blue KC adds rules, not a tile). The PA tile's
wave banner advances to 52-26.

### Added (spec-v52 wave 52-25 — §4.5.25 Arkansas Blue Cross and Blue Shield commercial overlay, 20 of 20)

The nineteenth named commercial-payer overlay, and the fourteenth "Blues plans by
state" overlay. The full 20-rule `R-PA-ARKBCBS-NNN` family is anchored to Arkansas
Blue Cross and Blue Shield's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`arkbcbs-precert`). Arkansas Blue Cross is the dominant Blue Cross Blue Shield
licensee in Arkansas and one of the largest independent licensees not already
routed to an earlier bucket.

A new `'arkbcbs'` payer bucket in `lib/pa/payer.js` is placed after `'bcbssc'` and
before the generic `'commercial'` fall-through. It matches only
definitively-Arkansas anchors (the `arkansas blue cross [and blue shield]` plan
name and the `arkansas bcbs` short form), so generic `blue cross` / `blue shield`
and other licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'arkbcbs'` and vacuously passes on every other packet.

The 20 rules mirror the prior eighteen commercial families so the nineteen
commercial overlays stay structurally parallel and auditable side by side, with
Arkansas-specific routing names where the plan uses them: the AHIN / Availity
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 515 rules shipped (was 495), 467 source-anchored (was 447), 34
sources (was 33), 0 ledger orphans, 0 coverage gaps. A new `arkbcbs-precert`
golden fixture (hospital-outpatient knee arthroscopy under an Arkansas Blue Cross
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
twenty-five goldens gain +20 vacuous-pass findings each; all twenty-six re-seeded
deterministically. Tests: +9 engine assertions (count 515, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 495 -> 515.
Catalog count unchanged (255 tiles; Arkansas Blue Cross adds rules, not a tile).
The PA tile's wave banner advances to 52-25.

### Added (spec-v52 wave 52-24 — §4.5.24 Blue Cross Blue Shield of South Carolina commercial overlay, 20 of 20)

The eighteenth named commercial-payer overlay, and the thirteenth "Blues plans by
state" overlay. The full 20-rule `R-PA-BCBSSC-NNN` family is anchored to Blue
Cross Blue Shield of South Carolina's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbssc-precert`). BCBSSC is the dominant Blue Cross Blue Shield licensee in South
Carolina and one of the largest independent licensees not already routed to an
earlier bucket.

A new `'bcbssc'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsal'` and
before the generic `'commercial'` fall-through. It matches only
definitively-South-Carolina anchors (the plan name and the `bcbssc` acronym, which
carries no substring collision with the Michigan `bcbsm` bucket), so generic
`blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA bucket
earlier. Each rule self-gates on `bundle.payer === 'bcbssc'` and vacuously passes
on every other packet.

The 20 rules mirror the prior seventeen commercial families so the eighteen
commercial overlays stay structurally parallel and auditable side by side, with
BCBSSC-specific routing names where the plan uses them: the My Insurance Manager /
Availity submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 495 rules shipped (was 475), 447 source-anchored (was 427), 33
sources (was 32), 0 ledger orphans, 0 coverage gaps. A new `bcbssc-precert` golden
fixture (hospital-outpatient knee arthroscopy under a BCBSSC letterhead) exercises
the on-bucket path — 009 flag, 003 info — and the other twenty-four goldens gain
+20 vacuous-pass findings each; all twenty-five re-seeded deterministically.
Tests: +9 engine assertions (count 495, the off-bucket loop, fire/pass checks) and
+1 classify assertion. e2e pa-lint rule count 475 -> 495. Catalog count unchanged
(255 tiles; BCBSSC adds rules, not a tile). The PA tile's wave banner advances to
52-24.

### Added (spec-v52 wave 52-23 — §4.5.23 Blue Cross Blue Shield of Alabama commercial overlay, 20 of 20)

The seventeenth named commercial-payer overlay, and the twelfth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, Blue Cross NC, Horizon, BCBST, and
BCBSMA. The full 20-rule `R-PA-BCBSAL-NNN` family is anchored to Blue Cross Blue
Shield of Alabama's public provider pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsal-precert`). BCBSAL is the dominant Blue Cross Blue Shield licensee in
Alabama and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California,
IBX, CareFirst, Blue Cross NC, Horizon, BCBST, or BCBSMA buckets.

A new `'bcbsal'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsma'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Alabama anchors (the plan name and the `bcbsal` acronym), so generic
`blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA
bucket earlier. Each rule self-gates on `bundle.payer === 'bcbsal'` and vacuously
passes on every other packet.

The 20 rules mirror the prior sixteen commercial families so the seventeen
commercial overlays stay structurally parallel and auditable side by side, with
BCBSAL-specific routing names where the plan uses them: the ProviderAccess /
Availity submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 475 rules shipped (was 455), 427 source-anchored (was 407), 32
sources (was 31), 0 ledger orphans, 0 coverage gaps. A new `bcbsal-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSAL letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-three
goldens gain +20 vacuous-pass findings each; all twenty-four re-seeded
deterministically. Tests: +9 engine assertions (count 475, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 455 -> 475.
Catalog count unchanged (255 tiles; BCBSAL adds rules, not a tile). The PA tile's
wave banner advances to 52-23.

### Added (spec-v52 wave 52-22 — §4.5.22 Blue Cross Blue Shield of Massachusetts commercial overlay, 20 of 20)

The sixteenth named commercial-payer overlay, and the eleventh "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, Blue Cross NC, Horizon, and BCBST.
The full 20-rule `R-PA-BCBSMA-NNN` family is anchored to Blue Cross Blue Shield
of Massachusetts's public Provider Central pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsma-precert`). BCBSMA is the dominant Blue Cross Blue Shield licensee in
Massachusetts and one of the largest independent licensees not already routed to
the Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, IBX, CareFirst, Blue Cross NC, Horizon, or BCBST buckets.

A new `'bcbsma'` payer bucket in `lib/pa/payer.js` is placed after `'bcbst'` and
before the generic `'commercial'` fall-through. It matches only the spelled-out
plan name and the `bcbs of massachusetts` short form — the bare `bcbsma` acronym
is deliberately omitted, because `bcbsm` (the earlier Michigan bucket) is a
substring of `bcbsma` and a bare-acronym packet would otherwise route to
Michigan; the spelled-out name has no such collision (a classify test asserts
Michigan still routes to `bcbsm`). Generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'bcbsma'` and vacuously passes on every other packet.

The 20 rules mirror the prior fifteen commercial families so the sixteen
commercial overlays stay structurally parallel and auditable side by side, with
BCBSMA-specific routing names where the plan uses them: the Provider Central /
Availity submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 455 rules shipped (was 435), 407 source-anchored (was 387), 31
sources (was 30), 0 ledger orphans, 0 coverage gaps. A new `bcbsma-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSMA letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-two
goldens gain +20 vacuous-pass findings each; all twenty-three re-seeded
deterministically. Tests: +9 engine assertions (count 455, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 435 -> 455.
Catalog count unchanged (255 tiles; BCBSMA adds rules, not a tile). The PA tile's
wave banner advances to 52-22.

### Added (spec-v52 wave 52-21 — §4.5.21 Blue Cross Blue Shield of Tennessee commercial overlay, 20 of 20)

The fifteenth named commercial-payer overlay, and the tenth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, Blue Cross NC, and Horizon. The
full 20-rule `R-PA-BCBST-NNN` family is anchored to Blue Cross Blue Shield of
Tennessee's public provider authorizations pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbst-precert`). BCBST is the dominant Blue Cross Blue Shield licensee in
Tennessee and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California,
IBX, CareFirst, Blue Cross NC, or Horizon buckets.

A new `'bcbst'` payer bucket in `lib/pa/payer.js` is placed after `'horizon'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Tennessee anchors (the plan name and the `bcbst` acronym), so
generic `blue cross` / `blue shield` and other licensees stay in the commercial
fall-through, and an explicit "Medicare Advantage" string still wins the MA
bucket earlier. Each rule self-gates on `bundle.payer === 'bcbst'` and vacuously
passes on every other packet.

The 20 rules mirror the prior fourteen commercial families so the fifteen
commercial overlays stay structurally parallel and auditable side by side, with
BCBST-specific routing names where the plan uses them: the Availity Essentials /
BlueAccess submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 435 rules shipped (was 415), 387 source-anchored (was 367), 30
sources (was 29), 0 ledger orphans, 0 coverage gaps. A new `bcbst-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBST letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty-one
goldens gain +20 vacuous-pass findings each; all twenty-two re-seeded
deterministically. Tests: +9 engine assertions (count 435, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 415 -> 435.
Catalog count unchanged (255 tiles; BCBST adds rules, not a tile). The PA tile's
wave banner advances to 52-21.

### Added (spec-v52 wave 52-20 — §4.5.20 Horizon Blue Cross Blue Shield of New Jersey commercial overlay, 20 of 20)

The fourteenth named commercial-payer overlay, and the ninth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, CareFirst, and Blue Cross NC. The full
20-rule `R-PA-HORIZON-NNN` family is anchored to Horizon Blue Cross Blue Shield
of New Jersey's public provider prior-authorization pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`horizon-precert`). Horizon is the dominant Blue Cross Blue Shield licensee in
New Jersey and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of California,
IBX, CareFirst, or Blue Cross NC buckets.

A new `'horizon'` payer bucket in `lib/pa/payer.js` is placed after `'bcbsnc'`
and before the generic `'commercial'` fall-through. It matches only
definitively-Horizon anchors (`horizon blue cross`, `horizon bcbs`, `horizon
healthcare services`), never the bare common word `horizon`, so generic `blue
cross` / `blue shield` and other licensees stay in the commercial fall-through,
and an explicit "Medicare Advantage" string still wins the MA bucket earlier.
Each rule self-gates on `bundle.payer === 'horizon'` and vacuously passes on
every other packet.

The 20 rules mirror the prior thirteen commercial families so the fourteen
commercial overlays stay structurally parallel and auditable side by side, with
Horizon-specific routing names where the plan uses them: the NaviNet provider
portal / Availity submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 415 rules shipped (was 395), 367 source-anchored (was 347), 29
sources (was 28), 0 ledger orphans, 0 coverage gaps. A new `horizon-precert`
golden fixture (hospital-outpatient knee arthroscopy under a Horizon letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twenty goldens
gain +20 vacuous-pass findings each; all twenty-one re-seeded deterministically.
Tests: +9 engine assertions (count 415, the off-bucket loop, fire/pass checks)
and +1 classify assertion. e2e pa-lint rule count 395 -> 415. Catalog count
unchanged (255 tiles; Horizon adds rules, not a tile). The PA tile's wave banner
advances to 52-20.

### Added (spec-v52 wave 52-19 — §4.5.19 Blue Cross Blue Shield of North Carolina commercial overlay, 20 of 20)

The thirteenth named commercial-payer overlay, and the eighth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, Independence Blue Cross, and CareFirst. The full 20-rule
`R-PA-BCBSNC-NNN` family is anchored to Blue Cross Blue Shield of North
Carolina's public provider prior-authorization pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`bcbsnc-precert`). Blue Cross NC is the dominant Blue Cross Blue Shield licensee
in North Carolina and one of the largest independent licensees not already
routed to the Anthem/Elevance, HCSC, Highmark, Florida Blue, BCBSM, Blue Shield
of California, IBX, or CareFirst buckets.

A new `'bcbsnc'` payer bucket in `lib/pa/payer.js` is placed after `'carefirst'`
and before the generic `'commercial'` fall-through. It matches only
definitively-North-Carolina anchors (the plan name, the `blue cross nc` short
form, and the `bcbsnc` acronym), so generic `blue cross` / `blue shield` and
other licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'bcbsnc'` and vacuously passes on every other packet.

The 20 rules mirror the prior twelve commercial families so the thirteen
commercial overlays stay structurally parallel and auditable side by side, with
Blue-Cross-NC-specific routing names where the plan uses them: the Blue e
provider portal / Availity submission channel (003), the advanced-imaging
utilization-management program (007, 012), pharmacy management for step therapy
(011), behavioral health (016), and the Blue Distinction Centers for Transplant
(017).

Coverage is now 395 rules shipped (was 375), 347 source-anchored (was 327), 28
sources (was 27), 0 ledger orphans, 0 coverage gaps. A new `bcbsnc-precert`
golden fixture (hospital-outpatient knee arthroscopy under a Blue Cross NC
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
nineteen goldens gain +20 vacuous-pass findings each; all twenty re-seeded
deterministically. Tests: +9 engine assertions (count 395, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 375 -> 395.
Catalog count unchanged (255 tiles; Blue Cross NC adds rules, not a tile). The
PA tile's wave banner advances to 52-19.

### Added (spec-v52 wave 52-18 — §4.5.18 CareFirst BlueCross BlueShield commercial overlay, 20 of 20)

The twelfth named commercial-payer overlay, and the seventh "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, Blue Shield of
California, and Independence Blue Cross. The full 20-rule `R-PA-CAREFIRST-NNN`
family is anchored to CareFirst BlueCross BlueShield's public provider
preauthorization pages, Medical Policies, and utilization-management / pharmacy
program requirements (new ledger source `carefirst-precert`). CareFirst is the
dominant Blue Cross Blue Shield licensee in the mid-Atlantic — Maryland, the
District of Columbia, and Northern Virginia — and one of the largest independent
licensees not already routed to the Anthem/Elevance, HCSC, Highmark, Florida
Blue, BCBSM, Blue Shield of California, or IBX buckets.

A new `'carefirst'` payer bucket in `lib/pa/payer.js` is placed after `'ibx'`
and before the generic `'commercial'` fall-through. It matches the unambiguous
`carefirst` trade-name anchor, so generic `blue cross` / `blue shield` and other
licensees stay in the commercial fall-through, and an explicit "Medicare
Advantage" string still wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'carefirst'` and vacuously passes on every other packet.

The 20 rules mirror the prior eleven commercial families so the twelve commercial
overlays stay structurally parallel and auditable side by side, with
CareFirst-specific routing names where the plan uses them: the CareFirst Direct /
iEXchange submission channel (003), the advanced-imaging utilization-management
program (007, 012), pharmacy management for step therapy (011), behavioral health
(016), and the Blue Distinction Centers for Transplant (017).

Coverage is now 375 rules shipped (was 355), 327 source-anchored (was 307), 27
sources (was 26), 0 ledger orphans, 0 coverage gaps. A new `carefirst-precert`
golden fixture (hospital-outpatient knee arthroscopy under a CareFirst
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
eighteen goldens gain +20 vacuous-pass findings each; all nineteen re-seeded
deterministically. Tests: +9 engine assertions (count 375, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 355 -> 375.
Catalog count unchanged (255 tiles; CareFirst adds rules, not a tile). The PA
tile's wave banner advances to 52-18.

### Added (spec-v52 wave 52-17 — §4.5.17 Independence Blue Cross commercial overlay, 20 of 20)

The eleventh named commercial-payer overlay, and the sixth "Blues plans by
state" overlay after HCSC, Highmark, Florida Blue, BCBSM, and Blue Shield of
California. The full 20-rule `R-PA-IBX-NNN` family is anchored to Independence
Blue Cross's public provider authorizations pages, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`ibx-precert`). Independence Blue Cross (IBX) is the dominant Blue Cross Blue
Shield licensee in southeastern Pennsylvania (the Philadelphia region) and one
of the largest independent licensees not already routed to the Anthem/Elevance,
HCSC, Highmark, Florida Blue, BCBSM, or Blue Shield of California buckets.

A new `'ibx'` payer bucket in `lib/pa/payer.js` is placed after `'blue-shield-ca'`
and before the generic `'commercial'` fall-through. It matches the `independence
blue cross` / `independence administrators` / `ibx` anchors. Critically, IBX
(southeastern PA) is a distinct licensee from Highmark (western / central PA) —
the `'highmark'` bucket catches that brand earlier — so generic `blue cross` /
`blue shield` and other licensees stay in the commercial fall-through, and an
explicit "Medicare Advantage" string still wins the MA bucket earlier. Each rule
self-gates on `bundle.payer === 'ibx'` and vacuously passes on every other packet.

The 20 rules mirror the prior ten commercial families so the eleven commercial
overlays stay structurally parallel and auditable side by side, with IBX-specific
routing names where the plan uses them: the Availity / PEAR provider portal
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 355 rules shipped (was 335), 307 source-anchored (was 287), 26
sources (was 25), 0 ledger orphans, 0 coverage gaps. A new `ibx-precert` golden
fixture (hospital-outpatient knee arthroscopy under an Independence Blue Cross
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
seventeen goldens gain +20 vacuous-pass findings each; all eighteen re-seeded
deterministically. Tests: +10 engine assertions (count 355, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 335 -> 355.
Catalog count unchanged (255 tiles; IBX adds rules, not a tile). The PA tile's
wave banner advances to 52-17.

### Added (spec-v52 wave 52-16 — §4.5.16 Blue Shield of California commercial overlay, 20 of 20)

The tenth named commercial-payer overlay, and the fifth "Blues plans by state"
overlay after HCSC, Highmark, Florida Blue, and BCBSM. The full 20-rule
`R-PA-BSCA-NNN` family is anchored to Blue Shield of California's public provider
authorizations pages, Medical Policies, and utilization-management / pharmacy
program requirements (new ledger source `blueshieldca-precert`). Blue Shield of
California is the second-largest health plan in California and one of the largest
independent Blue Cross Blue Shield licensees not already routed to the
Anthem/Elevance, HCSC, Highmark, Florida Blue, or BCBSM buckets.

A new `'blue-shield-ca'` payer bucket in `lib/pa/payer.js` is placed after
`'bcbsm'` and before the generic `'commercial'` fall-through. It matches the
unambiguous plan-name anchor `blue shield of california` (and `blue shield of
ca`), so generic `blue cross` / `blue shield` and other licensees stay in the
commercial fall-through. Critically, Blue Shield of California is a distinct
licensee from Anthem Blue Cross of California (Elevance) — the `'anthem'` bucket
catches the latter earlier — and an explicit "Medicare Advantage" string still
wins the MA bucket earlier. Each rule self-gates on
`bundle.payer === 'blue-shield-ca'` and vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark /
Florida Blue / BCBSM families so the ten commercial overlays stay structurally
parallel and auditable side by side, with Blue Shield of California-specific
routing names where the plan uses them: the Availity / provider connection
submission channel (003), the advanced-imaging utilization-management program
(007, 012), pharmacy management for step therapy (011), behavioral health (016),
and the Blue Distinction Centers for Transplant (017).

Coverage is now 335 rules shipped (was 315), 287 source-anchored (was 267), 25
sources (was 24), 0 ledger orphans, 0 coverage gaps. A new
`blue-shield-ca-precert` golden fixture (hospital-outpatient knee arthroscopy
under a Blue Shield of California letterhead) exercises the on-bucket path — 009
flag, 003 info — and the other sixteen goldens gain +20 vacuous-pass findings
each; all seventeen re-seeded deterministically. Tests: +10 engine assertions
(count 335, the off-bucket loop, fire/pass checks) and +1 classify assertion.
e2e pa-lint rule count 315 -> 335. Catalog count unchanged (255 tiles; Blue
Shield of California adds rules, not a tile). The PA tile's wave banner advances
to 52-16.

### Added (spec-v52 wave 52-15 — §4.5.15 BCBSM / Blue Cross Blue Shield of Michigan commercial overlay, 20 of 20)

The ninth named commercial-payer overlay, and the fourth "Blues plans by state"
overlay after HCSC, Highmark, and Florida Blue. The full 20-rule
`R-PA-BCBSM-NNN` family is anchored to BCBSM's public provider
authorization-requirements pages, Medical Policies, and utilization-management /
pharmacy program requirements (new ledger source `bcbsm-precert`). Blue Cross
Blue Shield of Michigan (with its HMO subsidiary Blue Care Network) is the
dominant Blue Cross Blue Shield licensee in Michigan and one of the largest
independent licensees not already routed to the Anthem/Elevance, HCSC, Highmark,
or Florida Blue buckets.

A new `'bcbsm'` payer bucket in `lib/pa/payer.js` is placed after
`'florida-blue'` and before the generic `'commercial'` fall-through. It matches
only definitively-BCBSM anchors — the `blue cross [and] blue shield of michigan`
plan name, the `bcbsm` acronym, and the `blue care network` HMO brand — so
generic `blue cross` / `blue shield` and other licensees (Independence Blue
Cross, CareFirst) stay in the commercial fall-through, and "BCBSM Medicare Plus
Blue" still wins the MA bucket earlier when it carries an explicit "Medicare
Advantage" string. Each rule self-gates on `bundle.payer === 'bcbsm'` and
vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark /
Florida Blue families so the nine commercial overlays stay structurally parallel
and auditable side by side, with BCBSM-specific routing names where BCBSM uses
them: the Availity Essentials submission channel (003), BCBSM's advanced-imaging
utilization-management program (007, 012), BCBSM pharmacy management for step
therapy (011), BCBSM behavioral health (016), and the Blue Distinction Centers
for Transplant (017).

Coverage is now 315 rules shipped (was 295), 267 source-anchored (was 247), 24
sources (was 23), 0 ledger orphans, 0 coverage gaps. A new `bcbsm-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSM letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other fifteen
goldens gain +20 vacuous-pass findings each; all sixteen re-seeded
deterministically. Tests: +10 engine assertions (count 315, the off-bucket loop,
fire/pass checks) and +1 classify assertion. e2e pa-lint rule count 295 -> 315.
Catalog count unchanged (255 tiles; BCBSM adds rules, not a tile). The PA tile's
wave banner advances to 52-15.

### Added (spec-v52 wave 52-14 — §4.5.14 Florida Blue / GuideWell commercial overlay, 20 of 20)

The eighth named commercial-payer overlay, and the third "Blues plans by state"
overlay after HCSC and Highmark. The full 20-rule `R-PA-FLBLUE-NNN` family is
anchored to Florida Blue's public provider authorizations pages, Medical
Policies, and utilization-management / pharmacy program requirements (new ledger
source `floridablue-precert`). Florida Blue (Blue Cross and Blue Shield of
Florida, a GuideWell company) is the dominant Blue Cross Blue Shield licensee in
Florida and one of the largest independent licensees not already routed to the
Anthem/Elevance, HCSC, or Highmark buckets.

A new `'florida-blue'` payer bucket in `lib/pa/payer.js` is placed after
`'highmark'` and before the generic `'commercial'` fall-through. It matches only
definitively-Florida-Blue anchors — the `florida blue` / `guidewell` trade names
and the `blue cross [and] blue shield of florida` plan name — so generic
`blue cross` / `blue shield` and other licensees (Independence Blue Cross, Blue
Shield of California) stay in the commercial fall-through, and "Florida Blue
Medicare Advantage" still wins the MA bucket earlier when it carries an explicit
"Medicare Advantage" string. Each rule self-gates on
`bundle.payer === 'florida-blue'` and vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark
families so the eight commercial overlays stay structurally parallel and
auditable side by side, with Florida Blue-specific routing names where Florida
Blue uses them: the Availity Essentials submission channel (003), Florida Blue's
advanced-imaging utilization-management program (007, 012), Florida Blue pharmacy
management for step therapy (011), Florida Blue behavioral health (016), and the
Blue Distinction Centers for Transplant (017).

Coverage is now 295 rules shipped (was 275), 247 source-anchored (was 227), 23
sources (was 22), 0 ledger orphans, 0 coverage gaps. A new
`florida-blue-precert` golden fixture (hospital-outpatient knee arthroscopy
under a Florida Blue letterhead) exercises the on-bucket path — 009 flag, 003
info — and the other fourteen goldens gain +20 vacuous-pass findings each; all
fifteen re-seeded deterministically. Tests: +10 engine assertions (count 295,
the off-bucket loop, fire/pass checks) and +1 classify assertion. e2e pa-lint
rule count 275 -> 295. Catalog count unchanged (255 tiles; Florida Blue adds
rules, not a tile). The PA tile's wave banner advances to 52-14.

### Added (spec-v52 wave 52-13 — §4.5.13 Highmark / Blue Cross Blue Shield commercial overlay, 20 of 20)

The seventh named commercial-payer overlay, and the second "Blues plans by
state" overlay after HCSC. The full 20-rule `R-PA-HIGHMARK-NNN` family is
anchored to Highmark's public Provider Resource Center, Medical Policies, and
utilization-management / pharmacy program requirements (new ledger source
`highmark-precert`). Highmark is the second-largest independent Blue Cross Blue
Shield licensee (after HCSC); it operates the Blues plans of Pennsylvania, West
Virginia, Delaware, and western / northeastern New York.

A new `'highmark'` payer bucket in `lib/pa/payer.js` is placed after `'hcsc'`
and before the generic `'commercial'` fall-through. It matches the single
unambiguous brand anchor `highmark` (a distinct trade name, not a generic Blues
phrase), so generic `blue cross` / `blue shield` and other licensees stay in
the commercial fall-through, and "Highmark Medicare Advantage" (Freedom Blue)
still wins the MA bucket earlier when it carries an explicit "Medicare
Advantage" string. Each rule self-gates on `bundle.payer === 'highmark'` and
vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana / HCSC families so
the seven commercial overlays stay structurally parallel and auditable side by
side, with Highmark-specific routing names where Highmark uses them: the
Availity Essentials portal and Provider Resource Center (003), Highmark's
advanced-imaging utilization-management program (007, 012), Highmark pharmacy
management for step therapy (011), Highmark behavioral health (016), and the
Blue Distinction Centers for Transplant (017).

Coverage is now 275 rules shipped (was 255), 227 source-anchored (was 207), 22
sources (was 21), 0 ledger orphans, 0 coverage gaps. A new `highmark-precert`
golden fixture (hospital-outpatient knee arthroscopy under a Highmark
letterhead) exercises the on-bucket path — 009 flag, 003 info — and the other
thirteen goldens gain +20 vacuous-pass findings each; all fourteen re-seeded
deterministically. Tests: +10 engine assertions (count 275, the off-bucket
loop, fire/pass checks) and +1 classify assertion. e2e pa-lint rule count
255 -> 275. Catalog count unchanged (255 tiles; Highmark adds rules, not a
tile). The PA tile's wave banner advances to 52-13.

### Added (spec-v52 wave 52-12 — §4.5.12 HCSC / Blue Cross Blue Shield commercial overlay, 20 of 20)

The sixth named commercial-payer overlay, and the first to address the §9
"Blues plans by state" candidate directly. The full 20-rule `R-PA-HCSC-NNN`
family is anchored to Health Care Service Corporation's public BCBSIL provider
prior-authorization hub, Medical Policies, and utilization-management / Prime
Therapeutics program requirements (new ledger source `hcsc-precert`). HCSC is
the largest Blue Cross Blue Shield licensee not already routed to the
Anthem/Elevance bucket; it operates the Blues plans of Illinois, Texas,
Montana, New Mexico, and Oklahoma.

A new `'hcsc'` payer bucket in `lib/pa/payer.js` is placed after `'humana'` and
before the generic `'commercial'` fall-through. It matches only
definitively-HCSC anchors — the corporate name, the `hcsc` acronym, and the
five state plan names (Blue Cross [and] Blue Shield of Illinois / Texas /
Montana / New Mexico / Oklahoma). Generic `blue cross` / `blue shield` and
other licensees (Florida Blue, Blue Shield of California) stay in the
commercial fall-through, exactly as the Anthem bucket leaves them, and "Blue
Cross Medicare Advantage" still wins the MA bucket earlier. Each rule self-gates
on `bundle.payer === 'hcsc'` and vacuously passes on every other packet.

The 20 rules mirror the Aetna / UHC / Anthem / Cigna / Humana families so the
six commercial overlays stay structurally parallel and auditable side by side,
with HCSC-specific routing names where HCSC uses them: the Availity Essentials
submission channel (003), HCSC's advanced-imaging utilization-management
program (007, 012), Prime Therapeutics (which HCSC co-owns) for pharmacy / step
therapy (011), HCSC Behavioral Health for behavioral health (016), and the Blue
Distinction Centers for Transplant for transplant (017). As with Humana, the
imaging / lab-management program is named generically in the ruleset, since its
current vendor name collides with an AI-vendor substring barred from source by
spec-v50 §3.6 (check-commitments enforces this).

Coverage is now 255 rules shipped (was 235), 207 source-anchored (was 187), 21
sources (was 20), 0 ledger orphans, 0 coverage gaps. A new `hcsc-precert`
golden fixture (hospital-outpatient knee arthroscopy under a BCBSIL letterhead)
exercises the on-bucket path — 009 flag, 003 info — and the other twelve
goldens gain +20 vacuous-pass findings each; all thirteen re-seeded
deterministically. Tests: +10 engine assertions (count 255, the off-bucket
loop, fire/pass checks) and +1 classify assertion. Catalog count unchanged
(255 tiles; HCSC adds rules, not a tile). The PA tile's wave banner advances to
52-12.

### Fixed (tool views — deferred listener wiring on a torn-down view)

Hardened a navigation/teardown race that surfaced intermittently in the
`all-tools` e2e sweep on Firefox (a `pageerror`: `getElementById(...) is null`
→ `.addEventListener`). Eleven tool renderers (opioid-mme, steroid-equiv,
benzo-equiv, abx-renal, vasopressor, field-triage, tetanus, rabies-pep,
bbp-exposure, tb-testing, sti-screening) build their UI and wire input
listeners **inside** a `loadFile(...).then(...)` callback. When the user (or
the test) navigated to another tool before the dataset fetch resolved,
`renderToolView` had already cleared the DOM, so the late callback wired
listeners to elements that no longer existed and threw. Each deferred callback
now bails with `if (!root.isConnected) return;` when its view was torn down
before the fetch resolved. Real-user impact: navigating away from one of these
tools mid-load no longer logs a console error. Verified with
`all-tools --project=firefox --repeat-each=3` (9/9 green).

### Added (spec-v52 wave 52-7c — §4.5.7 Aetna commercial overlay, 11 → 15 of ~20)

Five more self-gating `R-PA-AETNA-NNN` rules anchored to named Aetna Clinical
Policy Bulletins and the Outpatient Surgical Procedures policy: step-therapy
prior-trial documentation for a drug request (011, flag), the bariatric CPB
0157 BMI + supervised-weight-management requirement (012, flag), the genetic
CPB 0140 pre-test counseling + family-history requirement (013, flag), a
retrospective-request justification (014, info), and the Outpatient Surgical
Procedures site-of-service rationale for a hospital-setting elective surgery
(015, info). Each vacuously passes off the `aetna` bucket.

No ledger/bucket change (all fifteen Aetna rules map to the existing
`aetna-precert` source by prefix). Coverage is now 150 rules shipped, 102
source-anchored, 0 orphans, 0 gaps. A new `aetna-drug` golden fixture
(specialty J-code request) demonstrates 011 + 010 firing; the `aetna-precert`
fixture now also surfaces 015. All eight goldens re-seeded; e2e finding count
145 → 150. View wave banner advanced to 52-7c.

### Added (spec-v52 wave 52-7b — §4.5.7 Aetna commercial overlay, 6 → 10 of ~20)

Five more self-gating `R-PA-AETNA-NNN` rules keyed to Aetna's public
utilization-management surface: concurrent-review documentation for an
inpatient request (006, flag), the site-of-care requirement for a
hospital-outpatient MRI/CT (007, flag), a clinical-urgency justification on an
expedited request (008, flag), objective evidence (visual field / photos /
measurements) for procedures whose Clinical Policy Bulletin requires it (009,
flag), and the NDC on a physician-administered J-code drug request (010, info).
Each vacuously passes off the `aetna` bucket.

No ledger change (all ten Aetna rules map to the existing `aetna-precert`
source by prefix). Coverage is now 145 rules shipped, 97 source-anchored, 0
orphans, 0 gaps. A new `aetna-imaging` golden fixture (hospital-outpatient
expedited MRI) demonstrates 007 + 008 firing; the `aetna-precert` fixture now
also surfaces 006. All seven goldens re-seeded; e2e finding count 140 → 145.
View wave banner advanced to 52-7b.

### Added (spec-v52 wave 52-7a — §4.5.7 commercial payer overlays open: Aetna)

The §9 wave plan's "first commercial payer overlays" land now that the core,
CMS FFS / MA / Medicaid, specialty, report, and maintenance surfaces are all
complete. `lib/pa/payer.js` gains a named `aetna` payer bucket (before the
generic `commercial` fall-through; `aetna medicare advantage` still routes to
the MA bucket). `lib/pa/rules.js` adds five self-gating `R-PA-AETNA-NNN` rules
(§4.5.7): medical-necessity criteria (Aetna CPB / CMS / MCG) referenced (flag),
supporting clinical documentation attached (flag), submission channel noted
(info), service-on-precert-list (info stub, R-PA-053 pattern), and a
procedure-specific precertification questionnaire when required (flag). Each
rule vacuously passes on non-Aetna packets and cites Aetna's public
precertification hub.

`lib/pa/rule-sources.js` maps `R-PA-AETNA-` to a new ledger source
`aetna-precert`; `pa-staleness-ledger.json` and the bundled
`lib/pa/staleness-ledger.js` were regenerated (16 sources; 140 rules shipped;
92 source-anchored; 0 orphans; 0 coverage gaps). A new `aetna-precert` golden
fixture demonstrates the overlay; the four prior goldens were re-seeded to add
the five vacuously-passing Aetna findings. View wave banner advanced to 52-7a.

### Added (spec-v52 wave 52-6j — §4.5.6 stale-source disabling: the engine half)

Wires the engine to act on a ledger source marked `disabled` (`true` or
`{ since, reason }`): `disabledSourceMap(ledger)` (`lib/pa/staleness.js`)
normalizes the flag, and `runEngine(bundle, rules, { disabledSources })` skips
any rule anchored to a disabled source — emitting a `status: "disabled"`
finding (evidence null, note recording the source / since / reason) instead of
running its check. `summarizeFindings` gains a `disabled` count; the report
audit trail gains a `disabledRules` array; the DOCX renders both. A
`disabled-source` golden fixture exercises the path. Closes the last "Not yet
built" item in `docs/pa-maintenance.md`; §4.5.6 is complete.

### Added (spec-v52 wave 52-6i — §4.5.6 / §8.2 maintainer refresh helper)

`scripts/refresh-pa-rules.mjs` (exposed as `npm run refresh:pa-rules`) fetches
every ledger source URL, reports the HTTP outcome and a content SHA-256,
computes staleness age, tallies dependent rules per source, and prints a
per-source recommendation. Because it makes outbound network requests it is
NOT wired into `npm run lint` / `npm run test` and never runs in CI's offline
build or the browser (spec-v50 §3.1). Its report-building core is pure and
network-free, unit-tested in `test/unit/pa-refresh.test.js` with injected
fetch outcomes.

### Added (spec-v52 wave 52-6h — §4.5.6 structured per-rule source metadata)

New pure module `lib/pa/rule-sources.js` exports `ruleSourceIds(id)`, a total
map from rule id to the ledger source id(s) it is anchored to (or `[]` for a
structural rule). `rules.js` attaches the result as each rule's `sources`
field at load. `lib/pa/staleness.js` gains `findRuleSourceOrphans` and
`findLedgerCoverageGaps`, both wired into `scripts/check-pa-staleness.mjs` so
the ledger and the per-rule map cannot drift in either direction. The field is
build/maintenance plumbing and never enters a finding or the report.

### Added (spec-v52 wave 52-6g — §4.3 / §8.1 PA runtime no-network spec)

Ships the runtime proof of §4.3's central commitment — "the only network
access during a session is the initial page load; after first paint there
are zero outbound requests" — and of Sophie's first commitment (spec-v50
§3.1) that the patient's chart never leaves the tab. Until now that was
asserted statically (`check-commitments.mjs`, `grep-check.mjs`) and at
runtime only for a sample of numeric tiles (`no-network.spec.js`); the PA
pipeline — the one surface that ingests PHI — had no runtime network
assertion.

**New surface:**

- `test/integration/pa-no-network.spec.js` (§8.1) mirrors the generic
  no-network harness but drives the PA pipeline end-to-end: it drops a
  happy-path TXT packet plus a one-page PDF (the PDF forces the lazy
  `pdf.js` import — the single most likely place for an accidental
  off-origin fetch such as a CDN worker, cmaps, or standard fonts), then
  serializes all three report flavors (DOCX, full JSON, redacted JSON) by
  clicking each download button. It then asserts zero off-origin requests,
  zero `navigator.sendBeacon` / `Image`-pixel fires, an empty
  `document.cookie`, and only allowlisted storage keys (the PA tile writes
  none). Chromium-only, consistent with the other `pa-lint-*` specs.

View wave banner advanced to 52-6g.

### Added (spec-v52 wave 52-6f — §4.10 / §8.2 PA golden-fixture audit + §8.4 property tests)

Builds the two determinism-enforcement surfaces §8 named but the report
waves had not yet shipped.

**New surfaces:**

- `scripts/audit-pa.mjs` (§8.2, wired into `npm run lint` → the CI Lint
  step; also `npm run audit:pa`) runs the full deterministic pipeline
  against every fixture under `test/fixtures/pa-lint/` and diffs the
  produced JSON report against the committed golden in
  `test/fixtures/pa-lint/expected/`. The report is built without
  `generatedAt`, so the output is byte-stable (§4.10). Re-seed intended
  changes with `node scripts/audit-pa.mjs --update`.
- Four fixtures: `happy-path`, `missing-npi` (R-PA-016 block), `bad-pos`
  (R-PA-013 block on a POS off the CMS list), `cms-dme` (Medicare FFS
  letterhead engages the §4.5.2 overlay).
- `test/unit/pa-property.test.js` (§8.4) — reorder-invariance,
  irrelevant-file invariance, double-run byte-identity, and redact
  idempotence (plain + findings-aware paths).

**Determinism fix:** the report was not invariant under input file order —
`evidenceLedger` / `extractedData` echoed drop order, and rules citing the
first matching document picked by drop order. `buildBundle` now
canonicalizes document order by content hash (sha256, then name), so the
whole report is order-invariant. No existing test depended on drop order.

Unit suite: 2006 (was 2001).

### Added (spec-v52 wave 52-6e — §4.5.6 / §8.3 follow-up: ledger → ruleset coverage)

Closes a silent-drift gap in the dataset-staleness ledger: its per-source
`rules` arrays named rule ids with nothing verifying those ids still ship.
A renamed or retired rule (cf. the wave 52-2b id correction) would leave
the ledger — and the deferred `scripts/refresh-pa-rules.mjs` that will
iterate exactly these ids — pointing at a dead reference.

**New surfaces:**

- `lib/pa/staleness.js` `findLedgerRuleOrphans(ledger, shippedRuleIds)` —
  pure helper returning every ledger-referenced rule id absent from the
  shipped set, in deterministic (source, then listed) order. Accepts an
  array or a `Set`.
- `scripts/check-pa-staleness.mjs` (already in `npm run lint`) imports
  `STARTER_RULES` from `lib/pa/rules.js`, builds the shipped-id set, and
  exits 1 on the first orphan; the clean line now also reports
  `135 rules shipped, 0 ledger orphans`.

The `rules` arrays stay the representative anchor rules per source (not an
exhaustive map), so no reverse "every rule must have a source" check is
added — that needs the per-rule structured source metadata §4.5.6 still
defers with the refresh script.

**Tests / docs:** 4 new assertions in `test/unit/pa-staleness.test.js`.
`docs/pa-maintenance.md` documents the coverage check and corrects its
"Not yet built" list — the in-tab report-audit-trail staleness item it
still listed actually shipped in 52-6d.

### Added (spec-v52 wave 52-6d — §8.3 follow-up: staleness in the report audit trail)

Surfaces per-source dataset staleness in the in-tab PA report audit
trail, closing the first of the two §8.3 follow-ups wave 52-6c deferred.

**New surfaces:**

- `scripts/build-pa-staleness-ledger.mjs` — generator that emits the
  browser-bundleable module `lib/pa/staleness-ledger.js`
  (`export const PA_STALENESS_LEDGER`) from the canonical
  `pa-staleness-ledger.json`. No runtime fetch, no new dependency.
- `lib/pa/report.js` `auditTrail.datasetStaleness` — per-source
  `{id, label, url, ruleFamily, lastVerified}`; with a caller-supplied
  `generatedAt`, also per-source `{ageDays, state}` and an `evaluated`
  summary. Without a timestamp the block is static ledger facts only, so
  the report stays byte-stable (§4.10).
- `lib/pa/docx.js` — renders a "Dataset source staleness" audit-trail
  subsection.
- `views/pa-lint.js` — captures one timestamp at download time (a user
  click, outside the deterministic compute path) so the in-tab report
  shows live freshness state and a populated "generated at" field.

**CI:** `scripts/check-pa-staleness.mjs` (already in `npm run lint`) now
regenerates-and-diffs `lib/pa/staleness-ledger.js` against the JSON, so
editing the ledger without rebuilding fails CI. 3 new assertions in
`test/unit/pa-report.test.js`.

### Changed (homepage tagline — maintainer request 2026-05-29)

The home `<h1>` and lede were rewritten to a count-free SEO elevator
pitch ("Private healthcare calculators, built for the bedside ...") per
the spec-v29 nurse-first pivot. `check-catalog-truth.mjs` drops the
retired "home lede" count surface; the catalog count of 255 is still
enforced on the remaining 13 surfaces. A "pinned tools" homepage section
was considered and declined — it requires persistent client storage,
which spec-v50 §3.4 forbids and a smoke test guards. Browser bookmarks of
the `/tools/<id>/` pages cover the same need with zero storage.

### Added (spec-v52 wave 52-6c — §8.3 dataset-staleness CI)

Adds the staleness ledger and CI check that spec-v52 §8.3 calls for,
closing the §8 CI surface for the report waves.

**Deliberate refinement of the spec's letter** (same posture as 52-6b):
§8.3 named the ledger `dkb-staleness-ack.yml`. Sophie ships zero runtime
dependencies (spec-v10 §6), so introducing a YAML parser for one config
file is the wrong trade. The ledger is JSON (`pa-staleness-ledger.json`,
repo root). It enumerates the 15 external source families the rules are
anchored to (AMA CPT, CMS HCPCS / ICD-10-CM / POS / NCCI, NPPES, CMS
NCD-LCD / IOM, CMS MA, Medicaid core, ACR AC, FDA labeling, ASA,
DSM-5-TR, NCCN / ACMG), each with its rule ids, canonical URL, and
`lastVerified` date.

**New modules:**

- `lib/pa/staleness.js` — pure evaluator `evaluateStaleness(ledger, now)`
  over the deterministic `lib/pa/date.js` UTC math. States: fresh / warn
  / fail / acknowledged / invalid. An acknowledgment downgrades a stale
  source while the ack itself is current; a stale ack stops masking.
- `scripts/check-pa-staleness.mjs` — CLI wired into `npm run lint` (and
  therefore the CI Lint step). Policy window: warn at 90 days (printed,
  exit 0), fail at 365 days / unparseable date / abandoned ack (exit 1).
  This is §8.3's "fails (or warns, depending on the configured grace
  window)". `--strict` turns warnings into failures; `SOPHIEWELL_NOW`
  pins the evaluation date for reproduction.

**Maintenance:** the new `docs/pa-maintenance.md` (referenced by §8.2)
documents the monthly verification pass, the acknowledgment mechanism,
and the two deferred §8.3 follow-ups (`scripts/refresh-pa-rules.mjs`,
which needs network + §4.5.6 structured source metadata; and surfacing
per-source staleness in the in-tab report audit trail, which needs the
ledger bundled to honor no-network).

**Tests:** new `test/unit/pa-staleness.test.js` (9 assertions covering
the warn/fail boundaries, acknowledgment downgrade and re-surfacing,
invalid dates, mixed-ledger summary, and a ship-time green guard for the
shipped ledger).

### Added (spec-v52 wave 52-6b — §4.6 DOCX report complete + §4.7 redaction hardening)

Ships the human-facing `.docx` flavor of the spec-v52 §4.6 report and the
third download button, closing the §4.6 report contract (JSON + DOCX, full
and PHI-redacted).

**Deliberate refinement of the spec's letter.** §4.6 / §5.2 named a vendored
docx.js (~140 KB) packed in a worker. This wave instead ships a first-party,
dependency-free OOXML writer (`lib/pa/docx.js`) because it better serves the
spec's own intent:

- **§8.1 testability.** `test/unit/pa-report.test.js` must assert "DOCX
  assembles without throwing" under `node --test`. The vendored mammoth.js /
  pdf.js bundles are browser-only and are never imported by the node runner,
  so a vendored browser docx.js could not be exercised there. A module that
  runs identically in node and the browser can.
- **§4.10 determinism.** docx.js packs via jszip, which stamps each zip entry
  with the wall-clock time (not reproducible). This writer zeroes every DOS
  date/time (fixed 1980-01-01) so the same report yields byte-identical
  `.docx` bytes.
- **spec-v10 §6 dependency budget / §4.9 perf.** The ~140 KB dependency and
  its lazy-load path are avoided entirely; the writer is a few hundred bytes
  of first-party code with zero runtime cost until the user clicks Download.

The output is a minimal valid OOXML package (`[Content_Types].xml` +
`_rels/.rels` + `word/document.xml`) stored uncompressed; system `unzip -t`
confirms CRC integrity and Word / LibreOffice / Google Docs open it. The
§5.1 `report.worker.js` and `vendored/docxjs/` surfaces are therefore not
needed and not added.

**New module:**

- `lib/pa/docx.js` — CRC-32 + store-method zip writer + OOXML paragraph
  rendering. `renderReportDocx(report)` returns a `Uint8Array`; `_internals`
  exposes `crc32` / `zipStore` for unit tests. `lib/pa/report.js` gains
  `buildDocxReport` and `buildRedactedDocxReport`, both rendering the
  already-deterministic JSON report object through the writer.

**§4.7 hardening (PHI-leak fix).** Wave 52-6a's
`redactBundle({redactFindings:true})` masked finding evidence / note strings
by pattern only, so a rule that quoted a raw extracted value back without a
label (e.g. `Found "Jane Q Doe" in doc.txt`) leaked the name into both the
redacted JSON and redacted DOCX reports. `redactBundle` now also scrubs the
literal PHI values the extractor pulled (`patientName` / `dob` / `memberId` /
`ssns` / `tins`, longest-first) out of evidence / note before pattern
redaction. The fix lands in the shared `lib/pa/redact.js`, so both report
flavors are covered.

**View wiring:** the `.pa-downloads` group leads with a third button,
"Download report (.docx)", ahead of the two existing JSON buttons; it builds
the DOCX from the in-memory bundle and writes a Blob via
`URL.createObjectURL`. No network call. A shared `triggerDownload` helper now
backs all three buttons.

**Tests:** new `test/unit/pa-docx.test.js` (7 assertions); 3 new DOCX
assertions in `test/unit/pa-report.test.js`; 1 new literal-scrub regression
in `test/unit/pa-redact.test.js`. The Playwright happy-path is unchanged
(still 135 rules).

### Added (spec-v52 wave 52-6a — §4.6 JSON report + §4.7 PHI redaction open)

Ships the JSON half of the spec-v52 §4.6 report contract plus the
§4.7 PHI redaction module. The DOCX flavor lands in wave 52-6b
alongside the vendored docx.js.

**New modules:**

- `lib/pa/redact.js` — deterministic PHI masking covering
  Patient / Name / DOB / Member ID / Subscriber ID / MRN / Chart
  Number / Address / SSN / phone / email. Labeled patterns keep
  the label and replace the value (`Patient: [REDACTED]`); free-
  text patterns redact in full. Idempotent: redacting twice
  changes nothing. Bundle-level `redactBundle` hard-redacts
  extract-block PHI fields (`patientName`, `dob`, `memberId`,
  `ssns`, `tins`, `serviceDates`, `dates`) via a per-field
  allowlist; structural fields (CPT / ICD-10 / POS / NPI codes)
  pass through unchanged.
- `lib/pa/report.js` — six-section JSON report builder mirroring
  the §4.6 enumeration (coverPage / executiveSummary / findings /
  evidenceLedger / extractedData / auditTrail). Per-rule
  remediation hints by rule-id prefix. Deterministic: same
  `bundle` + `findings` produces byte-identical JSON (no
  `Date.now()`, no random, no fetch); `opts.generatedAt` is
  caller-supplied so golden-tests are byte-stable.

**View wiring:** the findings panel now appends a `.pa-downloads`
group with two `<button>` elements — "Download report (.json)"
and "Download PHI-redacted report (.json)". Each click serializes
the in-memory bundle + findings, builds the JSON report (full or
redacted), wraps it in a Blob via `URL.createObjectURL`, and
triggers a same-origin download. No network call.

19 new unit assertions across `test/unit/pa-redact.test.js` (9)
and `test/unit/pa-report.test.js` (10). Total PA unit suite:
197 assertions. The Playwright happy-path is unchanged at 135
rules.

Wave 52-6b will land the DOCX report (vendored docx.js, ~140 KB
gzipped, MIT) and a third download button.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5e — §4.5.5 genetic-testing overlay COMPLETE: closes §4.5.5 + §4.5)

Final 5 specialty rules triggered by AMA molecular-pathology CPT
(81105-81512, simplified to 81xxx). This wave closes the §4.5.5
specialty surface AND the complete spec-v52 §4.5 ruleset.

- **R-PA-GEN-001** — family-history / pedigree / familial anchor
  per NCCN BRCA / hereditary-cancer criteria. Flag.
- **R-PA-GEN-002** — pre-test / post-test genetic-counseling
  anchor per ACMG / NSGC guidelines. Flag.
- **R-PA-GEN-003** — panel-scope rationale (why single-gene vs
  focused vs comprehensive vs WES vs WGS is appropriate)
  documented. Flag.
- **R-PA-GEN-004** — personal clinical indication: either an
  extracted ICD-10 dx OR a clinical-indication anchor. Flag.
- **R-PA-GEN-005** — genetic-specific informed consent covering
  GINA / incidental findings / family implications. Info.

New helper `collectGeneticTestingCpts(bundle)` in `lib/pa/rules.js`
uses the compact `/^81\d{3}$/` filter for AMA Molecular Pathology
Tier 1 + Tier 2 + Genomic Sequencing Procedures. PLA proprietary
lab codes (0001U-0999U) are intentionally NOT consumed here --
the wave-52-1e CPT extractor doesn't match the 4-digit-plus-U
form, so genetic-test trigger relies on the 81xxx CPTs the
extractor already produces.

R-PA-GEN-004's dual-acceptance logic (either an ICD-10 dx OR a
clinical-indication anchor satisfies the rule) follows the
R-PA-RAD-004 pattern. The evidence string records which branch
fired so the audit trail distinguishes structural-signal pass
from anchor pass.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 178 assertions. The Playwright happy-path now asserts
135 rules render in the findings panel.

This closes spec-v52 §4.5.5 AND the complete §4.5 ruleset:

| Section | Description                              | Rules |
|---------|------------------------------------------|-------|
| §4.5.1  | Core (payer-agnostic)                    | 60    |
| §4.5.2  | CMS Medicare FFS overlay                 | 25    |
| §4.5.3  | CMS Medicare Advantage overlay           | 15    |
| §4.5.4  | Medicaid state-agnostic core             | 10    |
| §4.5.5  | Specialty (rad / inf / surg / BH / gen)  | 25    |
| **§4.5**| **Complete deterministic ruleset**       | **135** |

Wave 52-6 picks up with the §4.6 DOCX report, the §4.7 PHI
redaction, and the §8.3 dataset-staleness CI.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5d — §4.5.5 behavioral-health specialty overlay, 5 of 25)

Five behavioral-health rules triggered by an AMA psychiatric CPT
(90785-90899 psychotherapy, 96130-96139 psych testing) OR an
ICD-10 F-code (F00-F99 mental and behavioral disorders):

- **R-PA-BH-001** — ICD-10 F-code AND DSM-5-TR / diagnostic-
  criteria reference present. Flag.
- **R-PA-BH-002** — treatment plan with measurable / time-bound
  goals. Flag.
- **R-PA-BH-003** — step-up of care (outpatient -> IOP -> PHP ->
  residential -> inpatient) requires a prior-level-of-care
  anchor per ASAM / LOCUS. Flag.
- **R-PA-BH-004** — risk assessment (SI / HI / self-harm) per
  Joint Commission NPSG. Flag.
- **R-PA-BH-005** — SUD packets requesting medication-assisted
  treatment reference DEA X-waiver / OTP / induction-maintenance
  phase. Info.

New helper `collectBehavioralHealthSignals(bundle)` in
`lib/pa/rules.js` returns the BH CPTs, the ICD-10 F-codes, and
a `triggered` boolean -- ALL five BH rules consume the same
signal so the trigger logic stays in one place. Specialty rules
apply across every payer once the trigger fires (no
`bundle.payer` self-gate).

R-PA-BH-005's two-stage trigger -- SUD ICD-10 (F10-F19) OR MAT
keyword -- is the first specialty rule to combine structural
code-range filtering AND a keyword fallback in the gate; the
rule fires when either signal is present, but vacuously passes
on a non-SUD / non-MAT packet.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 172 assertions. The Playwright happy-path now
asserts 130 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5c — §4.5.5 surgery specialty overlay, 5 of 25)

Five surgery rules triggered by an AMA Surgery-category CPT
(10004-69990):

- **R-PA-SURG-001** — conservative-management / non-operative
  trial documented; emergent-surgery anchor bypasses with a
  "does not apply" branch. Flag.
- **R-PA-SURG-002** — imaging supporting surgical indication
  (attached imaging-report doc OR imaging-findings anchor).
  Flag.
- **R-PA-SURG-003** — ASA Physical Status >= 3: pre-op medical
  / anesthesia clearance. Flag.
- **R-PA-SURG-004** — ASA classification 1-5 documented. Flag.
- **R-PA-SURG-005** — informed-consent anchor present (R-PA-059
  covers consent date vs service date ordering across the
  packet). Flag.

New helper `collectSurgeryCpts(bundle)` in `lib/pa/rules.js`
collects surgery-category CPTs via `/^[1-6]\d{4}$/`, mirroring
the radiology / J-code collectors. E/M codes like 99213 (9xxxx)
and radiology codes like 70551 (7xxxx) fall outside the trigger
range so the HAPPY_PACKET fixture continues to all-pass.

R-PA-SURG-001 reuses the wave-52-5a R-PA-RAD-002 emergent-
exception pattern: the rule self-bypasses with "Emergent /
urgent surgical anchor present; rule does not apply" rather
than vacuously passing. R-PA-SURG-005 intentionally narrows
R-PA-059 (core consent date check) to the surgery specialty
section so consent issues surface in the specialty audit
cluster.

6 new unit assertions in `test/unit/pa-engine.test.js`.
R-PA-SURG-001's test explicitly strips HAPPY_TEXT's pre-existing
"Step therapy: trial of lisinopril" line so the "trial of"
anchor doesn't pre-satisfy the conservative-management check.
Total PA unit suite: 166 assertions. The Playwright happy-path
now asserts 125 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5b — §4.5.5 infusion / specialty-drug overlay, 5 of 25)

Five infusion / specialty-drug rules triggered by J-code (HCPCS
Level II J####) presence:

- **R-PA-INF-001** — J-code + NDC documented (generalizes the
  Medicaid-specific R-PA-MCD-006 to all payers). Flag.
- **R-PA-INF-002** — weight-based dose: weight + dose-calculation
  anchor (dual-anchor). Flag.
- **R-PA-INF-003** — site-of-care indicator (home / clinic /
  office / infusion center / hospital outpatient). Flag.
- **R-PA-INF-004** — FDA-approved indication or NCCN-compendia
  citation for the diagnosis. Flag.
- **R-PA-INF-005** — premedication / monitoring plan when the
  drug carries infusion-reaction risk (rituximab / infliximab /
  IV iron / taxanes / cetuximab / trastuzumab). Info.

New helper `collectJCodes(bundle)` in `lib/pa/rules.js` extracts
J-codes via `/^J\d{4}$/`, mirroring the radiology / MRI collectors
from wave 52-5a. Like radiology, these rules apply across every
payer once the J-code trigger fires; specialty rules do NOT
self-gate on `bundle.payer`.

R-PA-INF-002 is the fourth dual-anchor rule and reuses the
wave-52-1h `extract.weight` extractor; R-PA-INF-005's risk-trigger
anchor set names the drugs most commonly flagged for infusion-
reaction premedication.

When no J-code is in the requested-procedures list each rule
vacuously passes, so the HAPPY_PACKET fixture continues to
all-pass without modification.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 160 assertions. The Playwright happy-path now asserts
120 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-5a — §4.5.5 specialty overlays open: radiology, 5 of 25)

Opens spec-v52 §4.5.5 with five radiology / advanced-imaging
specialty rules:

- **R-PA-RAD-001** — ACR Appropriateness Criteria reference
  present. Info.
- **R-PA-RAD-002** — non-emergent MRI: conservative-management
  trial anchor; emergent / red-flag exception bypasses. Flag.
- **R-PA-RAD-003** — contrast imaging study: contrast-allergy
  review AND renal-function (eGFR / SCr / CrCl) anchors. Flag.
- **R-PA-RAD-004** — radiology procedure: attached clinical-note
  document or clinical-evaluation anchor. Flag.
- **R-PA-RAD-005** — pediatric imaging: ALARA / dose-reduction
  / pediatric-protocol anchor. Info.

Specialty rules differ from payer overlays: they do NOT self-gate
on `bundle.payer` -- they apply across every payer once the
procedure trigger is met. Two new helpers in `lib/pa/rules.js`
supply the structural triggers:

- `collectRadiologyCpts(bundle)` -- CPT regex `/^7\d{4}$/`
  for the AMA Radiology category 70010-79999.
- `collectMriCpts(bundle)` -- compact prefix-match for the
  common MRI subranges (70551-70559 brain, 71550-71552 chest,
  72141-72158 spine, 72195-72197 pelvis, 73218-73223 upper
  extremity, 73718-73723 lower extremity, 74181-74183 abdomen).

When no imaging CPT is in the requested-procedures list each
rule vacuously passes, so the HAPPY_PACKET fixture (which
requests only 99213) continues to all-pass without modification
despite the fixture's imaging-report attachment.

R-PA-RAD-002's emergent-exception branch is the first specialty
rule to declare itself "does not apply" rather than vacuously
satisfied -- the evidence string reads "Emergent / red-flag
anchor present; rule does not apply" so the audit trail
distinguishes payer-bypass from trigger-absent. R-PA-RAD-003 is
the third dual-anchor rule (allergy AND renal-function).

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 154 assertions. The Playwright happy-path now asserts
115 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-4b — Medicaid state-agnostic core COMPLETE: 5 -> 10)

The final 5 of the 10 spec-v52 §4.5.4 Medicaid state-agnostic
core rules ship, closing both the overlay and the planned wave
52-2 of the spec (§4.5.2 + §4.5.3 + §4.5.4 overlays):

- **R-PA-MCD-006** — J-code physician-administered drug requires
  an NDC (per Section 1927(a)(7) of the Social Security Act).
  Flag.
- **R-PA-MCD-007** — dental service requires an adult-vs-pediatric
  / EPSDT-vs-state-optional coverage indicator. Flag.
- **R-PA-MCD-008** — non-emergency medical transportation (NEMT)
  requires a trip-purpose + appointment-date anchor (42 CFR
  §431.53). Flag.
- **R-PA-MCD-009** — behavioral-health service requires a
  carve-out / integrated-BH indicator (PIHP / BHO / specialty
  MCO). Info.
- **R-PA-MCD-010** — outpatient prescription drug requires an
  MDRP / labeler-agreement / participating-manufacturer indicator
  (per Section 1927). Info.

R-PA-MCD-006 is the third overlay rule to consume HCPCS Level II
codes via regex (`/^J\d{4}$/`), alongside R-PA-CMS-017's L-codes
and R-PA-CMS-026's cataract-surgery range. It also accepts NDC
patterns in 5-4-2 / 5-3-2 / 4-4-2 hyphenated form or 11-digit run.

Each rule self-gates on `bundle.payer === 'medicaid'` and again
on its context anchor (J-code / dental / NEMT / BH / Rx). The
HAPPY_PACKET fixture continues to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 148 assertions. The Playwright happy-path now asserts
110 rules render in the findings panel.

The complete payer-overlay surface is now shipped: 60 §4.5.1 core
+ 25 §4.5.2 CMS FFS + 15 §4.5.3 CMS MA + 10 §4.5.4 Medicaid =
110 rules. Wave 52-3 of the spec (the §4.5.5 specialty overlays
-- 25 rules across imaging / infusion / surgery / behavioral /
genetic) picks up next.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-4a — Medicaid state-agnostic core opens, first 5 of 10)

Opens spec-v52 §4.5.4 with five Medicaid cross-state intersection
rules:

- **R-PA-MCD-001** — state Medicaid member-ID / CIN / recipient-
  ID line present. Block.
- **R-PA-MCD-002** — pediatric Medicaid patient: EPSDT /
  well-child / periodic-screening anchor when seeking
  non-routine services. Flag.
- **R-PA-MCD-003** — eligibility-window / verification anchor
  for the service date. Flag.
- **R-PA-MCD-004** — state-Medicaid medical-necessity /
  state-plan reference. Flag.
- **R-PA-MCD-005** — Managed Care Organization vs FFS Medicaid
  routing indicator. Flag.

Each rule self-gates on `bundle.payer === 'medicaid'` and, where
applicable, on a context anchor (pediatric for EPSDT). The
HAPPY_PACKET fixture continues to all-pass without modification.

R-PA-MCD-001 reuses the wave-52-1f `extract.memberId` extractor.
The Medicaid overlay introduces zero new extractors. R-PA-MCD-001
is distinct from core R-PA-003 (member-ID presence anywhere) --
MCD-001 ties the existence of a recipient ID to the Medicaid-
payer-bucket detection, so a Medicaid packet without a recipient
ID surfaces as a Medicaid-specific block alongside the core block.

6 new unit assertions in `test/unit/pa-engine.test.js` (one
aggregate vacuous-pass guard plus a fires-when-it-should test
per new rule). Total PA unit suite: 143 assertions. The
Playwright happy-path now asserts 105 rules render in the
findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-3c — CMS Medicare Advantage overlay COMPLETE: 10 -> 15)

The final 5 of the 15 spec-v52 §4.5.3 CMS Medicare Advantage
overlay rules ship, closing the overlay:

- **R-PA-MA-011** — organization-determination type (pre-service
  / concurrent / payment) indicator. Info.
- **R-PA-MA-012** — expedited review: treating-clinician clinical-
  urgency / serious-jeopardy attestation. Flag.
- **R-PA-MA-013** — transition supply for new enrollees:
  continuity-of-care anchor. Flag.
- **R-PA-MA-014** — hospice-related service on MA packet:
  hospice-election indicator (elected / not elected / revoked).
  Flag.
- **R-PA-MA-015** — C-SNP / I-SNP: qualifying chronic-condition
  diagnosis or institutional-residence anchor. Flag.

R-PA-MA-015's qualifier-anchor set covers both C-SNP chronic
conditions (diabetes / CHF / ESRD / dementia / HIV/AIDS / COPD)
and I-SNP institutional-residence anchors (SNF resident /
long-term care facility), so one rule serves both SNP variants.

Each rule self-gates on the detected payer bucket and again on a
context anchor (expedited / transition / hospice / SNP-specific).
No new extractors.

The R-PA-MA-015 unit test explicitly strips HAPPY_TEXT's
pre-existing "Dx: I10 essential hypertension" and "Step therapy:
trial of lisinopril..." lines so neither "diabetes" nor any other
qualifier anchor pre-satisfies the rule.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 137 assertions. The Playwright happy-path now asserts
100 rules render in the findings panel.

This closes spec-v52 §4.5.3 (the CMS Medicare Advantage overlay).
Wave 52-4 picks up with §4.5.4 Medicaid state-agnostic core
(10 rules).

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-3b — CMS Medicare Advantage overlay 5 -> 10 of 15)

Five more spec-v52 §4.5.3 MA overlay rules covering drug-coverage
path, D-SNP Medicaid coordination, supplemental benefits, Part B
step therapy, and inpatient admissions:

- **R-PA-MA-006** — MA drug request: Part B vs Part D coverage-
  path indicator. Flag.
- **R-PA-MA-007** — D-SNP packets: state-Medicaid plan / member-
  ID info documented. Flag.
- **R-PA-MA-008** — supplemental benefit (dental / vision /
  hearing) under Evidence of Coverage. Info.
- **R-PA-MA-009** — Part B drug under step therapy requires
  prior-trial / failure documentation per 2019 CMS final rule.
  Flag.
- **R-PA-MA-010** — inpatient admission: two-midnight
  expectation or short-stay-criteria documentation per 2024
  CMS extension. Flag.

Each rule self-gates on the detected payer bucket and again on
a context anchor (drug-request / D-SNP / dental-vision-hearing /
Part B + step therapy / inpatient admission). No new extractors.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 132 assertions. The Playwright happy-path now asserts
95 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-3a — CMS Medicare Advantage overlay opens, first 5 of 15)

Opens spec-v52 §4.5.3 with five Medicare Advantage starter rules
covering the additional documentation MA plans request beyond FFS:

- **R-PA-MA-001** — HMO / gatekeepered plan: PCP referral present
  for specialist services. Block.
- **R-PA-MA-002** — in-network confirmation OR out-of-network
  exception anchor present. Flag.
- **R-PA-MA-003** — gatekeepered plan requires 2 distinct
  Luhn-valid NPIs so ordering PCP and servicing specialist are
  separable. Flag.
- **R-PA-MA-004** — plan-name anchor + member-ID line both
  present. Flag.
- **R-PA-MA-005** — service-location / service-area anchor.
  Info; v52-3b+ will tie this to bundled CMS plan-service-area
  files.

Each MA overlay rule self-gates on
`bundle.payer === 'cms-medicare-advantage'` and, where applicable,
on a plan-type anchor (HMO / gatekeepered) so non-HMO MA packets
bypass the HMO-specific rules. The HAPPY_PACKET fixture continues
to all-pass without modification.

R-PA-MA-003 reuses the wave-52-1e `extract.npis` array;
R-PA-MA-004 reuses the wave-52-1f `extract.memberId` extractor.
The MA overlay introduces zero new extractors.

6 new unit assertions in `test/unit/pa-engine.test.js` (one
aggregate guard that all five new rules vacuously pass on a
non-MA packet, plus a fires-when-it-should test per new rule).
Total PA unit suite: 127 assertions. The Playwright happy-path
now asserts 90 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2e — CMS Medicare FFS overlay COMPLETE: 20 -> 25)

The final 5 of the 25 spec-v52 §4.5.2 CMS Medicare Fee-for-Service
overlay rules ship, closing the overlay:

- **R-PA-CMS-022** — external infusion pump: covered indication +
  drug documented. Flag, LCD L33794.
- **R-PA-CMS-023** — ostomy supplies: ostomy type anchor + Quantity
  field present. Flag, LCD L33828.
- **R-PA-CMS-024** — urinary catheters: permanent incontinence /
  retention diagnosis. Flag, LCD L33803.
- **R-PA-CMS-025** — surgical dressings: wound surface area +
  dressing-change frequency. Flag, LCD L33831.
- **R-PA-CMS-026** — post-cataract refractive lenses: cataract-
  surgery anchor + cataract CPT (66830-66999) present. Flag,
  NCD 80.4.

R-PA-CMS-026 is the second overlay rule to consume structural CPT
codes via a regex filter (cataract-surgery range 66830-66999),
alongside R-PA-CMS-017's L-code orthotic check from wave 52-2d.
R-PA-CMS-023 ties into the wave-52-1f `extract.quantity`
extractor so the LCD L33828 monthly-utilization gate has a
structural quantity to reference.

Each rule self-gates on the detected payer bucket and again on
its device-category anchor. The HAPPY_PACKET fixture continues
to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 121 assertions. The Playwright happy-path now asserts
85 rules render in the findings panel.

This closes spec-v52 §4.5.2 (the CMS Medicare Fee-for-Service
overlay). Wave 52-3 picks up with §4.5.3 CMS Medicare Advantage
(15 rules) and §4.5.4 Medicaid state-agnostic core (10 rules).

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2d — CMS Medicare FFS overlay 15 -> 20 of 25)

Five more spec-v52 §4.5.2 CMS Medicare Fee-for-Service overlay
rules covering orthotics, continuous glucose monitors, post-
transplant immunosuppressives, parenteral nutrition, and
pneumatic compression devices:

- **R-PA-CMS-017** — orthotics: covered-condition anchor AND an
  L-code HCPCS present. Flag, LCD L33686.
- **R-PA-CMS-018** — CGM: insulin-therapy AND frequent-self-
  monitoring anchors present. Flag, LCD L33822.
- **R-PA-CMS-019** — post-transplant immunosuppressives:
  Medicare-covered transplant organ documented. Flag.
- **R-PA-CMS-020** — parenteral nutrition: GI-tract failure AND
  caloric-requirement anchors present. Flag, LCD L33799.
- **R-PA-CMS-021** — lymphedema pump: lymphedema / CVI dx AND
  failed-conservative-therapy anchors present. Flag, LCD L33829.

R-PA-CMS-017 is the first overlay rule to consume HCPCS Level II
L-codes from the existing `extract.cpts` array via a regex filter
(`/^L\d{4}$/`), so the orthotic-device family ties to a structural
signal alongside the free-text condition anchor. R-PA-CMS-018 /
R-PA-CMS-020 / R-PA-CMS-021 continue the dual-anchor pattern
introduced in wave 52-2c.

Each rule self-gates on the detected payer bucket and again on
its device-category anchor. The HAPPY_PACKET fixture continues
to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 116 assertions. The Playwright happy-path now
asserts 80 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2c — CMS Medicare FFS overlay 10 -> 15 of 25)

Five more spec-v52 §4.5.2 CMS Medicare Fee-for-Service overlay
rules covering enteral nutrition, nebulizers, TENS, NPWT, and
lower-limb prosthetics:

- **R-PA-CMS-012** — enteral nutrition: inability-to-ingest /
  projected-duration documented. Flag, LCD L33783.
- **R-PA-CMS-013** — nebulizer: covered obstructive-pulmonary
  diagnosis documented. Flag, LCD L33370.
- **R-PA-CMS-014** — TENS: chronic intractable pain > 3 months
  AND failed conventional therapy documented. Block, NCD 160.13
  / LCD L33802.
- **R-PA-CMS-015** — NPWT: covered wound type AND failed standard
  wound care documented. Flag, LCD L33821.
- **R-PA-CMS-016** — lower-limb prosthesis: K-level / functional
  rehabilitation potential documented. Flag, LCD L33787.

R-PA-CMS-014 / R-PA-CMS-015 are the first overlay rules to
require TWO independent anchors -- both must be present for the
rule to pass; either alone trips with a specific note pointing
at the missing half of the requirement.

Each rule self-gates on the detected payer bucket and again on
its device-category anchor. The HAPPY_PACKET fixture continues
to all-pass without modification.

5 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 111 assertions. The Playwright happy-path now
asserts 75 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build`
are all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2b — CMS Medicare FFS overlay 5 -> 10 of 25, plus a spec-alignment renumber)

Five more spec-v52 §4.5.2 CMS Medicare Fee-for-Service overlay
rules ship, bringing the overlay from 5 to 10 of its planned 25.

- **R-PA-CMS-003** — Standard Written Order required elements
  present (beneficiary identity, item / HCPCS, order date,
  quantity, prescriber NPI, dated signature). Block, IOM Pub
  100-08 ch. 5.
- **R-PA-CMS-005** — power-mobility functional-status
  documentation. Flag, LCD L33788.
- **R-PA-CMS-007** — PAP continuation 90-day adherence /
  compliance. Flag, LCD L33718.
- **R-PA-CMS-008** — home-oxygen qualifying ABG or SpO2. Block,
  NCD 240.2 / LCD L33797.
- **R-PA-CMS-011** — hospital-bed positioning / medical-necessity.
  Flag, LCD L33820.

### Changed

- **Spec-alignment renumber.** Wave 52-2a inadvertently shipped
  the proof-of-delivery rule as R-PA-CMS-003, but spec-v52 §4.5.2
  reserves that id for the SWO-elements-complete rule. Wave 52-2b
  corrects the id: R-PA-CMS-003 (POD) is renumbered to
  R-PA-CMS-004 (POD, the spec-aligned id; logic and citation
  unchanged). A proper R-PA-CMS-003 (SWO elements) ships above.
  The engine treats rule ids as opaque sort keys, so the audit
  trail format remains stable across the rename.

Each new overlay rule self-gates on the detected payer bucket
(`bundle.payer === 'cms-medicare-ffs'`) and again on a device-
context anchor (DME / power-mobility / PAP-continuation /
home-oxygen / hospital-bed). The HAPPY_PACKET fixture continues
to all-pass without modification.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 106 assertions. The Playwright happy-path now asserts
70 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-2a — CMS Medicare FFS overlay opens, first 5 of 25)

Opens spec-v52 §4.5.2 with five Durable Medical Equipment / Positive
Airway Pressure starter rules for Medicare Fee-for-Service:

- **R-PA-CMS-001** — DME face-to-face encounter documented (block,
  NCD-280.x).
- **R-PA-CMS-002** — Standard / Detailed Written Order present and
  signature-dated (block, CMS IOM Pub 100-08 ch. 5).
- **R-PA-CMS-003** — proof of delivery (flag, IOM Pub 100-08 ch. 4
  §4.26).
- **R-PA-CMS-006** — PAP-device sleep-study results documented
  (flag, LCD L33718).
- **R-PA-CMS-009** — DME supplier PTAN documented (flag).

Each overlay rule self-gates on the detected payer bucket from
`lib/pa/payer.js`: `check()` short-circuits with a vacuous pass when
`bundle.payer !== 'cms-medicare-ffs'`, and again when the packet
lacks the rule's context anchor (DME, PAP, etc.). The HAPPY_PACKET
fixture therefore sees them all pass without modification.

The payer detector (wave 52-1g) becomes load-bearing for the engine,
not just informational. No new extractors and no changes to
`buildBundle`; overlay rules arrive as five additional entries in
`STARTER_RULES` so the engine's rule-set stays monolithic and the
audit trail records each rule's evaluation decision explicitly.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total PA
unit suite: 100 assertions. The Playwright happy-path now asserts
65 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-1k — PA core ruleset COMPLETE: 55 -> 60)

The final 5 of the 60 spec-v52 §4.5.1 core rules ship, closing the
payer-agnostic core ruleset for the deterministic PA-packet linter.

- **R-PA-008** — each extracted CPT code (5 digits) is well-formed
  and not on the bundled deleted-codes list (block).
- **R-PA-009** — each extracted HCPCS Level II code (letter + 4
  digits) is well-formed and not on the bundled deleted-codes list
  (block).
- **R-PA-011** — each extracted ICD-10-CM code is well-formed and
  not on the bundled deleted-codes list (block).
- **R-PA-012** — no bundled NCCI procedure-to-procedure (PTP)
  edit-pair conflict among the extracted CPT codes (flag).
- **R-PA-043** — no document in the packet is password-protected
  or encrypted (block).

Three new bundled placeholders in `lib/pa/extract.js` —
`DELETED_CPT_HCPCS_BUNDLED`, `DELETED_ICD10_BUNDLED`, and
`NCCI_PAIRS_BUNDLED` — ship empty at v52-1k per spec-v52 §5.3.
The maintainer refresh script populates them in subsequent waves
without an engine change; the rules are wired through and behave
as format-strict pass-or-fire today.

R-PA-043 required a small plumbing change: `buildBundle` now
threads an optional `parseError` string through from the view's
ingest step, and `views/pa-lint.js` pushes a stub document with
`parseError` set when pdf.js / mammoth throws (encrypted PDF,
password-protected DOCX, corrupted bytes). Previously the failed
file was rendered in the audit trail but silently dropped from
the engine bundle. The audit-trail UI is unchanged; only the
engine's view of the packet is extended.

6 new unit assertions in `test/unit/pa-engine.test.js`. Total
PA unit suite: 94 assertions. The Playwright happy-path now
asserts 60 rules render in the findings panel.

This closes the payer-agnostic core. Wave 52-2 picks up with
CMS Medicare FFS / MA / Medicaid overlays + payer detection.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-1j — PA core ruleset backfill 45 -> 55)

Ten more of the 60 spec-v52 §4.5.1 core rules ship in
`lib/pa/rules.js`, bringing the deterministic PA-packet linter's
core ruleset from 45 to 55 rules.

- **R-PA-014** — each CPT modifier suffix is a well-formed
  2-character code (flag). Format-only; payer-specific
  permissibility lands with payer overlays.
- **R-PA-042** — each PDF document in the packet has non-zero
  extractable text (flag). Scanned PDFs without an embedded text
  layer trip this rule.
- **R-PA-044** — every document opened cleanly with non-zero
  extractable content (block). Catches password-protected,
  corrupted, or empty files at intake.
- **R-PA-047** / **R-PA-048** / **R-PA-049** — patient address /
  subscriber relationship / other-insurance (COB) presence
  (info, payer-overlay-gated). Vacuously satisfied at v52-1j;
  flip to "required" per plan when payer overlays ship in v52-2+.
- **R-PA-050** — diagnosis-procedure linkage shown (flag). At
  least one document in the packet carries both an ICD-10 code
  and a CPT/HCPCS code, so the dx ↔ procedure linkage is
  establishable.
- **R-PA-051** — procedure description matches the CPT short
  descriptor (info). Placeholder until a license-clean CPT
  descriptor source ships per spec-v52 §5.3.
- **R-PA-056** — anesthesia time documented when an anesthesia
  CPT (00100-01999) or anesthesia anchor is present (flag).
- **R-PA-057** — assistant-surgeon modifier (80 / 81 / 82 / AS)
  accompanied by a second Luhn-valid NPI in the packet (flag).

All ten rules are vacuously satisfied when their trigger condition
is absent, so the wave 52-1h HAPPY_PACKET fixture still returns
all-pass without modification. R-PA-042 / R-PA-044 consume
`extract.textLength` already populated by the wave 52-1e extractor,
so no new extractors were required.

10 new unit assertions in `test/unit/pa-engine.test.js` (one
fires-when-it-should per new rule plus a vacuous-pass guard for
R-PA-014 and explicit placeholder guards for R-PA-047 / R-PA-051).
Total PA unit suite: 88 assertions. The Playwright happy-path now
asserts 55 rules render in the findings panel.

Verified: `npm run lint`, `npm run test`, and `npm run build` are
all green. **Catalog count 255, unchanged.**

### Added (spec-v52 wave 52-1i — PA core ruleset backfill 35 -> 45)

Ten more of the 60 spec-v52 §4.5.1 core rules land in
`lib/pa/rules.js`, bringing the deterministic PA-packet linter's
core ruleset from 35 to 45 rules.

- **R-PA-030** — prior-treatment list when step therapy applies
  (flag).
- **R-PA-035** — LFTs (AST / ALT / bilirubin / alk phos) when
  the packet references a hepatically-dosed agent (info).
- **R-PA-038** — submission is a resubmission iff a prior-auth-
  denial document is attached (flag). The classifier's
  `prior-auth-denial` role becomes load-bearing here.
- **R-PA-039** — resubmission references the original PA
  reference number (flag).
- **R-PA-040** — resubmission addresses each reason cited in
  the prior denial (info).
- **R-PA-052** — date-of-injury anchor present when an ICD-10
  external-cause code (V/W/X/Y leading letter) is in the
  packet (flag).
- **R-PA-054** — modifier 25 / 59 accompanied by "separately
  identifiable" / "distinct procedural service" supporting
  language (flag).
- **R-PA-055** — "bilateral" mention matches modifier 50
  presence on the CPT line (flag).
- **R-PA-058** — unlisted-procedure CPT carries a narrative /
  procedure-description anchor (flag).
- **R-PA-059** — consent date (when a consent document is
  present) is on or before the latest service date (flag).

All ten rules are vacuously satisfied when their trigger
condition is absent, so the wave 52-1h HAPPY_PACKET fixture
still returns all-pass without modification. No new extractors;
R-PA-052 reuses `extract.icd10` with a V/W/X/Y filter and
R-PA-059 reuses `extract.serviceDates` + `extract.dates`.

10 new unit assertions in `test/unit/pa-engine.test.js` (one
fires-when-it-should per new rule). Total PA unit suite: 78
assertions. The Playwright happy-path now asserts 45 rules
render in the findings panel. Engine output and ordering remain
deterministic; the property test still holds.

Verified: `npm run lint`, `npm run test`, and `npm run build`
are all green. **Catalog count 255, unchanged.**

### Added (spec-v48 wave 48-4j — Bishop, ABC MTP, MGAP, GAP)

Four more long-tail derivation blocks spanning obstetric
induction assessment and trauma triage scoring.

- **Bishop** (`bishop`, Bishop 1964): 5 cervical-examination
  items with banded callbacks (dilation, effacement, station,
  consistency, position); range 0-13.
- **ABC MTP** (`abc-mtp`, Nunez 2009): 4 binary criteria, range
  0-4. Cutoff >= 2 -> activate massive transfusion protocol.
- **MGAP** (`mgap`, Sartorius 2010): 4 items including a GCS
  raw-value passthrough into the sum; range 3-29.
- **GAP** (`gap`, Kondo 2011): 3 items (GCS passthrough, age,
  banded SBP); range 3-24. MGAP minus the mechanism term.

4 new provenance logs under `docs/audits/v48/`. 14 new unit
tests including the Bishop dilation / station banded callbacks,
the ABC MTP cutoff-at-2, the MGAP and GAP SBP three-level
callbacks, and the GCS raw-value passthrough.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4i — LIPS, Westley, PRAM, PASS)

Four more long-tail derivation blocks spanning ALI/ARDS
prediction and pediatric respiratory severity scoring.

- **LIPS** (`lips`, Gajic 2011): 15 weighted yes/no factors
  including a protective diabetes -1 modifier; range -1 to +20.
- **Westley croup score** (`westley`, Westley 1978): 5 items
  with non-uniform allowed values (LOC 0/5, cyanosis 0/4/5,
  stridor 0-2, air entry 0-2, retractions 0-3); range 0-17.
- **PRAM** (`pram-asthma`, Chalut 2000): 5 items with per-item
  allowed value sets; range 0-12.
- **PASS** (`pass-asthma`, Gorelick 2004): 3 items each 0-2
  (clamped); range 0-6.

4 new provenance logs under `docs/audits/v48/`. 18 new unit
tests including the LIPS diabetes -1 protective weight, the
Westley cyanosis three-level callback, the PRAM binary-style
items, and the PASS 0-2 clamp.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4h — CRB-65, ISTH DIC, PEWS, Alvarado/PAS)

Four more long-tail derivation blocks spanning outpatient
pneumonia severity, DIC coagulation scoring, pediatric
early-warning deterioration, and the adult / pediatric
appendicitis screen pair.

- **CRB-65** (`crb65`, Lim 2003): 4 binary criteria, range 0-4.
  Lab-free outpatient-friendly variant of CURB-65.
- **ISTH overt DIC** (`isth-dic`, Taylor 2001): 4 lab components
  with three-level banded callbacks; range 0-8. Underlying-
  disorder gate is surfaced in the tile but does not modify the
  lab sum.
- **PEWS** (`pews`, Monaghan 2005): Brighton 3-subscale
  pediatric early-warning score, each 0-3 (clamped); range 0-9.
- **Alvarado / PAS** (`alvarado-pas`, Alvarado 1986 + Samuel
  2002): dual-block tile following the aldrete-padss precedent
  — primary `derivation` (Alvarado MANTRELS) and sibling
  `derivationPas` (Pediatric Appendicitis Score), each 8 items
  with two +2 weights, range 0-10.

4 new provenance logs under `docs/audits/v48/`. 19 new unit
tests including the ISTH DIC platelet three-level callback, the
PEWS 0-3 subscale clamp, and the Alvarado / PAS +2 weights.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4g — LACE, HEMORR2HAGES, DAPT, MUST)

Four more long-tail derivation blocks across hospital
readmission risk, AF bleeding stratification, post-PCI
antiplatelet-duration decision support, and malnutrition
screening.

- **LACE Index** (`lace`, van Walraven 2010): 4 components with
  three banded callbacks (LOS 7-tier, Charlson 5-tier, ED 5-tier).
  Bands: 0-4 low, 5-9 moderate, >=10 high.
- **HEMORR2HAGES** (`hemorr2hages`, Gage 2006): 11 binary
  criteria including a +2 Rebleeding weight (the "R^2" in the
  mnemonic). Range 0-12.
- **DAPT Score** (`dapt-score`, Yeh 2016): 9 criteria including
  a subtractive age band (0 / -1 / -2). Range -2 to +10. Cutoff
  >=2 favors extended DAPT beyond 12 months after PCI.
- **MUST nutrition** (`must-nutrition`, BAPEN 2003): 3
  components — BMI band, weight-loss band, acute-disease
  modifier. Range 0-6.

4 new provenance logs under `docs/audits/v48/`. 17 new unit
tests including the LACE LOS / Charlson banded callbacks, the
HEMORR2HAGES +2 Rebleeding weight, the DAPT subtractive age
band, and the MUST BMI / weight-loss three-level callbacks.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4f — HERDOO2, HOSPITAL, IMPROVE-Bleeding, Aldrete/PADSS)

Four more long-tail derivation blocks across women-only
VTE-recurrence stratification, hospital-readmission risk,
medical-inpatient bleeding risk, and the operational
PACU/ambulatory-surgery discharge pair.

- **HERDOO2** (`herdoo2`, Rodger 2017): women only, 4 binary
  criteria, range 0-4. Bands: 0-1 safe to discontinue
  anticoagulation; >=2 continue.
- **HOSPITAL Score** (`hospital-score`, Donze 2013): 7 items
  including a prior-admissions banded callback (0-2: 0 / 3-4: +2
  / >=5: +5). Bands: 0-4 low ~5.8%, 5-6 intermediate ~11.9%,
  >=7 high ~22.8% 30-day potentially-avoidable readmission.
- **IMPROVE-Bleeding** (`improve-bleeding`, Decousus 2011): 11
  criteria with mixed boolean and banded weights (age and renal
  string-enum callbacks), range 0-30.5. Cutoff >=7 = high
  bleeding risk.
- **Aldrete / PADSS** (`aldrete-padss`, Aldrete 1995 + Chung
  1995): dual-block tile following the qsofa-sofa / centor
  precedent — primary `derivation` for modified Aldrete and
  sibling `derivationPadss` for PADSS, each 5 items × 0-2,
  range 0-10, cutoff >=9.

4 new provenance logs under `docs/audits/v48/`. 17 new unit
tests covering boundary points per tile, including the HOSPITAL
prior-admissions banded callback (0 / 3 / 5), the
IMPROVE-Bleeding age and renal three-level string callbacks,
and the Aldrete 0-2 clamp on out-of-range inputs.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4e — ICH Score, IMPROVE-VTE, Khorana, DASH)

Four more long-tail derivation blocks spanning intracerebral
hemorrhage prognostication and the VTE-risk family. No
infrastructure changes.

- **ICH Score** (`ich-score`, Hemphill 2001): 5 features, range
  0-6, with banded GCS / age / volume callbacks per Hemphill
  2001 Table 2. 30-day mortality bands per Table 4
  (0/13/26/72/97/100%).
- **IMPROVE-VTE** (`improve-vte`, Spyropoulos 2011): 7 weighted
  yes/no criteria, range 0-12. Bands: <2 low, 2-3 inpatient
  prophylaxis candidate, >=4 extended-duration candidate.
- **Khorana** (`khorana`, Khorana 2008): 5 criteria, range 0-6,
  with a string-valued cancer-site callback (very-high +2 /
  high +1 / other 0). 2.5-month VTE rates per Table 3
  (0.3% / 2.0% / 6.7%).
- **DASH** (`dash-vte`, Tosetto 2012): 4 criteria including the
  -2 hormone-use modifier; range -2 to +4. Annual recurrence
  bands per Table 4 (3.1% / 6.4% / 12.3% per year).

4 new provenance logs under `docs/audits/v48/`. 16 new unit
tests including the DASH hormone subtractive path and the
Khorana cancer-site three-level callback.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4d — STOP-BANG, 4Ts, ABCD2, RCRI)

Four more long-tail derivation blocks across preoperative
screening and acute-care risk stratification. No infrastructure
changes.

- **STOP-BANG** (`stop-bang`, Chung 2008 / 2012): 8 binary
  items, range 0-8. Preoperative OSA screen; high-risk cutoff
  ≥ 5 per Chung 2012 Table 3.
- **4Ts** (`four-ts`, Lo 2006): 4 domains × 0-2 = range 0-8.
  Heparin-induced thrombocytopenia pretest probability;
  callback-clamped to mirror existing `fourTsClamp`.
- **ABCD2** (`abcd2`, Johnston 2007): 5 features, range 0-7.
  TIA stroke-risk score; B (blood-pressure) component reads
  `inputs.dbp` via the second-arg-to-callback pattern so the
  SBP≥140 OR DBP≥90 rule fires on either limb.
- **RCRI** (`rcri`, Lee 1999): 6 binary risk factors, range
  0-6. Preoperative cardiac risk for major noncardiac surgery;
  Class I-IV bands map to the published major-cardiac-event
  rates (0.4%, 0.9%, 6.6%, ≥ 11%).

4 new provenance logs under `docs/audits/v48/`. 14 new unit
tests including the ABCD2 DBP-alone-meets-threshold path and
the 4Ts 0-2 clamp.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4c — EPDS, MEWS, COMFORT-B, WAT-1)

Four more long-tail derivation blocks spanning perinatal mental
health, ward early-warning vitals, and pediatric ICU
sedation / withdrawal.

- **EPDS** (`epds`, Cox 1987): screener-based 10 items × 0-3,
  range 0-30. Edinburgh Postnatal Depression Scale; item 10
  (self-harm) is a critical-action flag.
- **MEWS** (`mews`, Subbe 2001): 5 banded per-parameter
  callbacks (SBP / pulse / RR / temp / AVPU). Predecessor to
  NEWS2 (also a Sophie tile).
- **COMFORT-B** (`comfort-b`, van Dijk 2005): 6 items × 1-5,
  range 6-30. Target band 11-22. Minimum aggregate 6 (not 0)
  because every item starts at 1.
- **WAT-1** (`wat-1`, Franck 2008): 10 binary items + 1
  banded-recovery-minutes callback. Range 0-12; cutoff ≥3 =
  iatrogenic withdrawal.

4 new provenance logs under `docs/audits/v48/`. 20 new unit
tests including parameterized loops over the MEWS AVPU callback
and the WAT-1 recovery-minutes callback.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1621 (was 1600;
+21). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4b — ORBIT Bleeding, PAINAD, CAGE, Mini-Cog)

Four more long-tail derivation blocks across bleeding, pain,
addiction, and cognition. No infrastructure changes.

- **ORBIT Bleeding** (`orbit-bleeding`, O'Brien 2015): 5
  weighted criteria, range 0-7. AF bleeding-risk companion to
  ATRIA and HAS-BLED.
- **PAINAD** (`painad`, Warden 2003): 5 nurse-observed
  behaviors × 0-2 = range 0-10. Adult-dementia analog of
  FLACC; same 0 / 1-3 / 4-6 / 7-10 band structure.
- **CAGE** (`cage`, Ewing 1984): screener-based, 4 binary
  items, range 0-4. Mnemonic CAGE; cutoff ≥2 = positive screen
  for alcohol use disorder.
- **Mini-Cog** (`mini-cog`, Borson 2000): 2 components — 3-word
  recall (0-3) + clock-draw (0 or 2). Total 0-5; cutoff <3 =
  positive screen for cognitive impairment.

4 new provenance logs under `docs/audits/v48/`. 13 new unit
tests covering boundary points per tile.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1600 (was 1580;
+20). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-4a — ATRIA Bleeding, Hendrich II, FLACC, AUDIT-C)

Opens spec-v48 wave 48-4 (long-tail backfill) with four
additive tiles. No infrastructure changes.

- **ATRIA Bleeding** (`atria-bleeding`, Fang 2011): 5 weighted
  criteria, range 0-10. Companion bleeding-risk score
  alongside HAS-BLED and ORBIT.
- **Hendrich II Fall Risk** (`hendrich-ii`, Hendrich 2003): 8
  weighted items including a string-valued get-up-and-go
  callback (able / pushes-up / needs-help / unable →
  0 / 1 / 3 / 4). Companion to Morse Falls.
- **FLACC** (`flacc`, Merkel 1997): 5 behaviors × 0-2 = range
  0-10. Pediatric pain for nonverbal children.
- **AUDIT-C** (`auditc`, Bush 1998): screener-based, 3 items ×
  0-4 = range 0-12. Sex-specific cutoff (≥3 women / ≥4 men)
  documented in bands.

4 new provenance logs under `docs/audits/v48/`. 15 new unit
tests covering boundary points per tile, including the
Hendrich II tri-level get-up-and-go callback and the AUDIT-C
screener-indexed sums.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1580 (was 1559;
+21). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3d — PHQ-9, GAD-7, CAM, C-SSRS)

Four more behavioral / cognitive screens. Includes one
infrastructure extension to make screener-based tiles
drive derivation steps.

- `lib/screener.js renderScreener` now accepts an optional
  `opts.onUpdate(answers, score, band)` callback fired every
  time `renderResult` runs. PHQ-9 / GAD-7 tile views use it to
  update the derivation steps in-place without re-rendering
  the whole `<details>` block (so the user's open/closed state
  is preserved).
- **PHQ-9** (`phq9`, Kroenke 2001): 9 items × 0-3, range 0-27,
  5 severity bands. Component `inputKey`s are the item index
  as a string (`'0'`-`'8'`); the tile converts the screener's
  numeric-indexed `answers` array into a keyed input object
  for the derivation renderer.
- **GAD-7** (`gad7`, Spitzer 2006): 7 items × 0-3, range 0-21,
  4 severity bands.
- **CAM** (`cam`, Inouye 1990): formula-only — algorithm is the
  boolean `(F1 AND F2) AND (F3 OR F4)`, not an additive sum.
- **C-SSRS Screener** (`cssrs`, Posner 2011): formula-only —
  logic-based banding (HIGH / MODERATE / LOW / NONE), not
  additive.

4 new provenance logs under `docs/audits/v48/`. 12 new unit
tests including screener-indexed component sums for PHQ-9 and
GAD-7 and formula-only schema asserts for CAM and C-SSRS.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1559 (was 1542;
+17). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3c — NIHSS, RACE, MEOWS, SOS)

Four more derivation blocks; mix of additive and formula-only.

- **NIHSS** (`nihss`, Brott 1989): 13 components in the Sophie
  tile (motor arm L+R and motor leg L+R are entered as
  per-side sums covering the published 8-row sub-items).
  Range 0-42 with 5-band severity stratification.
- **RACE** (`race`, Pérez de la Ossa 2014): 5 NIHSS-derived
  items, range 0-9, LVO threshold ≥5.
- **MEOWS** (`meows`, Singh 2012): formula-only —
  track-and-trigger chart with per-parameter yellow/red flags
  and OR/AND trigger logic. NOT representable as an additive
  sum; ships in the formula-only shape following the MELD-3.0
  and GUSS precedents.
- **SOS** (`sos`, Ista 2009): 15 binary symptom items observed
  over the prior 4-hour window. Range 0-15; withdrawal cutoff
  ≥4 per the Youden-optimal threshold from the derivation
  cohort.

4 new provenance logs under `docs/audits/v48/`. 18 new unit
tests covering boundary points per tile (including the NIHSS
max-42 maximum and the SOS withdrawal cutoff of 4).

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1542 (was 1523;
+19). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3b — Barthel, ROSIER, CPSS, LAMS)

Four more rehab / stroke-recognition derivation blocks. No
infrastructure changes.

- **Barthel Index** (`barthel`, Mahoney 1965 + Shah 1989 bands):
  10 weighted ADL items with published closed-value sets per
  item (0/5/10 or 0/5/10/15); total 0-100.
- **ROSIER** (`rosier`, Nor 2005): 7 binary items with mixed
  +1 / −1 weights — two stroke-mimic items subtract, five
  focal-deficit items add. Range −2 to +5.
- **CPSS** (`cpss`, Kothari 1999): 3 binary items. The CPSS
  "score" is the count of abnormal items (positive screen at
  ≥1); the derivation block's components sum equals
  `cpss().abnormalCount` (the function returns `abnormalCount`
  rather than `score`).
- **LAMS** (`lams`, Llanes 2004 + Nazliel 2008 LVO threshold):
  3 motor items (range 0-5), LVO threshold ≥4.

4 new provenance logs under `docs/audits/v48/`. 13 new unit
tests covering boundary points per tile, including the ROSIER
mimic-subtraction path that exercises the negative-points
component branch in `lib/derivation.js`.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1523 (was 1504;
+19). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-3a — Braden, Morse Falls, Lawton IADL, Katz ADL)

Opens spec-v48 wave 48-3 (nursing-floor / rehab / behavioral
extension) with four widely-used additive screens.

- **Braden** (`braden`, Bergstrom 1987): 6 ordinal items 1-4
  (friction caps at 3); range 6-23. Pressure-injury risk
  stratification.
- **Morse Falls** (`morse-falls`, Morse 1989): 6 weighted
  items including three string-valued callbacks for the
  tri-level select inputs (ambulatory aid, gait, mental
  status). Range 0-125.
- **Lawton IADL** (`lawton-iadl`, Lawton & Brody 1969): 8
  binary items, range 0-8. Modern unisex form; the 1969
  sex-stratified variant is NOT implemented by design.
- **Katz ADL** (`katz-adl`, Katz 1963): 6 binary items, range
  0-6. Sophie collapses the original A-G letter grading into
  the contemporary discharge-planning band stratification.

4 new provenance logs under `docs/audits/v48/`. 11 new unit
tests covering multiple boundary points per tile, including
the Braden friction clamp (1-3 not 1-4) and the Morse Falls
tri-level string callbacks.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1504 (was 1486;
+18). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-2c — PSI, CPOT, BPS, GUSS)

Four more acute-care derivation blocks. Mix of additive,
additive-with-callbacks, and formula-only:

- **PSI / PORT** (`psi`): 19 components per Fine 1997 Table 2,
  including a sex-aware age callback (M=age, F=age−10) using
  the wave-48-1c second-argument-to-callbacks pattern, and 7
  optional-lab callbacks that early-return 0 when the input
  is null/empty/undefined (matching `lib/scoring-v4.js psi()`).
- **CPOT** (`cpot`): 4 nurse-observed behaviors 0-2 per
  Gelinas 2006.
- **BPS** (`bps`): 3 nurse-observed behaviors 1-4 per Payen
  2001. Minimum aggregate is 3 (not 0) because every
  component starts at 1.
- **GUSS** (`guss`): formula-only block (no `components`)
  following the MELD-3.0 precedent. GUSS's staged gating —
  fail Stage 1 → stop; fail a Stage 2 consistency → don't
  advance to the next — is the safety mechanism; an additive
  components array would misrepresent the stop conditions.

4 new provenance logs under `docs/audits/v48/`. 14 new unit
tests including the sex-aware age callback and the
optional-lab null-handling on PSI.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1486 (was 1466;
+20 — 14 new derivation tests + 6 additional schema-loop tests
for the 4 new tiles). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-2b — BISAP, COWS, ICDSC, 4AT)

Four more acute-care derivation blocks. All purely additive,
no infrastructure changes from prior waves.

- `lib/meta.js`: derivation blocks for the BISAP half of
  `ranson-bisap` (5 binary criteria per Wu 2008; the contemporary
  24-h bedside pancreatitis severity score), `cows` (11
  clinician-rated items per Wesson & Ling 2003 with per-item
  anchor levels), `icdsc` (8 binary items per Bergeron 2001
  with the ≥4 delirium cutoff), and `4at` (mixed binary 0/4
  items + two 0/1/2 callbacks per MacLullich 2019).
- `views/group-g.js`: renderer wired into all four tile views.
  The `ranson-bisap` view appends one `<details>` block for
  BISAP; Ranson's two-time-point math stays as the existing
  checkbox UI (a `derivationRanson` second block is a candidate
  for a later wave).
- `docs/audits/v48/ranson-bisap.md`, `cows.md`, `icdsc.md`,
  `4at.md`: per-tile provenance logs mapping every component
  and band to the source paper.
- `test/unit/derivation.test.js`: +20 cases covering boundary
  points (zero, worked example, max) for each tile plus 4AT's
  AMT4 callback clamping.
- `docs/spec-v48.md`: §5.2 gains a 48-2b subsection.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1466 (was 1447;
+19). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-2a — CURB-65, Centor/McIsaac, CIWA-Ar, FOUR Score)

Opens spec-v48 wave 48-2 (acute-care / ICU bedside extension)
with four widely-used additive scores. No infrastructure
changes — every block uses the existing
`derivation` + optional sibling-block pattern shipped in waves
48-1a through 48-1c.

- `lib/meta.js`: derivation blocks for `curb-65`, `centor`
  (with `derivationMcisaac` second block for the McIsaac age
  modifier), `ciwa` (CIWA-Ar; clamped 0-7 / 0-4 callbacks),
  and `four-score` (clamped 0-4 callbacks).
- `views/group-g.js`: renderer wired into all four tile views.
  The `centor` view appends two `<details>` blocks (Centor +
  McIsaac).
- `docs/audits/v48/curb-65.md`, `centor.md`, `ciwa.md`,
  `four-score.md`: per-tile provenance logs mapping every
  component / band to the source paper.
- `test/unit/derivation.test.js`: +16 cases covering three
  boundary points per tile plus the McIsaac age-modifier path
  (age 12 +1, age 30 +0, age 50 −1).
- `docs/spec-v48.md`: §5.2 wave 48-2 gains a 48-2a subsection
  recording the four shipped tiles.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1447 (was 1426; +21
— 16 new derivation tests plus 5 additional schema-loop tests
exercising the 4 new tiles). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-1c — NEWS2, SOFA, MELD-3.0; closes wave 48-1)

Closes the §5 wave-48-1 list. Three small infrastructure
extensions land first, then the three remaining tiles.

- `lib/derivation.js scoreComponent`: callbacks now receive the
  full inputs object as the second argument
  (`points(value, inputs)`). Pre-existing single-arg callbacks
  (waves 48-1a + 1b) are unaffected — they ignore the second
  parameter. Required so NEWS2's SpO2 callback can branch on
  `scale2` and `onO2` from the same inputs object.
- `META.<id>.derivationSofa` pattern: a second derivation block
  on a single tile is delivered via a sibling field (no schema
  change to the `derivation` block itself). The view layer
  calls `renderDerivation({ derivation: META[id].derivationSofa })`
  for the second block. Used here to surface SOFA alongside
  the existing qSOFA derivation block on `qsofa-sofa`.

Tiles backfilled:
- **NEWS2** (`news2`) — components with banded per-variable
  callbacks per RCP 2017 Table 1, including the SpO2 Scale 1
  vs Scale 2 branch and the supplemental-O2 modifier.
- **SOFA** — second block on `qsofa-sofa` via the new
  `derivationSofa` field. Six organ systems, each accepting a
  pre-graded 0-4 value (clamped).
- **MELD-3.0** on `meld-childpugh` — formula-only block (no
  `components`). Kim 2021 log-linear regression text with the
  input-clamping rules called out explicitly.

Six new provenance logs under `docs/audits/v48/` (news2,
sofa, meld-childpugh). 17 new unit tests in
`test/unit/derivation.test.js` covering Scale-2 / on-O2 paths
for NEWS2, the clamped 0-4 path for SOFA, and a schema test
asserting MELD-3.0 ships as formula-only.

`docs/spec-v48.md` §5 list updated — all 12 wave-48-1 tiles
shipped. Wave 48-1 is complete; subsequent v48 waves (48-2
acute-care, 48-3 nursing-floor, 48-4+ long-tail) backfill the
remaining catalog per §5.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1426 (was 1409;
+17). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-1b — 6 additive-boolean tiles backfilled)

Mechanical backfill of the six additive-boolean tiles in the §5
list: Wells DVT, CHA₂DS₂-VASc (`chads`), HAS-BLED, PERC, TIMI,
and HEART. Infrastructure is unchanged from wave 48-1a; this
wave only adds META.derivation entries, view-side renderer
calls, audit logs, and unit tests.

- `lib/meta.js`: derivation blocks for `wells-dvt`, `chads`,
  `hasbled`, `perc`, `timi`, `heart`. Each has components
  matching the published point table (including Wells DVT's −2
  subtractive criterion, the two 2-point CHA₂DS₂-VASc items,
  and HEART's per-component banded integers via clamped point
  callbacks), bands matching the published cutoffs, and the
  verbatim source quote.
- `views/group-g.js`: appends `renderDerivation` +
  `updateDerivationSteps` calls in the six tile renderers.
- `docs/audits/v48/wells-dvt.md`, `chads.md`, `hasbled.md`,
  `perc.md`, `timi.md`, `heart.md`: new per-tile provenance
  logs (mirroring the v11 audit format).
- `test/unit/derivation.test.js`: +27 new cases. The schema
  test loop now covers all 9 derivation tiles (wave 48-1a + 1b).
  Per-tile components-sum tests cover boundary points including
  the Wells DVT −2 criterion and HEART's input clamping.
- `docs/spec-v48.md`: §5 list updated — six tiles shipped, three
  (NEWS2, SOFA, MELD-Na) explicitly deferred to wave 48-1c with
  the reason documented (each needs a renderer extension that
  is out of scope for the mechanical backfill).

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. Test count 1409 (was 1382;
+27). **Catalog count 254, unchanged.**

### Added (spec-v48 wave 48-1a — derivation layer infrastructure + 3 pilot tiles)

Lands the v48 derivation layer end-to-end on three pilot tiles
so the schema, renderer, test harness, and per-tile provenance
log are all exercised in production before the §5 list is
mechanically backfilled. The remaining nine wave-48-1 tiles
slip to wave 48-1b (same infrastructure, same tests, just more
META entries + audit logs).

- `lib/derivation.js`: new. Exports `renderDerivation(meta)` and
  `updateDerivationSteps(detailsEl, meta, inputs)`. The renderer
  emits a closed-by-default `<details>` block with the formula,
  population, validity, and source quote; the updater fills the
  live step-by-step list of per-input contributions on every
  input change via the same `aria-live="polite"` plumbing the
  result block already uses. Schema is validated on render and
  throws on missing required fields (`formula`, `population`,
  `units`, `validity`, `source`).
- `lib/meta.js`: adds `derivation` blocks for `wells-pe`, `gcs`,
  and the qSOFA half of `qsofa-sofa`. Each block carries the
  verbatim source quote, the named cohort and dates, the
  validity caveats, and (where additive) the `components` array
  matching the source's published point table.
- `views/group-g.js`: wires `renderDerivation` +
  `updateDerivationSteps` into the three pilot tiles. The block
  is appended after the result `<div>` so the bedside-shift
  surface is unchanged unless the user expands the details.
- `test/unit/derivation.test.js`: new. 18 cases covering schema
  completeness, components-sum-equals-computed-score at three
  boundary points per tile, band-coverage of the achievable
  range, and renderer validation throws on malformed input.
- `docs/audits/v48/wells-pe.md`, `gcs.md`, `qsofa-sofa.md`: new
  per-tile provenance logs (mirroring the v11 audit format) that
  re-quote the source paper and map every component / band to
  the published phrasing. The `qsofa-sofa` log documents why
  the SOFA half is intentionally not in the derivation block at
  this wave (per-organ non-additive scoring is not faithfully
  representable in the additive-components schema).
- `docs/spec-v48.md`: §5 wave 48-1 is restructured into 48-1a
  (this wave, shipped) and 48-1b (the remaining nine §5 tiles).
- `README.md`: one sentence in the feature paragraph noting the
  collapsed "where does this come from?" block.

Verified: `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` are all green. **Catalog count 254, unchanged.**

### Fixed (data-refresh workflow — `shardLayout: "shards"` missing from regenerated manifests)

The weekly `data-refresh` GitHub Action was failing at the
`verify-integrity` step because `scripts/build-data.mjs` wrote
manifests for the three sharded-subdir datasets (`icd10cm`,
`mpfs`, `ndc`) without a `shardLayout` field. The verify script
defaults to the "root" layout when the field is absent, so it
looked for `data/icd10cm/A.json` instead of
`data/icd10cm/shards/A.json` — 16 false-positive MISSING errors.
The repo-committed seed manifests had `"shardLayout": "shards"`
hand-set, which is why local `data:verify` was green and the
drift only surfaced when the workflow re-ran the pipeline.

- `scripts/build-data.mjs`: add `shardLayout: 'shards'` to the
  manifest object written for the `icd10cm`, `mpfs`, and `ndc`
  datasets (the three that call
  `writeShard(join(folder, 'shards'), …)`).

Verified by `SOPHIEWELL_OFFLINE=1 node scripts/build-data.mjs &&
node scripts/verify-integrity.mjs` — now reports
`ok. 46 manifests verified`. Lint + unit tests + a11y + build
unchanged and green.

### Fixed (spec-v46 wave 46-2 — docs/ backfill + activate catalog-count grep rule on docs)

Closes wave 46-1's silent gap. The §6 catalog-count drift rule
was wired into `npm run lint` but `scripts/grep-check.mjs`'s
`walkAll` traversal re-used the forbidden-pattern scan's
`SKIP_DIRS` (which includes `docs`), so the dead
`if (entry.name === 'docs')` descend branch never fired and the
rule was dormant for every doc surface. Wave 46-2 makes the rule
actually scan `docs/*.md`, then backfills the legitimate
historical / non-catalog counts that the activated rule would
otherwise flag.

- `scripts/grep-check.mjs`: `walkAll` now genuinely descends
  into `docs/` (skipping only `node_modules`, `dist`, `.git`,
  `data`, and dotfiles); the dead branch removed.
  `catalogScanRanges` gains two file-level exclusions —
  `docs/spec-seo.md` (spec doc by intent, topic-named) and
  `docs/scope-mdcalc-parity.md` (its current close-count is
  already validated by `check-catalog-truth.mjs` surface #14,
  so the ledger's historical snapshots are excluded here).
- `docs/data-sources.md`: inline
  `<!-- catalog-truth:historical -->` escape above "121 tiles"
  (count of hand-authored copy files, not catalog total).
- `docs/threat-model.md`: inline escape above the v4-era
  "utilities 82-197" group-numbering line.
- `docs/performance.md`: inline escape above the "< 250 KB"
  utility-view transfer-size budget row.
- `docs/spec-v46.md`: §6 marks wave 46-2 shipped; new §10
  records the fix and the exclusions/escapes.

Sanity-tested: removing any single new escape or exclusion
surfaces the expected drift violation; restoring it goes green.
**Catalog count 254, unchanged.** Lint + unit tests + a11y +
sbom + build all clean.

### Removed (spec-v51 wave 51-2 — dead CSS cleanup after the minimal homepage)

Deletes the CSS rules orphaned by spec-v51 wave 51-1's
homepage minimization. Wave 51-1 stripped the homepage to
header + h1 + lede + hero search + 10 quick picks + footer
but left the unused selectors in `styles.css` because unused
rules are inert at runtime. Wave 51-2 closes that loop.

- `styles.css`: removes `.hub-strip` (and its label/link
  descendants), `.trust-strip` (and `.trust-icon`,
  `.trust-label`, `.trust-sub`, the responsive grid),
  `.why-sophie` + `.why-grid` (and descendants + responsive
  breakpoint), `.visible-faq` (and `details`, `summary`,
  marker overrides, `p`), `.audience-chips` (and
  `.audience-chips .toggle` variants), `.browse-disclosure` +
  `.browse-summary` (and the marker, caret rotate, hover/focus,
  open-state margin), and `.task-hero .hero-examples`.
- `docs/spec-v51.md`: adds §9 documenting wave 51-2 and the
  selectors deliberately retained (e.g. `.hub-page`,
  `.tool-card`, `.toggle`).

No markup, no checks, no tests changed. **Catalog count 254,
unchanged.** `UTILITIES.length` is 254. Lint + unit tests +
a11y + build all clean.

### Added (spec-v50 wave 50-2 — runtime no-network / no-cookie / storage-allowlist integration test)

Closes the deferred runtime half of the v50 §3.1 / §3.3 / §3.4 /
§3.5 enforcement. Wave 50-1 codified the static checks (CSP
shape, source-scan denies, package-deps deny). Wave 50-2 adds
the browser-runtime trace that proves the rules hold under
actual page execution, not just at the call site.

- `test/integration/no-network.spec.js`: new. Boots a real
  browser, exercises the home view + three representative tiles
  (`bmi`, `icd10cm-lookup`, `wells-pe` — covering pure compute,
  data-shard fetch, and additive-scoring code paths), then
  asserts: zero off-origin requests of any kind; zero
  `navigator.sendBeacon` calls and zero `Image` pixel-style
  fires (caught via a tripwire installed before any tile JS
  runs); `document.cookie === ''`; every key in `localStorage`
  / `sessionStorage` matches `scripts/storage-allowlist.json`.
  Runs across all three Playwright browser projects (chromium,
  firefox, webkit) in the existing `npm run test:e2e` job.
- `scripts/grep-check.mjs`: +1 file exception so the test may
  name `sendBeacon`, `analytics`, etc. by-name in its assertions
  without colliding with the §3.5 deny rule.
- Sanity-tested: a deliberate `document.cookie = "test=1"` in a
  view file causes the test to fail with the §3.3 violation
  message. Restored after the local check.

No tiles added, removed, or renamed. **Catalog count 254,
unchanged.**

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean. The new Playwright spec passes on chromium,
firefox, and webkit locally.

### Added (spec-v50 wave 50-1 — public-infrastructure commitments: codified non-degradation guarantees)

Codifies the eight posture commitments that distinguish Sophie
from a typical web product (no ads, no login, no telemetry, no
third-party fetch, no AI, no cookies, no paid tier, MIT-licensed
forever) as automated invariants enforced on every commit, and
ships a public `/commitments/` page listing each guarantee
alongside the check that enforces it.

- `scripts/check-commitments.mjs`: new. Enforces §3.4 (every
  `localStorage.setItem` / `sessionStorage.setItem` / `caches.open`
  uses a key on the allowlist), §3.6 (no AI-vendor SDK substrings
  in source `import` / `require` / string-literal contexts and no
  AI-vendor package in `package.json` dependencies), §3.7 (no
  auth / paywall vendor package in dependencies), §3.8
  (`package.json` `license === "MIT"` and `LICENSE` first line
  begins with "MIT License"), and the `_headers` CSP-shape
  assertion for §3.1 / §3.2 (`connect-src 'self'`, `script-src 'self'`).
- `scripts/storage-allowlist.json`: new. Lists the one permitted
  `localStorage` key (`sw-theme`) and the service worker's two
  cache-namespace prefixes (`sophiewell-shell-`, `sophiewell-data-`).
- `scripts/grep-check.mjs`: +3 rules for §3.3 (no `document.cookie =`
  / `Set-Cookie` in source), §3.5 (no analytics / RUM / error-
  reporting vendor identifiers), and §3.7 (no auth / paywall
  vendor identifiers). Word- and URL-bounded to avoid colliding
  with prose like "implausible".
- `scripts/build-commitments-page.mjs`: new. Emits
  `dist/commitments/index.html`, a pure-HTML page with the eight
  commitments and a link to each enforcement script.
  Wired into `scripts/build.mjs`.
- `index.html`: footer carries a new `/commitments/` link.
- `CONTRIBUTING.md`: new file documenting the tile-add workflow,
  the commitment-add / -change process, and the defect-against-
  a-commitment reporting protocol.
- `package.json`: `npm run lint` now runs `eslint` →
  `grep-check.mjs` → `check-catalog-truth.mjs` →
  `check-commitments.mjs` as four sequential gates.
- `docs/spec-v50.md`: the v50 spec doc itself.
- No tiles added, removed, or renamed. **Catalog count 254,
  unchanged.**

Sanity-tested: a deliberate `localStorage.setItem('unauthorized-key', 'x')`
on a source file fails `check-commitments` locally with a
per-line diff. A deliberate addition of an analytics-vendor
identifier fails grep-check. The Playwright runtime no-network
test (spec-v50 §3.1 step 2) is deferred to a follow-up wave;
the CSP shape assertion already enforces the network half at
build time.

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean. `/commitments/` is reachable from the footer
of every page after `npm run build`.

### Added (spec-v46 wave 46-1 — catalog-truth invariants: anti-drift guards)

Closes a class of defect discovered on 2026-05-22: the home page
`<title>`, OG / Twitter cards, meta description, home lede, JSON-LD
description, and the `#browse-tile-count` no-JS fallback had all
drifted by 24-31 tiles behind the catalog. Per spec-v46,
`UTILITIES.length` is now the single canonical source of truth for
the catalog count, and CI fails the build on any drift across the
14 in-scope user-facing surfaces.

- `scripts/check-catalog-truth.mjs`: new. Parses `app.js` to count
  `UTILITIES`, then extracts the named count from each in-scope
  surface (title, meta description, OG title / description /
  image alt, Twitter title / description / image alt, home lede,
  `#browse-tile-count` no-JS fallback, JSON-LD description, README
  first-section blurb, `package.json` description, and the
  most-recent close-line in `docs/scope-mdcalc-parity.md`). Exits
  1 with a per-surface diff on any mismatch.
- `scripts/grep-check.mjs`: +1 rule. A 3-digit decimal literal in
  the range [100, 999] adjacent to one of `tile`, `tiles`, `tool`,
  `tools`, `calculator`, `calculators`, `utilit`, `deterministic`
  on a scanned surface is treated as a putative tile count and
  must equal `UTILITIES.length`. Scanned surfaces are
  `index.html`, `README.md`, `package.json`, `site.webmanifest`,
  the prelude of `CHANGELOG.md` above the most recent `[Unreleased]`
  header, and `docs/*.md` excluding `docs/spec-v*.md` and
  `docs/audits/**`. Legitimate historical counts are escaped with
  `<!-- catalog-truth:historical -->` on the same or preceding line.
- `package.json`: `npm run lint` now runs `eslint` →
  `grep-check.mjs` → `check-catalog-truth.mjs` as three sequential
  gates. Any drift fails CI.
- `docs/spec-v46.md`: the v46 spec doc itself (catalog count 254,
  unchanged).
- No tiles added, removed, or renamed. **Catalog count 254,
  unchanged.**

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean. A deliberate ±1 drift on any in-scope surface
fails `npm run lint` locally with a per-surface diff.

### Added (spec-v45 wave 45-1 — bedside suicide-risk screen: `cssrs`)

Closes the suicide-risk screening gap in Sophie's psychiatric /
behavioral-health nursing surface. PHQ-9 and GAD-7 already ship
as severity screens, but Sophie had no validated suicide-risk
triage tool. The C-SSRS Screener (Posner 2011) is Joint-
Commission and SAMHSA recommended for inpatient and ED
suicide-risk screening; PHQ-9 item 9 captures passive ideation
but is not a triage instrument. C-SSRS is publicly distributable
for clinical use (Columbia Lighthouse Project license).

- `lib/scoring-v4.js`: new `cssrs()`. Seven boolean items: five
  ideation questions (Q1-Q5 past-month: wish-dead, thoughts-
  killing, thoughts-methods, some-intent, plan-intent), one
  lifetime behavior question (Q6), and a past-3-months follow-
  up (Q6a). Risk band per the Columbia Lighthouse Project ED
  Triage Screener: no risk reported / low (Q1 or Q2 only) /
  moderate (Q3, or lifetime Q6 not in past 3 months) / high
  (Q4 or Q5, or Q6 in past 3 months). Enforces Q6 / Q6a
  consistency (cannot be in past 3 months without lifetime).
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with seven labeled checkboxes
  carrying the verbatim Posner 2011 question text and an aria-
  live result region with the band, the band-appropriate
  decision-support action line, and the banding source.
- `lib/meta.js`: META entry with inline Posner 2011 citation,
  specialty tags (nursing-ed / nursing-floor / nursing-general
  / psychiatry / emergency-medicine / family-medicine /
  social-work), a prefilled all-no worked example, and the
  spec-v11 §5.3 four-band interpretation.
- `test/unit/cssrs.test.js`: 13 new unit tests covering the
  all-no tile example, each band-boundary item (Q1, Q2 low; Q3
  moderate; Q4, Q5 high; Q6 lifetime moderate; Q6+Q6a high),
  the escalation behavior across multiple positives, text-
  content citations, the Q6 / Q6a consistency guard, and
  rejection of non-boolean inputs.
- `docs/audits/v11/cssrs.md`: v11 audit log with PASS status,
  primary citation re-verified against Posner 2011, and the
  Columbia Lighthouse Project ED Triage Screener banding rule
  cross-checked.
- `docs/spec-v45.md`: the v45 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 253 → 254.

`UTILITIES.length` is 254. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v44 wave 44-1 — rehab-nursing weighted ADL: `barthel`)

Adds the Barthel Index (Mahoney & Barthel 1965), the rehab-
nursing standard ADL with weighted scoring. Sophie's discharge-
planning surface now ships Katz ADL (v42, six binary basic-ADL
items) and Lawton IADL (v43, eight binary instrumental-ADL
items); Barthel is the granular weighted ADL used in inpatient
stroke rehab and post-acute SNF nursing. Ten items with weighted
0/5/10/15-point increments, total 0-100 (always a multiple of 5).
Severity banding per Shah 1989 — five bands: 100 independent,
91-99 slight, 61-90 moderate, 21-60 severe, 0-20 total dependency.

- `lib/scoring-v4.js`: new `barthel()`. Enforces the published
  per-item allowed-value sets (off-grid values reject), sums to
  a 0-100 total, and bands per Shah 1989. Returns `{score,
  parts, band, text}`.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with ten labeled selects, each
  option explicitly naming the score (e.g., "10 independent",
  "5 needs help"); per-item muted breakdown for the bedside
  hand-off.
- `lib/meta.js`: META entry with inline Mahoney 1965 + Shah 1989
  citations, specialty tags (nursing-floor / nursing-rehab /
  nursing-general / physical-therapy / occupational-therapy /
  physical-medicine-rehabilitation / geriatrics /
  case-management), a prefilled all-maximal worked example, and
  the spec-v11 §5.3 five-band interpretation.
- `test/unit/barthel.test.js`: 12 new unit tests covering the
  maximal (100) and minimal (0) tile examples, the band-boundary
  scores at 95 / 90 / 65 / 60 / 25 / 20 (the 91 / 21 / 61
  cutoffs are not reachable on a 5-point grid), text-content
  citations, and rejection of off-grid values, non-integer, and
  missing items.
- `docs/audits/v11/barthel.md`: v11 audit log with PASS status,
  primary citation re-verified against Mahoney 1965, and the
  Shah 1989 five-band cutoffs cross-checked.
- `docs/spec-v44.md`: the v44 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 252 → 253.

`UTILITIES.length` is 253. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v43 wave 43-1 — instrumental-ADL companion to Katz: `lawton-iadl`)

Adds the instrumental-ADL companion to v42's Katz ADL. Katz tells
the discharging RN whether the patient can survive at home;
Lawton tells them whether the patient can *manage* at home —
placing a phone call, shopping, preparing food, housekeeping,
laundry, organizing transportation, managing one's own
medications, and handling one's own finances. A patient who is
Katz 6 / Lawton 8 goes home; a patient who is Katz 6 / Lawton 3
goes home only with medication-management and meal-prep services;
a patient who is Katz 4 / Lawton 1 needs an assisted-living or
SNF placement. Lawton declines also flag mild cognitive
impairment and increased medication-error risk earlier than ADL
alone.

- `lib/scoring-v4.js`: new `lawtonIadl()`. Eight 0/1 IADL items
  summing to 0-8 on the modern unisex form. Returns `{score,
  parts, band, text}` with bands at 8 / 6-7 / 3-5 / 0-2.
- `app.js`: +1 UTILITIES row in Group G under tile id
  `lawton-iadl`.
- `views/group-g.js`: +1 renderer with eight labeled 0-1 range
  fields; the muted summary line names the IADLs the patient
  needs help with for the discharge note.
- `lib/meta.js`: META entry with inline Lawton 1969 citation,
  specialty tags (nursing-floor / nursing-ed / nursing-general /
  geriatrics / family-medicine / case-management /
  occupational-therapy / physical-therapy), a prefilled all-
  independent worked example, and the spec-v11 §5.3 four-band
  interpretation.
- `test/unit/lawton-iadl.test.js`: 9 new unit tests covering the
  full-independence tile example, the 7 / 6 / 5 / 3 / 2 / 0
  band-boundary scores, text-content citation, and rejection of
  non-binary, non-integer, and missing inputs.
- `docs/audits/v11/lawton-iadl.md`: v11 audit log with PASS
  status, primary citation re-verified against Lawton 1969, and
  the four band cutoffs cross-checked against the Hartford
  Institute "Try This" series.
- `docs/spec-v43.md`: the v43 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 251 → 252.

`UTILITIES.length` is 252. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v42 wave 42-1 — geriatric / discharge-planning ADL: `katz-adl`)

Closes the functional-status / discharge-planning gap in the
nursing surface. Sophie ships fall-risk (Hendrich II, Morse),
pressure-injury (Braden, Norton+PUSH), frailty (CFS), and
cognitive screening (mini-Cog) — but had nothing for functional
status / ADL independence, the core nurse / case-management
question at every discharge huddle. Katz ADL (Katz 1963) is the
foundational instrument: six binary ADL items (bathing,
dressing, toileting, transferring, continence, feeding); each
0 dependent / 1 independent; total 0-6 with bands 6 = full
independence, 5 = mild, 3-4 = moderate, 0-2 = severe. Katz is
RN-administered, in routine use in geriatric assessment, home-
health initial assessment (OASIS items M1830-M1870 are largely
Katz-aligned), and discharge planning.

- `lib/scoring-v4.js`: new `katzAdl()`. Six 0/1 items summed to
  0-6 with Katz 1963 bands. Returns `{score, parts, band, text}`.
- `app.js`: +1 UTILITIES row in Group G under tile id
  `katz-adl`.
- `views/group-g.js`: +1 renderer with six labeled 0-1 range
  fields and an aria-live result region; the muted summary
  line lists the per-item independent / dependent breakdown for
  the discharge note.
- `lib/meta.js`: META entry with inline Katz 1963 citation,
  specialty tags (nursing-floor / nursing-ed / nursing-general /
  geriatrics / family-medicine / physical-therapy /
  occupational-therapy / case-management), a prefilled all-
  independent worked example, and the spec-v11 §5.3 four-band
  interpretation.
- `test/unit/katz-adl.test.js`: 8 new unit tests covering the
  full-independence tile example, the 5 / 4 / 3 / 2 / 0
  band-boundary scores, text-content citation, and rejection of
  non-binary, non-integer, and missing inputs.
- `docs/audits/v11/katz-adl.md`: v11 audit log with PASS status,
  primary citation re-verified against Katz 1963, and the four
  band cutoffs cross-checked.
- `docs/spec-v42.md`: the v42 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 250 → 251.

`UTILITIES.length` is 251. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v41 wave 41-1 — ICU coma scale for intubated patients: `four-score`)

Adds the FOUR Score (Wijdicks 2005) — the validated ICU coma
scale designed for intubated and severely obtunded patients
where the GCS verbal component is unavailable. GCS ships in the
v3 vitals tile but has two well-known ICU weak spots: (1) the
verbal component is unscoreable in intubated patients (the "Vt"
workaround preserves the score but loses the airway-protection
signal), and (2) it does not assess brainstem reflexes. FOUR
replaces verbal with a respiration component (capturing both
intubation and over-breathing of the ventilator) and adds a
dedicated brainstem-reflex component. A CCRN, neuro-ICU RN, or
trauma-ICU RN at the bedside uses FOUR multiple times per shift
today; it is also one of the metrics in the AAN 2010 brain-death
determination guidance for screening confounders.

- `lib/scoring-v4.js`: new `fourScore()`. Four ordinal items
  each integer 0-4 (eye, motor, brainstem, respiration) summing
  to 0-16. Returns `{score, parts, text}` with a clinically-
  anchored note at score 16 ("all four maximal") and score 0
  ("all four absent - AAN 2010 brain-death-workup pattern"), and
  an "intermediate pattern" message reporting per-component
  E/M/B/R values for the bedside hand-off.
- `app.js`: +1 UTILITIES row in Group G under tile id
  `four-score`.
- `views/group-g.js`: +1 renderer with four labeled range fields
  (each with the published Wijdicks 2005 anchor descriptions
  visible in the label) and an aria-live result region.
- `lib/meta.js`: META entry with inline Wijdicks 2005 citation,
  specialty tags (nursing-icu / nursing-general / neurology /
  critical-care / emergency-medicine / family-medicine), a
  prefilled all-maximal worked example, and the spec-v11 §5.3
  three-band interpretation (16 / 1-15 intermediate / 0).
- `test/unit/four-score.test.js`: 7 new unit tests covering the
  maximal (16) and minimal (0) tile examples, an intermediate
  pattern (E2 M3 B4 R1 = 10), part-mirroring, the
  minimum-non-zero (1) case, and rejection of out-of-range,
  non-integer, and missing components.
- `docs/audits/v11/four-score.md`: v11 audit log with PASS
  status, primary citation re-verified against Wijdicks 2005,
  and the AAN 2010 brain-death-workup cross-reference.
- `docs/spec-v41.md`: the v41 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 249 → 250.

`UTILITIES.length` is 250. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v40 wave 40-1 — post-stroke bedside dysphagia screen: `guss`)

Adds the bedside RN's "can this acute-stroke patient eat?" tile.
Every acute-stroke patient should have a bedside dysphagia
screen before any oral intake (AHA/ASA 2018 §6.3); GUSS (Trapl
2007) is the most-validated nurse-administered bedside screen at
acute stroke onset. The screen prevents the stroke-associated
aspiration pneumonia that drives a sizable share of stroke-unit
length-of-stay and 90-day mortality. Sophie's cerebrovascular
surface now covers recognition (CPSS, ROSIER), severity (NIHSS,
mNIHSS), LVO prediction (LAMS, RACE), and aspiration risk (this
tile).

- `lib/scoring-v4.js`: new `guss()`. Two-stage screen with the
  full Trapl 2007 gating rules in code: stage 1 (5 binary items)
  gates stage 2; within stage 2, each consistency (semisolid ->
  liquid -> solid) must score 5 to advance. Returns `{score,
  stage1, semisolid, liquid, solid, gated, band, text}` with
  band per Trapl 2007 Table 3 (20 slight/no, 15-19 slight, 10-14
  moderate, 0-9 severe).
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with four section headings
  (preliminary + three consistencies) and 17 labeled range
  inputs, plus a per-stage breakdown and a "gated subtests"
  muted line in the result region.
- `lib/meta.js`: META entry with inline Trapl 2007 citation,
  specialty tags (nursing-icu / nursing-ed / nursing-general /
  neurology / emergency-medicine / speech-language-pathology /
  family-medicine), a prefilled all-pass worked example, and the
  spec-v11 §5.3 four-band interpretation.
- `test/unit/guss.test.js`: 10 new unit tests covering the
  perfect tile example (20), the stage-1 gate (=4 ends the
  screen at 4), the semisolid / liquid / solid gates, all four
  band lower/upper edges (0/4, 9/10, 14/15, 19/20), per-band
  text content, and rejection of out-of-range / non-integer
  inputs.
- `docs/audits/v11/guss.md`: v11 audit log with PASS status,
  primary citation re-verified against Trapl 2007, and the
  three gating rules plus the four band cutoffs cross-checked.
- `docs/spec-v40.md`: the v40 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 248 → 249.

`UTILITIES.length` is 249. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v39 wave 39-1 — ED stroke recognition with mimic discrimination: `rosier`)

Closes the recognition-stage gap in the cerebrovascular surface.
CPSS (spec-v37) is sensitive but non-specific — post-ictal Todd's
paresis, syncope, and migraine-with-aura all flip it positive —
and the ED RN performing recognition needs an instrument that
subtracts points for the two most common stroke mimics (seizure
and a syncope-pattern LOC) and adds points for focal-deficit
items. ROSIER (Nor 2005) is that instrument: seven binary items,
total -2 to +5, stroke likely at >0 with sensitivity 93% and
specificity 83%. It is in routine ED use at UK stroke centers
and an increasing number of US ED triage protocols.

- `lib/scoring-v4.js`: new `rosier()`. Seven boolean items — two
  mimic items each weighted -1 (LOC/syncope, seizure) and five
  focal-deficit items each weighted +1 (facial/arm/leg weakness,
  speech disturbance, visual-field defect) — summing to a total
  in -2..+5. `strokeLikely` fires at score > 0 per Nor 2005.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with seven labeled checkboxes
  and an aria-live result region; per-item labels include the
  explicit ±1 weight.
- `lib/meta.js`: META entry with inline Nor 2005 citation,
  specialty tags (nursing-ed / nursing-general /
  emergency-medicine / neurology / family-medicine), a prefilled
  all-false worked example, and the spec-v11 §5.3 interpretation
  bands.
- `test/unit/rosier.test.js`: 9 new unit tests covering the
  all-false tile example (0), the +1 / -1 / -2 / +5 boundaries,
  the focal-plus-mimic-cancels-to-0 case, part-sign mirroring,
  text-content citation, and rejection of non-boolean and
  missing inputs.
- `docs/audits/v11/rosier.md`: v11 audit log with PASS status,
  primary citation re-verified against Nor 2005, and the
  >0-threshold and per-item-sign cross-checks.
- `docs/spec-v39.md`: the v39 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 247 → 248.

`UTILITIES.length` is 248. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v38 wave 38-1 — prehospital LVO predictor: `race`)

Closes the EU/Catalan-protocol gap left by v37's LAMS-only LVO
predictor. LAMS (Llanes 2004) ships in v37 wave 37-1 as the
three-item motor scale; v38 adds the five-item NIHSS-derived
Rapid Arterial oCclusion Evaluation (RACE; Pérez de la Ossa
2014) which is the LVO predictor in Catalan stroke protocols and
an increasing number of US systems. Both scales are validated
prehospital LVO predictors with comparable literature; the choice
is protocol-driven and Sophie should not force the maintainer's
local EMS / stroke system into one of them.

- `lib/scoring-v4.js`: new `race()`. Five integer items (facial
  palsy 0-2, arm motor 0-2, leg motor 0-2, gaze 0-1, aphasia /
  agnosia 0-2) summing to 0-9; `lvoLikely` fires at total >=5
  per Pérez de la Ossa 2014 (sensitivity 85% / specificity 68%
  in the derivation cohort).
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with five labeled range fields
  and an aria-live result region.
- `lib/meta.js`: META entry with inline Pérez de la Ossa 2014
  citation, specialty tags (nursing-ed / nursing-icu /
  nursing-general / emergency-medicine / neurology /
  paramedicine), a prefilled all-normal worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/race.test.js`: 7 new unit tests covering the tile
  example (score 0), the 4 / 5 / 9 boundaries around the LVO
  threshold, part-mirroring, text-content citation, and
  rejection of out-of-range, non-integer, and non-finite inputs.
- `docs/audits/v11/race.md`: v11 audit log with PASS status,
  primary citation re-verified against Pérez de la Ossa 2014,
  and the LVO-threshold cross-check.
- `docs/spec-v38.md`: the v38 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 246 → 247.

`UTILITIES.length` is 247. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v37 wave 37-1 — prehospital / ED stroke triage scales: `cpss` + `lams`)

Closes the prehospital and ED triage gap in the stroke surface.
Sophie already ships the bedside-severity NIHSS and the
telemedicine-collapsed mNIHSS (spec-v29 wave 29-3a), but carried
no triage-grade screen and no LVO-prediction scale. v37 adds the
Cincinnati Prehospital Stroke Scale (CPSS; Kothari 1999) — the
three-item bedside screen an ED triage RN performs at the door —
and the Los Angeles Motor Scale (LAMS; Llanes 2004, LVO
threshold Nazliel 2008) — the three-item motor scale ED RNs and
EMS use to decide whether to route a stroke alert to a
comprehensive / thrombectomy-capable center.

- `lib/scoring-v4.js`: new `cpss()` (three binary items: facial
  droop, arm drift, abnormal speech; positive if any one is
  abnormal per Kothari 1999) and new `lams()` (facial droop
  0-1, arm drift 0-2, grip strength 0-2; total 0-5; `lvoLikely`
  fires at total >=4 per Nazliel 2008 sensitivity 81% /
  specificity 89%).
- `app.js`: +2 UTILITIES rows in Group G.
- `views/group-g.js`: +2 renderers, each with three labeled
  range inputs and an aria-live result region.
- `lib/meta.js`: two META entries with inline Kothari 1999 and
  Llanes 2004 / Nazliel 2008 citations, specialty tags covering
  nursing-ed / nursing-icu / nursing-general / emergency-medicine
  / neurology / paramedicine, prefilled all-normal worked
  examples, and the spec-v11 §5.3 interpretation bands.
- `test/unit/cpss-lams.test.js`: 11 new unit tests covering the
  all-normal tile examples, the CPSS one-abnormal trigger and
  three-abnormal cases, the LAMS 3 / 4 / 5 boundaries around the
  Nazliel 2008 LVO threshold, text-content citations, and
  rejection of out-of-range, non-binary, and non-integer inputs.
- `docs/audits/v11/cpss.md` and `docs/audits/v11/lams.md`: v11
  audit logs with PASS status, primary citations re-verified
  against Kothari 1999 and Nazliel 2008, and the trigger-rule
  and LVO-threshold cross-checks.
- `docs/spec-v37.md`: the v37 spec doc itself, narrow and
  two-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 244 → 246.

`UTILITIES.length` is 246. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v36 wave 36-1 — maternal track-and-trigger: `meows`)

Closes the maternal-warning gap left by the NEWS2/MEWS surface
([spec-v13](docs/spec-v13.md)) by shipping the Modified Early
Obstetric Warning System (MEOWS; Singh 2012) as the routine
maternal vitals chart for OB and OB-anaesthesia nurses. NEWS2
is built for the general adult ward and the physiology of late
pregnancy and the peripartum period shifts the thresholds for
tachycardia, hypotension, and tachypnea enough that the
non-obstetric chart will miss early maternal deterioration. The
Singh 2012 validation study at Northwick Park established the
track-and-trigger thresholds now in routine use across NHS
maternity units; ACOG's 2019 committee opinion on severe
maternal morbidity endorses the same idea. Sophie's existing OB
surface (APGAR, Bishop, ACOG severe-feature preeclampsia,
HELLP) does not cover routine maternal vitals — v36 plugs that.

- `lib/scoring-v4.js`: new `meows()`. Classifies eight maternal
  observations (RR, SpO2, temp, SBP, DBP, HR, AVPU neuro, pain
  0-3) as normal / yellow / red per Singh 2012 Table 1, counts
  reds and yellows, and triggers when any one red or two or
  more yellows are present. Returns `{flags, redCount,
  yellowCount, trigger, band, text}`. Rejects non-finite
  numbers, implausible vitals (negative HR, SpO2 outside
  0-100), invalid AVPU letters, and pain outside integer 0-3.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with six numeric vital-sign
  inputs, an AVPU select, a 0-3 pain range, and an aria-live
  result region that shows the band, red/yellow counts, the
  trigger sentence, and per-parameter classification.
- `lib/meta.js`: META entry with inline Singh 2012 citation,
  specialty tags (nursing-ob / nursing-general / obstetrics /
  anesthesiology / emergency-medicine / family-medicine), a
  prefilled all-normal worked example, and the spec-v11 §5.3
  interpretation bands.
- `test/unit/meows.test.js`: 11 new unit tests covering the
  tile example, single-yellow and two-yellow boundaries, a
  single-red trigger, the SpO2 <95 cutoff, the temp 35.0 and
  38.0 edges, AVPU mapping, pain-2 yellow, text content, and
  rejection of invalid neuro / pain / non-finite / out-of-range
  vitals.
- `docs/audits/v11/meows.md`: v11 audit log with PASS status,
  primary citation re-verified against Singh 2012, and the
  trigger-rule cross-check against the CEMACH chart.
- `docs/spec-v36.md`: the v36 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 243 → 244.

`UTILITIES.length` is 244. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v35 wave 35-1 — pediatric ICU iatrogenic-withdrawal companion: `sos`)

Closes out the pediatric ICU iatrogenic-withdrawal surface by
shipping the Sophia Observation withdrawal Symptoms scale
(SOS; Ista 2009) as the validated companion to WAT-1 shipped
in [spec-v34](docs/spec-v34.md). SOS was explicitly named as a
candidate in [spec-v34 §5](docs/spec-v34.md). PICU practice
documents both side-by-side at every shift — WAT-1 is leaner
and stimulus-driven, SOS is longer and observation-window
driven over a 4-hour shift — and a bedside nurse should be
able to pick whichever scale her unit's protocol calls for
without leaving Sophie.

- `lib/scoring-v4.js`: new `sos()`. Validates each of 15
  binary items as integer 0 or 1, sums to 0-15, and bands as
  no significant withdrawal / iatrogenic withdrawal present at
  the >=4 cutoff per Ista 2009 (Youden-optimal derivation
  threshold). Returns `{score, parts, withdrawal, band, text}`
  matching the shape of `wat1()` for parity.
- `app.js`: +1 UTILITIES row in Group G.
- `views/group-g.js`: +1 renderer with 15 labeled 0-1 range
  fields and an aria-live result region.
- `lib/meta.js`: META entry with inline Ista 2009 citation,
  specialty tags (nursing-picu / nursing-nicu / nursing-peds /
  nursing-general / pediatrics / anesthesiology / pain-medicine),
  a prefilled all-zero worked example, and the spec-v11 §5.3
  interpretation bands.
- `test/unit/sos.test.js`: 7 new unit tests covering band-
  boundary scores (0, 3, 4, 15), part-mirroring, text content,
  and rejection of out-of-range and non-integer inputs.
- `docs/audits/v11/sos.md`: v11 audit log with PASS status,
  primary citation re-verified against Ista 2009, and the
  derivation Youden cutoff cross-check.
- `docs/spec-v35.md`: the v35 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/spec-v34.md §5`: cross-reference back-link noting SOS
  "Resolved by spec-v35".
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 242 → 243.

`UTILITIES.length` is 243. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v34 wave 34-1 — pediatric ICU bedside extensions: `comfort-b`, `wat-1`, `sbs`)

Completes the pediatric-ICU nurse-bedside sedation and
iatrogenic-withdrawal surface. COMFORT-B (van Dijk 2005) was
explicitly deferred in [spec-v33 §5](docs/spec-v33.md); WAT-1
(Franck 2008) and SBS (Curley 2006) are its natural companions
- WAT-1 because it is the most-cited pediatric iatrogenic-
withdrawal scale and uses SBS state as one of its 11 input
items, and SBS because it is the anchor scale that both
COMFORT-B and WAT-1 lean on in their validation studies.

- `lib/scoring-v4.js`: new `comfortB()`, `wat1()`, `sbs()`.
  COMFORT-B validates each of six items as integer 1-5, sums
  to 6-30, and bands as <11 over-sedation / 11-22 adequate /
  >22 distress per van Dijk 2005. WAT-1 validates ten binary
  items (0-1) plus a recoveryMinutes number that maps to 0/1/2
  recovery points (<2/2-5/>5 minutes), aggregates to 0-12, and
  flags withdrawal at the >=3 cutoff per Franck 2008. SBS is a
  single 6-level ordinal -3..+2 banded as deeper than target /
  target / inadequate per Curley 2006.
- `app.js`: +3 UTILITIES rows in Group G.
- `views/group-g.js`: +3 renderers - six 1-5 range fields for
  COMFORT-B, ten 0-1 range fields plus one number input for
  WAT-1, one signed -3..+2 range field with live descriptor
  label for SBS. Each has an aria-live result region.
- `lib/meta.js`: META entries for all three, each with inline
  citation, specialty tags, prefilled worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/comfort-b.test.js`, `test/unit/wat-1.test.js`,
  `test/unit/sbs.test.js`: 23 new unit tests total covering
  band-boundary scores (COMFORT-B 6/10/11/18/22/23/30; WAT-1
  0/2/3/12 with recovery 0/1/2 minute boundaries; SBS -3/-2/-1/
  0/+1/+2) and rejection of out-of-range inputs.
- `docs/audits/v11/comfort-b.md`, `wat-1.md`, `sbs.md`: v11
  audit logs with PASS status, primary citation re-verified
  against van Dijk 2005, Franck 2008, and Curley 2006
  respectively. Cross-implementation differential drawn from
  each paper's worked example.
- `docs/spec-v34.md`: the v34 spec doc itself, narrow and
  three-tile (no other rule amended).
- `docs/spec-v33.md §5`: cross-reference back-link noting
  COMFORT-B "Resolved by spec-v34".
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 239 → 242.

`UTILITIES.length` is 242. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v33 wave 33-1 — opioid-sedation + neonatal-pain extensions: `npass`, `cries`, `poss`)

Extends the v32 non-verbal pain catalog with the three bedside-
necessary pain / sedation scales explicitly listed as out-of-
scope in [spec-v32 §5](docs/spec-v32.md): N-PASS (neonatal pain,
agitation, and sedation; Hummel 2008), CRIES (neonatal post-op
pain; Krechel 1995), and POSS (Pasero opioid-induced sedation;
Pasero 2009). After v33 the nurse-bedside pain / sedation
surface is complete for the non-self-report population: ICU
(CPOT, BPS), peds / dementia / neonatal non-verbal (FLACC,
PAINAD, NIPS), neonatal extended (N-PASS, CRIES), and opioid-
sedation monitoring (POSS).

- `lib/scoring-v4.js`: new `npass()`, `cries()`, `poss()`.
  N-PASS validates each of five items as a signed integer
  -2..+2 plus a gestational-age number in [20, 44], sums the
  positive items as the pain score, sums the negative items as
  the sedation score, and applies the Hummel 2008 preterm +1/
  week<30 wk adjustment to the pain side. CRIES is a five-item
  0-10 ordinal sum with bands 0-3 / 4-6 / 7-10 (>=4 indicates
  analgesia per Krechel 1995). POSS is a single 5-level
  ordinal (S, 1, 2, 3, 4) that emits the canonical Pasero 2009
  bedside action for each level.
- `app.js`: +3 UTILITIES rows in Group G.
- `views/group-g.js`: +3 renderers - a signed -2..+2 range
  field with a GA number input for N-PASS, five 0-2 range
  fields for CRIES, one 0-4 range field with live S/1/2/3/4
  label for POSS. Each has an aria-live result region.
- `lib/meta.js`: META entries for all three, each with inline
  citation, specialty tags, prefilled worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/npass.test.js`, `test/unit/cries.test.js`,
  `test/unit/poss.test.js`: 24 new unit tests total covering
  the band-boundary scores (N-PASS pain 0/3/4/10 + sedation
  -1/-3/-5 + preterm 26-wk adjustment; CRIES 0/3/4/6/7/10;
  POSS S/1/2/3/4) and rejection of out-of-range inputs.
- `docs/audits/v11/npass.md`, `cries.md`, `poss.md`: v11 audit
  logs with PASS status, primary citation re-verified against
  Hummel 2008, Krechel 1995, and Pasero 2009 respectively.
  Cross-implementation differential drawn from each paper's
  worked example.
- `docs/spec-v33.md`: the v33 spec doc itself, narrow and
  three-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 236 → 239.

`UTILITIES.length` is 239. Lint + unit tests + a11y + sbom +
build all clean.

### Added (spec-v32 wave 32-1 — non-verbal pain scales: `flacc`, `painad`, `nips`)

Extends the v29 nursing-shift catalog with three validated
non-verbal pain scales nurses reach for at the bedside when the
patient cannot self-report on a numeric rating scale. Each is a
small ordinal sum with a banded interpretation and passes the
v29 §3 one-line test (structured input → computed result).
Complements the v29-shipped CPOT (any ICU) and BPS (intubated)
by covering the non-ICU non-verbal surface: pediatrics,
advanced dementia, and neonatal.

- `lib/scoring-v4.js`: new `flacc()`, `painad()`, `nips()`. Each
  validates per-item ordinal range, sums to the total, and
  returns `{score, parts, band, text}`. Shared `painBand()`
  helper for the FLACC / PAINAD 0-10 banding (0 no pain; 1-3
  mild; 4-6 moderate; 7-10 severe). NIPS uses its own three-
  band cutoff per Lawrence 1993 (0-2 no/mild; 3-4 mild-to-
  moderate; >4 severe).
- `app.js`: +3 UTILITIES rows in Group G.
- `views/group-g.js`: +3 renderers, each five or six labeled
  range inputs and an aria-live result region.
- `lib/meta.js`: META entries for all three, each with inline
  citation, specialty tags, prefilled worked example, and
  spec-v11 §5.3 interpretation bands.
- `test/unit/flacc.test.js`, `test/unit/painad.test.js`,
  `test/unit/nips.test.js`: 20 new unit tests total covering the
  band-boundary scores (FLACC 0/3/4/6/7/10; PAINAD 0/3/4/7/10;
  NIPS 0/2/3/4/5/7) and rejection of out-of-range inputs.
- `docs/audits/v11/flacc.md`, `painad.md`, `nips.md`: v11 audit
  logs with PASS status, primary citation re-verified against
  Merkel 1997, Warden 2003, and Lawrence 1993 respectively.
  Cross-implementation differential drawn from each paper's
  worked example.
- `docs/spec-v32.md`: the v32 spec doc itself, narrow and
  three-tile (no other rule amended).
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 233 → 236.

`UTILITIES.length` is 236. Lint + 1211 unit tests + a11y + sbom +
build all clean.

### Added (spec-v31 wave 31-1 — Beers Criteria deprescribing checker: `beers-check`)

Resolves [spec-v29 §10.4](docs/spec-v29.md#10-open-questions). The
v29 prune cut the standalone `beers` reference card (a searchable
list of drugs-to-avoid). v31 ships the computed form: a closed-
vocabulary intake (patient age + 15 PIM medication categories +
8 comorbidities) cross-referenced against AGS 2023 Tables 2, 3,
and 6 to emit specific PIM, drug-disease, and high-severity
drug-drug flags with deprescribing recommendations.

- `lib/medication-v4.js`: new `beersCheck()` plus exported
  `BEERS_PIM` (15 categories) and `BEERS_DISEASE` (8) closed
  vocabularies. Inputs: `ageYears` (18-120), `medications` (array
  of PIM keys), `comorbidities` (array of disease keys). Outputs:
  per-medication PIM flag (rationale + recommendation), drug-
  disease flag for each PIM × comorbidity row in AGS 2023
  Table 3, drug-drug flag for opioid + benzodiazepine,
  opioid + gabapentinoid, and opioid + Z-drug (AGS 2023 Table 6).
  Age-band banner (< 65 vs in-band per AGS 2023 §2).
- `app.js`: +1 UTILITIES row in Group F.
- `views/group-f.js`: renderer slotted at end of group-F; one
  number input (age), two grouped checkbox lists driven by the
  exported vocabularies (so the UI and the data-table stay in
  sync automatically).
- `lib/meta.js`: META entry with inline citation, specialty tags,
  prefilled worked example (age 78 + benzodiazepine + opioid +
  history-of-falls produces 5 flags), and the spec-v11 §5.3
  interpretation bands.
- `test/unit/beers-check.test.js`: 15 new unit tests covering the
  five worked examples from spec-v31 §2.1, the < 65 / 65-boundary
  banner switch, the NSAID three-way comorbidity expansion (HF +
  GI-bleed + CKD), the three drug-drug Table 6 rows, duplicate-
  input collapse, and rejection of out-of-range / non-array /
  unknown-token inputs.
- `docs/audits/v11/beers-check.md`: v11 audit log with PASS
  status, primary citation re-verified against AGS 2023 Tables
  2, 3, and 6. Boundary examples, cross-implementation
  differential (three rows pulled from AGS 2023 verified
  verbatim), edge-input handling, a11y, defects opened (none).
- `docs/spec-v31.md`: the v31 spec doc itself, narrow and
  one-tile (no other rule amended).
- `docs/spec-v29.md §10.4`: cross-reference back-link noting
  "Resolved by spec-v31".
- `docs/scope-mdcalc-parity.md`, `README.md`, `package.json`:
  catalog count 232 → 233.

`UTILITIES.length` is 233. Lint + 1191 unit tests + a11y + sbom +
build all clean.

### Added (spec-v30 wave 30-1 — thermal-emergency decision tiles: hypothermia-rewarm + heatstroke-decision)

Resolves [spec-v29 §10.3](docs/spec-v29.md#10-open-questions). The
v29 prune cut the static `hypothermia` and `heat-illness` staging
reference cards (correctly — a labelled grid is not computation).
What was missing was the *algorithm pinned to the staging*: given
the staging inputs, which rewarming or cooling action is indicated,
and what is the EMS / ECPR referral threshold. v30 ships those two
calculators, each passing the v29 §3 one-line test (structured
input → computed bedside action).

- `lib/scoring-v4.js`: new `hypothermiaRewarm()`. Inputs: core
  temp (C), Swiss-state picker (alert+shivering / impaired /
  unconscious / arrest), ECPR-exclusion flag (lethal injury,
  chest non-compressible, known asystole pre-cooling), optional
  serum K+. Outputs: Swiss stage HT I-IV per Durrer 2003;
  rewarming pathway (passive external / active external +
  minimally invasive / active internal / ECPR); ERC 2021 §4.7
  ECPR cut-off (K+ > 12 mmol/L); the "do not declare death until
  rewarmed to >=32 C" banner; the Gilbert 2000 < 13.7 C
  lowest-reported-survival banner.
- `lib/scoring-v4.js`: new `heatstrokeDecision()`. Inputs: core
  (rectal) temp (C), CNS picker (none / mild confusion /
  altered), sweating present, setting (field / hospital). Outputs:
  stage per Bouchama 2002 (heat exhaustion vs heat stroke =
  core >40 C **or** CNS dysfunction); subtype (classic anhidrotic
  vs exertional sweating); cooling algorithm (rest + rehydrate
  for exhaustion; CWI to 38.9 C cool-first-transport-second for
  field heat stroke per WMS 2019; CWI preferred / evaporative
  acceptable for in-hospital); rhabdo / DIC / AKI surveillance
  banner; Casa 2007 30-minute-window survival banner.
- `app.js`: +2 UTILITIES rows in Group I.
- `views/group-i.js`: +2 renderers slotted next to the surviving
  field-medicine calculators (cincinnati, fast, field-triage,
  burn-fluid, peds-ett, naloxone, co-cn-antidote).
- `lib/meta.js`: META entries for both tiles, each with inline
  citation, specialty tags, prefilled worked example, and the
  spec-v11 §5.3 interpretation bands.
- `test/unit/hypothermia-rewarm.test.js` and
  `test/unit/heatstroke-decision.test.js`: 17 new unit tests
  total (10 + 7), covering the five Durrer 2003 staging boundaries
  (including the K+ 12 / K+ 14 ECPR cut-off boundary and the
  Gilbert 2000 < 13.7 C survival banner), the five Bouchama 2002
  worked examples (heat-exhaustion at 39.5 C, the 40.0 C boundary,
  exertional 41.2 C with CWI, classic 41.0 C anhidrotic, and CNS
  dysfunction at 39.0 C independent of temperature), and
  rejection of out-of-range and unknown-token inputs.
- `docs/audits/v11/hypothermia-rewarm.md` and
  `docs/audits/v11/heatstroke-decision.md`: v11 audit logs with
  PASS status, primary citation re-verified against Durrer 2003,
  Brown 2012, Lott 2021, Bouchama 2002, Lipman 2019, and
  Casa 2007. Boundary examples, cross-implementation differential
  (Brown 2012 Figure 1 / Lott 2021 §4.7 / Bouchama 2002 Table 1 /
  WMS 2019 field algorithm), edge-input handling, a11y, defects
  opened (none) all populated.
- `docs/spec-v30.md`: the v30 spec doc itself, narrow and
  two-tile (no other v29 rule amended).
- `docs/spec-v29.md §10.3`: cross-reference back-link noting
  "Resolved by spec-v30".
- `docs/scope-mdcalc-parity.md` and `README.md` and
  `package.json`: catalog count 230 → 232.

`UTILITIES.length` is 232. Lint + 1176 unit tests + a11y + sbom +
build all clean.

### Fixed (spec-v29 post-close: prune stale e2e smokes for retired tiles; fix two stale META examples)

The Playwright e2e job carried smokes and a parameterized correctness
sweep that still targeted tiles retired in spec-v29 wave 29-2, plus
two `META[id].example` blocks whose `expected` text no longer
matched the renderer output. Net effect: 20-ish pre-existing
chromium failures on `main`. After this change the e2e suite is
clean of retired-tile drift and the meta-example mismatches.

- `test/integration/smoke.spec.js`: the per-tile Group I (`defib`),
  K (`lab-adult`), L (`eob-glossary`), and O (`high-alert-card`)
  smokes referenced retired tiles. They are replaced with a single
  parameterized check that asserts each hash now redirects to the
  home view with the `.deprecation-notice` "Removed in spec-v29"
  banner (mirroring the pattern already used for Group A `icd10`).
  The "Group I tools render the local-protocol notice" smoke is
  retargeted at a surviving Group I tile (`cincinnati`); `defib`'s
  notice is gone with the tile.
- `test/integration/smoke.spec.js`: the GCS smoke asserted "GCS
  total: 15 (Mild)" — the v6-era default-input result. Per
  spec-v9 §3.3 every tile boots with its `META.example` applied,
  so the GCS view loads at 3/4/5 = 12 (Moderate). Assertion
  updated.
- `test/integration/smoke.spec.js`: the "Test-with-example
  button" smoke clicked `.example-btn` (a selector retired in
  spec-v9 when the button was replaced by an on-load prefill +
  `.example-reset` link). Test now exercises the prefill +
  reset-link round trip on BMI.
- `test/integration/example-correctness.spec.js`: same
  `.example-btn` → `.example-reset` rename. `ews-escalation`
  added to the `SCENARIO_ONLY` skiplist — its expected hour-band
  is local-timezone-dependent (datetime-local input + ISO output),
  not a tile bug; the unit test in `test/unit/` asserts the math
  directly.
- `lib/meta.js`: `egfr` example expected text "eGFR ~91 mL/min"
  did not match the CKD-EPI 2021 race-free output for the
  example's `sex: 'F'` field (correct value ~60, as the
  matching unit test in `test/unit/clinical.test.js` confirms).
  Expected text bumped to "eGFR ~60 mL/min/1.73m^2".
- `lib/meta.js`: `hacor` example expected "HACOR 3: not in the
  high-risk band" but for the documented example inputs
  (HR 110 / pH 7.40 / GCS 15 / P/F 240 / RR 25) every Duan
  2017 Table 1 sub-score is 0; the unit test in
  `test/unit/hacor.test.js` asserts exactly this. Expected
  text bumped to "HACOR 0: ...".

`npm run release:check` clean. The remaining e2e failures on the
chromium project are two slow specs hitting the 360s per-test
timeout when run sequentially in the same workers (cosmetic CI
slowness, not assertion failures); the suites pass when run
individually.

### Changed (spec-v29 post-close: docs/scope-mdcalc-parity.md sync to v29-close catalog count)

No code change; no catalog change. Brings the long-horizon scope
doc into agreement with the v29-close catalog.

- §3 cadence rationale: "the existing 178 tiles already cover
  the highest-frequency clinical workflows" → "the existing
  230 tiles already cover...". The 178 figure was the v6-era
  count; the v29-close catalog is 230 tiles
  (`UTILITIES.length` in `app.js`).
- §1 v29-amendment block: the "(603 -> 576)" projection is
  retained for spec-fidelity but now annotated as projected-
  from-over-counted-base, with the actual v29-close count
  (230 tiles) called out alongside. Matches the README +
  package.json sync already landed in this `[Unreleased]`
  block.

Lint + 1159 unit tests + sbom + build clean.

### Removed (spec-v29 post-close: 6 orphaned `G`-leader keyboard shortcuts whose target tiles were retired)

The `G`-prefix keyboard shortcuts in `lib/keyboard.js` carried six
entries that targeted tiles retired by spec-v10 or spec-v29 wave
29-2:

- `G I` → `icd10` (retired wave 29-2 §2.1)
- `G C` → `cpt` (retired wave 29-2 §2.1)
- `G N` → `ndc` (retired wave 29-2 §2.1)
- `G F` → `mpfs` Medicare Fee Lookup (retired in spec-v10)
- `G O` → `oop` Out-of-Pocket Estimator (retired in spec-v10)
- The HCPCS branch of `G H` ("Home or HCPCS from home", retired
  wave 29-2 §2.1)

Each leader pointed at a hash that no longer resolves to a tile.
Removed; `G H` is now an unconditional "Home" jump. Surviving
shortcuts: `G H` (Home), `G U` (Unit Converter), `G B` (BMI),
`G E` (eGFR), `G D` (Drip Rate), `G W` (Weight-Based Dose),
`G M` (MAP), `G G` (GCS). The help overlay (`?`) lists the
surviving set.

`test/unit/keyboard.test.js` updated: the surviving-keys
assertion drops the six retired letters; a new assertion
explicitly forbids them so a future regression cannot re-add
a leader that targets a missing tile.

### Changed (spec-v29 post-close: docs/data-sources.md rewritten around the v29-close bundled data)

No code change; no catalog change. Rewrites `docs/data-sources.md`
so the doc describes the data that actually ships with the page
at v29 close rather than the v1-v8 build-data catalog.

- Surviving datasets documented one section at a time: clinical
  reference data (formulas only), field-medicine datasets
  (CDC Field Triage, START / JumpSTART, FDA prehospital meds,
  EMS run-type checklists), public-health decision trees
  (tetanus, rabies PEP, BBP, TB, STI), medication / infusion
  datasets (abx-renal, benzo-equiv, steroid-equiv, MME factors,
  TPN rules, vasopressor doses), workflow templates, and the
  pre-rendered per-tile copy under `data/tool-copy/`.
- `data/synonyms.json` documented as the spec-v7 §3.2
  synonym map consumed by `lib/synonyms.js`.
- `data/mpfs/` flagged as vestigial: the shards still ship from
  disk but no tile reads them; pencilled in for a future
  cleanup pass.
- Explicit "Retired datasets" section enumerates every folder
  that was bundled in v1-v8 and was removed in the spec-v10
  patient-artifact retirement or the spec-v29 wave 29-2 prune
  (code lookups, patient-administrative infographics, field-
  medicine reference cards, lab and pharmacy reference tables,
  pricing / coverage / enforcement, eligibility / benefits,
  and the four single-class Group G clinical references).
  Every entry cross-references the spec-v29 §2 sub-section
  that retired it.
- Manifests section retained: every surviving folder still ships
  a manifest with the fields listed at the top, verified on
  every `npm run test` by `scripts/verify-integrity.mjs`.

Lint + 1159 unit tests + sbom + build clean.

### Changed (spec-v29 post-close: docs/architecture.md sync to v29-close runtime)

Brings `docs/architecture.md` into agreement with the v29-close
runtime. No code change; no catalog change.

- Diagram (right-hand "Static origin" column): drops the retired
  data shard directories (`icd10cm/`, `hcpcs/`, `cpt-summaries/`,
  `mpfs/`, `nadac/`, `ndc/`, `npi/`, `crosswalks/`, `ncci/`,
  `mue/`, `coverage/`, `enforcement/`, `hospital-prices/`,
  `no-surprises/`, `state-rights/`) that were retired in
  spec-v10 and spec-v29 wave 29-2; what remains is `clinical/`,
  `synonyms.json`, and the small per-tile shards consumed by
  the calculators that embed a bundled table inline.
- Runtime architecture: audience-tag bullet replaced by the
  spec-v29 §5.3 chip set (All / Nurse / Doctor / Pharmacist /
  RT / EMS / Biller-Coder / Educator; Nurse on-first-visit
  default). Web-Worker bullet rewritten to record that the
  Bill Decoder and Hospital Price Transparency Web Workers
  were retired and no Web Workers remain at runtime.
- "Shared renderers (v4)" section: `lib/table.js` and
  `lib/print.js` consumer lists updated for the post-v29
  surface (no more code-index / reference-range tables;
  printables collapse to appeal letter / HIPAA / ROI /
  discharge / wallet / SBAR).
- "v4 group expansion (J-O)" section rewritten as
  "v4 group expansion (post-v29 surface)": K (Lab Reference),
  L (Forms & Numbers Literacy), and O (Patient Safety)
  marked as retired with the spec-v29 wave 29-2 cross-
  references; J (Public Health) and N (Literacy Helpers)
  trimmed to their v29 survivors.

Lint + 1159 unit tests + sbom + build clean.

### Changed (spec-v29 post-close: README + package.json sync to v29-close catalog)

Brings the user-facing prose into agreement with the v29-close
catalog (230 tiles, all deterministic, nurse-first audience
priority).

- `package.json` description: "79 deterministic healthcare
  utilities" → "230 deterministic healthcare calculators tuned
  to the nurse on shift."
- `README.md` lead paragraph: drops the stale "603 -> 576"
  projection (the v29 spec projection was based on an over-
  counted base; actual at v29 close is 230 tiles).
- `README.md` "The problem" section: rewritten around the
  bedside-math use case rather than the patient-bill use case
  (the patient-facing bill / EOB / insurance decoders were
  retired in spec-v29 wave 29-2 §2.2).
- `README.md` "How it works" catalog narrative: rewritten to
  describe the v29-close grouping (Clinical math &
  conversions, Medication & infusion, Clinical scoring &
  risk, Clinical criteria & diagnostic bundles, Workflow &
  templates, Field medicine, Public health & infectious
  disease, Billing & coding). The static-index references
  (ICD-10 / HCPCS / CPT / NDC / EOB decoder / bill decoder /
  ASA / Mallampati / Beers / mRS / lab-ranges / TDM / tox
  levels / NIOSH / DOT-ERG / AHA wallet card) are dropped;
  the new v29 nursing-shift tiles (Braden, Morse, Hendrich II,
  RASS, BPS, CPOT, ICDSC, CAM, CAM-ICU, NPIAP, VIP/INS, ABO
  compat, insulin correction, electrolyte ladder, CRRT dose,
  ECMO titration, MTP tracker, restraint timer, sepsis-bundle
  clock, code-blue clock, device-day counter, Bristol / girth,
  vent SBT / PEEP-FiO2) are reflected.
- `README.md` "System design": drops the obsolete Web-Worker
  reference (Medical Bill Decoder and Hospital Price
  Transparency were removed in spec-v10 and spec-v29).
- `README.md` CLI reference: test count updated 191 → 1159.
- `README.md` "Limitations": drops the CPT / ICD-10-CM / NDC /
  Bill Decoder / Hospital Price Transparency / Medicare-fee
  limitations (these tiles no longer exist); adds one bullet
  pointing users at upstream sources for the retired static
  indexes.

No catalog change. No code change. Lint + 1159 unit tests +
sbom + build clean.

### Changed (spec-v29 §5.3 — audience-chip taxonomy revised; Nurse is the on-first-visit default)

Closes the final spec-v29 acceptance-criteria item. The audience
chip set on the home view is revised from the v6/v28 taxonomy
(`All / Patient / Biller and Coder / Nurse and Clinician / EMS
and Field / Educator`) to the v29 nurse-first taxonomy:

```
All  /  Nurse  /  Doctor  /  Pharmacist  /  RT  /  EMS  /  Biller-Coder  /  Educator
```

Nurse is the *default-selected* chip on first visit, preserved
across visits via URL hash only (no localStorage; per spec-v29
§5.3 this is the only user-preference signal on the site).

Surfaces touched:
- `index.html`: chip set replaced; Nurse carries `is-active` +
  `aria-pressed="true"` and the rest start inert.
- `app.js`: `filterState.audience` initial value is `'nurse'`.
  New `CHIP_MATCHERS` table maps each chip value to a predicate
  over `(tile.audiences, tile.specialties)` (spec-v29 §5.3:
  "Each chip filters the grid by the union of tile `audiences`
  and `specialties`."). The Nurse chip matches tiles with a
  `nursing-*` specialty tag (spec-v29 §5.1) *or* the legacy
  `clinicians` audience; RT matches `respiratory-therapy` or
  `pulmonology` specialty; Pharmacist matches `pharmacy`
  specialty; EMS matches the `field` audience or
  `emergency-medicine` specialty; Doctor / Biller-Coder /
  Educator map to the existing `clinicians` / `billers` /
  `educators` audience tokens. `tileMatches` looks up
  specialties from `META[id].specialties` via the tile's
  `data-tool` attribute.
- `app.js`: new `CHIP_TO_AUDIENCE_HINT` table maps the active
  chip to its closest legacy audience tag for the synonym
  matcher and the prompt ranker; this keeps
  `data/synonyms.json` audience-hint matching unchanged while
  the UI taxonomy is decoupled.
- `lib/hash.js`: the default audience returned by `parseHash`
  is `'nurse'`; `buildHash` omits the `a=` segment when the
  audience equals the default. The literal `'all'` is now a
  non-default value (`buildHash({ audience: 'all' })` emits
  `a=all`).
- `test/unit/hash.test.js`: empty-hash and round-trip tests
  updated for the new default. New test asserts
  `audience=all` now emits `a=all` (it is no longer the
  default).

Old bookmarks of the form `#a=patients` / `#a=clinicians` /
`#a=field` / `#a=billers` / `#a=educators` continue to round-
trip through the parser and the toggle-group sync logic; they
just do not match any of the new chip predicates, so the grid
falls back to the equivalent of `all` for those legacy tokens.
Per spec-v29 there is no backwards-compatibility shim for the
chip tokens themselves.

This closes the v29 acceptance criteria: spec-v29 is fully
shipped. Wave 29-1 (spec landing + deprecation banners),
wave 29-2 (47 tile deletions across Groups A, C/L, I, K/O, G),
wave 29-3 (20 new nursing-shift tiles), and the §5.3 audience-
chip update are all on `main`.

### Removed (spec-v29 wave 29-2 Group G — 5 single-class clinical reference tiles)

Fifth and final wave 29-2 deletion PR (one per group letter per
spec-v29 sec 7.2). Removes the Group G slots that are not
calculators — single-class clinical references whose "output" is
just the label of the class the user picked, or a filtered
view of a static table. The Group G scoring calculators (NIHSS,
CHA2DS2-VASc, HAS-BLED, Wells, GRACE, HEART, PERC, CURB-65, PSI,
qSOFA/SOFA, MELD/Child-Pugh, Ranson/BISAP, Centor, Caprini,
Bishop, Alvarado, mini-Cog, PHQ-9/GAD-7/AUDIT-C/CAGE/EPDS,
CIWA-Ar, plus every v17-v28 score tile) remain.

Tiles removed (5):
- `beers` (AGS Beers Criteria drug-condition lookup; static list).
- `peds-vitals` (PALS age-banded reference ranges; static table).
- `asa` (ASA Physical Status 6-class reference; static index).
- `mallampati` (Mallampati 4-class reference; static index).
- `mrs` (Modified Rankin Scale 0-6 reference; investigator-rated,
  not auto-computed).

Surfaces touched:
- `app.js` UTILITIES: 5 entries deleted; the Group G block in
  `REMOVED_V29_IDS` carries the per-group note. The
  `DEPRECATED_V29_TILES` set and `DEPRECATION_V29_BANNER_TEXT`
  string + their renderer branch are removed (wave 29-2 is now
  complete; no tiles remain in the deprecation window).
- `lib/meta.js`: 5 META entries deleted.
- `lib/scoring-v4.js`: `MRS_DESCRIPTIONS` export removed
  (it was a static 0-6 label table, not a scoring function).
- `views/group-g.js`: `peds-vitals`, `asa`, `mallampati`,
  `beers`, and `mrs` renderers removed; the unused `loadFile`
  import is dropped.
- `index.html`: 5 home-grid tool cards removed.
- `scripts/build-tool-pages.mjs`: `DATASET_TILES` and
  `REFERENCE_TILES` collapsed (the removed-tile bookkeeping no
  longer iterates; live tiles route through `classify()` directly).
- `scripts/build-topic-pages.mjs`: obstetrics-pediatrics topic
  drops `peds-vitals` from its tile list, description, and lede.
- `sitemap.xml`: 5 `/tools/<id>/` entries removed (build step
  regenerates this from `UTILITIES`).
- `test/unit/meta.test.js`: NO_INPUTS_TILES allowlist drops the
  3 Group G non-score ids.
- `test/unit/scoring-v4-w34.test.js`: 2 MRS reference tests and
  the `MRS_DESCRIPTIONS` import dropped.

Data shards deleted: `data/clinical/pediatric-vitals.json`,
`data/clinical/beers.json`, `data/clinical/asa-status.json`,
`data/clinical/mallampati.json`. `data/clinical/manifest.json`
shrinks to a single file (`formulas.json`) with `recordCount: 22`.

URL hashes for the 5 removed ids resolve to the home view with
the Group G note (spec-v29 sec 2.7).

Catalog 235 -> 230. Wave 29-2 is now complete: all 47 tile ids
in spec-v29 sec 2.1-2.5 have been removed (Groups A, C/L, I,
K/O, G).

### Removed (spec-v29 wave 29-2 Group K/O — 8 reference-range and wallet-card tiles)

Fourth of the five wave 29-2 deletion PRs (one per group letter
per spec-v29 sec 7.2). Removes the Group K (lab-reference) and
Group O (high-alert wallet) tiles, plus the deferred Group K/O
tiles surfaced in Groups F and G. The `iv-to-po` deferral from
spec-v29 sec 7.2 is resolved per the wave-29-2 audit decision:
the implementation is a static equivalence table with no numeric
output, so it is removed with the rest.

Tiles removed (8):
- lab-ranges (Group G slot; common adult ranges).
- lab-adult, lab-peds (Group K; NIH / pediatric reference tables).
- tdm-levels (Group K; therapeutic drug-level table).
- tox-levels (Group K; toxicology threshold table).
- high-alert (Group F slot; ISMP high-alert list).
- high-alert-card (Group O; ISMP wallet card).
- iv-to-po (Group F slot; static IV/PO equivalence table per
  spec-v29 sec 7.2 audit).

Surfaces touched:
- `app.js` UTILITIES: 8 entries deleted; the Group K/O block in
  `REMOVED_V29_IDS` adds the per-group note. `DEPRECATED_V29_TILES`
  now lists only the wave 29-2 Group G non-score deletion targets.
- `lib/meta.js`: 8 META entries deleted.
- `lib/medication-v4.js`: `ivToPo()` helper removed.
- `views/group-f.js`: high-alert + iv-to-po renderers + `renderTable`
  + `ivToPo` imports removed.
- `views/group-g.js`: lab-ranges renderer removed.
- `views/group-klmno.js`: lab-adult / lab-peds / tdm-levels /
  tox-levels / high-alert-card renderers removed + all four
  rendering library imports collapsed (file is now el-only).
- `index.html`: 8 home-grid tool cards + the Reference Ranges
  and High-Alert & Safety home sections removed.
- `scripts/build-topic-pages.mjs`: medication-safety topic
  rewritten around the calculator survivors;
  obstetrics-pediatrics drops `lab-peds`.

Data shards deleted: `data/lab-ranges-adult/`,
`data/lab-ranges-peds/`, `data/therapeutic-drug-levels/`,
`data/tox-levels/`, `data/iv-to-po/`. `data/clinical/manifest.json`
shrunk to drop `lab-ranges.json` and `ismp-high-alert.json`
(also removed); the remaining `data/clinical/` files
(formulas / pediatric-vitals / beers / asa-status / mallampati)
go in the wave 29-2 Group G non-scores PR.

Tests updated: `test/unit/medication-v4.test.js` drops `ivToPo`
import + four tests + the IVPO fixture; `test/unit/meta.test.js`
NO_INPUTS_TILES allowlist drops the 8 removed ids.

URL hashes for the 8 removed ids resolve to the home view with
the Group K/O note (spec-v29 sec 2.7).

Catalog 243 -> 235. Remaining v29 deletion PR: Group G non-scores
(5 single-class clinical references: beers, peds-vitals, asa,
mallampati, mrs).

### Removed (spec-v29 wave 29-2 Group I — 10 field-medicine reference cards)

Third of the five wave 29-2 deletion PRs (one per group letter
per spec-v29 sec 7.2). Removes the Group I reference cards,
leaving the field-medicine calculators and decision rules
(peds-weight-dose, cincinnati, fast, field-triage, start /
jumpstart triage, bsa_burn, burn-fluid, peds-ett, naloxone,
ems-doc, nexus-cspine, co-cn-antidote, avpu-gcs) in place.

Tiles removed (10):
- adult-arrest-ref, peds-arrest-ref (AHA ECC drug tables).
- defib (1-J/kg lookup, not a calculation per spec-v29 sec 2.3).
- toxidromes (static syndrome reference).
- dot-erg, niosh-pg (hazmat / chemical-hazard lookups).
- cpr-numeric (AHA wallet-card numeric reference).
- tccc (CoTCCC tourniquet reference).
- hypothermia, heat-illness (WMS staging reference tables).

Surfaces touched:
- `app.js` UTILITIES: 10 entries deleted; the Group I block in
  `REMOVED_V29_IDS` adds the per-group note.
- `lib/meta.js`: 10 META entries deleted.
- `lib/field.js`: `defibEnergy()` removed.
- `views/group-i.js`: 10 renderers + the `renderTable` /
  `buildIndex` imports removed.
- `index.html`: 10 Field Medicine home-grid cards removed.
- `scripts/build-topic-pages.mjs`: cardiology + obstetrics-
  pediatrics topic pages drop the removed-tile references.
- `test/unit/field.test.js`: `defibEnergy` import + six tests
  removed.

Data shards deleted: `data/aha-reference/`,
`data/cpr-aha-numeric/`, `data/dot-erg/`, `data/environmental/`,
`data/niosh-pg/`, `data/tccc/`, `data/toxidromes/`.

Tests deleted: `test/unit/aha-no-flowchart.test.js` (its only
job was to police the now-deleted AHA / CPR shards).

URL hashes for the 10 removed ids resolve to the home view with
the Group I note (spec-v29 sec 2.7).

Catalog 253 -> 243. Remaining v29 deletion PRs: Group K/O (8
reference-range / wallet-card tiles), Group G non-scores (5
single-class clinical references).

### Removed (spec-v29 wave 29-2 Group C/L — 15 patient-literacy and form-locator tiles)

Second of the five wave 29-2 deletion PRs (one per group letter,
per spec-v29 sec 7.2). Removes the patient-literacy and
form-locator surface, leaving only the generators (appeal-letter,
hipaa-roa) per spec-v29 sec 10 open question 1.

Tiles removed (15):
- Group C (12): decoder, insurance, eob-decoder, no-surprises,
  insurance-card, abn-explainer, msn-decoder, idr-eligibility,
  birthday-rule, cobra-timeline, medicare-enrollment, aca-sep.
- Group L (3): cms1500, ub04, eob-glossary.

Surfaces touched:
- `app.js` UTILITIES: 15 entries deleted; `REMOVED_V29_IDS`
  promoted from Set to Map so the redirect note text matches the
  group bucket (per spec-v29 sec 2.7).
- `lib/meta.js` META: 15 entries deleted.
- `views/group-c.js`: rewritten as the survivor-only file
  (appeal-letter + hipaa-roa). 580+ lines deleted.
- `views/group-klmno.js`: cms1500 / ub04 / eob-glossary
  renderers removed.
- `index.html`: 15 Insurance & Patient Literacy + Insurance
  Glossary home-grid tool cards deleted.
- `data/synonyms.json`: 14 synonym entries deleted.
- `scripts/build-topic-pages.mjs`: billing-and-coding and
  patient-literacy topic pages rewritten around the survivor
  generators (appeal-letter, hipaa-roa, lab-interpret,
  wallet-card).

Library modules deleted (the Group A holdover):
`lib/codes.js`, `lib/decoder.js`, `lib/cobra.js`,
`lib/medicare-enrollment.js`, `lib/aca-sep.js`,
`lib/birthday-rule.js`, `lib/tob.js`, plus the long-orphan
`lib/artifact-detect.js`, `lib/artifact-route.js`,
`lib/artifact-handoff.js` (spec-v10 sec 3.1 dropzone retire).

Data shard directories deleted: `data/icd10cm/`, `data/hcpcs/`,
`data/cpt-summaries/`, `data/ndc/`, `data/crosswalks/`,
`data/hcpcs-modifiers/`, `data/pos-codes/`, `data/revenue-codes/`,
`data/tob-codes/`, `data/nubc-special-codes/`, `data/drg/`,
`data/apc/`, `data/icd10-pcs/`, `data/rxnorm/`,
`data/cms-1500-fields/`, `data/ub04-fields/`,
`data/eob-glossary/`, `data/no-surprises/`. The bytes-on-disk
reduction is substantial; the service-worker pre-cache and
cold-cache install shrink proportionally per spec-v29 sec 2.7.

Tests deleted: `test/unit/decoder.test.js`,
`test/unit/cobra.test.js`, `test/unit/aca-sep.test.js`,
`test/unit/birthday-rule.test.js`, `test/unit/codes.test.js`,
`test/unit/tob.test.js`, `test/unit/medicare-enrollment.test.js`,
`test/unit/cpt-no-ama.test.js`, the three `test/unit/artifact-*`
tests. SOURCE_REQUIRED list in `test/unit/meta.test.js` is now
empty (no surviving tile relies on a source stamp).

URL hashes for the 15 removed ids resolve to the home view with
the one-line removed-note for Group C/L (spec-v29 sec 2.7).

Catalog 268 -> 253 at v29 wave 29-2 Group C/L close. Remaining
v29 deletion PRs: Group I (10 field-medicine reference cards),
Group K/O (8 reference-range / wallet-card tiles), Group G
non-scores (5 single-class clinical references).

### Removed (spec-v29 wave 29-2 Group A — 19 code-reference lookup tiles)

First of the five wave 29-2 deletion PRs (one per group letter, per
spec-v29 sec 7.2). Removes the entire Group A code-reference
surface, leaving only the survivor calculators (em-time,
ndc-convert) that compute deterministic outputs.

Tiles removed:
- icd10, hcpcs, cpt, ndc, pos-codes, modifier-codes,
  revenue-codes, carc, rarc (the original Group A spec-v2 set).
- hcpcs-mod, pos-lookup, tob-decode, rev-table, nubc-codes,
  drg-lookup, apc-lookup, pcs-lookup, rxnorm-lookup, ndc-rxnorm
  (the spec-v4 Group A extensions; v0/v4 duplicates resolved per
  spec-v29 sec 2.6).

Surfaces touched:
- `app.js` UTILITIES: 19 entries deleted; new REMOVED_V29_IDS Set
  drives the home-view redirect note (spec-v29 sec 2.7).
- `lib/meta.js` META: 19 entries deleted.
- `views/group-a.js`: emptied; surviving Group A renderers
  (em-time, ndc-convert) live in `views/group-v5.js`.
- `index.html`: 19 Billing &amp; Coding home-grid tool cards
  deleted.
- `data/synonyms.json`: 6 synonym entries deleted.
- `scripts/build-topic-pages.mjs`: the `billing-and-coding` topic
  page is rewritten around the calculator survivors (the static
  reference lookups belong in the EHR or upstream CMS / FDA /
  NUBC / X12 release).
- Smoke spec: per-tile Group A tests replaced with a
  removed-tile-hash regression covering the v29 redirect note.

Data shards (`data/icd10cm/`, `data/hcpcs/`, `data/cpt-summaries/`,
`data/ndc/`, `data/crosswalks/`, `data/hcpcs-modifiers/`,
`data/pos-codes/`, `data/revenue-codes/`, `data/tob-codes/`,
`data/nubc-special-codes/`, `data/drg/`, `data/apc/`,
`data/icd10-pcs/`, `data/rxnorm/`) and `lib/codes.js` remain on
disk because `views/group-c.js` (decoder / EOB decoder / etc.)
and `lib/decoder.js` still import them. They go in the wave 29-2
Group C deletion PR.

URL hashes for the 19 removed ids resolve to the home view with
the one-line note `Removed in spec-v29 wave 29-2 (code-reference
lookup): this tile is no longer hosted by Sophie. Use the
upstream code source (CMS, FDA, NUBC, AMA, X12) or your EHR's
lookup.` (spec-v29 sec 2.7).

Catalog 287 -> 268 at v29 wave 29-2 Group A close.

### Added (spec-v29 wave 29-3e close — vent bundle: SBT readiness + ARDSnet PEEP/FiO2; wave 29-3 complete)

Final wave 29-3 sub-batch. Closes wave 29-3 with the vent
bundle.

- `vent-sbt-peep` (Boles 2007 + ARDS Network 2000 / ALVEOLI
  2004): five SBT readiness criteria (PaO2/FiO2 >=150, PEEP <=8,
  FiO2 <=0.5, minimal or no vasopressors, awake / cooperative)
  with per-criterion ok/no breakdown; optional ARDSnet PEEP/FiO2
  look-up against the low-PEEP arm (Brower 2000) or high-PEEP
  arm (ALVEOLI 2004). Cross-link banner pairs with the existing
  `rsbi` tile for f/Vt assessment during the SBT. Tagged
  `nursing-icu`, `critical-care`, `pulmonology`,
  `respiratory-therapy`.

Wave 29-3 tile inventory at close:
- 29-3a (8 tiles): braden, morse-falls, hendrich-ii, cam,
  ich-score, hunt-hess-wfns, mnihss, aldrete-padss; plus 5
  nursing-icu specialty backfills (rass, cam-icu, icdsc, cpot,
  bps).
- 29-3b (4 tiles): npiap-staging, norton-push, vip-extravasation,
  blood-compat.
- 29-3c (4 tiles): insulin-correction, electrolyte-replacement,
  crrt-dose, ecmo-titration.
- 29-3d (7 tiles): ews-escalation, restraint-timer,
  sepsis-bundle-clock, code-blue-clock, mtp-tracker,
  device-day-counter, bristol-girth.
- 29-3e (1 tile): vent-sbt-peep.

Total wave 29-3 new tiles: 24 (the spec-v29 sec 4 inventory plus
one composite renaming). Remaining v29 work is wave 29-2 (the
47-tile code/data deletion pass), which follows once the
deprecation banners have run for the spec-v29 sec 7.4 courtesy
window.

Catalog 286 -> 287 at v29 wave 29-3e close.

### Added (spec-v29 wave 29-3d — timers / workflow: NEWS2-escalation, restraint, sepsis bundle, code blue, MTP, device-day, Bristol+girth)

Wave 29-3d ships all seven timer / workflow bedside tiles in one
batch. Each tile ships under the spec-v11 audit floor + spec-v12
sec 5 13-point per-tile shipping contract and is tagged with the
spec-v29 sec 5 nursing-subspecialty specialties.

- `ews-escalation` (RCP NEWS2 2017): aggregate-score -> next
  observations cadence (12 h / 4-6 h / 1 h / continuous) with
  single-parameter 3 trigger and computed nextDueIso from input
  vitals timestamp. Tagged `nursing-floor`, `nursing-icu`,
  `nursing-general`, `internal-medicine`.
- `restraint-timer` (CMS 42 CFR sec 482.13(e), Tag A-0178+):
  violent / self-destructive renewal cadence q4 / q2 / q1 h by
  age band, q15 min nursing reassessment, 1 h physician / LIP
  face-to-face; non-violent medical-surgical calendar-day
  renewal. Tagged `nursing-floor`, `nursing-icu`,
  `nursing-general`, `psychiatry`, `quality-safety`.
- `sepsis-bundle-clock` (SSC 2021 / CMS SEP-1 2024 + Nguyen
  2004): hour-1 elements (lactate, cultures, antibiotics, 30
  mL/kg crystalloid) on-time vs late; repeat lactate 6 h band;
  computed lactate clearance %. Tagged `nursing-er`,
  `nursing-icu`, `nursing-floor`, `nursing-general`,
  `critical-care`, `emergency-medicine`, `infectious-disease`.
- `code-blue-clock` (AHA 2020 ACLS): minutes-from-start, next
  2-min rhythm check, next 4-min epi (q3-5 midpoint), last
  shock J, cycle count, ETCO2 ROSC target banner. Tagged
  `nursing-icu`, `nursing-er`, `nursing-floor`,
  `nursing-general`, `critical-care`, `emergency-medicine`.
- `mtp-tracker` (Holcomb 2015 PROPPR + ATLS 2018): PRBC:FFP:Plt
  ratio vs 1:1:1; next-product suggestion; cumulative units;
  cryoprecipitate cadence (1 pooled dose / 6 PRBC). Tagged
  `nursing-er`, `nursing-icu`, `nursing-or`, `nursing-general`,
  `trauma-surgery`, `critical-care`, `anesthesiology`.
- `device-day-counter` (CDC NHSN 2024 + SHEA Lo 2014): Foley /
  central-line device-days from insertion timestamp; remove-
  today banner when no daily-removal indication is checked.
  Tagged `nursing-floor`, `nursing-icu`, `nursing-general`,
  `infectious-disease`, `quality-safety`.
- `bristol-girth` (Lewis 1997 + ANA 2013 + SCCM 2013): Bristol
  type 1-7 -> constipation / normal / soft / diarrhoea category;
  optional girth-trend cm/h with the SCCM 2013 abdominal-
  compartment-syndrome escalation banner at >=2 cm/h or >20 cm
  over <=24 h. Tagged `nursing-floor`, `nursing-icu`,
  `nursing-general`, `gastroenterology`.

Wave 29-3e (vent-sbt-peep) is the final sub-wave per spec-v29
sec 7.3.

Catalog 279 -> 286 at v29 wave 29-3d close.

### Added (spec-v29 wave 29-3c — bedside math: insulin correction, electrolyte ladder, CRRT dose, ECMO titration)

Wave 29-3c ships all four bedside-math tiles in one batch. Each
tile ships under the spec-v11 audit floor + spec-v12 sec 5
13-point per-tile shipping contract and is tagged with the
spec-v29 sec 5 nursing-subspecialty specialties.

- `insulin-correction` (ADA 2024 Standards of Care ch. 16): ISF
  provided directly or derived from total daily dose using the
  1800-rule (rapid-acting analogues) or 1500-rule (regular
  insulin); correction units = max(0, (currentBG - targetBG) /
  ISF); meal coverage = carbs / ICR; output rounded to 0.1 U.
  Banner pins the ADA 2024 hospital glycemic targets (140-180
  mg/dL non-critical; 110-180 mg/dL ICU). Tagged
  `nursing-floor`, `nursing-icu`, `nursing-general`,
  `endocrinology`.
- `electrolyte-replacement` (ASHP / Hammond 2019 + Hebert 2008 +
  Brown 2006): K, Mg, and Phos ladders with route (IV / PO) and
  renal-impairment flag. K 3.0-3.4 -> 40 mEq; 2.5-2.9 -> 60 mEq;
  <2.5 -> 80 mEq with the ASHP rate caps. Mg 1.0-1.7 -> 2 g
  MgSO4 over 1 h; <1.0 -> 4 g. Phos 1.6-2.2 -> 0.16 mmol/kg;
  1.0-1.5 -> 0.32 mmol/kg; <1.0 -> 0.64 mmol/kg per Brown 2006
  graduated protocol. Tagged `nursing-icu`, `nursing-floor`,
  `nursing-general`, `critical-care`, `pharmacy`.
- `crrt-dose` (KDIGO 2012 + Davenport 2009): delivered effluent
  dose mL/kg/h from prescribed effluent rate and weight; banners
  at <20 / 20-25 / >25 mL/kg/h per KDIGO sec 5.8. Optional
  citrate-anticoagulation inputs flag post-filter iCa outside
  0.25-0.35 mmol/L, systemic iCa outside 1.1-1.2 mmol/L, and
  total/ionised Ca ratio >= 2.5 (citrate-accumulation flag per
  Davenport 2009). Tagged `nursing-icu`, `critical-care`,
  `nephrology`.
- `ecmo-titration` (ELSO 2022 v1.5): VV / VA modality; sweep
  titration via the linear PaCO2 heuristic (suggested sweep =
  current sweep x current PaCO2 / target PaCO2); DO2 = pumpFlow
  x 10 x 1.34 x Hb x SaO2; DO2i target >= 6 mL/kg/min. Banner
  pins the VV SatO2 >= 80% acceptable rule and the "not a
  closed-loop controller; verify with attending and
  perfusionist" disclaimer per spec-v29 sec 4.18.1. Tagged
  `nursing-icu`, `critical-care`, `perfusion`, `cardiac-surgery`.

Wave 29-3d (timers / workflow: ews-escalation, restraint-timer,
sepsis-bundle-clock, code-blue-clock, mtp-tracker,
device-day-counter, bristol-girth) and wave 29-3e (vent-sbt-peep)
remain per spec-v29 sec 7.3.

Catalog 275 -> 279 at v29 wave 29-3c close.

### Added (spec-v29 wave 29-3b — criteria bundles: NPIAP, Norton + PUSH, VIP + INS, ABO/Rh compatibility)

Wave 29-3b ships all four criteria-bundle tiles in one batch. Each
tile ships under the spec-v11 audit floor + spec-v12 sec 5
13-point per-tile shipping contract and is tagged with the
spec-v29 sec 5 nursing-subspecialty specialties.

- `npiap-staging` (Edsberg 2016 / NPIAP 2019): decision tree over
  six structured pickers (mucosal location, skin intact, blanching
  behavior, obscured base, depth). Outputs one of seven stages:
  Stage 1 / 2 / 3 / 4 / Unstageable / DTPI / Mucosal Membrane PI.
  Tagged `nursing-floor`, `nursing-icu`, `nursing-general`,
  `wound-care`.
- `norton-push` (Norton 1962 + NPIAP 2005 PUSH 3.0): Norton scale
  (five 1-4 items; total 5-20; <=14 at risk) plus PUSH Tool 3.0
  (length-by-width band 0-10, exudate 0-3, tissue type 0-4; total
  0-17; declining total = healing). Tagged `nursing-floor`,
  `nursing-general`, `wound-care`.
- `vip-extravasation` (Jackson 1998 + INS 2021 Standards sec 38):
  VIP picker (0-5) plus INS infiltration / extravasation grade
  (0-4) with banners at VIP >=3, INS >=3, and INS 4 + vesicant
  (antidote decision per INS Table 38-3). Tagged `nursing-floor`,
  `nursing-icu`, `nursing-general`, `nursing-or`.
- `blood-compat` (AABB 33rd ed., 2024): recipient ABO / Rh picker
  plus product picker (PRBC / FFP / platelets / cryo); outputs
  compatible donor types per the AABB compatibility tables, plus
  the universal emergency-release note for each product. Tagged
  `nursing-icu`, `nursing-er`, `nursing-or`, `nursing-floor`,
  `nursing-general`, `pathology`, `hematology`.

Wave 29-3c (bedside math: insulin-correction,
electrolyte-replacement, crrt-dose, ecmo-titration) is the next
sub-wave per spec-v29 sec 7.3.

Catalog 271 -> 275 at v29 wave 29-3b close.

### Added (spec-v29 wave 29-3a close — mNIHSS + Aldrete/PADSS; wave 29-3a complete)

Third (final) wave 29-3a sub-batch. Closes wave 29-3a with two
last new tiles.

- `mnihss` (Meyer 2002 modified NIHSS): 11 items (LOC questions,
  LOC commands, gaze, visual fields, motor arm L and R, motor
  leg L and R, sensory dichotomized 0-1, language, extinction);
  total 0-31; severity bands per NIHSS convention (mNIHSS
  validates against the same bands per Meyer 2002 Results).
  Tagged `nursing-icu`, `nursing-er`, `nursing-general`,
  `neurology`, `emergency-medicine`.
- `aldrete-padss` (Aldrete 1995 + Chung 1995 PADSS, side-by-
  side): Aldrete (5 domains, 0-10, >=9 PACU-to-floor) plus
  PADSS (5 domains, 0-10, >=9 home discharge). The existing
  `aldrete` tile remains; the new tile composes both scores on
  one page for PACU workflows. Tagged `nursing-or`,
  `nursing-floor`, `nursing-general`, `anesthesiology`.

Wave 29-3a tile inventory at close:
- New tiles (8): braden, morse-falls, hendrich-ii, cam,
  ich-score, hunt-hess-wfns, mnihss, aldrete-padss.
- Audit upgrades (5, nursing-icu specialty backfill): rass,
  cam-icu, icdsc, cpot, bps.

Wave 29-3b (criteria bundles: npiap-staging, norton-push,
vip-extravasation, blood-compat) is the next sub-wave per
spec-v29 sec 7.3.

Catalog 269 -> 271 at v29 wave 29-3a close.

### Added (spec-v29 wave 29-3a (partial) — stroke completers: ICH Score + Hunt-Hess/WFNS; nursing-icu specialty backfill)

Second wave 29-3a sub-batch. Two new neuro tiles plus a metadata
upgrade on the existing ICU sedation / delirium / pain bundle.

- `ich-score` (Hemphill 2001 ICH grading): five inputs (GCS band,
  age >=80, ICH volume >=30 mL, infratentorial origin,
  intraventricular extension); total 0-6; 30-day mortality per
  Hemphill 2001 Table 4 (0% / 13% / 26% / 72% / 97% / 100% /
  100%). Tagged `nursing-icu`, `nursing-er`, `nursing-general`,
  `neurology`, `neurosurgery`, `critical-care`,
  `emergency-medicine`.
- `hunt-hess-wfns` (Hunt 1968 + Drake 1988 aneurysmal SAH
  grading): Hunt-Hess I-V picker plus WFNS computed from GCS
  band + focal motor deficit (per Drake 1988 Table I). Tagged
  `nursing-icu`, `nursing-er`, `nursing-general`, `neurology`,
  `neurosurgery`, `critical-care`.

Plus: `rass`, `cam-icu`, `icdsc`, `cpot`, `bps` META.specialties
now include `nursing-icu` per spec-v29 §4.3, so the home-view
nurse-by-shift sort can place them in the ICU lane.

Remaining wave 29-3a tiles (mnihss new; aldrete-padss new)
deferred to follow-on commits.

Catalog 267 -> 269 at v29 wave 29-3a (further partial) close.

### Added (spec-v29 wave 29-3a (partial) — nurse-bedside scoring: Braden, Morse, Hendrich II, CAM)

First wave 29-3a sub-batch (4 of 13 tiles). Each tile ships under
the spec-v11 audit floor + spec-v12 §5 13-point per-tile shipping
contract and is tagged with the spec-v29 §5 nursing-subspecialty
specialties (nursing-floor, nursing-icu, nursing-general,
geriatrics, wound-care as applicable). The remaining wave 29-3a
tiles (rass, bps, cpot, icdsc, cam-icu — already present, audit
upgrades pending; mnihss, ich-score, hunt-hess-wfns, aldrete-padss
— new) are deferred to follow-on commits.

- `braden` (Bergstrom 1987 pressure-injury risk): six ordinal
  items; total 6-23; bands >=19 not at risk, 15-18 mild, 13-14
  moderate, 10-12 high, <=9 very high. Tagged `nursing-floor`,
  `nursing-icu`, `nursing-general`, `geriatrics`, `wound-care`.
- `morse-falls` (Morse 1989): six weighted items (history 25,
  secondary diagnosis 15, ambulatory aid 0/15/30, IV or
  heparin lock 20, gait 0/10/20, mental status 0/15); bands
  0-24 low, 25-50 moderate, >=51 high. Tagged `nursing-floor`,
  `nursing-general`, `geriatrics`.
- `hendrich-ii` (Hendrich 2003): seven binary risk factors
  (confusion 4, depression 2, altered elimination 1, dizziness
  1, male 1, antiepileptic 2, benzodiazepine 1) plus
  get-up-and-go test (0/1/3/4); validated cutoff >=5 -> high
  fall risk. Tagged `nursing-floor`, `nursing-general`,
  `geriatrics`.
- `cam` (Inouye 1990, non-ICU): four features; positive when
  features 1 + 2 AND (3 OR 4). Tagged `nursing-floor`,
  `nursing-general`, `geriatrics`, `internal-medicine`,
  `emergency-medicine`.

Catalog 263 -> 267 at v29 wave 29-3a (partial) close.

### Added (spec-v29 wave 29-1 — nurse-first pivot: spec-doc landing + deprecation banners)

First v29 wave. The spec lands the **nurse-first pivot**: the
catalog is narrowed to tiles that compute a result the user acts
on, with the home-view default audience reordered to nurses by
shift type (ICU, ED, floor, OR / PACU, L&D / NICU). The wave is
spec-doc only (no code or data deletions, no new tiles); waves
29-2 and 29-3 land the 47 deletions and the 20 additions
respectively.

- Land [docs/spec-v29.md](docs/spec-v29.md). The spec amends
  [spec-v10 §2.3](docs/spec-v10.md) (permanent out-of-scope
  ledger) and [scope-mdcalc-parity §1](docs/scope-mdcalc-parity.md)
  (the "everything MDCalc does not cover" clause).
- Update [docs/spec-v10.md §2.3](docs/spec-v10.md) with the v29
  cross-reference: code-reference indexes, patient-administrative
  infographics, reference tables of normal values, hazmat /
  occupational reference cards, and single-class clinical
  reference cards are now permanently out of scope.
- Update [docs/scope-mdcalc-parity.md §1](docs/scope-mdcalc-parity.md)
  with the v29 cross-reference: the "everything MDCalc does not
  cover" clause is narrowed to the calculator-shaped rows
  (time-based E/M, NDC 10/11 converter, HIPAA 60-day breach
  clock, and the patient-facing workflow generators).
- Update [README.md](README.md) leading paragraph to reflect
  the post-v29 audience and the one-line scope test.
- Add the v29 one-line deprecation banner to each of the 47
  tile ids in [spec-v29 §2.1-§2.5](docs/spec-v29.md). The banner
  renders above the tool body as "Removed in spec-v29 — use the
  upstream source." Tile bodies still render under the banner
  through wave 29-2 (the actual delete). v29 acceptance criterion
  §8 (47 ids removed from UTILITIES / views / data / lib) is not
  met yet; wave 29-2 lands that.
- New v29 catalog ledger row: 603 (at v28 close) -> 556 (v29 cut)
  -> 576 (v29 cut + add). First reduction in catalog count in
  the project's history. The post-v29 catalog sits comfortably
  inside the 400-600 parity-window upper bound from
  [scope-mdcalc-parity §1](docs/scope-mdcalc-parity.md) on
  quality-audited tiles.

### Added (spec-v15 wave 15-5 (partial) — trauma scoring: ABC-MTP, MGAP, GAP, BIG)

Partial v15 wave 15-5 (4 of 8 tiles). Each tile ships under the
spec-v11 audit floor + spec-v12 §5 13-point per-tile shipping
contract. The four remaining wave 15-5 tiles (ISS, RTS, TRISS,
peds-trauma) are deferred to a follow-on wave 15-5 partial commit.

- **`abc-mtp` — ABC Score for Massive Transfusion** (Nunez TC,
  Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA.
  *Early prediction of massive transfusion in trauma: simple as
  ABC (assessment of blood consumption)?* J Trauma. 2009;66(2):
  346-352). Four binary criteria (penetrating mechanism; SBP
  <=90; HR >=120; positive FAST). >=2 of 4 -> activate massive
  transfusion protocol (sensitivity 75%, specificity 86% per
  Nunez 2009). Group G. Audit log:
  [docs/audits/v11/abc-mtp.md](docs/audits/v11/abc-mtp.md).
  Worked examples in
  [test/unit/abc-mtp.test.js](test/unit/abc-mtp.test.js).
- **`mgap` — MGAP Trauma Score** (Sartorius D, Le Manach Y,
  David JS, et al. *Mechanism, glasgow coma scale, age, and
  arterial pressure (MGAP): a new simple prehospital triage
  score to predict mortality in trauma patients.* Crit Care Med.
  2010;38(3):831-837). Mechanism (blunt 4 / penetrating 0) +
  GCS (3-15) + age <60 (5) + SBP bands (>120 = 5; 60-120 = 3;
  <60 = 0). Bands per Sartorius 2010 Table 3 (<18 high, 18-22
  moderate, 23-29 low). Group E. Audit log:
  [docs/audits/v11/mgap.md](docs/audits/v11/mgap.md). Worked
  examples in [test/unit/mgap.test.js](test/unit/mgap.test.js).
- **`gap` — GAP Trauma Score** (Kondo Y, Abe T, Kohshi K,
  Tokuda Y, Cook EF, Kukita I. *Revised trauma scoring system
  to predict in-hospital mortality in the emergency department:
  Glasgow Coma Scale, Age, and Systolic Blood Pressure score.*
  Crit Care. 2011;15(4):R191). GCS (3-15) + age <60 (3) + SBP
  bands (>120 = 6; 60-120 = 4; <60 = 0). Bands per Kondo 2011
  (<=10 high, 11-18 moderate, 19-24 low). Group E. Audit log:
  [docs/audits/v11/gap.md](docs/audits/v11/gap.md). Worked
  examples in [test/unit/gap.test.js](test/unit/gap.test.js).
- **`big` — BIG Score (pediatric trauma)** (Borgman MA, Maegele
  M, Wade CE, Blackbourne LH, Spinella PC. *Pediatric trauma
  BIG score: predicting mortality in children after military
  and civilian trauma.* Pediatrics. 2011;127(4):e892-e897). BIG
  = base deficit + 2.5 * INR + (15 - GCS). BIG >=16 predicts
  mortality with high sensitivity per Borgman 2011. Group E.
  Audit log: [docs/audits/v11/big.md](docs/audits/v11/big.md).
  Worked examples in
  [test/unit/big.test.js](test/unit/big.test.js).

Catalog 259 -> 263 at v15 wave 15-5 (partial) close.

### Added (spec-v15 wave 15-4 — pediatric imaging-decision companions: PECARN IAI, PECARN C-Spine)

Full v15 wave 15-4. Both tiles ship under Group N (Pediatrics &
Neonatal) per spec-v15 §3.4 and under the spec-v11 audit floor +
spec-v12 §5 13-point per-tile shipping contract.

- **`pecarn-iai` — PECARN Intra-Abdominal Injury Rule** (Holmes
  JF, Lillis K, Monroe D, et al. *Identifying children at very
  low risk of clinically important blunt abdominal injuries.*
  Ann Emerg Med. 2013;62(2):107-116.e2). Seven negative findings
  (abdominal wall trauma/seat-belt sign; GCS <14; abdominal
  tenderness; vomiting; thoracic wall trauma; abdominal pain;
  decreased breath sounds). All seven must be absent for
  very-low-risk classification (NPV 99.9% per Holmes 2013). The
  `findingsPresent` list surfaces which findings disqualified
  the patient. Audit log:
  [docs/audits/v11/pecarn-iai.md](docs/audits/v11/pecarn-iai.md).
  Worked examples in
  [test/unit/pecarn-iai.test.js](test/unit/pecarn-iai.test.js).
- **`pecarn-cspine` — PECARN Pediatric C-Spine Rule** (Leonard
  JC, Browne LR, Ahmad FA, et al. *Cervical spine injury risk
  factors in children with blunt trauma.* Pediatrics. 2019;
  144(1):e20183221; derivation: Leonard JC, Kuppermann N, Olsen
  C, et al. Ann Emerg Med. 2011;58(2):145-155). Eight risk
  factors (altered mental status; abnormal ABC; focal
  neurologic deficit; neck pain; torticollis; substantial
  torso injury; predisposing condition; high-risk MVC). NONE
  present -> low-risk; imaging not indicated. ANY present ->
  imaging warranted. Audit log:
  [docs/audits/v11/pecarn-cspine.md](docs/audits/v11/pecarn-cspine.md).
  Worked examples in
  [test/unit/pecarn-cspine.test.js](test/unit/pecarn-cspine.test.js).

### Added (spec-v15 wave 15-3 — pediatric respiratory & neurologic: Westley, PRAM, PASS, peds-GCS, Nigrovic)

Full v15 wave 15-3 closes the pediatric respiratory + neurologic
bundle. Five tiles each shipped under the spec-v11 audit floor and
the spec-v12 §5 13-point per-tile shipping contract.

- **`westley` — Westley Croup Score** (Westley CR, Cotton EK,
  Brooks JG. *Nebulized racemic epinephrine by IPPB for the
  treatment of croup: a double-blind study.* Am J Dis Child.
  1978;132(5):484-487). Five items with non-uniform per-item
  maxima (LOC 0/5; cyanosis 0/4/5; stridor 0/1/2; air entry
  0/1/2; retractions 0/1/2/3); sum 0-17; bands <3 mild / 3-7
  moderate / 8-11 severe / >=12 impending respiratory failure.
  Per-item values snap to the published allowed-token set. Audit
  log: [docs/audits/v11/westley.md](docs/audits/v11/westley.md).
  Worked examples in
  [test/unit/westley.test.js](test/unit/westley.test.js).
- **`pram-asthma` — PRAM** (Chalut DS, Ducharme FM, Davis GM.
  *The Preschool Respiratory Assessment Measure (PRAM): a
  responsive index of acute asthma severity.* J Pediatr.
  2000;137(6):762-768). Five items with non-uniform per-item
  maxima; sum 0-12; bands 0-3 mild / 4-7 moderate / 8-12 severe.
  Audit log:
  [docs/audits/v11/pram-asthma.md](docs/audits/v11/pram-asthma.md).
  Worked examples in
  [test/unit/pram-asthma.test.js](test/unit/pram-asthma.test.js).
- **`pass-asthma` — PASS** (Gorelick MH, Stevens MW, Schultz TR,
  Scribano PV. *Performance of a novel clinical score, the
  pediatric asthma severity score (PASS), in the evaluation of
  acute asthma.* Acad Emerg Med. 2004;11(1):10-18). Three items
  each 0-2; sum 0-6; bands 0-1 mild / 2-3 moderate / 4-6 severe.
  Audit log:
  [docs/audits/v11/pass-asthma.md](docs/audits/v11/pass-asthma.md).
  Worked examples in
  [test/unit/pass-asthma.test.js](test/unit/pass-asthma.test.js).
- **`peds-gcs` — Pediatric Glasgow Coma Scale** (Reilly PL,
  Simpson DA, Sprod R, Thomas L. *Assessing the conscious level
  in infants and young children: a paediatric version of the
  Glasgow Coma Scale.* Childs Nerv Syst. 1988;4(1):30-33; verbal
  age-adjustment: James HE. Pediatr Ann. 1986;15(1):16-22). Eye
  opening 1-4, age-adjusted verbal 1-5 (under 2 / 2-5 / older),
  motor 1-6; sum 3-15; bands match adult GCS (<=8 severe / 9-12
  moderate / 13-15 mild). Audit log:
  [docs/audits/v11/peds-gcs.md](docs/audits/v11/peds-gcs.md).
  Worked examples in
  [test/unit/peds-gcs.test.js](test/unit/peds-gcs.test.js).
- **`nigrovic` — Bacterial Meningitis Score** (Nigrovic LE,
  Kuppermann N, Macias CG, et al. *Clinical prediction rule for
  identifying children with cerebrospinal fluid pleocytosis at
  very low risk of bacterial meningitis.* JAMA. 2007;297(1):52-
  60). Five weighted criteria (positive CSF Gram stain +2; CSF
  ANC >=1000 +1; CSF protein >=80 +1; peripheral ANC >=10,000 +1;
  seizure at or before presentation +1); cutoff: 0 = very low
  risk for bacterial meningitis (NPV ~99.9%); >=1 = not low risk
  / do not discharge. Audit log:
  [docs/audits/v11/nigrovic.md](docs/audits/v11/nigrovic.md).
  Worked examples in
  [test/unit/nigrovic.test.js](test/unit/nigrovic.test.js).

### Added (spec-v15 wave 15-2 — pediatric febrile-infant evaluation: Rochester, Philadelphia, Boston, Step-by-Step, YOS)

Full v15 wave 15-2 closes the febrile-infant bundle. Each tile
ships under the spec-v11 audit floor and the spec-v12 §5 13-point
per-tile shipping contract.

- **`rochester` — Rochester Criteria** (Jaskiewicz JA, McCarthy
  CA, Richardson AC, et al. *Febrile infants at low risk for
  serious bacterial infection -- an appraisal of the Rochester
  criteria and implications for management.* Pediatrics.
  1994;94(3):390-396). Seven criteria; ALL must be met for
  low-risk classification (age <=60 d; term and previously
  healthy; no focal infection; WBC 5-15; bands <=1.5; urine WBC
  <=10/HPF; stool WBC <=5/HPF). Failing criteria are surfaced
  alongside the boolean so a clinician sees which item
  disqualified the patient. Audit log:
  [docs/audits/v11/rochester.md](docs/audits/v11/rochester.md).
  Worked examples in
  [test/unit/rochester.test.js](test/unit/rochester.test.js).
- **`philadelphia` — Philadelphia Criteria** (Baker MD, Bell LM,
  Avner JR. *Outpatient management without antibiotics of fever
  in selected infants.* N Engl J Med. 1993;329(20):1437-1441).
  Eight criteria; ALL must be met for safe outpatient management
  without empiric antibiotic. Audit log:
  [docs/audits/v11/philadelphia.md](docs/audits/v11/philadelphia.md).
  Worked examples in
  [test/unit/philadelphia.test.js](test/unit/philadelphia.test.js).
- **`boston-febrile` — Boston Criteria** (Baskin MN, O'Rourke
  EJ, Fleisher GR. *Outpatient treatment of febrile infants 28
  to 89 days of age with intramuscular administration of
  ceftriaxone.* J Pediatr. 1992;120(1):22-27). Seven criteria;
  ALL must be met for outpatient ceftriaxone-management
  eligibility. Audit log:
  [docs/audits/v11/boston-febrile.md](docs/audits/v11/boston-febrile.md).
  Worked examples in
  [test/unit/boston-febrile.test.js](test/unit/boston-febrile.test.js).
- **`step-by-step` — Step-by-Step Approach** (Gomez B, Mintegi S,
  Bressan S, Da Dalt L, Gervaix A, Lacroix L, European Group for
  Validation of the Step-by-Step Approach. *Validation of the
  "Step-by-Step" approach in the management of young febrile
  infants.* Pediatrics. 2016;138(2):e20154381). Sequential
  decision tree (short-circuits on first positive) producing
  low / intermediate / high risk per Gomez 2016 Figure 1; the
  `reason` line names which step triggered. Audit log:
  [docs/audits/v11/step-by-step.md](docs/audits/v11/step-by-step.md).
  Worked examples in
  [test/unit/step-by-step.test.js](test/unit/step-by-step.test.js).
- **`yos` — Yale Observation Scale** (McCarthy PL, Sharpe MR,
  Spiesel SZ, et al. *Observation scales to identify serious
  illness in febrile children.* Pediatrics. 1982;70(5):802-809).
  Six observation items each scored 1 / 3 / 5; sum 6-30; bands
  per McCarthy 1982: <=10 low, 11-15 increased, >=16 high
  probability of SBI. Per-item input clamped to the {1, 3, 5}
  set. Audit log:
  [docs/audits/v11/yos.md](docs/audits/v11/yos.md). Worked
  examples in [test/unit/yos.test.js](test/unit/yos.test.js).

### Added (spec-v15 wave 15-1 (partial) — obstetrics: BPP, ACOG severe-feature preeclampsia, HELLP, Carpenter-Coustan, IADPSG)

First v15 wave. Each tile ships under the spec-v11 audit floor
and the spec-v12 §5 13-point per-tile shipping contract.

- **`bpp` — Biophysical Profile** (Manning FA, Platt LD, Sipos L.
  *Antepartum fetal evaluation: development of a fetal
  biophysical profile.* Am J Obstet Gynecol. 1980;136(6):787-795).
  Five components each 0 or 2 per Manning 1980 rubric (fetal
  breathing movements, fetal body movements, fetal tone,
  amniotic fluid volume, reactive NST); sum 0-10; bands per
  Manning 1980 + ACOG Practice Bulletin 145 (2014): 8-10 normal,
  6 equivocal, <=4 abnormal. Audit log:
  [docs/audits/v11/bpp.md](docs/audits/v11/bpp.md). Worked
  examples in [test/unit/bpp.test.js](test/unit/bpp.test.js).
- **`acog-severe-pre` — ACOG Severe-feature Preeclampsia
  Checklist** (ACOG Task Force on Hypertension in Pregnancy.
  *Hypertension in pregnancy.* Obstet Gynecol. 2013;122(5):1122-
  1131; re-affirmed ACOG Practice Bulletin 222, 2020). Six severe
  features (BP >=160/110 on two occasions >=4 h apart;
  thrombocytopenia <100; impaired hepatic function; creatinine
  >1.1 or doubled baseline; pulmonary edema; new cerebral or
  visual disturbances); ANY single feature qualifies as severe
  preeclampsia per ACOG 2013. Audit log:
  [docs/audits/v11/acog-severe-pre.md](docs/audits/v11/acog-severe-pre.md).
  Worked examples in
  [test/unit/acog-severe-pre.test.js](test/unit/acog-severe-pre.test.js).
- **`hellp` — HELLP Syndrome Criteria** (Sibai BM. *The HELLP
  syndrome (hemolysis, elevated liver enzymes, and low
  platelets): much ado about nothing?* Am J Obstet Gynecol.
  1990;162(2):311-316). Three criteria: hemolysis (abnormal
  smear AND/OR total bili >=1.2 AND/OR LDH >=600); AST >=70;
  platelets <100 x10^9/L. Complete (3/3) or partial HELLP.
  Mississippi class per Martin 1999 by platelet nadir
  (<=50 / 50-100 / 100-150). Audit log:
  [docs/audits/v11/hellp.md](docs/audits/v11/hellp.md). Worked
  examples in [test/unit/hellp.test.js](test/unit/hellp.test.js).
- **`carpenter-coustan` — Carpenter-Coustan GDM Criteria**
  (Carpenter MW, Coustan DR. *Criteria for screening tests for
  gestational diabetes.* Am J Obstet Gynecol. 1982;144(7):768-
  773). 100-g 3-h OGTT cutoffs (mg/dL): fasting 95, 1-h 180,
  2-h 155, 3-h 140; GDM if >=2 values exceed; single abnormal =
  impaired glucose tolerance. Audit log:
  [docs/audits/v11/carpenter-coustan.md](docs/audits/v11/carpenter-coustan.md).
  Worked examples in
  [test/unit/carpenter-coustan.test.js](test/unit/carpenter-coustan.test.js).
- **`iadpsg` — IADPSG GDM Criteria** (International Association
  of Diabetes and Pregnancy Study Groups Consensus Panel.
  *International association of diabetes and pregnancy study
  groups recommendations on the diagnosis and classification of
  hyperglycemia in pregnancy.* Diabetes Care. 2010;33(3):676-
  682). 75-g 2-h OGTT cutoffs (mg/dL): fasting 92, 1-h 180,
  2-h 153; GDM if >=1 value exceeds. Ships side by side with
  `carpenter-coustan` per spec-v15 §3.1.6 so the clinician can
  pick by local protocol. Note: spec-v15 §6 sequencing lists
  five tiles for wave 15-1 (omits IADPSG); §3.1 enumerates six.
  IADPSG ships here with the rest of the OB bundle. Audit log:
  [docs/audits/v11/iadpsg.md](docs/audits/v11/iadpsg.md). Worked
  examples in [test/unit/iadpsg.test.js](test/unit/iadpsg.test.js).
- **Wave 15-1 partial.** New Ballard Score (Ballard 1991)
  deferred — 12 neuromuscular + physical criteria each scored -1
  to +5 with a sum-to-gestational-age conversion table that
  warrants a focused audit against Ballard 1991 Table 1 rather
  than a rushed batch.

### Added (spec-v14 backfills — Berlin Questionnaire, LEMON, White-Song)

These three tiles close the wave 14-2 and wave 14-3 partials with
focused audits against the primary sources, as flagged when those
waves originally shipped.

- **`berlin-osa` — Berlin Questionnaire for OSA** (Netzer NC,
  Stoohs RA, Netzer CM, Clark K, Strohl KP. *Using the Berlin
  Questionnaire to identify patients at risk for the sleep apnea
  syndrome.* Ann Intern Med. 1999;131(7):485-491). Three
  categories with criteria-specific high-risk rules: Category 1
  (snoring) positive if >=2 of five answers (snore, louder than
  talking, >=3-4/wk, bothered others, observed apnea >=3-4/wk);
  Category 2 (daytime sleepiness) positive if >=2 of three (tired
  after sleep, tired during day, nodded off while driving);
  Category 3 positive if hypertension OR BMI >30. Overall HIGH
  risk for OSA iff >=2 categories are positive per Netzer 1999.
  Audit log:
  [docs/audits/v11/berlin-osa.md](docs/audits/v11/berlin-osa.md).
  Worked examples in
  [test/unit/berlin-osa.test.js](test/unit/berlin-osa.test.js).
- **`lemon` — LEMON Difficult Airway Predictor** (Reed MJ, Dunn
  MJG, McKeown DW. *Can an airway assessment score predict
  difficulty at intubation in the emergency department?* Emerg
  Med J. 2005;22(2):99-102). Six factors with the 3-3-2 rule
  sub-grouped (Look externally +1; Evaluate 3-3-2 +1 per failed
  sub-measurement, max 3; Mallampati >=III +1; Obstruction/
  Obesity +1; Neck mobility limited +1); sum 0-7 (the spec-v14
  §3.3.1 prose says 0-8 but the mathematics produces 0-7;
  flagged in audit). Higher = greater
  predicted difficulty per Reed 2005. The 3-3-2 subtotal is
  surfaced alongside the total. Audit log:
  [docs/audits/v11/lemon.md](docs/audits/v11/lemon.md). Worked
  examples in [test/unit/lemon.test.js](test/unit/lemon.test.js).
- **`white-song` — White-Song Fast-Track Score** (White PF, Song
  D. *New criteria for fast-tracking after outpatient anesthesia:
  a comparison with the modified Aldrete's scoring system.*
  Anesth Analg. 1999;88(5):1069-1072). Seven domains each scored
  0-2 (LOC, physical activity, hemodynamic stability, respiratory
  stability, oxygen saturation, postoperative pain, postoperative
  emetic symptoms); sum 0-14; fast-track-eligible iff sum >=12
  AND no individual domain <1 per White 1999. The dual-condition
  band differentiates the two failure modes (sum cutoff vs.
  per-domain floor) so a clinician sees why borderline cases
  fail. Per-item input clamped to [0, 2]. Audit log:
  [docs/audits/v11/white-song.md](docs/audits/v11/white-song.md)
  (PASS-WITH-FIXES; spec-v14 §3.3.4 prose says "six domains" but
  enumerates seven; published score has seven). Worked examples
  in [test/unit/white-song.test.js](test/unit/white-song.test.js).

### Added (spec-v14 wave 14-8 — DAPT duration (partial): DAPT Score)

- **`dapt-score` — DAPT Score (continuation)** (Yeh RW, Secemsky
  EA, Kereiakes DJ, et al. *Development and validation of a
  prediction rule for benefit and harm of dual antiplatelet
  therapy beyond 1 year after percutaneous coronary
  intervention.* JAMA. 2016;315(16):1735-1749). Nine criteria:
  Age (<65 = 0; 65-74 = -1; >=75 = -2); CHF or LVEF <30% (+2);
  vein graft PCI (+2); MI at presentation (+1); prior MI or PCI
  (+1); diabetes (+1); stent diameter <3 mm (+1); paclitaxel-
  eluting stent (+1); current smoker (+1); sum -2 to +10. Cutoff
  >=2 favors continuing DAPT beyond 12 months after PCI per
  Yeh 2016. Age band modeled as a mutually-exclusive select so a
  single patient cannot double-count. Audit log:
  [docs/audits/v11/dapt-score.md](docs/audits/v11/dapt-score.md).
  Worked examples in
  [test/unit/dapt-score.test.js](test/unit/dapt-score.test.js).
- **Wave 14-8 partial.** PRECISE-DAPT Bleeding Score (Costa 2017)
  deferred — Group E nomogram producing PRECISE-DAPT 0-100 from
  Hb, WBC, age, CrCl, and prior bleeding via the published
  nomogram formula; warrants a focused cross-implementation
  differential against the Costa 2017 source rather than a
  rushed batch.

### Added (spec-v14 wave 14-7 — HIT / DIC (partial): 4Ts, ISTH DIC)

- **`four-ts` — 4Ts Score for HIT** (Lo GK, Juhl D, Warkentin
  TE, Sigouin CS, Eichler P, Greinacher A. *Evaluation of pretest
  clinical score (4 T's) for the diagnosis of heparin-induced
  thrombocytopenia in two clinical settings.* J Thromb Haemost.
  2006;4(4):759-765). Four domains each scored 0-2:
  Thrombocytopenia, Timing of platelet fall, Thrombosis or other
  sequelae, oTher causes; sum 0-8; bands per Lo 2006 Table 2:
  0-3 low, 4-5 intermediate, 6-8 high pretest probability of HIT.
  Per-item input clamped to [0, 2]. Audit log:
  [docs/audits/v11/four-ts.md](docs/audits/v11/four-ts.md). Worked
  examples in [test/unit/four-ts.test.js](test/unit/four-ts.test.js).
- **`isth-dic` — ISTH Overt DIC Score** (Taylor FB Jr, Toh CH,
  Hoots WK, Wada H, Levi M. *Towards definition, clinical and
  laboratory criteria, and a scoring system for disseminated
  intravascular coagulation.* Thromb Haemost. 2001;86(5):1327-
  1330). Four laboratory components: platelet count (>100 = 0;
  50-100 = +1; <50 = +2), fibrin marker D-dimer/FDP (none 0;
  moderate +2; strong +3), prolonged PT (<3 s = 0; 3-6 s = +1;
  >6 s = +2), fibrinogen (>1 g/L = 0; <=1 g/L = +1); sum 0-8;
  cutoff >=5 = compatible with overt DIC per Taylor 2001. A
  required underlying-disorder gate is enforced before band
  emission per the Taylor 2001 published rubric. Audit log:
  [docs/audits/v11/isth-dic.md](docs/audits/v11/isth-dic.md).
  Worked examples in
  [test/unit/isth-dic.test.js](test/unit/isth-dic.test.js).
- **Wave 14-7 partial.** HEP Score for HIT (Cuker 2010) deferred
  — eight weighted clinical features per Cuker 2010 Table 1 with
  multiple mutually-exclusive option groups (timing-of-fall has
  six bands; thrombosis category overrides on several rules)
  that warrant a focused audit against the primary source rather
  than a rushed batch.

### Added (spec-v14 wave 14-6 — cancer-VTE & VTE recurrence (partial): Khorana, DASH, HERDOO2)

- **`khorana` — Khorana Cancer-VTE Score** (Khorana AA, Kuderer
  NM, Culakova E, Lyman GH, Francis CW. *Development and
  validation of a predictive model for chemotherapy-associated
  thrombosis.* Blood. 2008;111(10):4902-4907). Five criteria:
  site of cancer (very-high stomach/pancreas +2; high lung/
  lymphoma/gynecologic/bladder/testicular +1; other 0), platelet
  count >=350 (+1), Hb <10 or ESA use (+1), WBC >11 (+1), BMI >=35
  (+1); sum 0-6; 2.5-month VTE rates per Khorana 2008 Table 3:
  0 -> 0.3% (low), 1-2 -> 2.0% (intermediate), >=3 -> 6.7% (high).
  Cancer site modeled as a mutually-exclusive select so a single
  patient cannot double-count. Audit log:
  [docs/audits/v11/khorana.md](docs/audits/v11/khorana.md). Worked
  examples in [test/unit/khorana.test.js](test/unit/khorana.test.js).
- **`dash-vte` — DASH VTE-Recurrence Score** (Tosetto A, Iorio A,
  Marcucci M, et al. *Predicting disease recurrence in patients
  with previous unprovoked venous thromboembolism: a proposed
  prediction score (DASH).* J Thromb Haemost. 2012;10(6):1019-
  1025). Four criteria: D-dimer abnormal post-anticoagulation
  (+2), Age <50 (+1), Male sex (+1), Hormone use at time of
  initial VTE in women (-2); sum -2 to +4; annual recurrence
  bands per Tosetto 2012 Table 4: <=1 -> 3.1% (low), 2 -> 6.4%
  (intermediate), >=3 -> 12.3% (high). Audit log:
  [docs/audits/v11/dash-vte.md](docs/audits/v11/dash-vte.md).
  Worked examples in
  [test/unit/dash-vte.test.js](test/unit/dash-vte.test.js).
- **`herdoo2` — HERDOO2 (women with unprovoked VTE)** (Rodger MA,
  Le Gal G, Anderson DR, et al. *Validating the HERDOO2 rule to
  guide treatment duration for women with unprovoked venous
  thrombosis: multinational prospective cohort management study.*
  BMJ. 2017;356:j1065). Women only; four criteria each +1
  (hyperpigmentation/edema/redness in either leg, D-dimer >=250
  ug/L on anticoag, BMI >=30, age >=65); sum 0-4; 0-1 -> safe to
  discontinue anticoagulation, >=2 -> continue per Rodger 2017.
  Audit log:
  [docs/audits/v11/herdoo2.md](docs/audits/v11/herdoo2.md). Worked
  examples in
  [test/unit/herdoo2.test.js](test/unit/herdoo2.test.js).
- **Wave 14-6 partial.** Vienna Prediction Model (Eichinger 2010)
  deferred — Group E nomogram with published 12- and 60-month
  recurrence-probability formulas that warrant a focused
  cross-implementation differential against the Eichinger 2010
  source rather than a rushed batch.

### Added (spec-v14 wave 14-5 — medical-inpatient bleeding & VTE prophylaxis: IMPROVE-Bleeding, IMPROVE-VTE)

- **`improve-bleeding` — IMPROVE Bleeding Risk Score** (Decousus
  H, Tapson VF, Bergmann JF, et al. *Factors at admission
  associated with bleeding risk in medical patients: findings
  from the IMPROVE investigators.* Chest. 2011;139(1):69-79).
  Thirteen weighted criteria (active gastroduodenal ulcer +4.5;
  bleeding in 3 months prior +4; platelet <50 +4; age >=85 +3.5;
  hepatic failure +2.5; severe renal failure +2.5; ICU/CCU +2.5;
  central venous catheter +2; rheumatic disease +2; active cancer
  +2; age 40-84 +1.5; moderate renal failure +1; male +1). Age
  and renal-failure categories modeled as mutually-exclusive
  selects so a single patient cannot double-count. Cutoff >=7 =
  high bleeding risk -> favor mechanical over pharmacologic
  prophylaxis per Decousus 2011. Audit log:
  [docs/audits/v11/improve-bleeding.md](docs/audits/v11/improve-bleeding.md).
  Worked examples in
  [test/unit/improve-bleeding.test.js](test/unit/improve-bleeding.test.js).
- **`improve-vte` — IMPROVE VTE Risk Score** (Spyropoulos AC,
  Anderson FA Jr, FitzGerald G, et al. *Predictive and
  associative models to identify hospitalized medical patients
  at risk for VTE.* Chest. 2011;140(3):706-714). Seven weighted
  criteria (prior VTE +3; thrombophilia +2; lower-limb paralysis
  +2; active cancer +2; immobilized >=7 days +1; ICU/CCU stay +1;
  age >60 +1); sum 0-12; cutoffs >=2 -> inpatient prophylaxis,
  >=4 -> extended-duration post-discharge prophylaxis per
  Spyropoulos 2011. Audit log:
  [docs/audits/v11/improve-vte.md](docs/audits/v11/improve-vte.md).
  Worked examples in
  [test/unit/improve-vte.test.js](test/unit/improve-vte.test.js).

### Added (spec-v14 wave 14-4 — atrial-fibrillation bleeding alternatives: ATRIA, ORBIT, HEMORR2HAGES)

- **`atria-bleeding` — ATRIA Bleeding Score** (Fang MC, Go AS,
  Chang Y, et al. *A new risk scheme to predict warfarin-
  associated hemorrhage. The ATRIA (Anticoagulation and Risk
  Factors in Atrial Fibrillation) Study.* J Am Coll Cardiol.
  2011;58(4):395-401). Five weighted criteria (anemia +3, severe
  renal disease eGFR <30 +3, age >=75 +2, prior bleeding +1,
  hypertension +1); sum 0-10; bands 0-3 low (0.8%/yr), 4
  intermediate (2.6%/yr), 5-10 high (5.8%/yr) annual major bleed
  per Fang 2011 Table 3. Audit log:
  [docs/audits/v11/atria-bleeding.md](docs/audits/v11/atria-bleeding.md).
  Worked examples in
  [test/unit/atria-bleeding.test.js](test/unit/atria-bleeding.test.js).
- **`orbit-bleeding` — ORBIT Bleeding Score** (O'Brien EC, Simon
  DN, Thomas LE, et al. *The ORBIT bleeding score: a simple
  bedside score to assess bleeding risk in atrial fibrillation.*
  Eur Heart J. 2015;36(46):3258-3264). Five weighted criteria
  (low Hb/Hct +2, age >74 +1, bleeding history +2, renal
  insufficiency eGFR <60 +1, antiplatelet treatment +1); sum 0-7;
  bands 0-2 low (2.4%/yr), 3 intermediate (4.7%/yr), 4-7 high
  (8.1%/yr) annual major bleed per O'Brien 2015 Table 3. Audit
  log:
  [docs/audits/v11/orbit-bleeding.md](docs/audits/v11/orbit-bleeding.md).
  Worked examples in
  [test/unit/orbit-bleeding.test.js](test/unit/orbit-bleeding.test.js).
- **`hemorr2hages` — HEMORR2HAGES Bleeding Score** (Gage BF, Yan
  Y, Milligan PE, et al. *Clinical classification schemes for
  predicting hemorrhage: results from the National Registry of
  Atrial Fibrillation (NRAF).* Am Heart J. 2006;151(3):713-719).
  Eleven criteria with prior rebleeding weighted +2 and all
  others +1 (Hepatic/Renal, Ethanol abuse, Malignancy, Older
  age >75, Reduced platelet count/function, Rebleeding,
  uncontrolled Hypertension, Anemia, Genetic factors CYP2C9,
  excessive fall risk, Stroke); sum 0-12; bleeds per 100
  patient-years per Gage 2006 Table 3 (0 -> 1.9, 1 -> 2.5,
  2 -> 5.3, 3 -> 8.4, 4 -> 10.4, >=5 -> 12.3). Audit log:
  [docs/audits/v11/hemorr2hages.md](docs/audits/v11/hemorr2hages.md).
  Worked examples in
  [test/unit/hemorr2hages.test.js](test/unit/hemorr2hages.test.js).

### Added (spec-v14 wave 14-3 — airway, PONV, recovery (partial): Apfel, modified Aldrete)

- **`apfel` — Apfel Simplified PONV Score** (Apfel CC, Laara E,
  Koivuranta M, Greim CA, Roewer N. *A simplified risk score for
  predicting postoperative nausea and vomiting: conclusions from
  cross-validations between two centers.* Anesthesiology. 1999;
  91(3):693-700). Four binary risk factors (female sex,
  nonsmoker, history of PONV or motion sickness, postoperative
  opioids); sum 0-4; predicted PONV risk per Apfel 1999 Table 4
  -> 10% / 20% / 40% / 60% / 80%. Audit log:
  [docs/audits/v11/apfel.md](docs/audits/v11/apfel.md). Worked
  examples in [test/unit/apfel.test.js](test/unit/apfel.test.js).
- **`aldrete` — modified Aldrete Recovery Score** (Aldrete JA.
  *The post-anesthesia recovery score revisited.* J Clin Anesth.
  1995;7(1):89-91). Five domains (activity, respiration,
  circulation, consciousness, oxygen saturation) each scored 0-2;
  sum 0-10; cutoff >=9 for PACU discharge per Aldrete 1995. The
  1995 revision replaces the original 1970 skin-color domain with
  oxygen saturation. Per-item input clamped to [0, 2]. Audit log:
  [docs/audits/v11/aldrete.md](docs/audits/v11/aldrete.md). Worked
  examples in
  [test/unit/aldrete.test.js](test/unit/aldrete.test.js).
- **Wave 14-3 partial.** LEMON Difficult Airway Predictor (Reed
  2005) and White-Song Fast-Track Score deferred -- each has
  per-component cutoffs (LEMON 3-3-2 rule sub-thresholds,
  White-Song's per-item floor for bypass eligibility) that warrant
  a focused audit against the primary source.

### Added (spec-v14 wave 14-2 — sleep-disordered breathing (partial): STOP-BANG, Epworth)

- **`stop-bang` — STOP-BANG OSA Screen** (Chung F, et al.
  *STOP questionnaire: a tool to screen patients for obstructive
  sleep apnea.* Anesthesiology. 2008;108(5):812-821; BANG
  extension: Chung F, et al. *High STOP-Bang score indicates a
  high probability of obstructive sleep apnoea.* Br J Anaesth.
  2012;108(5):768-775). Eight binary criteria (Snore, Tired,
  Observed apnea, blood Pressure, BMI>35, Age>50, Neck>40cm,
  Gender male); sum 0-8; cutoffs 0-2 low, 3-4 intermediate, 5-8
  high risk for moderate-to-severe OSA per Chung 2012 Table 3.
  Audit log:
  [docs/audits/v11/stop-bang.md](docs/audits/v11/stop-bang.md).
  Worked examples in
  [test/unit/stop-bang.test.js](test/unit/stop-bang.test.js).
- **`epworth` — Epworth Sleepiness Scale** (Johns MW. *A new
  method for measuring daytime sleepiness: the Epworth sleepiness
  scale.* Sleep. 1991;14(6):540-545). Eight scenarios each scored
  0 (would never doze) to 3 (high chance of dozing); sum 0-24;
  bands per Johns 1991: 0-10 normal, 11-14 mild, 15-17 moderate,
  18-24 severe excessive daytime sleepiness. Per-item input
  clamped to [0, 3]. Audit log:
  [docs/audits/v11/epworth.md](docs/audits/v11/epworth.md). Worked
  examples in [test/unit/epworth.test.js](test/unit/epworth.test.js).
- **Wave 14-2 partial.** Berlin Questionnaire for OSA deferred —
  Netzer 1999 specifies three categories with criteria-specific
  high-risk rules that warrant a focused audit against the primary
  source rather than a rushed batch.

### Added (spec-v13 wave 13-1 — ICU mortality scoring: MODS)

- **`mods` — Multiple Organ Dysfunction Score** (Marshall JC,
  Cook DJ, Christou NV, et al. *Multiple Organ Dysfunction
  Score: a reliable descriptor of a complex clinical outcome.*
  Crit Care Med. 1995;23(10):1638-1652). Six organ-system
  variables each scored 0-4 per Marshall 1995 Table 1
  (respiratory PaO2/FiO2, renal serum creatinine, hepatic total
  bilirubin, cardiovascular pressure-adjusted heart rate
  PAR = HR x CVP / MAP, hematologic platelet count, neurologic
  GCS). Sum 0-24; ICU mortality bands per Marshall 1995 Table 4
  (0: 0%; 1-4: 1-2%; 5-8: 3-5%; 9-12: ~25%; 13-16: ~50%;
  17-20: ~75%; 21-24: ~100%). Per-organ subscores surfaced
  alongside the total so a bedside clinician can see which
  system is dragging the score. Audit log:
  [docs/audits/v11/mods.md](docs/audits/v11/mods.md). Worked
  examples in [test/unit/mods.test.js](test/unit/mods.test.js).
  First tile of the wave 13-1 ICU mortality scoring bundle;
  APACHE II, SAPS II, and LODS remain queued.

### Added (spec-v13 wave 13-8 — closeout)

- **spec-v13 partial close (21 of 25 tiles).** Waves 13-2 through
  13-7 shipped under the v11 audit floor and the v12 §5 13-point
  shipping contract: sedation & delirium (RASS, SAS-Riker,
  CAM-ICU, ICDSC, 4AT), ICU pain (CPOT, BPS), nutrition (NUTRIC,
  mNUTRIC, NRS-2002, MUST), ventilation & lung injury (ROX,
  HACOR, Berlin ARDS, Murray LIS, LIPS), vasoactive load (VIS),
  and severe CAP triage (SMART-COP, CRB-65, ATS/IDSA-CAP, DRIP).
  Catalog 202 -> 223 at v13 partial close.
- **Wave 13-1 (ICU mortality scoring — APACHE II, SAPS II, MODS,
  LODS) deferred.** Each of the four mortality scores ships with
  per-variable weighting tables and (for APACHE II / SAPS II /
  LODS) a published logit producing predicted mortality; they
  require deeper audit-log work than the rest of the v13 tranche
  and are queued for a dedicated wave-13-1 PR rather than rushed
  into the closeout. v13 acceptance per
  [docs/spec-v13.md §7](docs/spec-v13.md) reopens to 25/25 once
  that wave lands; the §6 sequencing is unchanged.
- **Home grid copy refreshed**: [index.html](index.html)
  `<title>`, `<meta description>`, the OG / Twitter cards, the
  home-lede paragraph, and the WebApplication description in
  the JSON-LD `featureList` (auto-derived from
  `UTILITIES.length` via
  [scripts/build-ld.mjs](scripts/build-ld.mjs)) all read 223.
  README catalog snapshots in [README.md](README.md) updated
  202 -> 223 in both the "twelve categories" sentence and the
  post-spec-v5-trimming paragraph.
- **Audit coverage rerun**: `scripts/audit-coverage.mjs` reports
  223 / 223 (100%) with the v13 tiles slotted into Groups G
  (Clinical Scoring & Risk) and E (Clinical Math & Conversions)
  per [docs/spec-v13.md §4](docs/spec-v13.md).
- **Audience hubs and topic pages re-render** with the v13 tiles
  slotted in via `META[id].specialties` intersected with the
  audience and topic mappings in
  [scripts/build-hub-pages.mjs](scripts/build-hub-pages.mjs) and
  [scripts/build-topic-pages.mjs](scripts/build-topic-pages.mjs).
  No manual hub or topic edits were needed.

### Added (spec-v13 wave 13-7 — severe CAP triage bundle: SMART-COP, CRB-65, ATS/IDSA-CAP, DRIP)

- **`smart-cop` — SMART-COP** (Charles PGP, et al. *SMART-COP: a
  tool for predicting the need for intensive respiratory or
  vasopressor support in community-acquired pneumonia.* Clin
  Infect Dis. 2008;47(3):375-384). Eight-criterion weighted score
  (range 0-11) with age-adjusted RR (>=25 if age <=50; >=30 if
  >50) and age-adjusted oxygenation thresholds per Charles 2008.
  Cutoffs: 0-2 low; 3-4 moderate; >=5 high. Audit log:
  [docs/audits/v11/smart-cop.md](docs/audits/v11/smart-cop.md).
  Worked examples in
  [test/unit/smart-cop.test.js](test/unit/smart-cop.test.js).
- **`crb65` — CRB-65** (Lim WS, et al. *Defining community
  acquired pneumonia severity on presentation to hospital: an
  international derivation and validation study.* Thorax. 2003;
  58(5):377-382). Four binary criteria (confusion, RR >=30,
  SBP <90 or DBP <=60, age >=65); 30-day mortality bands 0: 1.2%,
  1-2: 8.2%, 3-4: 31.4% per Lim 2003. Ships alongside the
  existing `curb-65` tile for sites without BUN at presentation.
  Audit log: [docs/audits/v11/crb65.md](docs/audits/v11/crb65.md).
  Worked examples in
  [test/unit/crb65.test.js](test/unit/crb65.test.js).
- **`ats-idsa-cap` — ATS/IDSA Severe CAP Criteria (2019)**
  (Metlay JP, et al. *Diagnosis and Treatment of Adults with
  Community-acquired Pneumonia. An Official Clinical Practice
  Guideline of the American Thoracic Society and Infectious
  Diseases Society of America.* Am J Respir Crit Care Med. 2019;
  200(7):e45-e67). Two major criteria + nine minor; severe CAP /
  ICU admission if >=1 major OR >=3 minor per Metlay 2019 Table 1.
  Audit log:
  [docs/audits/v11/ats-idsa-cap.md](docs/audits/v11/ats-idsa-cap.md).
  Worked examples in
  [test/unit/ats-idsa-cap.test.js](test/unit/ats-idsa-cap.test.js).
- **`drip` — DRIP Score** (Webb BJ, et al. *Derivation and
  Multicenter Validation of the Drug Resistance in Pneumonia
  Clinical Prediction Score.* Antimicrob Agents Chemother. 2016;
  60(5):2652-2663). Four major risk factors (2 each) + six minor
  (1 each); cutoff >=4 = high risk for drug-resistant pneumonia
  (2019 ATS/IDSA endorsement for risk-adjusted empiric coverage).
  Audit log: [docs/audits/v11/drip.md](docs/audits/v11/drip.md).
  Worked examples in
  [test/unit/drip.test.js](test/unit/drip.test.js).

### Added (spec-v13 wave 13-6 — vasoactive load: VIS)

- **`vis` — Vasoactive-Inotropic Score** (Gaies MG, et al.
  *Vasoactive-inotropic score as a predictor of morbidity and
  mortality in infants after cardiopulmonary bypass.* Pediatr
  Crit Care Med. 2010;11(2):234-238). VIS = dopamine +
  dobutamine + 100*epinephrine + 100*norepinephrine +
  10*milrinone + 10000*vasopressin (mcg/kg/min, vasopressin in
  units/kg/min); also surfaces the simpler Wernovsky 1995
  Inotrope Score. Audit log:
  [docs/audits/v11/vis.md](docs/audits/v11/vis.md). Worked
  examples in [test/unit/vis.test.js](test/unit/vis.test.js).

### Added (spec-v13 wave 13-5 — ventilation & lung-injury bundle: ROX, HACOR, Berlin ARDS, Murray LIS, LIPS)

- **`rox` — ROX Index** (Roca O, et al. *An index combining
  respiratory rate and oxygenation to predict outcome of nasal
  high-flow therapy.* Am J Respir Crit Care Med. 2019;199(11):
  1368-1376). ROX = (SpO2/FiO2) / RR; cutoffs at 2 / 6 / 12 h
  per Roca 2019 Figure 2. Audit log:
  [docs/audits/v11/rox.md](docs/audits/v11/rox.md). Worked
  examples in [test/unit/rox.test.js](test/unit/rox.test.js).
- **`hacor` — HACOR (NIV failure)** (Duan J, et al. *Assessment
  of heart rate, acidosis, consciousness, oxygenation, and
  respiratory rate to predict noninvasive ventilation failure in
  hypoxemic patients.* Intensive Care Med. 2017;43(2):192-199).
  Five-parameter weighted score (range 0-25) at 1 hour of NIV
  per Duan 2017 Table 1; cutoff >5 with ~90% specificity for
  failure. Audit log:
  [docs/audits/v11/hacor.md](docs/audits/v11/hacor.md). Worked
  examples in [test/unit/hacor.test.js](test/unit/hacor.test.js).
- **`berlin-ards` — Berlin ARDS Criteria** (ARDS Definition Task
  Force, Ranieri VM, et al. *Acute Respiratory Distress
  Syndrome: The Berlin Definition.* JAMA. 2012;307(23):2526-
  2533). Four required criteria (timing <=1 wk, bilateral
  opacities, not cardiac/overload, PEEP >=5) plus PaO2/FiO2
  severity bands (mild 200-300, moderate 100-200, severe <=100).
  Audit log:
  [docs/audits/v11/berlin-ards.md](docs/audits/v11/berlin-ards.md).
  Worked examples in
  [test/unit/berlin-ards.test.js](test/unit/berlin-ards.test.js).
- **`lis-murray` — Murray Lung Injury Score** (Murray JF, et al.
  *An expanded definition of the adult respiratory distress
  syndrome.* Am Rev Respir Dis. 1988;138(3):720-723). Average of
  four 0-4 components (CXR quadrants, PaO2/FiO2, PEEP,
  compliance); >2.5 = severe (ECMO referral context per ELSO
  2017). Audit log:
  [docs/audits/v11/lis-murray.md](docs/audits/v11/lis-murray.md).
  Worked examples in
  [test/unit/lis-murray.test.js](test/unit/lis-murray.test.js).
- **`lips` — Lung Injury Prediction Score** (Gajic O, et al.
  *Early identification of patients at risk of acute lung
  injury: evaluation of lung injury prediction score in a
  multicenter cohort study.* Am J Respir Crit Care Med. 2011;
  183(4):462-470). 15 weighted predictors (predisposing
  conditions and modifiers; diabetes contributes -1); cutoff
  >=4 = high risk for ALI/ARDS. Audit log:
  [docs/audits/v11/lips.md](docs/audits/v11/lips.md). Worked
  examples in [test/unit/lips.test.js](test/unit/lips.test.js).

### Added (spec-v13 wave 13-4 — nutrition risk bundle: NUTRIC, mNUTRIC, NRS-2002, MUST)

- **`nutric` — NUTRIC Score** (Heyland DK, et al. *Identifying
  critically ill patients who benefit the most from nutrition
  therapy.* Crit Care. 2011;15(6):R268). Six-component sum (age,
  APACHE II, SOFA, comorbidities, days hospital to ICU, IL-6);
  range 0-10; cutoff >=6 = high nutritional risk. Audit log:
  [docs/audits/v11/nutric.md](docs/audits/v11/nutric.md). Worked
  examples in [test/unit/nutric.test.js](test/unit/nutric.test.js).
- **`mnutric` — modified NUTRIC** (Rahman A, et al. *Identifying
  critically-ill patients who will benefit most from nutritional
  therapy: further validation of the "modified NUTRIC".* Clin
  Nutr. 2016;35(1):158-162). Same as NUTRIC but IL-6 omitted;
  range 0-9; cutoff >=5. Audit log:
  [docs/audits/v11/mnutric.md](docs/audits/v11/mnutric.md). Worked
  examples in [test/unit/mnutric.test.js](test/unit/mnutric.test.js).
- **`nrs2002` — NRS-2002** (Kondrup J, et al. *Nutritional risk
  screening (NRS 2002): a new method based on an analysis of
  controlled clinical trials.* Clin Nutr. 2003;22(3):321-336).
  Severity of disease 0-3 + nutritional status 0-3 + age >=70
  +1; cutoff >=3 (ESPEN-endorsed). Audit log:
  [docs/audits/v11/nrs2002.md](docs/audits/v11/nrs2002.md). Worked
  examples in [test/unit/nrs2002.test.js](test/unit/nrs2002.test.js).
- **`must-nutrition` — MUST (Malnutrition Universal Screening
  Tool)** (BAPEN. *The "MUST" Explanatory Booklet.* British
  Association for Parenteral and Enteral Nutrition; 2003). Three
  components (BMI 0-2 + unplanned weight loss 0-2 + acute disease
  no intake for >5 days = 2 else 0); 0 low / 1 medium / >=2 high
  risk. Audit log:
  [docs/audits/v11/must-nutrition.md](docs/audits/v11/must-nutrition.md).
  Worked examples in
  [test/unit/must-nutrition.test.js](test/unit/must-nutrition.test.js).

### Added (spec-v13 wave 13-3 — ICU pain bundle: CPOT, BPS)

- **`cpot` — Critical-Care Pain Observation Tool** (Gelinas C,
  et al. *Validation of the Critical-Care Pain Observation Tool
  in adult patients.* Am J Crit Care. 2006;15(4):420-427).
  Four behaviors (facial expression, body movements, muscle
  tension, ventilator compliance or vocalization) each 0-2;
  range 0-8 with the Gelinas 2006 unacceptable-pain cutoff >=3.
  Audit log: [docs/audits/v11/cpot.md](docs/audits/v11/cpot.md).
  Worked examples in
  [test/unit/cpot.test.js](test/unit/cpot.test.js).
- **`bps` — Behavioral Pain Scale** (Payen JF, et al. *Assessing
  pain in critically ill sedated patients by using a behavioral
  pain scale.* Crit Care Med. 2001;29(12):2258-2263). Three
  behaviors (facial expression, upper limb movements, ventilator
  compliance) each 1-4; range 3-12 with the Payen 2001
  unacceptable-pain cutoff >5. Audit log:
  [docs/audits/v11/bps.md](docs/audits/v11/bps.md). Worked
  examples in [test/unit/bps.test.js](test/unit/bps.test.js).

### Added (spec-v13 wave 13-2 — sedation & delirium bundle: RASS, SAS-Riker, CAM-ICU, ICDSC, 4AT)

- **`rass` — Richmond Agitation-Sedation Scale** (Sessler CN,
  et al. *The Richmond Agitation-Sedation Scale: validity and
  reliability in adult intensive care unit patients.* Am J
  Respir Crit Care Med. 2002;166(10):1338-1344). 10-row picker
  (-5 unarousable through +4 combative) with the SCCM PADIS 2018
  (Devlin 2018) light-sedation target band (-2 to 0). Audit log:
  [docs/audits/v11/rass.md](docs/audits/v11/rass.md). Worked
  examples in [test/unit/rass.test.js](test/unit/rass.test.js).
- **`sas-riker` — Riker Sedation-Agitation Scale** (Riker RR,
  et al. *Prospective evaluation of the Sedation-Agitation Scale
  for adult critically ill patients.* Crit Care Med. 1999;27(7):
  1325-1329). Seven-row picker (1 unarousable through 7 dangerous
  agitation) with the SCCM PADIS 2018 goal band SAS 3-4. Audit
  log: [docs/audits/v11/sas-riker.md](docs/audits/v11/sas-riker.md).
  Worked examples in
  [test/unit/sas-riker.test.js](test/unit/sas-riker.test.js).
- **`cam-icu` — Confusion Assessment Method for the ICU** (Ely
  EW, et al. *Delirium in mechanically ventilated patients:
  validity and reliability of the Confusion Assessment Method
  for the ICU (CAM-ICU).* JAMA. 2001;286(21):2703-2710). Four-
  feature algorithm: feature 1 (acute onset or fluctuating
  course) AND feature 2 (inattention) AND (feature 3 (altered
  level of consciousness) OR feature 4 (disorganized thinking)).
  Audit log:
  [docs/audits/v11/cam-icu.md](docs/audits/v11/cam-icu.md).
  Worked examples in
  [test/unit/cam-icu.test.js](test/unit/cam-icu.test.js).
- **`icdsc` — Intensive Care Delirium Screening Checklist**
  (Bergeron N, et al. *Intensive Care Delirium Screening
  Checklist: evaluation of a new screening tool.* Intensive Care
  Med. 2001;27(5):859-864). Eight binary items each 0/1; range
  0-8 with the Bergeron 2001 delirium cutoff >=4. Audit log:
  [docs/audits/v11/icdsc.md](docs/audits/v11/icdsc.md). Worked
  examples in [test/unit/icdsc.test.js](test/unit/icdsc.test.js).
- **`4at` — 4AT Delirium Screen** (MacLullich AMJ, et al. *The
  4 "A"s Test for detecting delirium in acute medical patients
  (4AT): a diagnostic accuracy study.* Health Technol Assess.
  2019;23(40):1-194). Four domains (Alertness 0 or 4; AMT4 0/1/2;
  Attention months-of-year-backwards 0/1/2; Acute change or
  fluctuating course 0 or 4) summing 0-12; three-band
  interpretation (0 unlikely; 1-3 possible cognitive impairment;
  >=4 possible delirium). Audit log:
  [docs/audits/v11/4at.md](docs/audits/v11/4at.md). Worked
  examples in [test/unit/4at.test.js](test/unit/4at.test.js).

### Added (spec-v12 wave 12-9 — closeout)

- **spec-v12 marked complete.** All 24 tiles enumerated in
  [docs/spec-v12.md §10](docs/spec-v12.md) (the `maddrey-lille`
  combined card ships as one tile per spec-v12 §3.4.3) shipped
  under the v11 audit floor and the v12 §5 13-point shipping
  contract. Catalog 178 -> 202 at v12 close.
- **Home grid copy refreshed**:
  [index.html](index.html) `<title>`, `<meta description>`, the
  OG / Twitter cards, and the home-lede paragraph updated from
  "178" to "202 calculators..."; the JSON-LD `featureList` is
  auto-derived from `UTILITIES.length` via
  [scripts/build-ld.mjs](scripts/build-ld.mjs) and now reports
  202. README catalog snapshots in
  [README.md](README.md) updated 178 -> 202 in both the "twelve
  categories" sentence and the post-spec-v5-trimming paragraph.
- **Audit coverage rerun**: `scripts/audit-coverage.mjs` reports
  202 / 202 (100%) with the new tiles slotted into Groups G, E,
  H, and N per [docs/spec-v12.md §4](docs/spec-v12.md).
- **Five audience hubs and eight topic pages re-render** with the
  new tiles slotted in via `META[id].specialties` intersected with
  the audience and topic mappings in
  [scripts/build-hub-pages.mjs](scripts/build-hub-pages.mjs) and
  [scripts/build-topic-pages.mjs](scripts/build-topic-pages.mjs).
  No manual hub or topic edits were needed.

### Added (spec-v12 wave 12-8 — cardiology + critical-care bundle: Killip, SIRS)

- **`killip` — Killip Classification** (Killip T, Kimball JT.
  *Treatment of myocardial infarction in a coronary care unit. A
  two-year experience with 250 patients.* Am J Cardiol. 1967;
  20(4):457-464). Four-row class picker (I-IV) with the Killip
  1967 original-cohort in-hospital mortality (6% / 17% / 38% /
  81%); the contemporary GUSTO-I reperfusion-era cohort
  (Lee 1995) is surfaced as a secondary reference. Audit log:
  [docs/audits/v11/killip.md](docs/audits/v11/killip.md). Worked
  examples in [test/unit/killip.test.js](test/unit/killip.test.js).
- **`sirs` — SIRS Criteria (with Sepsis-3 context)** (Bone RC,
  et al. *Definitions for sepsis and organ failure and guidelines
  for the use of innovative therapies in sepsis.* Chest. 1992;
  101(6):1644-1655). Four-criterion count with the >=2 SIRS-
  positive threshold per Bone 1992. Sepsis-3 (Singer M, et al.
  JAMA. 2016;315(8):801-810) deprecation is surfaced inline so a
  clinician auditing a CDS trigger sees both definitions. Audit
  log: [docs/audits/v11/sirs.md](docs/audits/v11/sirs.md). Worked
  examples in [test/unit/sirs.test.js](test/unit/sirs.test.js).

### Added (spec-v12 wave 12-7 — comorbidity, frailty & performance bundle: Charlson, Clinical Frailty Scale, ECOG + Karnofsky)

- **`charlson` — Charlson Comorbidity Index (age-adjusted)**
  (Charlson ME, et al. *A new method of classifying prognostic
  comorbidity in longitudinal studies: development and validation.*
  J Chronic Dis. 1987;40(5):373-383; age adjustment: Charlson 1994
  J Clin Epidemiol. 47(11):1245-1251). 19 comorbidity flags
  weighted 1 / 2 / 3 / 6 per Charlson 1987 Table 3 with severity
  dominance (the more-severe class suppresses the milder one),
  plus the Charlson 1994 age adjustment (1 point per decade >=50,
  capped at 4 at age >=80). 10-year mortality bands per Charlson
  1987 Table 4. Audit log:
  [docs/audits/v11/charlson.md](docs/audits/v11/charlson.md).
  Worked examples in
  [test/unit/charlson.test.js](test/unit/charlson.test.js).
- **`cfs` — Clinical Frailty Scale** (Rockwood K, et al. *A global
  clinical measure of fitness and frailty in elderly people.*
  CMAJ. 2005;173(5):489-495; Dalhousie 2020 v2 wording). Nine-level
  picker with the canonical Rockwood 2005 / Dalhousie 2020 v2
  descriptors and a Sophie-quoted outcome-association band. Audit
  log: [docs/audits/v11/cfs.md](docs/audits/v11/cfs.md). Worked
  examples in [test/unit/cfs.test.js](test/unit/cfs.test.js).
- **`ecog-karnofsky` — ECOG + Karnofsky Performance Status**
  (Oken MM, et al. Am J Clin Oncol. 1982;5(6):649-655 (ECOG);
  Karnofsky DA, Burchenal JH. 1949 (KPS); Buccheri G, et al.
  Eur J Cancer. 1996;32A(7):1135-1141 (crosswalk)). Two coupled
  pickers (ECOG 0-5 and KPS 100-0 in steps of 10) with the source
  descriptors verbatim; selecting an ECOG value auto-suggests the
  corresponding KPS via the Buccheri 1996 crosswalk, and the user
  may override. Audit log:
  [docs/audits/v11/ecog-karnofsky.md](docs/audits/v11/ecog-karnofsky.md).
  Worked examples in
  [test/unit/ecog-karnofsky.test.js](test/unit/ecog-karnofsky.test.js).

### Added (spec-v12 wave 12-6 — readmission & care-transition risk bundle: HOSPITAL, LACE)

- **`hospital-score` — HOSPITAL Score for Potentially Avoidable
  30-Day Readmissions** (Donze J, Aujesky D, Williams D, Schnipper
  JL. *Potentially avoidable 30-day hospital readmissions in
  medical patients: derivation and validation of a prediction
  model.* JAMA Intern Med. 2013;173(8):632-638). Seven-predictor
  weighted sum (range 0-13) per Donze 2013 Table 2 with the
  Table 4 risk bands (low 0-4 ~5.8%, intermediate 5-6 ~11.9%,
  high >=7 ~22.8%). Audit log:
  [docs/audits/v11/hospital-score.md](docs/audits/v11/hospital-score.md).
  Worked examples in
  [test/unit/hospital-score.test.js](test/unit/hospital-score.test.js).
- **`lace` — LACE Index for 30-Day Readmission / Death**
  (van Walraven C, et al. *Derivation and validation of an index
  to predict early death or unplanned readmission after discharge
  from hospital to the community.* CMAJ. 2010;182(6):551-557).
  Four-component sum (Length of stay, Acute admission, Charlson,
  Emergency visits in 6 months; range 0-19) per van Walraven 2010
  Table 3 with Figure 2 risk bands (low 0-4, moderate 5-9, high
  >=10). Audit log:
  [docs/audits/v11/lace.md](docs/audits/v11/lace.md). Worked
  examples in [test/unit/lace.test.js](test/unit/lace.test.js).

### Added (spec-v12 wave 12-5 — imaging-decision bundle: Canadian CT Head, Canadian C-Spine, PECARN Pediatric Head, Ottawa Ankle, Ottawa SAH)

- **`cthr` — Canadian CT Head Rule** (Stiell IG, et al. *The
  Canadian CT Head Rule for patients with minor head injury.*
  Lancet. 2001;357(9266):1391-1396). Five high-risk and two
  medium-risk criteria per Stiell 2001 Figure 2; rule applies to
  GCS 13-15 blunt head injury with witnessed LOC, definite amnesia,
  or witnessed disorientation. Audit log:
  [docs/audits/v11/cthr.md](docs/audits/v11/cthr.md). Worked
  examples in [test/unit/cthr.test.js](test/unit/cthr.test.js).
- **`ccsr` — Canadian C-Spine Rule** (Stiell IG, et al. *The
  Canadian C-Spine Rule for radiography in alert and stable
  trauma patients.* JAMA. 2001;286(15):1841-1848). Three-step
  algorithm per Stiell 2001 Figure 1; ships side by side with the
  existing `nexus-cspine` tile so both rules' recommendations are
  visible on the same screen. Audit log:
  [docs/audits/v11/ccsr.md](docs/audits/v11/ccsr.md). Worked
  examples in [test/unit/ccsr.test.js](test/unit/ccsr.test.js).
- **`pecarn-head` — PECARN Pediatric Head Injury Rule**
  (Kuppermann N, et al. *Identification of children at very low
  risk of clinically-important brain injuries after head trauma:
  a prospective cohort study.* Lancet. 2009;374(9696):1160-1170).
  Two age-banded algorithms (Kuppermann 2009 Figures 2 and 3)
  returning one of three ciTBI risk tiers (very-low / intermediate
  / high). Audit log:
  [docs/audits/v11/pecarn-head.md](docs/audits/v11/pecarn-head.md).
  Worked examples in
  [test/unit/pecarn-head.test.js](test/unit/pecarn-head.test.js).
- **`ottawa-ankle` — Ottawa Ankle Rules** (Stiell IG, et al. *A
  study to develop clinical decision rules for the use of
  radiography in acute ankle injuries.* Ann Emerg Med. 1992;
  21(4):384-390). Stiell 1992 Figure 1 algorithm; separate
  malleolar-zone (ankle x-ray) and midfoot-zone (foot x-ray)
  decisions. Rule for patients >= 18; pediatric variant
  (Plint 1999) deferred to a future spec. Audit log:
  [docs/audits/v11/ottawa-ankle.md](docs/audits/v11/ottawa-ankle.md).
  Worked examples in
  [test/unit/ottawa-ankle.test.js](test/unit/ottawa-ankle.test.js).
- **`ottawa-sah` — Ottawa Subarachnoid Hemorrhage Rule** (Perry
  JJ, et al. *Clinical decision rules to rule out subarachnoid
  hemorrhage for acute headache.* JAMA. 2013;310(12):1248-1255).
  Six-criterion decision rule per Perry 2013 Figure 2 with the
  §Methods exclusion-criteria pre-screen (new neurologic deficit,
  prior aneurysm / SAH / brain tumor, recurrent identical-pattern
  headaches, age <15). Audit log:
  [docs/audits/v11/ottawa-sah.md](docs/audits/v11/ottawa-sah.md).
  Worked examples in
  [test/unit/ottawa-sah.test.js](test/unit/ottawa-sah.test.js).

### Added (spec-v12 wave 12-4 — hepatology & liver-fibrosis bundle: FIB-4, APRI, Maddrey-Lille)

- **`fib4` — FIB-4 Index for Liver Fibrosis** (Sterling RK, et al.
  *Development of a simple noninvasive index to predict significant
  fibrosis in patients with HIV/HCV coinfection.* Hepatology. 2006;
  43(6):1317-1325). Four inputs (age, AST, ALT, platelets); formula
  FIB-4 = (age * AST) / (platelets * sqrt(ALT)). Sterling 2006
  cutoffs: <1.45 rules out advanced fibrosis (NPV 90%); >3.25 rules
  in advanced fibrosis (PPV 65%); 1.45-3.25 indeterminate. Audit
  log: [docs/audits/v11/fib4.md](docs/audits/v11/fib4.md). Worked
  examples in [test/unit/fib4.test.js](test/unit/fib4.test.js).
- **`apri` — AST to Platelet Ratio Index** (Wai CT, et al. *A
  simple noninvasive index can predict both significant fibrosis
  and cirrhosis in patients with chronic hepatitis C.* Hepatology.
  2003;38(2):518-526). Three inputs (AST, AST upper limit of
  normal, platelets); formula APRI = ((AST / AST_ULN) * 100) /
  platelets. Wai 2003 cutoffs: >0.7 predicts significant fibrosis;
  >1.0 predicts cirrhosis (WHO 2014 HCV guideline endorses these
  cutoffs for resource-limited settings). Audit log:
  [docs/audits/v11/apri.md](docs/audits/v11/apri.md). Worked
  examples in [test/unit/apri.test.js](test/unit/apri.test.js).
- **`maddrey-lille` — Maddrey DF + Lille Model (alcoholic
  hepatitis)** (Maddrey WC, et al. *Corticosteroid therapy of
  alcoholic hepatitis.* Gastroenterology. 1978;75(2):193-199;
  Louvet A, et al. *The Lille model: a new tool for therapeutic
  strategy in patients with severe alcoholic hepatitis treated
  with steroids.* Hepatology. 2007;45(6):1348-1354). Combined
  card: Maddrey DF = 4.6 * (patient PT - control PT) + bilirubin
  with the Maddrey 1978 DF >= 32 severe-disease cutoff; Lille
  computed in SI units internally per the Louvet 2007 equation
  with the 0.45 non-response cutoff (6-month survival ~25% vs
  ~85%). Audit log:
  [docs/audits/v11/maddrey-lille.md](docs/audits/v11/maddrey-lille.md).
  Worked examples in
  [test/unit/maddrey-lille.test.js](test/unit/maddrey-lille.test.js).

### Added (spec-v12 wave 12-3 — upper & lower GI-bleeding bundle: GBS, Rockall, AIMS65, Oakland)

- **`gbs` — Glasgow-Blatchford Bleeding Score** (Blatchford O, et
  al. *A risk score to predict need for treatment for upper-
  gastrointestinal haemorrhage.* Lancet. 2000;356(9238):1318-1321).
  Eight inputs (BUN in mg/dL, hemoglobin in g/dL with sex-specific
  Blatchford 2000 Table 1 bands, SBP, pulse >= 100, melena, recent
  syncope, hepatic disease, cardiac failure). GBS = 0 is the
  outpatient-management cutoff per Blatchford 2000 §Results,
  endorsed by NICE CG141 (2012). Audit log:
  [docs/audits/v11/gbs.md](docs/audits/v11/gbs.md). Worked
  examples in [test/unit/gbs.test.js](test/unit/gbs.test.js).
- **`rockall` — Rockall Score** (Rockall TA, et al. *Risk
  assessment after acute upper gastrointestinal haemorrhage.* Gut.
  1996;38(3):316-321). Complete (post-endoscopy) five-parameter
  score (range 0-11) with mortality bands quoted from Rockall 1996
  Figure 2; a `preEndoscopy` toggle exposes the Vreeburg 1999 /
  NICE CG141 variant (omits endoscopic diagnosis and stigmata;
  range 0-7). Audit log:
  [docs/audits/v11/rockall.md](docs/audits/v11/rockall.md). Worked
  examples in [test/unit/rockall.test.js](test/unit/rockall.test.js).
- **`aims65` — AIMS65 Score** (Saltzman JR, et al. *A simple risk
  score accurately predicts in-hospital mortality, length of stay,
  and cost in acute upper GI bleeding.* Gastrointest Endosc. 2011;
  74(6):1215-1224). Five binary criteria with the Saltzman 2011
  Table 4 six-band in-hospital mortality split (0.3% / 1.2% / 5.3%
  / 10.3% / 16.5% / 24.5%). Audit log:
  [docs/audits/v11/aims65.md](docs/audits/v11/aims65.md). Worked
  examples in [test/unit/aims65.test.js](test/unit/aims65.test.js).
- **`oakland` — Oakland Score** (Oakland K, et al. *Derivation
  and validation of a novel risk score for safe discharge after
  acute lower gastrointestinal bleeding: a modelling study.* Lancet
  Gastroenterol Hepatol. 2017;2(9):635-643). Seven-parameter
  weighted model (range 0-35); <= 8 is the safe-discharge cutoff
  (95% probability of safe discharge per Oakland 2017; endorsed by
  BSG 2019). Hemoglobin is entered in g/dL and converted to g/L
  internally to apply the Oakland 2017 Table 2 bands. Audit log:
  [docs/audits/v11/oakland.md](docs/audits/v11/oakland.md). Worked
  examples in [test/unit/oakland.test.js](test/unit/oakland.test.js).

### Added (spec-v12 wave 12-2 — VTE risk & severity bundle: PESI, sPESI, Padua)

- **`pesi` — Pulmonary Embolism Severity Index** (Aujesky D, et al.
  *Derivation and validation of a prognostic model for pulmonary
  embolism.* Am J Respir Crit Care Med. 2005;172(8):1041-1046). 11
  inputs (age in years, male sex, cancer, heart failure, chronic
  lung disease, HR >= 110, SBP < 100, RR >= 30, temperature < 36 °C,
  altered mental status, SaO2 < 90% on room air). Five risk classes
  (I <= 65, II 66-85, III 86-105, IV 106-125, V > 125) with the
  Aujesky 2005 Table 4 30-day mortality range per class. Audit log:
  [docs/audits/v11/pesi.md](docs/audits/v11/pesi.md). Worked
  examples in [test/unit/pesi.test.js](test/unit/pesi.test.js).
- **`spesi` — Simplified PESI** (Jimenez D, et al. *Simplification
  of the pulmonary embolism severity index for prognostication in
  patients with acute symptomatic pulmonary embolism.* Arch Intern
  Med. 2010;170(15):1383-1389). Six binary criteria; sPESI 0 -> low
  risk (1.0% 30-day mortality), >= 1 -> not-low risk (10.9%) per
  Jimenez 2010 Table 3. Audit log:
  [docs/audits/v11/spesi.md](docs/audits/v11/spesi.md). Worked
  examples in [test/unit/spesi.test.js](test/unit/spesi.test.js).
- **`padua` — Padua Prediction Score** (Barbar S, et al. *A risk
  assessment model for the identification of hospitalized medical
  patients at risk for venous thromboembolism: the Padua Prediction
  Score.* J Thromb Haemost. 2010;8(11):2450-2457). Weighted 11-item
  model; >= 4 is high risk for VTE per Barbar 2010 §Results, with
  the Barbar 2010 Table 4 90-day VTE rates (0.3% low, 11.0% high if
  untreated) surfaced in the interpretation block. Audit log:
  [docs/audits/v11/padua.md](docs/audits/v11/padua.md). Worked
  examples in [test/unit/padua.test.js](test/unit/padua.test.js).

### Added (spec-v12 wave 12-1 — early-warning bundle: NEWS2 + MEWS)

- **`news2` — National Early Warning Score 2** (Royal College of
  Physicians. *NEWS 2: Standardising the assessment of acute-illness
  severity in the NHS.* London: RCP, 2017). Eight inputs (respiratory
  rate, SpO2 with Scale 1 vs Scale 2 toggle per RCP 2017 §3.4,
  supplemental-oxygen flag, systolic BP, pulse, ACVPU consciousness,
  temperature). Per-parameter trace plus the RCP 2017 Table 2
  clinical-response trigger band (Low / Low-medium / Medium / High);
  a single parameter scoring 3 flips Low-medium aggregates to Medium
  per the source. Audit log:
  [docs/audits/v11/news2.md](docs/audits/v11/news2.md). Worked
  example (low edge of input + spec-v12 §3.1.1 mid + high edge)
  asserted in [test/unit/news2.test.js](test/unit/news2.test.js).
- **`mews` — Modified Early Warning Score** (Subbe CP, et al.
  *Validation of a modified Early Warning Score in medical
  admissions.* QJM. 2001;94(10):521-526). Five inputs (SBP, pulse,
  RR, temperature, AVPU). Per-parameter trace plus the Subbe 2001
  Table 2 four-band outcome split (0-2 / 3 / 4 / >=5). MEWS predates
  NEWS2 and omits SpO2 / supplemental-oxygen scoring; both tiles
  ship side by side so sites that have not converted from MEWS to
  NEWS2 still see their instrument. Audit log:
  [docs/audits/v11/mews.md](docs/audits/v11/mews.md). Worked
  examples in [test/unit/mews.test.js](test/unit/mews.test.js).

### Removed (clinical-staff-first pivot — patient-artifact dropzone UI retired)

- **The home-view artifact dropzone UI is gone.** spec-v7 §3.1's
  "What do you need to decode?" hero label, "Or drop the document
  you cannot read" dropzone, and "Or paste text:" textarea are all
  removed from `index.html`. The hero search remains but is reframed
  to clinical-first phrasing ("Find a calculator, lookup, or
  reference" with placeholders like *wells PE*, *CHA2DS2-VASc*,
  *ICD-10*, *magnesium replacement*).
- **`wireDropzone()` and the dropzone-only imports are removed from
  `app.js`.** The dropzone wiring, file-picker handlers, drag/drop
  listeners, paste auto-classify, and Escape/Clear chooser flow are
  all gone. `applyPendingDrop()` is no longer called from the tile
  renderer (no dropzone means nothing is ever pending).
- **`lib/artifact-detect.js`, `lib/artifact-route.js`, and
  `lib/artifact-handoff.js` remain in the tree.** Their unit tests
  still run; they continue to encode the deterministic classifier
  and routing table. The choice was deliberate: if a clinical-input
  surface ever reuses them (e.g., a clinician pasting an EHR lab
  panel per spec-v10 §3.3), the libraries are ready. The home view
  simply no longer wears them.
- **`styles.css` `.artifact-*` selectors and the patient-artifact
  meta description copy are pruned.** Meta descriptions now read
  "178 calculators, scoring tools, code lookups, and references"
  in place of "...bill decoders." The patient-decoder tiles
  themselves (`decoder`, `eob-decoder`, `msn-decoder`,
  `appeal-letter`, `roi`, `hipaa-roa`, ...) are not removed; they
  remain valid tiles in the catalog, just no longer promoted via
  an artifact-ingestion hero.
- **`test/unit/artifact-route.test.js`** reframes the prior
  "accept= stays in lockstep" assertion as a negative assertion
  that the dropzone elements are NOT present in `index.html`, so
  any accidental reintroduction is a CI failure.

### Added (spec-v11 §5 — eight more canonical-band tiles get `META.interpretation`)

- **Eight more tiles** now expose per-band `interpretation` blocks
  whose every band text is a direct paraphrase of the primary
  source. The renderer was already in place; this is pure metadata.
  - `gcs` — Teasdale & Jennett 1974 mild (13-15) / moderate (9-12) /
    severe (3-8) bands with the conventional GCS<=8 airway threshold.
  - `wells-pe` — Wells 2000 / Wells 2001 two-tier <=4 vs >4 cutoff.
  - `wells-dvt` — Wells 1997 Table 3 low (<=0) / moderate (1-2) /
    high (>=3) probability bands.
  - `nihss` — NIH/NINDS interpretation bands 0 / 1-4 / 5-15 / 16-20 /
    21-42 per Adams 1999.
  - `timi` — Antman 2000 Table 3 14-day composite-event rates by
    score (0-1 → 4.7% up to 6-7 → 40.9%).
  - `centor` — McIsaac 1998 Table 4 management bands by McIsaac
    age-adjusted score.
  - `ciwa` — CIWA-Ar minimal / moderate / severe bands per Sullivan
    1989 + Mayo-Smith 1997 consensus thresholds.
  - `cows` — COWS mild / moderate / moderately severe / severe per
    Wesson & Ling 2003 scoring key.
- All eight pass the `test/unit/meta-interpretation.test.js` CI
  guard. 16 of the 178 tiles now carry an interpretation block.

### Added (spec-v11 §5 — populate `META.interpretation` for eight canonical-band tiles)

- **Eight canonical tiles now expose per-band `interpretation` blocks**
  whose every band text is a direct paraphrase of the primary source,
  rendered below the citation under the mandatory "Per source:" header
  per spec-v11 §5.2:
  - `chads` (CHA2DS2-VASc) — Lip 2010 / ESC bands 0 / 1 / >=2 with
    antithrombotic guidance.
  - `hasbled` — Pisters 2010 Table 5 bleeds-per-100-patient-years for
    bands 0-1 / 2 / >=3.
  - `curb-65` — Lim 2003 Table 4 30-day mortality bands 0-1 / 2 / 3-5
    with disposition guidance.
  - `heart` — Six 2008 / Backus 2013 prospective-validation 6-week MACE
    bands 0-3 / 4-6 / 7-10.
  - `perc` — Kline 2004 rule-out vs rule-does-not-apply pair.
  - `phq9` — Kroenke 2001 Table 4 severity bands 0-4 / 5-9 / 10-14 /
    15-19 / 20-27.
  - `gad7` — Spitzer 2006 severity bands 0-4 / 5-9 / 10-14 / 15-21.
  - `abcd2` — Johnston 2007 Table 3 2-day stroke-risk bands 0-3
    (1.0%) / 4-5 (4.1%) / 6-7 (8.1%).
- All eight pass the `test/unit/meta-interpretation.test.js` CI guard
  (§5.4): `sourceQuoted: true`, non-empty `sourceCitation`, band text
  <=200 chars, no forbidden Sophie-authored phrasing.
- The renderer in `renderMetaBlock(util)` ([app.js](app.js)) was
  already in place from spec-v11 wave 2; this is a pure metadata
  addition with no UI work required.

### Changed (spec-v11 wave 4 — final pass; spec-v11 marked complete)

- **spec-v11 marked complete (2026-05-18).** All four phases landed:
  Wave 0 shipped the spec, the per-tile audit-log skeleton tooling
  (`scripts/audit-skeleton.mjs`), the coverage rollup
  (`scripts/audit-coverage.mjs`), and the §3.5 CI guards
  (`test/unit/audit-format.test.js`,
  `test/unit/meta-citation-verify.test.js`,
  `test/unit/meta-example-result.test.js`). Wave 1 renamed the
  visible group labels per §4.1 (`app.js GROUP_LABELS`), added the
  additive `META[id].specialties` array consumed by
  `lib/prompt.js`, and pushed the visible name through every header
  / ARIA label / hub / topic page. Wave 2 added the
  `interpretation` field and `test/unit/meta-interpretation.test.js`
  CI guard. Waves 3a–3n carried the per-tile audit work in the
  §3.3 order; every shipped tile now has a corresponding
  `docs/audits/v11/<tile-id>.md` in PASS or PASS-WITH-FIXES state.
- **§6 acceptance criteria met.** `scripts/audit-coverage.mjs`
  reports 178/178 (100%) — `A 21/21`, `C 15/15`, `E 31/31`,
  `F 15/15`, `G 47/47`, `H 9/9`, `I 24/24`, `J 5/5`, `K 4/4`,
  `L 3/3`, `N 3/3`, `O 1/1`. No defect (§3.6) reached a state
  that required a CHANGELOG `### Fixed` regression entry; the
  audit waves caught only precision observations (notably the
  `niosh-pg` CO TWA labelling note in wave 3n) that do not change
  hazard ranking or downstream safety. `npm run lint`, the unit +
  a11y suite, `npm run data:verify`, and `npm run build` are
  green. spec-v11 §6 final criteria — every audit log present and
  PASS, coverage 100%, `GROUP_LABELS` visible, `META[id].specialties`
  consumed by the prompt ranker, CI guard for `interpretation`
  passing — are all satisfied.
- **Update [docs/spec-v11.md](docs/spec-v11.md) status header**
  from "proposed (2026-05-17)" to "spec-v11 complete (2026-05-18)"
  with a summary of which waves landed and which acceptance
  criteria the release meets.

### Added (spec-v11 wave 3n — EMS & field medicine; Group I to 100%; v11 audit 178/178)

- **Wave 3n — Group I EMS & field medicine (24 tiles).**
  `peds-weight-dose`, `adult-arrest-ref`, `peds-arrest-ref`, `defib`,
  `cincinnati`, `fast`, `field-triage`, `start-triage`,
  `jumpstart-triage`, `bsa_burn`, `burn-fluid`, `hypothermia`,
  `heat-illness`, `peds-ett`, `toxidromes`, `naloxone`, `ems-doc`,
  `nexus-cspine`, `dot-erg`, `niosh-pg`, `cpr-numeric`, `tccc`,
  `co-cn-antidote`, and `avpu-gcs` each audited per spec-v11 §3.3.
  Drug-math tiles (`peds-weight-dose`, `naloxone`, `defib`,
  `burn-fluid`) hand-computed against PALS 2020 / AHA ECC 2020 / FDA
  labels / Baxter & Shires 1968 with cap and floor coverage rows
  (epinephrine 200 kg cap-hit; atropine 2 kg floor-hit; pediatric
  cardioversion at 1 kg low edge; Parkland 70 kg / 20% TBSA mid-case
  matching the META example; pediatric naloxone cap at 2 mg adult
  dose). Stroke / triage screens (`cincinnati`, `fast`, `start-triage`,
  `jumpstart-triage`, `field-triage`, `nexus-cspine`) re-verified
  against Kothari 1997 / Kleindorfer 2007 + Aroor 2017 / Super 1983 /
  Romig (CHOC) / CDC field-triage current edition / Hoffman 2000 +
  Stiell 2001. Lookup tiles (`adult-arrest-ref`, `peds-arrest-ref`,
  `cpr-numeric`, `hypothermia`, `heat-illness`, `toxidromes`,
  `dot-erg`, `niosh-pg`, `tccc`, `peds-ett`, `co-cn-antidote`,
  `avpu-gcs`, `ems-doc`) audited per step 10: shard integrity plus
  sampled authoritative lookups against AHA ECC 2020, WMS hypothermia
  / heat-illness guidelines, Goldfrank toxidrome table, PHMSA ERG
  (current edition), NIOSH Pocket Guide, CoTCCC public TCCC
  guidelines, Cole / modified Cole airway formulas, Cyanokit and
  Nithiodote FDA labels, UHMS HBO indications, McNarry 2004
  AVPU/GCS mapping, and the NEMSIS v3 documentation prompts behind
  `data/workflow/ems-runtypes.json`.
- **Group I (EMS & Field Medicine) is now 100% audited; spec-v11
  audit coverage reaches 178 / 178 (100%).**
  `scripts/audit-coverage.mjs` reports `A 21/21`, `C 15/15`,
  `E 31/31`, `F 15/15`, `G 47/47`, `H 9/9`, `I 24/24`, `J 5/5`,
  `K 4/4`, `L 3/3`, `N 3/3`, `O 1/1`. With all per-tile audit logs
  in PASS state, the spec-v11 §6 acceptance criterion for audit
  coverage is met; wave 4 (final summary) follows.

### Added (spec-v11 wave 3m — clinical scoring tail; Group G to 100%)

- **Wave 3m — Group G clinical-scoring tail (19 tiles).** `peds-vitals`,
  `lab-ranges`, `abg`, `asa`, `mallampati`, `beers`, `centor`,
  `alvarado-pas`, `ascvd`, `prevent`, `lights`, `mentzer`, `saag`,
  `r-factor`, `kdigo-aki`, `sgarbossa`, `rcri`, `pews`, and `abcd2` each
  audited per spec-v11 §3.3. Formula tiles (Light's, Mentzer, SAAG,
  R-factor, KDIGO, RCRI, ABCD2, ABG Winter compensation, PEWS,
  Modified Sgarbossa, ASCVD PCE, PREVENT 2024) cross-checked by
  hand-computation against the primary source (Light 1972; Mentzer
  1973; Runyon 1992; Benichou 1990; KDIGO 2012; Lee 1999; Johnston
  2007; Albert/Dell/Winters 1967; Monaghan 2005; Smith 2012; Goff
  2014; Khan 2024) and against MDCalc / ACC-tool reference
  implementations within the spec-v11 §3.1.3 0.5% tolerance. Lookup
  tiles (`peds-vitals`, `lab-ranges`, `asa`, `mallampati`, `beers`)
  audited per step 10 (shard integrity + sampled authoritative
  lookups). Centor / McIsaac age-modifier thresholds (3-14 → +1, 45+
  → -1) re-verified against McIsaac 1998 Table 2; Alvarado / PAS
  point allocations re-verified against Alvarado 1986 Table 1 and
  Samuel 2002 Table 2 (RLQ tenderness and leukocytosis are the only
  2-point items). ABCD2 band thresholds (0-3 / 4-5 / 6-7 with 2-day
  stroke risks 1.0% / 4.1% / 8.1%) pinned to Johnston 2007 Table 3.
- **Group G (Clinical Scoring & Risk) is now 100% audited.**
  `scripts/audit-coverage.mjs` reports 154 / 178 (87%) overall, with
  `A 21/21`, `C 15/15`, `E 31/31`, `F 15/15`, `G 47/47`, `H 9/9`,
  `I 0/24 (0%)`, `J 5/5`, `K 4/4`, `L 3/3`, `N 3/3`, `O 1/1`. The
  remaining wave is Group I EMS & field medicine (24 tiles) per
  spec-v11 §3.3.

### Added (spec-v11 wave 3l — workflow, high-alert, peds, reference ranges, immunization; Groups H, J, K, N, O to 100%)

- **Wave 3l — workflow + high-alert + remaining pediatrics + reference
  ranges + immunization & ID (19 tiles).** `prep`, `prior-auth`,
  `discharge-instr`, `specialty-visit`, `wallet-card`, `sbar-template`,
  `breach-clock`, `high-alert-card`, `unit-converter-v4`,
  `time-to-dose`, `lab-adult`, `lab-peds`, `tdm-levels`, `tox-levels`,
  `tetanus`, `rabies-pep`, `bbp-exposure`, `tb-testing`,
  `sti-screening` each audited per spec-v11 §3.3. Reference-range and
  STI-screening tiles audited per step 10 (shard integrity + sampled
  authoritative lookups). Workflow / patient-education generators
  (`prep`, `prior-auth`, `discharge-instr`, `specialty-visit`,
  `wallet-card`, `sbar-template`) audited per step 13 (required-field
  coverage backed by pinned unit tests in `lib/workflow-v4.js` and
  `lib/keywords.js`). `breach-clock` boundary-example pass:
  hand-computed 60-day arithmetic for individual / media / HHS notices
  and the `>=500` threshold across discovery-date and year-boundary
  edges; 45 CFR §§164.404 / 164.406 / 164.408 text re-read against
  the current eCFR. `unit-converter-v4` cross-checked against IFCC
  HbA1c master equation, NIH/NLM SI conversion table, and exact NIST
  in / lb factors. `tetanus`, `rabies-pep`, and `bbp-exposure`
  decision trees cross-checked row-by-row against the bundled JSON
  vs. CDC ACIP / USPHS source tables; the `tb-testing` 5 / 10 / 15 mm
  TST cutoffs confirmed against the current ATS / CDC / IDSA
  guidance.
- **Groups H (Workflow & Documentation), J (Immunization & Infectious
  Disease), K (Reference Ranges), N (Pediatrics & Neonatal), and O
  (High-Alert & Safety) are now 100% audited.**
  `scripts/audit-coverage.mjs` reports 135 / 178 (76%) overall, with
  `A 21/21`, `C 15/15`, `E 31/31`, `F 15/15`, `G 28/47 (60%)`,
  `H 9/9`, `I 0/24 (0%)`, `J 5/5`, `K 4/4`, `L 3/3`, `N 3/3`,
  `O 1/1`. The two remaining waves are Group G clinical-scoring tail
  (19 tiles) and Group I EMS & field medicine (24 tiles) per
  spec-v11 §3.3.

### Added (spec-v11 wave 3k — regulatory + patient-literacy; Groups C and L to 100%)

- **Wave 3k — regulatory and patient-literacy (20 tiles).** `decoder`,
  `insurance`, `eob-decoder`, `no-surprises`, `insurance-card`,
  `abn-explainer`, `msn-decoder`, `idr-eligibility`, `appeal-letter`,
  `hipaa-roa`, `birthday-rule`, `cobra-timeline`, `medicare-enrollment`,
  `aca-sep`, `lab-interpret`, `cms1500`, `ub04`, `eob-glossary`,
  `hipaa-auth`, `roi` each audited per spec-v11 §3.3 step 11: cited
  CFR / USC / form-version sections re-read against the current text
  (45 CFR 162.406 NPI Luhn; 45 CFR 164.524 HIPAA Right of Access
  30-day clock + cost-based fee cap; 45 CFR 164.508 HIPAA Authorization
  9 required elements; 45 CFR 147.136 internal appeal; 45 CFR 149 +
  PHSA 2799A-1/-2/-7 No Surprises Act; 29 USC 1162 COBRA 18/29/36
  windows; 42 CFR 407.14/15/21 Medicare IEP/GEP/SEP; 45 CFR 155.420
  ACA SEP; NUBC UB-04 Data Specifications; ADA 2024 + 2018 ACC/AHA +
  ATA 2014 reference bands) and existing pinned unit tests for the
  template-generators (HIPAA Authorization 9-element coverage; ROI
  required-field coverage; specialty-visit and wallet-card builders)
  re-confirmed.
- **One META citation defect fixed in the same PR per spec-v11 §3.6 #3.**
  `META.cms1500.citation` previously read "CMS-1500 (08/05)
  Health Insurance Claim Form ..."; the (08/05) form revision was
  superseded by the (02/12) revision in April 2014 and the (02/12)
  form is the current paper professional claim form. Corrected to
  "CMS-1500 (02/12) ... in use since April 1, 2014". Live tile
  content was already aligned to the 02/12 form layout; only the
  citation string referenced the obsolete revision.
- **Groups C (Insurance & Patient Literacy) and L (Insurance
  Glossary) are now 100% audited.** `scripts/audit-coverage.mjs`
  reports 116 / 178 (65%) overall, with `A 21/21 (100%)`,
  `C 15/15 (100%)`, `E 31/31 (100%)`, `F 15/15 (100%)`,
  `G 28/47 (60%)`, `H 2/9 (22%)`, `L 3/3 (100%)`, and
  `N 1/3 (33%)`. Wave 3l (remaining Group G + workflow + EMS / field)
  is next per spec-v11 §3.3.

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
