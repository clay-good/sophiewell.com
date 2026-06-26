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
  Group G and Class A. +4. The live catalog is **680** deterministic tiles.

## Program roadmap (proposed, not all shipped)

The [spec-v150](spec-v150.md) umbrella reserves the band v151–v156 for six feature
specs (nominal +25): v151 dermatology severity (shipped), v152 nutrition & energy
expenditure, v153 urology & men's-health PROs, v154 function/falls/palliative
performance, v155 suite completions, v156 rheumatology PRO & obstetric
classification. Each ships only after its own ≥ 2-source re-verification; a tile
whose published form cannot be cross-verified is deferred with the
[spec-v97](spec-v97.md) rationale recorded, not shipped from an approximation.
