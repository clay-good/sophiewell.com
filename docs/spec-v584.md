# spec-v584 — EBMT (Gratwohl) risk score

## What this gives you

The pre-transplant EBMT risk score for allogeneic hematopoietic stem cell transplantation, 0–7, with the
conditional item that most implementations get wrong applied correctly.

## Why it exists

The catalog had `hct-ci` — the Sorror comorbidity index, which scores the patient's **organ comorbidity**.
The EBMT score scores the **disease and the transplant**. They are complementary axes, routinely reported
together, and only one was here. `grep -ci ebmt app.js` returned 0.

## Scoring

| Factor | Points |
|---|---|
| Age | < 20 = 0; 20–40 = 1; > 40 = 2 |
| Disease stage | early = 0; intermediate = 1; late = 2 |
| Time from diagnosis | ≤ 12 months = 0; > 12 = 1 |
| Donor | HLA-identical sibling = 0; unrelated = 1 |
| Sex combination | **female donor → male recipient** = 1; everything else = 0 |

Bands: 0–2 low, 3–4 intermediate, 5–7 poor risk.

## The four things a naive implementation gets wrong

- **One factor silently disappears.** The timing item "does not apply for patients transplanted in first
  complete remission (score 0)" — three years from diagnosis in first CR still scores 0. The **maximum
  reachable score in first CR is 6, not 7**. The tile doesn't even ask for the interval there.
- **The sex item is one-directional.** Only female → male. Treating it as a generic "sex mismatch" item
  double-counts half the mismatched pairs.
- **The donor item has only two published categories.** **Haploidentical and cord-blood donors have no
  defined value** in a score that predates both as routine options. The tile refuses the input rather than
  inventing a category.
- **Exactly 12 months.** Some reproductions print "<12 = 0, >12 = 1", leaving 12 unclassified. The consistent
  partition (≤ 12 = 0) is used and the discrepancy stated.

Plus a disease-specific override hiding inside a generic-looking item: **severe aplastic anemia always scores
0 for stage**, because the ladder is built from remission states it does not have.

## Scope (spec-v11 §5.3)

A group-level estimate before transplant. It does not decide whether to transplant, does not select a donor,
conditioning regimen or graft source, and **a high score is not a reason to withhold transplantation** — for
many of these diseases transplant is the only curative option, and the comparator is the untransplanted
course, about which this score says nothing.

## Sourcing (spec-v97)

Points and categories double-confirmed across two independent reproductions of the score table. The first-CR
suppression rule and the timing operator were each confirmed separately, because those are the two places
reproductions diverge.

- Gratwohl A. The EBMT risk score. *Bone Marrow Transplant.* 2012;47(6):749-756.
- Gratwohl A, Stern M, Brand R, et al. *Cancer.* 2009;115(20):4715-4726.

## Files

`lib/ebmt-score-v584.js`, `views/group-v584.js`, `mcp/adapters/ebmt-score-v584.js` (wave 409),
`test/unit/ebmt-score.test.js`. Catalog 1433 → 1434; MCP 1370 → 1371.
