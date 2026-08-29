# spec-v890 — Methacholine challenge interpretation

## What this gives you

The grade for whichever metric the laboratory reported — and why the two are not
interchangeable.

## §1 Two metrics, two sets of cutpoints

| PD20 (dose, µg) — the 2017 standard | PC20 (concentration, mg/mL) — legacy | |
|---|---|---|
| > 400 | > 16 | Normal |
| 100–400 | 4–16 | Borderline |
| 25–100 | 1–4 | Mild hyperresponsiveness |
| < 25 | < 1 | Moderate to severe |

## §2 The 2017 standard moved from concentration to dose

This is why the tile exists. A **concentration** depends on the nebulizer output and the
inhalation protocol, so a PC20 from one laboratory is not comparable with a PC20 from another. A
delivered **dose** is. The tile says which metric it read and, when that metric is PC20, that the
value has to be read alongside the protocol it came from. On every result.

## §3 The negative test is the informative one

Its negative predictive value for current symptomatic asthma is high, and that is the main reason
the challenge is done. Printed on a normal result.

## §4 A positive test does not diagnose asthma

Bronchial hyperresponsiveness also occurs in allergic rhinitis, in COPD, after a viral infection,
and in smokers. Printed on every result that is not normal.

## §5 A falsely negative test is usually a drug that was not withheld

Inhaled corticosteroids, bronchodilators, antihistamines and caffeine all blunt the response.
Withholding is an **input**, and a normal result recorded without it gets told so directly — that
is the combination where a negative answer is worth least.

The baseline-FEV₁ threshold and the standard's contraindications are decided before the test and
are not read from the result; the tile says so rather than implying it evaluated them.

## §6 Sourcing (spec-v97 gate)

- Coates AL, Wanger J, Cockcroft DW, et al. *ERS technical standard on bronchial challenge
  testing: general considerations and performance of methacholine challenge tests.* Eur Respir J.
  2017;49(5):1601526.

The European Respiratory Society is not in the tracked-issuer pattern, so no
`docs/citation-staleness.md` row is owed.

## §7 Posture

Decision support, not a verdict. It reads a result against published cutpoints. It does not
diagnose asthma, and it does not decide treatment.

Catalog 1680 → 1681.
