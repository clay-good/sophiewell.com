# spec-v422.md — SUN anterior chamber flare grade (uveitis) tile

> Status: **SHIPPED (2026-07-18).** Builds the `sun-ac-flare` tile — the SUN (Standardization of Uveitis
> Nomenclature) anterior chamber flare grade, grades 0/1+/2+/3+/4+, the companion scale to the SUN anterior
> chamber cell grade ([spec-v421](spec-v421.md)). Catalog **1273 → 1274**, group G.

## Why

[spec-v421](spec-v421.md) shipped the SUN anterior chamber *cell* grade but not its companion, the anterior
chamber *flare* grade — the other half of how anterior-chamber inflammation is recorded in uveitis.
`SUN anterior chamber flare` / `aqueous flare grade` routed to nothing. This completes the SUN
cell ↔ flare pair.

## What it does

The clinician picks the grade (from the aqueous flare observed at the slit lamp); the tile reports the grade
and its description.

- `lib/sun-ac-flare-v422.js` — pure grade → description, the SUN anterior chamber flare scale (the scatter of
  the slit-lamp beam by anterior-chamber protein). **0:** none. **1+:** faint. **2+:** moderate (iris and
  lens details clear). **3+:** marked (iris and lens details hazy). **4+:** intense (fibrin or plasmoid
  aqueous). Accepts the grades plus the bare numbers and `none` (for 0).
- `views/group-v422.js` (RV422) — one select (dom `sunf-grade`), real `<label for>`.
- `lib/meta.js` — SUN Working Group 2005 (Am J Ophthalmol) citation + accessed date + grouped bands. No
  citation-staleness row (`SUN` is not in the check-citations issuer pattern).
- 7 worked-example unit tests + fuzz registration; synonym entry (v143 → v144); corpus → 1274.

**HIGH-STAKES:** it reports the grade from the flare the clinician has observed, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). It grades flare (protein leak), a separate
scale from anterior chamber cells (activity); the uveitis-management decision stays with the ophthalmology
team.

## Sourcing (spec-v97)

- **Citation:** Jabs DA, Nussenblatt RB, Rosenbaum JT; Standardization of Uveitis Nomenclature (SUN) Working
  Group. Standardization of uveitis nomenclature for reporting clinical data. Results of the First
  International Workshop. *Am J Ophthalmol.* 2005;140(3):509-516.
- Cross-verified against ophthalmology / uveitis references reproducing the same none (0) / faint (1+) /
  moderate (2+) / marked (3+) / intense (4+) flare grouping.

## Verification

Lint (all catalog-truth surfaces at 1274), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: grade 2+ renders "moderate flare (iris and lens details clear)," the other grades flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not examine the eye, grade anterior chamber cells
(the companion scale, `sun-ac-cell`), or recommend treatment. The MCP adapter + golden-probe promotion follow
in a separate wave.
