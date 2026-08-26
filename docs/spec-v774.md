# spec-v774.md — Boston Carpal Tunnel Questionnaire (BCTQ)

> Status: **SHIPPED (2026-08-26).** Builds the `bctq` tile. Catalog **1565 → 1566**, group G.

## Why

spec-v773 added CTS-6, which answers *is this carpal tunnel syndrome*. The BCTQ answers the
other axis: *how bad is it, and is it getting better*. It is the standard patient-reported
outcome measure in carpal tunnel trials and the natural companion to CTS-6.

## What it does

Two independent scales, each rated 1 (none / no difficulty) to 5 (very severe):

| Scale | Items | Score |
| --- | --- | --- |
| Symptom Severity Scale | 11 symptom items | mean of the 11 (range 1–5) |
| Functional Status Scale | 8 everyday hand activities | mean of the 8 (range 1–5) |

Higher is more severe on both. **The two scales are reported separately and are never added
together** — the tile enforces this by returning two means and no combined total.

**Worked example:** all 11 symptom items rated 3, all 8 activities rated 2 → symptom severity
**3.00 of 5**, functional status **2.00 of 5**.

Item wording is copyrighted, so the tile shows neutral topic labels only (night pain,
buttons, jars, and so on). Scoring is positional, so the labels carry no scoring weight.

## Posture (spec-v97)

A severity and function measure for following change over time in one patient. Not a
diagnostic test, not a substitute for nerve conduction studies, and not an order for
splinting, injection or surgery. The tile asserts no diagnostic cutoff — the 1993 source
publishes none — and describes only where a score sits in the 1–5 range.

## Files

- `lib/bctq-v774.js` — `bctq()`, `BCTQ_NOTE`.
- `views/group-v774.js` (RV774) — nineteen 1–5 selects under two h2 sections; a11y-checked.
- `mcp/adapters/bctq-v774.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both scales, related (cts6, quickdash, geissler-carpal).
- `test/unit/bctq.test.js` — 5 tests (floor, ceiling, worked example, scale independence, invalid input).
- `docs/spec-v774.md` (this file).

## Sourcing (spec-v97)

Levine DW, Simmons BP, Koris MJ, et al. *J Bone Joint Surg Am.* 1993;75(11):1585-1592
(PMID 8245050). The 11/8 item split, the 1–5 rating range, and mean-per-scale scoring were
confirmed against the APTA test-and-measure entry and a published validation study, which
agreed on all three.
