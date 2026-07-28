# spec-v554.md — GAGS (Global Acne Grading System) tile

> Status: **SHIPPED (2026-07-28).** Builds the `gags` tile. Catalog **1403 → 1404**, group G.

## Why

A **whole-concept gap**: `gags`, `acne`, `comedone` and `doshi` were all zero-hit. The catalog had no acne
content of any kind.

## What it does

Six regions, each with a fixed factor, multiplied by a lesion grade 0-4, summed.

| Region | Factor |
| --- | --- |
| Forehead | 2 |
| Right cheek | 2 |
| Left cheek | 2 |
| Nose | 1 |
| Chin | 1 |
| Chest **and** upper back (one region) | 3 |

Factors total 11, so the global score runs **0-44**.

| Grade | Meaning |
| --- | --- |
| 0 | No lesions |
| 1 | At least one comedone |
| 2 | At least one papule |
| 3 | At least one pustule |
| 4 | At least one nodule |

| Score | Severity |
| --- | --- |
| 0 | None |
| 1-18 | Mild |
| 19-30 | Moderate |
| 31-38 | Severe |
| >39 | Very severe |

## The three rules a plausible implementation breaks

**1. The grade is a maximum, never a sum.** The key reads like an additive checklist, so "the forehead has
comedones, papules and a nodule" invites 1+2+4 = 7. It is **4**. Summing lesion types would roughly triple
the score of anyone with mixed disease — which is most patients with acne.

**2. Chest and upper back are one region, not two.** Six regions, not seven. Splitting them would take the
maximum from 44 to 47 and over-weight truncal disease against the face, inverting the intent of factors
derived from surface area and pilosebaceous-unit density.

**3. The published table leaves 39 unassigned — and the tile says so rather than patching it.** Severe is
printed as 31-38 and very severe as **above 39**, so a score of exactly 39 falls in neither. It is
*reachable* (a test constructs it: 8+8+8+4+2+9). Two independent reproductions print the table identically,
so this is the source's own gap, not one publisher's typo — and many tertiary sources silently rewrite the
top band as "≥39", erasing it. The lib returns `bandAssigned: false` with `band: null` at 39 and states what
the primary table prints. Quietly picking a reading would hide a real ambiguity sitting exactly on the
boundary between the two most severe categories, which is where the choice matters most.

## Scope (spec-v11 §5.3)

A severity grading. It does **not** diagnose acne or distinguish it from rosacea, folliculitis, perioral
dermatitis or an acneiform drug eruption — several of which are managed quite differently. It does not
capture the features that change management *independently of severity*: scarring, post-inflammatory
pigmentation, psychological burden, or signs of hyperandrogenism. A low score in a patient who is scarring or
severely distressed is not a reason to withhold treatment. It does not select therapy and is not an
indication for isotretinoin or any antibiotic.

## Files

- `lib/gags-v554.js` — `gags()`, `GAGS_REGIONS`, `GAGS_GRADES`, `GAGS_MAX`, `UNASSIGNED_SCORE`.
- `views/group-v554.js` (RV554) — one select per region under an **h2**, each label showing its factor so the
  multiplication is visible rather than hidden in the total.
- `mcp/adapters/gags-v554.js` — wave 379.
- `test/unit/gags.test.js` — 15 tests, including one that constructs a score of exactly 39.
- `docs/spec-v554.md` (this file).

## Sourcing (spec-v97)

Two independent reproductions of the original table agree on every factor, every grade and every band
boundary — including the gap at 39:

- Doshi A, Zaheer A, Stiller MJ. A comparison of current acne grading systems and proposal of a novel
  system. *Int J Dermatol.* 1997;36(6):416-418.
- Two independent journal reproductions of that table, plus a review confirming the six-region structure.
