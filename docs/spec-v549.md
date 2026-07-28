# spec-v549.md — POSEIDON classification tile

> Status: **SHIPPED (2026-07-28).** Builds the `poseidon` tile — stratification of low-prognosis patients in
> assisted reproduction. Catalog **1398 → 1399**, group G.

## Why

A **whole-concept gap**. `poseidon`, `oocyte`, `amh`, `afc`, `antral`, `folliculogenesis`, `low-prognosis`
and `ivf` were **all zero-hit** across `corpus.json`, `app.js` and `lib/meta.js`. The catalog had no
reproductive-endocrinology content of any kind, so this opens a specialty rather than filling a gap inside
one.

## What it does

Two axes — **age** and **ovarian reserve** — give four groups.

| | Adequate reserve, prior cycle <10 oocytes | Poor reserve |
| --- | --- | --- |
| **Age <35** | **Group 1** — 1a: <4 oocytes; 1b: 4-9 | **Group 3** |
| **Age ≥35** | **Group 2** — 2a: <4 oocytes; 2b: 4-9 | **Group 4** |

Adequate reserve is **antral follicle count ≥5 and/or AMH ≥1.2 ng/mL**.

## The three shape facts, each of which a plausible implementation gets wrong

**1. Only groups 1 and 2 subdivide.** There is no group 3a or 4b. A four-group scheme in which exactly two
groups split is the shape a model smooths into "all four split", so the lib returns `subdivided: false` for
groups 3 and 4 and a test sweeps every oocyte count against a poor-reserve patient to assert the group
stays `'3'`.

**2. Groups 1 and 2 require a prior conventional-stimulation cycle; groups 3 and 4 do not.** Their defining
feature is an *unexpectedly* poor response, which cannot have happened yet if no cycle has been done. A
patient with adequate reserve and no prior cycle is therefore **not group 1**, and is **not "group 1
pending"** either — she is unclassifiable. The tile returns `classified: false` with the reason rather than
guessing. Groups 3 and 4 are assignable before any stimulation, because poor reserve is measurable up front.

**3. Adequate reserve with ≥10 oocytes is not a POSEIDON group at all.** The scheme describes *low-prognosis*
patients; a normal responder falls outside it. A classifier that always emits a group would label every
patient low-prognosis, inverting the purpose of the classification.

### The markers are alternatives, and discordance is reported

The criterion is AFC ≥5 **and/or** AMH ≥1.2, so either marker suffices. Neither field is individually
required; the tile refuses only when both are absent. When both are supplied and **disagree**, reserve is
graded **adequate** — that is what "and/or" means — and the result sets `markersDiscordant` and says so in
the band. Discordance is common and it decides which half of the scheme applies, so it is surfaced rather
than resolved silently.

## Scope (spec-v11 §5.3)

A descriptive stratification for research and counseling. It does **not** diagnose infertility, does **not**
measure ovarian reserve (it reads markers already measured), does **not** predict whether a given patient
will conceive, and is **not a protocol selector** — no stimulation regimen, gonadotropin dose, adjuvant, or
donor-oocyte decision. The groups describe expected **oocyte yield**, not live birth, and the marker
thresholds are population cut points that perform poorly as individual predictions.

## Files

- `lib/poseidon-v549.js` — `poseidon()`, `POSEIDON_GROUPS`, and the three exported thresholds.
- `views/group-v549.js` (RV549) — age, two optional marker inputs, and the prior-cycle pair under **h2**
  headings.
- `mcp/adapters/poseidon-v549.js` — wave 374. Only `poseidon-age` is required; the rest are conditional and
  the lib asks for what it still needs.
- `test/unit/poseidon.test.js` — 21 tests, weighted toward the three shape facts above.
- `docs/spec-v549.md` (this file).

## Sourcing (spec-v97)

Groups, thresholds and subdivisions re-fetched, never recalled, from two sources agreeing on every criterion:

- Poseidon Group. A new more detailed stratification of low responders to ovarian stimulation: from a poor
  ovarian response to a low prognosis concept. *Fertil Steril.* 2016;105(6):1452-1453.
- Humaidan P, Alviggi C, Fischer R, Esteves SC. The novel POSEIDON stratification of low prognosis patients
  in ART and its proposed marker of successful outcome. *F1000Res.* 2016;5:2911.
