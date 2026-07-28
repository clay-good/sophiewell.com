# spec-v572.md — HEAVEN criteria tile

> Status: **SHIPPED (2026-07-28).** Builds the `heaven-criteria` tile. Catalog **1421 → 1422**, group G.

## Why

A **companion gap**. `lemon` and `macocha` are in the catalog, as are Mallampati and Cormack-Lehane. HEAVEN
exists *because* those tools assume a cooperative, largely elective patient — it is the emergency
rapid-sequence-intubation axis of the same question, and unlike them it includes **physiologic** difficulty,
not only anatomic.

## What it does

| | Criterion |
| --- | --- |
| **H** | Hypoxemia — SpO₂ ≤93% **at the time of initial laryngoscopy** |
| **E** | Extremes of size — age ≤8 y, or clinical obesity the operator anticipates will interfere |
| **A** | Anatomic challenge anticipated to limit the laryngoscopic view |
| **V** | Vomit / blood / fluid in the pharynx anticipated to interfere |
| **E** | Exsanguination — **suspected anemia**, not bleeding |
| **N** | Neck — limited cervical range of motion |

## The four rules a plausible implementation breaks

**1. HEAVEN is a count, not a point score, and it has no band table.** Only **two** figures were ever
published — ~94% first-attempt success at 0 criteria, ~43% at ≥5. Everything between exists as a **figure**
in the source papers, never a numeric table. Asked for the rate at 3 criteria, the correct answer is that
none is published. A test sweeps counts 1-4 asserting `publishedAnchor` is null and the result says so.

**2. Four of the six criteria are operator judgment, not measurement** — "anticipated to interfere",
"anticipated to limit", "suspected". Only the hypoxemia threshold and the pediatric age are objective, and
**obesity is deliberately undefined with no BMI threshold**. Supplying one replaces the judgment the
instrument actually asks for.

**3. "Exsanguination" does not mean bleeding — the name is actively misleading.** It means *suspected
anemia*, chronic or acute, scored for its effect on **safe apnea time**. A patient who is not bleeding at
all can meet it; a briskly bleeding patient with a normal hemoglobin may not.

**4. The criteria are assessed at the moment of laryngoscopy, not on arrival.** Hypoxemia and the fluid
criterion both reference the time of initial laryngoscopy, so effective preoxygenation can legitimately
un-score hypoxemia. A count taken on arrival is not a HEAVEN count.

**Two published outcomes, same criteria:** first-pass intubation success (original paper) and a poor
laryngoscopic view, Cormack-Lehane III/IV (later analysis). A figure quoted without its endpoint is
ambiguous.

## Scope (spec-v11 §5.3)

It **anticipates** difficulty. It does not decide whether to intubate, when, or by what technique, and is
not an indication for a surgical airway. **A count of zero does not make an airway safe** — the published
negative predictive value is high but not perfect, and unanticipated difficulty is exactly the scenario
airway planning exists for. It does not replace a difficult-airway plan, backup equipment, or a trained
second operator.

## Files

- `lib/heaven-criteria-v572.js` — `heavenCriteria()`, `HEAVEN_CRITERIA`, `PUBLISHED_ANCHORS`,
  `HYPOXEMIA_THRESHOLD`, `PEDIATRIC_AGE_THRESHOLD`.
- `views/group-v572.js` (RV572) — six selects under an **h2**, each with its own definition below it.
- `mcp/adapters/heaven-criteria-v572.js` — wave 397.
- `test/unit/heaven-criteria.test.js` — 14 tests.
- `docs/spec-v572.md` (this file).

## Sourcing (spec-v97)

Two independent sources agree on every definition and on both numeric thresholds (SpO₂ ≤93%, age ≤8 y).

- Kuzmack E, Inglis T, Olvera D, Wolfe A, Seng K, Davis D. *J Emerg Med.* 2018;54(4):395-401.
- Davis DP, Olvera D, Selde W, et al. *Scand J Trauma Resusc Emerg Med.* 2019;27:21.
