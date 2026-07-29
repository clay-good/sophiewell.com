# spec-v587 — Quick Pitt (qPitt) bacteremia score

## What this gives you

A five-item, 0-5 mortality score for a patient who already has a bloodstream infection — with the item most
people get backwards spelled out.

## Why it exists

`pitt-bacteremia` has been in the catalog since spec-v199. Its simplified successor was not.
`grep -ci "quick pitt" app.js` returned 0.

## The score

| Item | Points |
|---|---|
| Temperature **under 36 °C** | 1 |
| Systolic BP under 90 mmHg, or vasopressors | 1 |
| Respiratory rate ≥ 25, or mechanical ventilation | 1 |
| Altered mental status | 1 |
| Cardiac arrest | 1 |

**High risk at 2 or more** — derivation mortality 8.7% below, 57.5% at or above.

Predicted 28-day mortality: 3%, 9%, 22%, 45%, 70% for 0, 1, 2, 3 and **4 or more**.

## The four things worth knowing

- **Fever scores nothing.** The temperature item is hypothermia only. A patient at 40.5 °C scores the same as
  one at 37.0. The predecessor scored fever; the successor dropped it. Scoring "abnormal temperature"
  over-scores every febrile patient — and there is no fever input to answer.
- **Binary, not weighted.** Same five domains as the predecessor, different arithmetic: 0-5 here against
  0-14 there, where cardiac arrest was worth 4. Here **cardiac arrest equals a respiratory rate of 25**. A
  score cannot be carried between the two.
- **The threshold is only 2 of 5** — a low bar for a nearly sevenfold mortality difference, and the main
  danger if misremembered.
- **The mortality ladder stops short.** A score of 5 has no figure of its own; 4 and 5 both return 70% with
  `mortalityFigureLumped` set, so the lumping is visibly the source's.

One operator diverges between reproductions — the hypotension item as "under 90" or "90 or below". The
derivation's own wording (below 90 mmHg or vasopressors) governs, and the divergence is stated.

## Scope (spec-v11 §5.3)

A mortality prognostic for an **established** bloodstream infection. It does not diagnose bacteremia, does
not identify the organism or the source, and does not select an antibiotic. **A low score is not a reason to
withhold or narrow empiric therapy** — the score knows nothing about resistance, source control or the site
of infection. It is not a sepsis screening tool for undifferentiated patients.

## Source

- Battle SE, Augustine MR, Watson CM, et al. *Infection.* 2019;47(4):571-578.

## Files

`lib/qpitt-v587.js`, `views/group-v587.js`, `mcp/adapters/qpitt-v587.js` (wave 412),
`test/unit/qpitt.test.js`. Catalog 1436 → 1437; MCP 1373 → 1374.
