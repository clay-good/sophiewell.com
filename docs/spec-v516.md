# spec-v516.md — Asthma Control Test (ACT) tile

> Status: **SHIPPED (2026-07-27).** Builds the `asthma-control-test` tile — the five-item patient-reported
> measure of asthma control, total 5-25. Catalog **1365 → 1366**, group G.

## Why

The catalog's asthma tiles (`pass-asthma`, `pram-asthma`) score **acute severity** in a child in front of you.
The ACT answers a different question — how well controlled has this patient's asthma been *between* visits —
and it was absent: `asthma control test`, `well controlled`, `juniper`, and `aqlq` were all zero-hit across
`corpus.json`. It is the number a primary-care or pulmonary visit opens with.

## What it does

Five patient-rated items about the past four weeks, each **1-5**, and every item runs the same direction:
**5 is always the best answer**. Total **5-25**.

| Total | Band |
| --- | --- |
| 25 | Totally controlled |
| 20-24 | Well controlled |
| 19 or less | Not well controlled |

- `lib/asthma-control-test-v516.js` — pure answers → total and band. Exports `ACT_ITEMS`, each carrying its
  **own five anchor labels** (item 2's "5" is "not at all", item 1's is "none of the time"), so the renderer,
  the adapter, and the tests share one source of that wording rather than a generic 1-5 scale.
- `views/group-v516.js` (RV516) — five selects (dom `act-q1` … `act-q5`), each with a real `<label for>` and
  its own anchor texts.
- `lib/meta.js` — Nathan and colleagues 2004 citation + accessed date + grouped bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 8 worked-example unit tests + fuzz registration; synonym entry; corpus → 1366.
- Audiences include `patients`: this is a self-administered questionnaire, unlike the clinician-rated tiles
  shipped alongside it.

**There is no zero on this scale.** The floor is 5, not 0, and a 0 on any item is rejected with a message that
says so — the one input error a caller used to 0-based instruments will actually make.

**HIGH-STAKES:** it sums what the patient reports. It is **not** a diagnosis of asthma, **not** a measure of
lung function (a well-controlled score can sit alongside abnormal spirometry), and **not** an indication to
step therapy up or down, to start or stop a controller, or to prescribe oral steroids
([spec-v11](spec-v11.md) §5.3). It does not assess inhaler technique, adherence, trigger exposure, or
comorbidities, which decide a step-up as much as the score does, and it is a **control** measure rather than a
**risk** measure: it does not estimate the risk of a future exacerbation.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the instrument name (`asthma control test`), the abbreviation
in context (`act asthma`), the concept (`well controlled`), and the neighbouring instruments (`acq`,
`juniper`, `aqlq`) — each against **both** `corpus.json` and `app.js`; plus a `test/unit/` and `lib/` scan.
The existing asthma tiles were read directly to confirm they score acute severity, not control. (A bare `act`
grep is useless here — 614 hits, all the English word.)

## Sourcing (spec-v97)

- **Citation:** Nathan RA, Sorkness CA, Kosinski M, et al. Development of the Asthma Control Test: a survey
  for assessing asthma control. *J Allergy Clin Immunol.* 2004;113(1):59-65.
- Cross-verified against respiratory references reproducing the same five items, the same 1-5 per-item
  anchors, the same 5-25 range, and the same cut of 19 or less for not well controlled.

## Verification

Lint (all catalog-truth surfaces at 1366), unit suite (+8 + fuzz), a11y, build — all green.

## Out of scope

The tile does not score the childhood ACT (a different four-item-plus-three instrument), the ACQ, or the
GOLD/GINA assessment steps, and it does not convert a score to a therapy step. The MCP adapter + golden-probe
promotion follow in the next wave (341).
