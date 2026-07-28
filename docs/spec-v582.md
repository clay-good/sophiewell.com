# spec-v582 — HLH-2004 diagnostic criteria (hemophagocytic lymphohistiocytosis)

## What this gives you

Whether a patient meets HLH-2004, computed correctly — including the alternative path that skips the
criteria, the bullet that looks like a criterion but isn't, and the difference between a criterion that is
*not met* and one that *hasn't come back from the lab yet*.

## Why it exists

The catalog had `hscore-hlh` — the HScore, which returns a *probability* of reactive hemophagocytic syndrome
in adults. HLH-2004 is a *criteria checklist* from a pediatric treatment protocol. Different construction,
different population, different output. `grep -c "id: 'hlh-2004'" app.js` returned 0.

## The four things a naive implementation gets wrong

| | Consequence |
|---|---|
| **Two paths** — "either 1 or 2" | A confirmed causative mutation establishes the diagnosis with **zero** of the eight criteria. Counting criteria alone reports that patient backwards. |
| **"No evidence of malignancy"** | Printed in the primary table, but **not** one of the eight. Counting it gives nine and inflates every total by one. |
| **No fever threshold** | Table I says only "Fever". The 38.5 °C figure in many secondary tables **is not in the source**. |
| **Pending ≠ not met** | 4 met + 2 send-out assays outstanding does **not** exclude HLH. Untreated HLH is rapidly fatal. |

## The eight criteria (five required)

| Criterion | Threshold |
|---|---|
| Fever | none given |
| Splenomegaly | none given |
| Cytopenias, **2 of 3 lineages** | Hb < 9 g/dL (< 10 g/dL if under 4 weeks old); platelets < 100 ×10⁹/L; neutrophils < 1.0 ×10⁹/L |
| Hypertriglyceridemia **and/or** hypofibrinogenemia | TG ≥ 265 mg/dL; fibrinogen ≤ 150 mg/dL |
| Hemophagocytosis | bone marrow, spleen or lymph nodes |
| Low/absent NK-cell activity | **by local laboratory reference** — no universal cutoff |
| Ferritin | ≥ 500 µg/L |
| Soluble CD25 | ≥ 2400 U/mL |

Two of the eight are themselves compound, so the eight criteria are not eight yes/no questions.

Unit conversions are exact and stated: 90 g/L = 9 g/dL; 1.5 g/L = 150 mg/dL; µg/L and ng/mL are numerically
identical; 265 mg/dL is the source's own figure.

## Scope (spec-v11 §5.3)

These are criteria from a treatment protocol. Meeting them is **not** an instruction to start etoposide and
dexamethasone. They do not identify the trigger — infection, malignancy and rheumatologic disease all drive
secondary HLH and each needs its own treatment. Failing them does not exclude HLH, particularly early in the
course. Malignancy-associated HLH is a recognized entity, so evidence of malignancy does not rule the
diagnosis out.

## Sourcing (spec-v97)

The criteria table was extracted verbatim from the primary full text, and every comparison operator was
re-checked against an independent reproduction because the primary PDF loses the ≥ and ≤ glyphs.

- Henter JI, Horne A, Aricò M, et al. HLH-2004: diagnostic and therapeutic guidelines for hemophagocytic
  lymphohistiocytosis. *Pediatr Blood Cancer.* 2007;48(2):124-131, Table I.

## Files

`lib/hlh-2004-v582.js`, `views/group-v582.js`, `mcp/adapters/hlh-2004-v582.js` (wave 407),
`test/unit/hlh-2004.test.js`. Catalog 1431 → 1432; MCP 1368 → 1369.
