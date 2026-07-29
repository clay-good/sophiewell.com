# spec-v599 — Myxedema coma diagnostic score

## What this gives you

The Popoveniuc diagnostic score for the hypothyroid emergency — with the scoring structure that most
implementations get wrong made explicit, and both published readings of the middle band reported.

## Why it exists

An **axis companion**. `burch-wartofsky` and `jta-thyroid-storm` grade the *hyper*thyroid emergency; the
*hypo*thyroid one had nothing. Every slug spelling and filename search returned 0.

## The structure — two kinds of category

**Single-pick ladders** (one option each):

| Category | Range |
|---|---|
| Thermoregulatory | 0 / 10 / 20 |
| CNS effects | 0 / 10 / 15 / 20 / 30 |
| Gastrointestinal | 0 / 5 / 15 / 20 |
| Bradycardia | 0 / 10 / 20 / 30 |

Precipitating event: +10.

**Additive sub-checklists** (each item adds independently):

- **Cardiovascular** — ECG changes 10, effusion 10, pulmonary edema 15, cardiomegaly 15, hypotension 20 —
  *plus* the bradycardia ladder. **Up to 100 points, more than the entire diagnostic threshold.**
- **Metabolic** — hyponatremia, hypoglycemia, hypoxemia, hypercarbia, reduced GFR, 10 each = **50**.

Maximum **230**.

## The three things worth knowing

- **The threshold of 60 is only ~26% of the maximum.** It sounds like a high bar and is not one.
- **A patient can cross it on non-specific derangement alone.** The five metabolic items total 50 and none
  is specific to hypothyroidism — those five plus a precipitating event total **exactly 60**.
- **The middle band's lower edge is disputed.** The adapted table says 25–59 "supportive"; the primary's
  abstract says 45–59 "at risk". **A score of 30 is "supportive" under one and "unlikely" under the other** —
  flagged with `bandsDisagree` rather than picked silently.

**Derived in 21 patients** (14 cases, 7 controls). The quoted 100% sensitivity / 85.7% specificity are
fragile.

## Scope (spec-v11 §5.3)

A diagnostic aid for a diagnosis that is ultimately **clinical**. It does not select or dose thyroid hormone,
does not decide the intravenous route, and does not decide on corticosteroids — which the source gives
*together* with thyroid hormone, because unrecognized adrenal insufficiency is precipitated by giving thyroid
hormone alone. **Failing to reach the threshold does not exclude myxedema coma**, and treatment should not
wait on a score or on thyroid function tests.

## Sourcing (spec-v97)

Every point value was double-confirmed cell-for-cell across two independent reproductions, which agree on the
entire table and diverge only on the middle band.

- Popoveniuc G, Chandra T, Sud A, et al. *Endocr Pract.* 2014;20(8):808-817.

## Files

`lib/myxedema-coma-v599.js`, `views/group-v599.js`, `mcp/adapters/myxedema-coma-v599.js` (wave 424),
`test/unit/myxedema-coma.test.js`. Catalog 1448 → 1449; MCP 1385 → 1386.
