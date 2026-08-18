# spec-v748.md — A gate that reads the page, not the source

> Status: **SHIPPED (2026-08-18).** Tooling only. No tile added, no number changed.
> Catalog stays **1564**.

## Why

Every copy gate in `npm run lint` reads **sources** — adapter summaries, tile descriptions, view
strings. All of them reported clean while this was live on the built site:

| Defect | Scale |
|---|---|
| A 663-character opening line | 27 pages led with a paragraph |
| No worked example | 23 pages showed a result with nothing behind it |
| A raw `<option value>` in the example | 370 rows printed `onevaso`, `mgdl`, `wet` |
| A cut mark on a whole sentence | 743 hub rows said `...` with nothing omitted |

Not one of these was a source defect. Every source string was correct, well-formed, and passed the
gate written for it. Each defect appeared only where correct source text met a template — so the
only place any of them could be seen was the output.

## What changed

`scripts/check-page-copy.mjs` runs at the end of `npm run build`, over `dist/`, and asserts what a
page has to hold **for a reader**:

1. It opens with one readable line.
2. It says what to type in.
3. It shows a worked example, or at minimum states what comes out.
4. It names its source — inside the collapsed disclosure, and not just the disclaimer.

Plus two invariants on the list pages: a row may be clamped, but a clamped row must be *marked*,
and a marked row must actually have been clamped.

Every budget is a **ratchet** set at the measured state, so the numbers can only improve: longest
lede 235 (max 260), 130 raw-value rows, 60 clamped labels. Loosening one is a deliberate edit with
a reason in the diff, not a silent drift.

It runs inside the `unit` CI job, which already runs `npm run build`, so a regression fails in
about three minutes rather than in the 45-minute e2e job.

## Proof

Negative-tested five ways against a mutated `dist/`, each failing with the right message and a
non-zero exit: an inflated lede (348 chars), a citation disclosure emptied to the disclaimer, a
page with its example section removed, a page with its inputs section removed, and a list row
ending in `...`. Restored and clean afterward. `npm run lint`, `npm run test:unit` (11,401), and a
full `npm run build` clean.

## The lesson worth keeping

A gate that reads the input to a template cannot see the output of one. Where a surface is
generated, the check belongs on the generated file — and its thresholds belong at today's measured
value, so the only way the number moves is somebody deciding to move it.
