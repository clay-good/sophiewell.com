# scope-subspecialty-depth.md — the Subspecialty Depth catalog ledger (spec-v157 program)

> Companion to [scope-mdcalc-parity.md](scope-mdcalc-parity.md) and
> [scope-post-parity.md](scope-post-parity.md). The first records the catalog's
> growth through the spec-v85 and spec-v100 programs (closing at 676); the second
> records the [spec-v150](spec-v150.md) Post-Parity Coverage program (closing at
> 700). This ledger records the growth under the [spec-v157](spec-v157.md)
> **Subspecialty Depth** program — the *second pass* that closes the deeper
> *subspecialty quantification* gaps a finer read surfaces after the
> whole-specialty gaps are filled.

The single source of truth for the count is `UTILITIES.length` in `app.js`; the
catalog-truth gate ([spec-v46](spec-v46.md)) fails CI on any drift between it and
the user-facing surfaces. The running close-count below is enforced against that
live value, never copied as a literal.

## Running ledger

<!-- catalog-truth:historical -->
- **Program baseline:** the spec-v150 Post-Parity Coverage program closed at a
  count of 700 (see [scope-post-parity.md](scope-post-parity.md)).
- **spec-v158** — [spec-v158](spec-v158.md), the first feature spec, fills the
  program's headline gap: echocardiography had a single quantification tile
  (`aortic-valve-area`) despite being one of the most-performed studies in
  medicine. Adds the daily ASE/EACVI chamber, filling-pressure, and right-heart
  computes — `lv-mass-index` (Devereux LV mass, LVMI, RWT, four-pattern geometry),
  `la-volume-index` (biplane area-length LAVI), `teichholz-lvef` (Teichholz LVEF
  & fractional shortening), `rvsp-pasp` (RVSP = 4·v² + RAP), and
  `mitral-e-e-prime` (E/e′ filling-pressure estimate). All Group E, Class A. +5.
- **spec-v159** — [spec-v159](spec-v159.md), the second feature spec, adds the
  standard neurology/spine disability scales that MS, spinal-cord-injury, and
  cervical-myelopathy clinics use and the catalog lacked: `edss` (Expanded
  Disability Status Scale, Kurtzke 1983), `asia-impairment` (ASIA Impairment Scale
  A–E, ISNCSCI Kirshblum 2011), `mjoa` (modified Japanese Orthopaedic Association
  score, Benzel 1991), and `nurick` (Nurick grade, 1972). All Group G, Class A. +4.
- **spec-v160** — [spec-v160](spec-v160.md), the third feature spec, completes the
  rheumatology activity/classification axis: `rapid3` (the routine US RA
  patient-reported index, Pincus 2009), `dapsa` (Psoriatic Arthritis disease
  activity, Schoels 2016), `slicc-sle` (SLICC 2012 SLE classification), and
  `sle-2019-eular-acr` (2019 EULAR/ACR SLE classification, weighted). All Group G,
  Class A. +4.
- **spec-v161** — [spec-v161](spec-v161.md), the fourth and CLOSING feature spec,
  adds the absent endocrine/metabolic/nutrition-support screening arithmetic:
  `arr` (Aldosterone-Renin Ratio primary-aldosteronism screen, Endocrine Society
  2016), `calcium-phosphate-product` (CKD-MBD), `free-thyroxine-index` (FTI / T7),
  and `nitrogen-balance` (ASPEN nutrition support). Groups E/F, Class A;
  `calcium-phosphate-product` carries a documentation-only KDIGO staleness row. +4.

**Subspecialty Depth program COMPLETE at 717 tiles** (a net +17 from the prior close of 700). The
program's nominal target in the [spec-v157](spec-v157.md) umbrella was +18; the
actual delta is +17 because the draft carried a known running-count off-by-one.
`UTILITIES.length` is the source of truth and the 13 catalog-truth surfaces agree
at 717. No tile was deferred; the difference is purely the corrected baseline
arithmetic, not a dropped feature.
