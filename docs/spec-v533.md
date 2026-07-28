# spec-v533.md — Renal Angina Index (predicting severe AKI in children) tile

> Status: **SHIPPED (2026-07-28).** Builds the `renal-angina` tile — the risk × injury product predicting
> day-3 severe AKI in critically ill children. Catalog **1382 → 1383**, group G.

## Why

`renal angina` and `basu` were zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`. The `angina` hits
all belong to `ccs-angina`, which is cardiac.

**A different axis from the existing `rifle-aki`, `akin-aki`, and KDIGO staging tiles.** Those **classify an
injury that has already happened**, from a creatinine or urine output that has already moved. The RAI is a
**prediction** made on day 0, at ~12 hours after ICU admission, about whether severe AKI will be present on
day 3 — *before the creatinine has moved*. Staging an injury and predicting one are different questions, and
the whole design of the RAI is to be usable while the staging tools still read normal.

## What it does

**The score is a product, not a sum, and that is the whole idea.** It multiplies a **risk** stratum by an
**injury** stratum — the arithmetic expression of the borrowed cardiology metaphor: chest pain matters more
in someone with coronary risk factors, and a small creatinine change matters more in a transplanted,
ventilated child.

| Risk stratum | Points |
| --- | --- |
| ICU admission | 1 |
| Solid-organ or stem-cell transplant | 3 |
| Invasive mechanical ventilation **AND** vasoactive support within 12 h | 5 |

| eCrCl decrease | Fluid overload | Injury points |
| --- | --- | --- |
| none | <5% | 1 |
| 0 to <25% | 5 to <10% | 2 |
| 25 to <50% | 10 to <15% | 4 |
| ≥50% | ≥15% | 8 |

Use **whichever route is worse**; only one injury score is assigned. **RAI = risk × injury**, and **≥8**
fulfills renal angina.

Adding instead of multiplying would cap the index at **13** instead of 40 and collapse exactly the
interaction it exists to capture — and on the sickest patients it *inverts* the conclusion. A test asserts
5 × 8 = 40 and explicitly not 13.

**The very-high risk stratum is "AND", not "OR".** It needs both ventilation and vasoactive support within
the first 12 hours, though not necessarily simultaneously. Several secondary sources render it as "or", which
would promote every ventilated child to a 5 and roughly triple the positives. A test asserts the wording.

**Only twelve totals are reachable:** 1, 2, 3, 4, 5, 6, 8, 10, 12, 20, 24, 40. There is no RAI of 7, 9, 11,
15, 16, or 32. The tile reports the reachable set rather than implying a continuous 1-40 scale — a reader who
sees "out of 40" will otherwise read a 12 as low-ish when it is the **fourth-highest** value the index can
produce. A test pins both the set and the gaps.

Because of that grid the threshold behaves arithmetically, so the result also states **which injury level the
patient's own risk stratum would need**: at risk 1 only an injury of 8 reaches 8; at risk 3 an injury of 4
suffices; at risk 5 an injury of 2 does. That is more actionable than a bare pass/fail.

- `lib/renal-angina-v533.js` — pure strata → product, positivity, and the reachable set. Exports `RAI_RISK`,
  `RAI_INJURY`, and the derived `RAI_REACHABLE`.
- `views/group-v533.js` (RV533) — two selects (dom `rai-risk`, `rai-injury`) under an **h2** heading, each
  option carrying its full tier definition.
- `lib/meta.js` — Basu and colleagues 2014 citation + accessed date + bands, related to `akin-aki` and
  `rifle-aki`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1383.

**HIGH-STAKES:** the index was designed as a **rule-out**. Its published performance is a high negative
predictive value with a **modest positive** predictive value, so a negative result is the informative one and
a positive result identifies a group worth watching rather than a child who will certainly develop AKI. It
does not diagnose AKI, does not stage it — RIFLE, AKIN, and KDIGO do that — and is not an indication to start
or withhold fluids, diuretics, nephrotoxin avoidance, or renal replacement therapy
([spec-v11](spec-v11.md) §5.3). It was derived and validated in **critically ill children**; a separate adult
adaptation exists with different tiers and a different cut point, and applying this pediatric index to an
adult is **not the same instrument**.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the concept (`renal angina`), the first author (`basu`), and
the neighboring staging systems (`akin`, `rifle`, `kdigo`, `angina`) — each against **both** `corpus.json`
and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan (`akin-aki.test.js`, `rifle-aki.test.js`, and
`ccs-angina.test.js` exist and answer other questions). Both target tokens zero.

## Sourcing (spec-v97)

- **Citation:** Basu RK, Zappitelli M, Brunner L, et al. Derivation and validation of the renal angina index
  to improve the prediction of acute kidney injury in critically ill children. *Kidney Int.*
  2014;85(3):659-667.
- The publisher's full text is not openly accessible; every value was transcribed from companion and
  validation papers — several from the same group — agreeing on the three risk tiers, the four injury tiers
  on both routes, the multiplication rule, and the threshold of 8. Where secondary sources rendered the
  very-high risk tier as "or", the derivation group's own "both within the 12-hour window" wording was
  shipped.
- A widely used **SCr-ratio** variant of the injury axis exists (1.0-1.49× → 2, 1.5-1.99× → 4, ≥2× → 8) and
  is **not arithmetically equivalent** to the eCrCl route. This tile implements the eCrCl route, which is the
  2014 original, and does not mix the two.

## Verification

Lint (all catalog-truth surfaces at 1383), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute eCrCl or the percentage of fluid overload from raw inputs, apply the SCr-ratio
variant, apply the adult adaptation, stage an AKI, or recommend therapy. The MCP adapter + golden-probe
promotion follow in the next wave (358).
