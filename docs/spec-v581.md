# spec-v581 — Shanghai Score System (Brugada syndrome diagnosis)

## What this gives you

The diagnostic criteria for Brugada syndrome, applied correctly — including the two rules that a plain
point-total gets wrong. Enter the highest-scoring finding in each of four categories and the tile returns the
score, the band, and whether the diagnosis is actually met.

## Why it exists

The catalog already had `brugada-vt` — the algorithm that distinguishes ventricular tachycardia from SVT with
aberrancy. Same surname, entirely different question. The score that decides whether a patient *has* Brugada
syndrome was missing. `grep -c "id: 'shanghai-brugada'" app.js` returned 0.

## The two rules that break a naive implementation

| Rule | Consequence |
|---|---|
| **At least one ECG finding is required** | Arrest (3) + relative with definite BrS (2) + probable pathogenic mutation (0.5) = **5.5**, above the 3.5 threshold, and **still non-diagnostic**. |
| **Categories take their maximum, not their sum** | Arrest + nocturnal agonal respirations + syncope is **3** for the clinical category, not 6. Only the four categories add. |

Getting either wrong over-diagnoses a condition whose management can include an implantable defibrillator.

## Scoring

| Category | Items |
|---|---|
| I. ECG (**required**) | Spontaneous type 1 pattern 3.5; fever-induced type 1 3; type 2/3 converting on drug challenge 2 |
| II. Clinical history | Unexplained arrest or documented VF/polymorphic VT 3; nocturnal agonal respirations 2; suspected arrhythmic syncope 2; syncope of unclear mechanism 1; atrial flutter/fibrillation **under 30 years** 0.5 |
| III. Family history | First- or **second**-degree relative with definite BrS 2; suspicious sudden cardiac death 1; unexplained sudden death under 45 with a **negative autopsy** 0.5 |
| IV. Genetics | Probable pathogenic mutation 0.5 |

Maximum 9. Bands: **3.5 or more** probable and/or definite; **2 to 3** possible; **under 2** non-diagnostic.

## Three further oddities the tile surfaces

- **The atrial fibrillation item silently disappears at 30.** The tool requires an age when that item is
  selected, and states plainly when the age zeroes it.
- **Two family items are unusual as published**: second-degree relatives count, and the sudden-death item
  requires a *negative autopsy* — an un-autopsied death does not qualify.
- **Genotype is deliberately de-weighted** to 0.5, one seventh of a spontaneous type 1 pattern, and it cannot
  open the ECG gate.

## Scope (spec-v11 §5.3)

Diagnostic, **not** risk stratification — meeting the criteria is a separate question from arrhythmic risk,
and many patients who meet them are at low risk. The tile does not read the electrocardiogram (the type 1/2/3
morphology is a judgment made before the score), does not select or interpret provocative drug challenge,
does not decide on a defibrillator, and does not evaluate relatives. The top band is labeled "probable and/or
definite" and is never reported as "definite".

## Sourcing (spec-v97)

Items, weights, the ECG requirement and the bands were re-fetched and confirmed against the primary consensus
report and an independent reproduction of the score table, never recalled.

- Antzelevitch C, Yan GX, Ackerman MJ, et al. J-Wave syndromes expert consensus conference report: emerging
  concepts and gaps in knowledge. *Europace.* 2017;19(4):665-694.

## Files

`lib/shanghai-brugada-v581.js`, `views/group-v581.js`, `mcp/adapters/shanghai-brugada-v581.js` (wave 406),
`test/unit/shanghai-brugada.test.js`. Catalog 1430 → 1431; MCP 1367 → 1368.
