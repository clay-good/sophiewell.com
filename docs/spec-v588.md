# spec-v588 — ESHRE Bologna criteria (poor ovarian response)

## What this gives you

Whether a patient meets the Bologna definition of poor ovarian response — computed with **your center's**
ovarian-reserve cutoff, because the consensus refuses to supply one, and with a warning when that choice is
what decided the answer.

## Why it exists

A **predecessor gap** — the inverse of the usual shape. `poseidon` was already in the catalog, and the
POSEIDON classification exists precisely because the Bologna criteria group women with very different
prognoses. The criteria it replaced were absent. `grep -ci bologna app.js` returned 0.

## The rule

At least **2 of 3**:

1. Advanced maternal age (≥ 40) **or any other risk factor** for poor response
2. A previous poor response — ≤ 3 oocytes after a **conventional** stimulation protocol
3. An abnormal ovarian reserve test — AFC < **5–7**, or AMH < **0.5–1.1 ng/mL**

**Override:** two episodes of poor response after *maximal* stimulation suffice on their own, *in the absence
of* advanced age and an abnormal reserve test.

## The headline: the cut-offs are ranges, not numbers

The consensus does not pick a value. So the same patient:

| AFC | Cutoff 5 | Cutoff 7 |
|---|---|---|
| 6 | reserve normal → **not** a poor responder | reserve abnormal → **poor responder** |

Both cutoffs are **required inputs**, neither is defaulted, and a value inside the published range sets
`cutoffSensitive`.

## Three more things a naive implementation gets wrong

- **The override needs only one criterion**, and counting to two and stopping misses exactly the group it was
  written for. It is also *blocked* when advanced age or an abnormal reserve test is present — both
  directions are tested.
- **Criterion 1 is not a number.** "Any other risk factor" is open-ended with no list attached, so it is its
  own input.
- **Criterion 2 depends on the protocol.** A low yield after a mild or minimal-stimulation cycle does not
  count.

Also: AFC and AMH are **one** criterion satisfied by either — they do not add.

## Scope (spec-v11 §5.3)

A research and prognostic **definition**, not a treatment decision. Meeting it does not mean a cycle will
fail, does not set a stimulation protocol or gonadotropin dose, and is not a reason to decline treatment or
advise donor oocytes. It says nothing about oocyte or embryo quality, or about an individual's chance of a
live birth.

## Source

- Ferraretti AP, La Marca A, Fauser BCJM, et al. *Hum Reprod.* 2011;26(7):1616-1624.

## Files

`lib/bologna-por-v588.js`, `views/group-v588.js`, `mcp/adapters/bologna-por-v588.js` (wave 413),
`test/unit/bologna-por.test.js`. Catalog 1437 → 1438; MCP 1374 → 1375.
