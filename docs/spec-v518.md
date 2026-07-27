# spec-v518.md — Childhood Asthma Control Test (c-ACT) tile

> Status: **SHIPPED (2026-07-27).** Builds the `childhood-act` tile — the child-and-caregiver asthma control
> questionnaire for ages roughly 4-11, total 0-27. Catalog **1367 → 1368**, group G.

## Why

The companion [spec-v516](spec-v516.md) explicitly named as out of scope, built next because the gap it leaves
is a real safety edge: the adult ACT is validated from age 12 up, so reaching for it with a seven-year-old is
an age-band error with no warning attached. `childhood asthma control`, `c-act`, and `pediatric asthma
control` were all zero-hit.

## What it does

It is **not the adult ACT with easier words** — it is a different instrument with a different shape:

| Group | Items | Range each | Subtotal |
| --- | --- | --- | --- |
| Answered by the **child** (how things are now) | 4 | 0-3 | 0-12 |
| Answered by the **caregiver** (past 4 weeks) | 3 | 0-5 | 0-15 |

Total **0-27**. **19 or less** is not well controlled; **20 or more** is well controlled.

The cut point is the *same number* as the adult ACT but sits on a *different scale*, and the two instruments
have different floors as well as different ceilings — the adult ACT runs 5-25, the c-ACT 0-27. Scoring a c-ACT
out of 25, or an ACT out of 27, is the error the pair exists to prevent, so this tile reports the child and
caregiver subtotals next to the total and both specs state the other's range.

- `lib/childhood-act-v518.js` — pure answers → total plus both subtotals. Exports `CHILD_ITEMS` and
  `PARENT_ITEMS` separately, each item carrying its own option texts, so the renderer, the adapter, and the
  tests share one source of wording *and* the two different maxima. Validates **per group**: a 4 is legal on a
  caregiver item and rejected on a child item.
- `views/group-v518.js` (RV518) — seven selects (dom `cact-c1` … `cact-c4`, `cact-p1` … `cact-p3`) under two
  **h2** section headings naming who answers which, each with a real `<label for>`.
- `lib/meta.js` — Liu and colleagues 2007 citation + accessed date + grouped bands, related to
  `asthma-control-test`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1368.
- Audiences include `patients`: like its adult companion, it is self-administered.

**HIGH-STAKES:** it sums what a child and a caregiver report. It is **not** a diagnosis of asthma, **not** a
measure of lung function, and **not** an indication to step therapy up or down, to start or stop a controller,
or to prescribe oral steroids ([spec-v11](spec-v11.md) §5.3). It does not assess inhaler technique, spacer
use, adherence, trigger exposure, or comorbidities, which decide a step-up as much as the score does, and it
is a **control** measure rather than a **risk** measure.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the instrument name (`childhood asthma control`), both
abbreviations (`c-act`, `cact`), and the concept (`pediatric asthma control`) — each against **both**
`corpus.json` and `app.js`; plus a `test/unit/` scan. The single `c-act` hit in `app.js` is the substring
inside "systemi**c-act**ivity" (the ESSDAI comment), not an instrument.

## Sourcing (spec-v97)

- **Citation:** Liu AH, Zeiger R, Sorkness C, et al. Development and cross-sectional validation of the
  Childhood Asthma Control Test. *J Allergy Clin Immunol.* 2007;119(4):817-825.
- Cross-verified against respiratory references reproducing the same four child items scored 0-3, the same
  three caregiver items scored 0-5, the same 0-27 range, and the same cut of 19 or less.

## Verification

Lint (all catalog-truth surfaces at 1368), unit suite (+9 + fuzz), a11y, build — all green. Two tests exist
purely to pin the difference from the adult companion: the 27 ceiling and the 0 floor.

## Out of scope

The tile does not choose between itself and the adult ACT for a 12-year-old (both are used in that region and
the choice is clinical), score the TRACK or ACQ instruments, or convert a score to a therapy step. The MCP
adapter + golden-probe promotion follow in the next wave (343).
