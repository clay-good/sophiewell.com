# spec-v749.md — The lede that trailed off inside a list of option values

> Status: **SHIPPED (2026-08-18).** Copy only. No tile added, no number changed.
> Catalog stays **1564**.

## Why

spec-v745 taught the lede to cut at the clause boundary a long sentence already carries, but only
on the path that leads with hand-authored copy. The other path — the 1,437 pages that lead with the
first sentence of the adapter summary — still cut at 220 characters and trailed off, usually inside
the parenthetical enumeration of option values that an adapter summary writes for an agent:

> ASTCT consensus cytokine release syndrome (CRS) grading (Lee 2019) after immune-effector-cell /
> CAR-T therapy: given the fever, hypotension level (none / no-vasopressor / one-vasopressor /
> multiple-vasopressors), and…

The reader gets the tool's name and then a list of internal tokens, and the sentence stops without
finishing.

## What changed

One line: when the summary's first sentence is too long to lead with, `leadSentence()` hands it to
the same `clauseLede()` that already served the other path.

| | |
|---|---|
| After | **ASTCT consensus cytokine release syndrome (CRS) grading (Lee 2019) after immune-effector-cell / CAR-T therapy.** |
| Ledes that trail off | 52 → **30** |
| Median lede | 164 → **143** characters |

The 30 that remain have no clause break within range, so they still clamp — honestly marked.

## Proof

`npm run build` (which now runs `check-page-copy.mjs`: longest lede 234 chars, under the 260
ratchet), `npm run test:unit` (11,401), and `static-pages-mobile.spec.js` (18 cases, including the
every-tool-page 320px sweep) clean.

## The lesson worth keeping

Two code paths produced the same visible defect, and fixing one left the other reading exactly as
badly. When a rule is worth writing down, check who else needed it before the commit lands.
