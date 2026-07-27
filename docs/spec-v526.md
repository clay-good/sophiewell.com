# spec-v526.md — nSOFA (neonatal Sequential Organ Failure Assessment) tile

> Status: **SHIPPED (2026-07-27).** Builds the `nsofa` tile — the three-domain neonatal organ-dysfunction
> score, total 0-15. Catalog **1375 → 1376**, group G.

## Why

`nsofa` and `wynn` were zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`. (The one `sofa` substring
nearby is `derivationSofa`, a variable name, not an instrument.)

**Age-band gap with a real structural difference.** The catalog already has adult SOFA/qSOFA and `psofa`. The
nSOFA is not those with neonatal cut points substituted — it has **three** organ systems where SOFA has six.
It **drops the neurologic, hepatic, and renal domains outright**, because a Glasgow Coma Scale cannot be
scored in a 26-week infant, neonatal bilirubin is dominated by physiologic jaundice rather than sepsis, and
early creatinine and urine output reflect maternal creatinine and the postnatal diuresis rather than the
infant's own kidneys. Scoring an infant on the adult or pediatric instrument imports three domains that do
not mean there what they mean in an older patient.

## What it does

Three subscores, total **0-15** — note the maximum is 15, not the adult SOFA's 24.

| Domain | Range | Driven by |
| --- | --- | --- |
| Respiratory | 0-8 | Intubation status and the SpO2/FiO2 ratio |
| Cardiovascular | 0-4 | Number of inotropes and systemic steroid treatment |
| Hematologic | 0-3 | Platelet count |

Respiratory: **0** not intubated *or* ratio ≥300, **2** below 300, **4** below 200, **6** below 150,
**8** below 100. The thresholds are strict "below", so a ratio of exactly 300 scores 0 and exactly 100
scores 6 — pinned by a test.

Cardiovascular is a grid over inotrope count × steroids: `0/no`→0, `0/yes`→1, `1/no`→2, `1/yes`→3, `2+/no`→3,
`2+/yes`→4. Two inotropes without steroids and one inotrope with steroids both score 3; a test asserts that
collision is intentional.

### The respiratory domain has a deliberate blind spot, and the tile names it

SpO2/FiO2 is evaluated **only when the infant is intubated**. A non-intubated infant scores **0** on the
respiratory domain no matter how much oxygen they are receiving — an infant on nasal CPAP at FiO2 0.60 scores
the same zero as an infant in room air. There is no "not intubated, on supplemental oxygen" row in the
published table, in any source. Inventing one would be inventing a scale. Instead the tile reports 0 **and
says plainly** that such an infant is a patient this domain cannot see, and the renderer hides the SpO2/FiO2
inputs when not intubated so their presence never implies they contribute.

### The hematologic rows overlap as published

Platelets of 40 satisfies both "below 100" (2 points) and "below 50" (3 points); every source writes `<100`
and none writes `50-99`. The SOFA-family convention applies — take the **highest** point value whose
criterion is met — stated in the copy rather than left to the reader, and pinned by a test.

- `lib/nsofa-v526.js` — pure inputs → total, three subscores, and the computed SpO2/FiO2 ratio. Exports
  `INOTROPE_OPTIONS`.
- `views/group-v526.js` (RV526) — three **h2** headings, one per organ domain, matching the instrument's own
  structure.
- `lib/meta.js` — Wynn and Polin 2020 citation + accessed date + bands, related to `psofa`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1376.

**HIGH-STAKES:** an organ-dysfunction score, **not** a diagnosis and **not** a treatment threshold. It was
derived and validated to predict **mortality from late-onset sepsis in preterm very-low-birth-weight
infants**. It does not diagnose sepsis, does not rule sepsis out, and **a low score in an infant who looks
unwell is not reassurance**. It is not an indication to start, continue, or stop antibiotics, inotropes, or
steroids ([spec-v11](spec-v11.md) §5.3). Applying it outside its validated population — a term infant,
early-onset sepsis, a congenital cardiac lesion — is extrapolation, and the tile says so rather than implying
the number travels. A test asserts the copy names the validated population and refuses the diagnosis reading.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the abbreviation (`nsofa`) and the first author (`wynn`)
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan (`psofa.test.js`
exists and is the pediatric sibling, addressed above). Both zero.

## Sourcing (spec-v97)

- **Citation:** Wynn JL, Polin RA. A neonatal sequential organ failure assessment score predicts mortality to
  late-onset sepsis in preterm very low birth weight infants. *Pediatr Res.* 2020;88(1):85-90.
- Every value was transcribed from **two independent sources that agree exactly** — the original paper and a
  subsequent cohort study reproducing the same three domains, the same SpO2/FiO2 thresholds, the same
  inotrope-and-steroid combinations, and the same platelet cut points.

## Verification

Lint (all catalog-truth surfaces at 1376), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute a mortality probability from the total (the source reports discrimination, not a
per-score risk), score serial nSOFAs over time, diagnose sepsis, or apply the adult or pediatric SOFA. The
MCP adapter + golden-probe promotion follow in the next wave (351).
