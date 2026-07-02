# scope-post-parity.md — the Post-Parity Coverage catalog ledger (spec-v150 program)

> Companion to [scope-mdcalc-parity.md](scope-mdcalc-parity.md). That ledger
> records the catalog's growth through the completed spec-v85 Advanced Clinical
> Calculators program and the completed spec-v100 MDCalc Parity Completion program
> (which closed at a catalog of 676). This ledger records the growth that follows,
> under the [spec-v150](spec-v150.md) **Post-Parity Coverage** program — the
> deliberate closing of the last under-represented-specialty gaps after acute-care
> parity.

The single source of truth for the count is `UTILITIES.length` in `app.js`; the
catalog-truth gate ([spec-v46](spec-v46.md)) fails CI on any drift between it and
the user-facing surfaces. The running close-count below is enforced against that
live value, never copied as a literal.

## Running ledger

<!-- catalog-truth:historical -->
- **Program baseline:** the spec-v100 program closed the catalog at 676 tiles
  (see [scope-mdcalc-parity.md](scope-mdcalc-parity.md)).
- **spec-v151** — [spec-v151](spec-v151.md), the first feature spec of the
  Post-Parity Coverage program, adds the four dermatology severity indices that
  fill the previously empty scored-severity dermatology surface: `pasi` (Psoriasis
  Area and Severity Index, Fredriksson 1978), `easi` (Eczema Area and Severity
  Index, Hanifin 2001, age-branched region weights, six-band Leshem 2015 strata),
  `scorad` (SCORing Atopic Dermatitis, European Task Force 1993, with the objective
  oSCORAD), and `dlqi` (Dermatology Life Quality Index, Finlay 1994). All four are
  Group G and Class A. +4 (the catalog reached 680 at the v151 close).
- **spec-v152** — [spec-v152](spec-v152.md), the second feature spec, adds the
  five predictive energy-expenditure equations that fill the missing resting/total
  energy-expenditure surface beside the existing nutrition screeners:
  `mifflin-st-jeor` (the ambulatory standard, Mifflin 1990), `harris-benedict`
  (the classic comparator, revised Roza 1984), `katch-mcardle` (lean-mass BMR),
  `penn-state-ree` (ventilated ICU REE, Frankenfield 2004/2009, with the three-way
  2003b/modified branch), and `ireton-jones` (1997-revised energy equation,
  ventilated + spontaneous). Mifflin/Harris-Benedict/Katch-McArdle are Group E;
  Penn State and Ireton-Jones are Group F. All five are Class A. +5 (the catalog
  reached 685 at the v152 close).
- **spec-v153** — [spec-v153](spec-v153.md), the third feature spec, adds the three
  urology / men's-health patient-reported symptom scores that fill the previously
  empty benign-disease symptom-score surface beside the existing urologic oncology
  math (`psa-density`, `prostate-volume`, `gleason-grade-group`, `capra-score`):
  `ipss` (International Prostate Symptom Score / AUA-SI for BPH/LUTS), `iief5`
  (IIEF-5 / Sexual Health Inventory for Men for erectile dysfunction), and `oabss`
  (Overactive Bladder Symptom Score, with the urgency ≥ 2 diagnostic gate surfaced).
  All three are Group G and Class A. +3. The catalog reached 688 at the v153 close.
- **spec-v154** — [spec-v154](spec-v154.md), the fourth feature spec, adds the four
  performance-based function / falls / palliative instruments that fill the
  previously empty performance-based mobility/balance and hospice-functional
  surface beside the fall-*risk* scores (`morse-falls`, `hendrich-ii`) and the
  frailty screens: `berg-balance` (Berg Balance Scale, 14 tasks 0–4, total 0–56),
  `tug` (Timed Up & Go, the CDC STEADI ≥ 12 s bedside mobility screen), `tinetti-poma`
  (Tinetti POMA, balance 0–16 + gait 0–12, total 0–28), and `pps` (Palliative
  Performance Scale v2, the read-leftward 0–100% hospice-eligibility anchor distinct
  from `ecog-karnofsky`). `berg-balance`, `tinetti-poma`, and `pps` are Group G;
  `tug` is Group E; all four are Class A. +4. The catalog reached 692 at the v154 close.
- **spec-v155** — [spec-v155](spec-v155.md), the fifth feature spec, adds the four
  suite-completion tiles that each plug a named hole in an otherwise-complete suite:
  `mipi` (Mantle Cell Lymphoma International Prognostic Index — the lymphoma-index
  suite had `nccn-ipi`/`r-ipi`/`flipi` but no mantle-cell index), `forrest` (the
  UGI-bleeding endoscopic-stigmata anchor beside `gbs`/`rockall`/`aims65`/`oakland`),
  `wagner-dfu` (Wagner diabetic-foot-ulcer grade), and `university-texas-dfu` (the UT
  grade × stage grid — `wifi` grades limb threat but the wound-care grading systems
  were absent). All four are Group G and Class A. **PRECISE-DAPT was deferred** under
  the [spec-v97](spec-v97.md) ≥ 2-source rule: its published score is a
  restricted-cubic-spline continuous nomogram with no verbatim per-variable point
  table reproducible across ≥ 2 independent sources, so it is parked with `crib-ii` /
  `gail-bcrat` rather than approximated. +4 (not the nominal +5). The catalog reached
  **696** at the v155 close.
