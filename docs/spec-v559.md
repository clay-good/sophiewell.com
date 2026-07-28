# spec-v559.md — Erez pregnancy-specific DIC score tile

> Status: **SHIPPED (2026-07-28).** Builds the `erez-dic` tile. Catalog **1408 → 1409**, group G.

## Why

`erez` was zero-hit. A **companion gap**: the catalog already has the ISTH and JAAM DIC scores. This is a
**third, pregnancy-specific** instrument with different components and a cutoff on a different scale —
**26, not 5**. Carrying a cutoff across would be wrong by an order of magnitude.

## What it does

| Platelets (×10⁹/L) | Points |
| --- | --- |
| Below 50 | 1 |
| 50-100 | 2 |
| Above 100-185 | 1 |
| Above 185 | 0 |

| PT **difference** (seconds) | Points |
| --- | --- |
| Below 0.5 | 0 |
| 0.5-1.0 | 5 |
| Above 1.0-1.5 | 12 |
| Above 1.5 | 25 |

| Fibrinogen (g/L) | Points |
| --- | --- |
| Below 3.0 | 25 |
| 3.0-4.0 | 6 |
| Above 4.0-4.5 | 1 |
| Above 4.5 | 0 |

Maximum **52**; **≥26 indicates DIC**.

## The four rules a plausible implementation breaks

**1. The platelet row is non-monotonic — and that is the published table.** Below 50 scores **1** while
50-100 scores **2**, so the most severe thrombocytopenia scores *fewer* points than moderate
thrombocytopenia. Two independent sources print it this way and one names the pattern as unusual. Every
instinct says to straighten it; doing so would change the score of exactly the sickest patients. A test
asserts the points array is *not* sorted.

**2. The prothrombin time input is a difference in seconds — not a ratio, not an INR.** Patient value minus
laboratory control. The strata are fractions of a second, so passing an INR of 1.2 or a raw PT of 14 seconds
lands in the top stratum and adds **25 unearned points**. This single confusion moves the score by 12-25
points — most of the way to the cutoff.

**3. The cutoff is essentially unreachable without one of the two 25-point findings.** Fibrinogen <3.0 g/L
or PT difference >1.5 s. Everything else — the whole platelet row plus both middle strata — totals at most
**20**. A falling platelet count never reaches DIC by that route, however far it falls.

**4. D-dimer and FDPs are deliberately absent, unlike ISTH.** They rise in normal pregnancy and would
false-positive — much of why a pregnancy-specific score exists. Their absence is a design decision, not an
omission to fill in.

## Boundary convention

The published strata share endpoints (50, 100, 185, 0.5, 1.0, 1.5, 3.0, 4.0, 4.5 each appear in two adjacent
rows). The two sources differ only in inequality **glyphs**, never in the numbers — so this is a convention
to choose, not a value disagreement to refuse under spec-v97. Each printed range takes its own **upper**
bound and the next starts strictly above it. The result states the convention.

## Scope (spec-v11 §5.3)

DIC in pregnancy is an **obstetric emergency**, and it is a **clinical** diagnosis supported by laboratory
findings rather than established by a score — **a score below the cutoff does not exclude it**. It does not
identify the **cause**, which is what actually gets treated: abruption, amniotic fluid embolism, sepsis,
severe preeclampsia and HELLP, retained products, and acute fatty liver of pregnancy all present this way
and diverge sharply in management. It does not indicate delivery, transfusion, or any blood product, and it
does not replace serial measurement, which is usually what reveals the diagnosis.

## Files

- `lib/erez-dic-v559.js` — `erezDic()`, `PLATELET_ROWS`, `PT_DIFFERENCE_ROWS`, `FIBRINOGEN_ROWS`,
  `EREZ_MAX`, `EREZ_CUTOFF`, `MAX_WITHOUT_A_25_POINT_FINDING`.
- `views/group-v559.js` (RV559) — three number inputs under an **h2**; the PT label says "DIFFERENCE in
  seconds… NOT a ratio and NOT an INR" in as many words.
- `mcp/adapters/erez-dic-v559.js` — wave 384.
- `test/unit/erez-dic.test.js` — 16 tests.
- `docs/spec-v559.md` (this file).

## Sourcing (spec-v97)

The derivation paper and an independent clinical reproduction agree on every stratum and every point value,
including the non-monotonic platelet row.

- Erez O, Novack L, Beer-Weisel R, et al. DIC score in pregnant women: a population based modification of
  the International Society on Thrombosis and Hemostasis score. *PLoS One.* 2014;9(4):e93240.
