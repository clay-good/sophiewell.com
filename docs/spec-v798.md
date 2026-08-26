# spec-v798.md — Renal tubular acidosis typing

> Status: **SHIPPED (2026-08-26).** Builds the `rta-type` tile. Catalog **1589 → 1590**,
> group G.

## Why

The catalog had every individual test — `urine-anion-gap`, `fe-bicarbonate`, `delta-gap`,
`corrected-anion-gap`, `winters` — and nothing that put them together into **which type of
RTA this is**. That last step is the one a clinician actually needs, and it is a short fixed
sequence.

## What it does

The typing sequence, **in order**:

| Step | Finding | Type |
| --- | --- | --- |
| 1 | Serum potassium **high** | **4**, hyperkalemic distal |
| 2 | Potassium not high, urine pH **> 5.5** in acidosis | **1**, classic distal |
| 3 | Potassium not high, urine pH **≤ 5.5** | **2**, proximal |

**Order matters**, and a test pins it: a high potassium gives type 4 *even when the urine is
alkaline*. A fractional excretion of bicarbonate above 15% supports type 2 but does not
override the pH-assigned type — also pinned.

The pH boundary is *above* 5.5, so exactly 5.5 is type 2.

## The urine anion gap is deliberately not used to type

This is the interesting part of the spec. The two sources **disagree** on the urine anion gap
in type 4: one gives it as **positive** (ammoniagenesis is impaired), the other's table gives
it as **negative**. Under the spec-v97 gate that is an unresolved disagreement.

They **do** agree on what the gap is actually for — separating a renal cause of a
normal-anion-gap acidosis from gastrointestinal bicarbonate loss. So the tile asks for it,
reports it for exactly that, and never lets it change the assigned type. A test asserts a
positive and a negative gap both leave the type unchanged. The renderer puts it under
"Supporting tests (not used to assign the type)."

**Type 3 is not offered** — a rare combined form, not a step in this sequence.

**Worked example:** low potassium, urine pH 6.2 → **type 1**.

## Posture (spec-v97)

Applies the published sequence to results you already have. It does not replace confirmatory
testing or the search for the underlying cause.

## Files

- `lib/rta-type-v798.js` — `rtaType()`, `RTA_NOTE`.
- `views/group-v798.js` (RV798) — the two discriminators first, supporting tests under their own heading; a11y-checked.
- `mcp/adapters/rta-type-v798.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, the sequence, the anion-gap caveat, related (urine-anion-gap, fe-bicarbonate, delta-gap).
- `test/unit/rta-type.test.js` — 8 tests (type 4 without a pH, potassium checked first, the pH split, the 5.5 boundary, undetermined without a pH, the anion gap never changing the type, FE bicarbonate as supporting only, invalid input).
- `docs/spec-v798.md` (this file).

## Gate note

`check-page-copy` rejected the first draft because **the lede only restated the heading** —
"Renal tubular acidosis typing (types 1, 2 and 4)" under a tile called "Renal Tubular Acidosis
Typing (1, 2, 4)". The summary now opens by saying what the tool is *for* (assigning the type
of a normal-anion-gap metabolic acidosis of renal origin) rather than repeating its own name.

## Sourcing (spec-v97)

*Renal Tubular Acidosis*, StatPearls, NCBI Bookshelf NBK519044; and the Merck Manual
Professional Edition entry. Both give the same typing sequence — potassium first, then urine
pH — and the same FE-bicarbonate threshold of 15% for type 2. Their one disagreement, the
direction of the urine anion gap in type 4, is handled by not typing on it and is stated
above rather than silently resolved.
