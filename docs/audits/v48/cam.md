# v48 derivation provenance — CAM (`cam`) — formula-only

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3d
- Citation re-verified against: Inouye SK, van Dyck CH, Alessi CA, Balkin S, Siegal AP, Horwitz RI. *Clarifying confusion: the confusion assessment method. A new method for detection of delirium.* Ann Intern Med. 1990;113(12):941-948.

## Why formula-only

CAM is an **algorithm**, not an additive score. Delirium is suggested by the boolean expression `(F1 AND F2) AND (F3 OR F4)`. Reducing this to an additive `components` array would misrepresent the algorithm — the four features do not contribute *additive* points, they participate in a boolean clause.

Therefore wave 48-3d ships CAM as a formula-only derivation block (no `components`), following the MELD-3.0, GUSS, and MEOWS precedents.

## Formula — verbatim source mapping

From Inouye 1990 Table 1 ("The Confusion Assessment Method algorithm"):

```
Delirium present when ALL of:
  Feature 1: Acute onset and fluctuating course   AND
  Feature 2: Inattention                           AND
  EITHER
    Feature 3: Disorganized thinking            OR
    Feature 4: Altered level of consciousness
```

Boolean: `(F1 AND F2) AND (F3 OR F4)`.

## Bands

| Algorithm output | Sophie label |
|---|---|
| 0 (negative) | CAM negative — features 1+2 and (3 or 4) NOT all present |
| 1 (positive) | CAM positive — features 1+2 AND (3 OR 4) present; delirium suggested |

## Population

Inouye 1990: derivation in 26 hospitalized patients aged ≥65; validation in 30 patients against psychiatrist-administered DSM-III-R delirium diagnosis. Subsequent validation in tens of thousands of patients across medical, surgical, ED, and post-acute settings.

## Validity

Adult hospitalized patients aged ≥65 (also valid in younger adults). CAM is a SCREEN — a positive screen prompts clinical confirmation against DSM criteria. The Sophie derivation block ships formula-only because the algorithm is a boolean expression, not an additive sum. The Sophie tile separately surfaces each feature and the algorithm evaluation. **CAM-ICU** (a separate Sophie tile) is the ICU adaptation for mechanically ventilated / unable-to-speak patients.

## Source quote

"The CAM ... uses 4 cardinal features of delirium identified from the DSM-III-R criteria: (1) acute onset and fluctuating course, (2) inattention, (3) disorganized thinking, and (4) altered level of consciousness. The diagnosis of delirium by CAM requires the presence of features 1 and 2 and either 3 or 4." — Inouye 1990 §Methods.

## Renderer assertions

Verified locally:
- `META.cam.derivation` has every required field per `lib/derivation.js validate()`.
- `components` is intentionally absent — the schema test asserts this is the formula-only shape.
- `bands` correctly use the two-tier negative / positive stratification.

## Defects opened
None.
