# spec-v525.md — CAPD (Cornell Assessment of Pediatric Delirium) tile

> Status: **SHIPPED (2026-07-27).** Builds the `capd` tile — the eight-item observational delirium screen for
> children, total 0-32, positive at 9. Catalog **1373 → 1374**, group G.

## Why

An age-band gap in a category the catalog already covers three times over for adults. `icdsc`, `4at`, and
`nu-desc` are all validated in **adults**; `capd`, `cornell assessment`, and `pediatric delirium` were
zero-hit. The nearest-looking existing tiles are both something else: `sos` is the Sophia Observation
**withdrawal** scale, and `cornell-csdd` is the Cornell Scale for **Depression in Dementia**. A PICU nurse
screening a three-year-old had nothing age-appropriate.

## What it does

Eight observations over a nursing shift, each **0-4**, total **0-32**. **9 or more** is the validated positive
screen.

**The anchors are reversed between the two halves**, which is the error this tile exists to prevent. All eight
items are answered on the same never/rarely/sometimes/often/always scale, but:

| Items | Ask about | never | always |
| --- | --- | --- | --- |
| 1-4 | preserved function (eye contact, purposeful actions, awareness, communication) | **4** | **0** |
| 5-8 | abnormal behavior (restless, inconsolable, underactive, slow to respond) | **0** | **4** |

Reading one direction across all eight inverts the instrument. A test pins exactly that: the well child who
scores **0** through the real anchors scores **16 — a positive screen —** if "always" is read as 4 everywhere.

- `lib/capd-v525.js` — pure answers → total and the positive flag. Exports `CAPD_ITEMS`, each item carrying
  its **own** option list and a `reversed` flag, so the renderer, the adapter, and the tests share one source
  of both the wording and the anchor direction. The invalid-input message names the reversal rather than just
  saying "answer all items".
- `views/group-v525.js` (RV524) — eight selects (dom `capd-q1` … `capd-q8`), each with a real `<label for>`
  and its own anchor texts.
- `lib/meta.js` — Traube and colleagues 2014 citation + accessed date + grouped bands, related to `sos`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1374.

**HIGH-STAKES:** it sums an observer's ratings over one shift. It is **not** a diagnosis of delirium, **not** a
cause, and **not** an indication for antipsychotics, for a sedation change, or for restraint
([spec-v11](spec-v11.md) §5.3). Two things the copy states rather than leaves implicit:

- A positive screen is a prompt to **look for the treatable causes** — pain, withdrawal, hypoxia,
  hypoglycemia, sepsis, seizure, and the sedatives already running. That search is the point of screening,
  not the number.
- Every item is rated against **the child's own developmental baseline**. An infant, and a child with
  developmental delay, is not scored against an adult's idea of purposeful action.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`capd`), the full name (`cornell assessment`),
the concept (`pediatric delirium`), and the bare eponym (`cornell`) — each against **both** `corpus.json` and
`app.js`, plus a `test/unit/` scan. The bare `cornell` probe is the one that mattered: 5 corpus hits and
`cornell-csdd.test.js`, all the depression-in-dementia scale, a different instrument for a different
population.

## Sourcing (spec-v97)

- **Citation:** Traube C, Silver G, Kearney J, et al. Cornell Assessment of Pediatric Delirium: a valid,
  rapid, observational tool for screening delirium in the PICU. *Crit Care Med.* 2014;42(3):656-663.
- Cross-verified against pediatric critical-care references reproducing the same eight items, the same
  reversed anchors between items 1-4 and 5-8, the same 0-32 range, and the same positive cut of 9.

## Build note (concurrent sessions)

Built in an isolated `git worktree` off `origin/main` rather than the shared checkout, because another session
was building its own tiles in the same tree. **Spec numbers, not tile content, are the resource that
collides**, and they collided twice: v523 was claimed while this was being written, then v524 *and* wave 348
were taken while it was being verified. Renumbered to v525 / wave 349 by resetting the branch to the new
`origin/main` and re-applying — cheaper and safer than resolving a rebase conflict across `app.js`,
`lib/meta.js`, and every count surface.

## Verification

Lint (all catalog-truth surfaces at 1374), unit suite (+10 + fuzz), a11y, build — all green.

## Out of scope

The tile does not score the preschool CAPD variant separately, screen for withdrawal (the `sos` tile does
that), or distinguish hypoactive from hyperactive delirium — items 5 and 7 point opposite ways clinically but
both add to one total, which is the instrument's design. The MCP adapter + golden-probe promotion follow in
the next wave.
