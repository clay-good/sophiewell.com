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
  `gail-bcrat` rather than approximated. +4 (not the nominal +5). The live catalog is
  **696** deterministic tiles.

## Program roadmap (proposed, not all shipped)

The [spec-v150](spec-v150.md) umbrella reserves the band v151–v156 for six feature
specs (nominal +25): v151 dermatology severity (shipped), v152 nutrition & energy
expenditure (shipped), v153 urology & men's-health PROs (shipped), v154 function/falls/palliative
performance (shipped), v155 suite completions (shipped, +4 — PRECISE-DAPT deferred),
v156 rheumatology PRO & obstetric classification. Each ships only after its own
≥ 2-source re-verification; a tile
whose published form cannot be cross-verified is deferred with the
[spec-v97](spec-v97.md) rationale recorded, not shipped from an approximation.
