# spec-v553.md — PUQE-24 tile

> Status: **SHIPPED (2026-07-28).** Builds the `puqe24` tile — Pregnancy-Unique Quantification of Emesis and
> nausea, 24-hour version. Catalog **1402 → 1403**, group G.

## Why

`puqe`, `emesis`, `hyperemesis`, `koren` and `motherisk` were all zero-hit. The `nausea` hits are unrelated
prose in other tiles' symptom lists.

## What it does

Three items over the last 24 hours — hours of nausea, episodes of vomiting, episodes of retching without
bringing anything up — each scored 1 to 5.

| Total | Band |
| --- | --- |
| 6 or less | Mild |
| 7-12 | Moderate |
| 13 or more | Severe |

## The three structural facts

**1. The scale has no zero. The total runs 3-15.** Every item's minimum is 1 point — the "not at all"
answer — so a woman with no nausea, no vomiting and no retching scores **3**. A 0 floor is the
overwhelmingly common shape for a symptom instrument, and assuming it here reads 3 as a mild burden rather
than as the *complete absence* of symptoms, mis-scaling every comparison. The source says a value of 3 means
no nausea, vomiting or retching, and that a lower category would not be meaningful. The lib rejects an
answer of 0 and the message explains the floor.

**2. The well-being item is not part of the total, and runs the opposite way.** The form asks the patient to
rate her well-being from 0 (worst possible) to 10 (as good as before pregnancy). **Higher is better** there;
**higher is worse** on the PUQE score. Summing it would both corrupt the total and invert the contribution
of the one item whose direction disagrees with the rest. Optional, reported separately, never added — a test
asserts the total is unchanged across its whole range.

**3. The bottom-of-scale label diverges, and the tile discloses it at the boundary.** The **numeric**
boundaries are identical in every source: 7 and 13. Only the *name* for the lowest range differs — the
instrument's own figure calls 6 or less "mild", while other renderings label 3 separately as "no nausea and
vomiting of pregnancy" and reserve mild for 4-6. This tile follows the instrument's figure and adds the
alternative reading **only when the total is 3**, the single value where the conventions disagree about what
to call the patient. Claiming 3 is both "mild" and "no NVP" at once, or picking one silently, would both be
worse than stating the divergence where it changes the answer.

## Scope (spec-v11 §5.3)

It quantifies **symptom severity over 24 hours**. It does **not** diagnose hyperemesis gravidarum, which is
a clinical diagnosis involving weight loss, dehydration and electrolyte or ketone disturbance that this
instrument does not measure — a high score supports the picture without establishing it, and a woman can be
severely dehydrated at a moderate score. It does not exclude the other causes of vomiting in pregnancy, some
urgent and unrelated to pregnancy. It does not select an antiemetic, decide on admission or intravenous
fluids, or indicate any treatment.

## Files

- `lib/puqe24-v553.js` — `puqe24()`, `PUQE_ITEMS`, `PUQE_MIN`, `PUQE_MAX`.
- `views/group-v553.js` (RV553) — the three items and the well-being question under separate **h2**
  headings, so the layout does not imply well-being feeds the total.
- `mcp/adapters/puqe24-v553.js` — wave 378.
- `test/unit/puqe24.test.js` — 15 tests, weighted to the floor, the well-being separation, and the
  disclose-only-at-3 rule.
- `docs/spec-v553.md` (this file).

## Sourcing (spec-v97)

All 15 answer options and all 15 point values agree exactly between two independent reproductions of the
form:

- Koren G, Boskovic R, Hard M, Maltepe C, Navioz Y, Einarson A. Motherisk-PUQE scoring system for nausea and
  vomiting of pregnancy. *Am J Obstet Gynecol.* 2002;186(5 Suppl):S228-S231.
- Birkeland E, Stokke G, Tangvik RJ, et al. Norwegian PUQE identifies patients with hyperemesis gravidarum
  and poor nutritional intake. *PLoS One.* 2015;10(4):e0119962 — Figure 1 reproduces the form with
  permission — plus an independent clinical reproduction of the same form.