- **spec-v156** — [spec-v156](spec-v156.md), the sixth and **closing** feature spec,
  completes the rheumatology patient-reported axis and the obstetric cesarean-audit
  standard: `basdai` (Bath AS Disease Activity Index — the patient-reported axial-SpA
  activity index, with the morning-stiffness pair averaged), `basfi` (Bath AS
  Functional Index — the mean of ten 0–10 items), `essdai` (EULAR Sjögren's Syndrome
  Disease Activity Index — twelve weighted systemic domains, max 123, strata low < 5 /
  moderate 5–13 / high ≥ 14), and `robson` (the WHO-endorsed Robson Ten-Group cesarean
  classification — a deterministic input → group mapping asserted mutually-exclusive
  and total). v147/v148 shipped the physician-derived rheumatology activity scores
  (`cdai-ra`, `sdai-ra`, `sledai-2k`, `asdas`, `ffs-2011`); v156 adds the
  patient-reported axial-SpA and Sjögren instruments still absent. All four are Group G
  and Class A — `essdai`'s EULAR citation and `robson`'s WHO endorsement are NOT in the
  `check-citations` issuer pattern (the spec-v156 §4 claim that EULAR trips it is
  incorrect against the live regex; same treatment as the v147/v148 ACR/EULAR scores),
  so no documentation-only staleness row is forced. +4. **The spec-v150 Post-Parity
  Coverage program is now COMPLETE** (679 → 700, +21 shipped; PRECISE-DAPT the sole
  deferral against the nominal +25). The live catalog is **868** deterministic tiles. The Subspecialty Depth and Cross-Discipline Completion programs have since carried the count from 700 onward; see [scope-subspecialty-depth.md](scope-subspecialty-depth.md).

## Program roadmap (complete)

The [spec-v150](spec-v150.md) umbrella reserved the band v151–v156 for six feature
specs (nominal +25): v151 dermatology severity (shipped, +4), v152 nutrition & energy
expenditure (shipped, +5), v153 urology & men's-health PROs (shipped, +3), v154
function/falls/palliative performance (shipped, +4), v155 suite completions (shipped,
+4 — PRECISE-DAPT deferred), v156 rheumatology PRO & obstetric classification (shipped,
+4). **All six are shipped; the program is closed at 700.** Each shipped only after its
own ≥ 2-source re-verification; the lone tile whose published form could not be
cross-verified (PRECISE-DAPT, a restricted-cubic-spline nomogram) was deferred with the
[spec-v97](spec-v97.md) rationale recorded, not shipped from an approximation.

The **Subspecialty Oncology & Hematology Staging** program (spec-v187/v188/v189)
closed 2026-07-01 at **802**: v187 solid-tumor staging/response/inflammation (+5),
[spec-v188](spec-v188.md) leukemia/lymphoma staging & prognosis (+5:
`binet-cll`, `rai-cll`, `ann-arbor`, `flipi-2`, `hasford-cml`), and
[spec-v189](spec-v189.md) heme/rheum/anticoagulation/comorbidity (+4: `msmart`,
`impede-vte`, `same-tt2r2`, `elixhauser`). The fifth v189 score, **BVAS v3, was
deferred** under the same [spec-v97](spec-v97.md) fidelity bar as PRECISE-DAPT: a
faithful score needs item-level new/worse-vs-persistent weighting of ~56 items
across nine organ systems, and an organ-system approximation would misreport the
total — parked with `precise-dapt` / `crib-ii` / `gwtg-hf`, not shipped from an
approximation. Every shipped weight and boundary was re-fetched and cross-verified
across ≥ 2 sources (the van Walraven weights, the Hasford ×1000 formula, the
IMPEDE-VTE and SAMe-TT2R2 point bands).

The **Hepatology/GI, Dermatology/Urology & Screening/Risk** program
(spec-v190/v191/v192) closed 2026-07-01 at **814** (802 → 814, +12 shipped):
[spec-v190](spec-v190.md) hepatology/GI (+4: `palbi`, `meld-na`, `clichy`,
`rome-iv-ibs`), [spec-v191](spec-v191.md) dermatology/urology severity & staging
(+4: `scorten`, `melanoma-t-stage`, `pi-rads`, `guys-stone-score`), and
[spec-v192](spec-v192.md) screening / bedside risk (+4: `findrisc`,
`grobman-vbac`, `marburg-heart-score`, `adhere-hf`). The fifth v192 score,
**GWTG-HF, was deferred** under the [spec-v97](spec-v97.md) fidelity bar: its full
row-by-row sub-range point table (Peterson 2010 Table 3 — the per-band points for
age, SBP, BUN, heart rate, and sodium) is paywalled on ahajournals.org and is not
reproduced verbatim in ≥ 2 independent open sources (only the categorical pieces —
COPD +2, non-Black +3, the 0–100 range, and the score→mortality band map — could
be cross-verified). A continuous-variable approximation would misreport the total,
so GWTG-HF is parked with `precise-dapt` / `bvas` / `crib-ii`, not shipped from an
approximation. Every shipped coefficient and boundary was re-fetched and
cross-verified across ≥ 2 sources — the PALBI linear predictor and −2.53/−2.09
cut-points, the MELD-Na OPTN operational coefficients (distinct from the Kim 2008
NEJM re-fit), the AJCC 8th-edition 0.8 mm melanoma split, the PI-RADS v2.1
zone-specific score-3 upgrades, the FINDRISC point table, the Grobman 2021
race-free logistic coefficients (which use weight + height, not BMI), and the
ADHERE CART thresholds and node mortality rates.
