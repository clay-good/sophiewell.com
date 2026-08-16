# spec-v739.md — Mayo Classification of Olecranon Fractures

> Status: **SHIPPED (2026-08-16).** Builds the `mayo-olecranon` tile. Catalog **1568 → 1569**, group G.

## Why

The elbow fracture-classification cluster had the Mason-Johnston radial head classification
but not the **Mayo classification of olecranon fractures**. Companion gap in the productive
fracture-classification vein; a published radiographic method (no copyright concern).

## What it does

A decision-logic classifier over three radiographic factors returning a type code **IA–IIIB**:

- **Type I** — undisplaced (under ~3 mm).
- **Type II** — displaced, ulnohumeral joint **stable** (collateral ligaments intact, congruent).
- **Type III** — displaced, ulnohumeral joint **unstable** (a fracture-dislocation).
- **Subtype A** = noncomminuted · **Subtype B** = comminuted.

Displacement separates I from II/III; ulnohumeral stability separates II from III. Stability is
only consulted once the fracture is displaced (Type I is stable by definition).

## Posture (spec-v97)

A radiographic classification read from imaging and the clinical exam; management decisions stay
with the treating surgeon. Decision support, not a verdict.

## Files

- `lib/mayo-olecranon-v739.js` — `mayoOlecranon()`, `MAYO_OLECRANON_NOTE`.
- `views/group-v739.js` (RV739) — three enum selects; a11y-checked, no innerHTML.
- `mcp/adapters/mayo-olecranon-v739.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example (displaced + stable + comminuted → IIB), types + subtypes,
  related (mason-radial-head, hawkins-talar).
- `test/unit/mayo-olecranon.test.js` — 6 tests (each type, A/B subtype, the II-vs-III
  stability discriminator, conditional stability requirement, validation).
- `docs/spec-v739.md` (this file).

## Sourcing (spec-v97)

Morrey BF, Adams RA. Fractures of the proximal ulna and olecranon. In: Morrey BF, ed. *The Elbow
and Its Disorders.* 2nd ed. Philadelphia: WB Saunders; 1993:405-428. Reviewed: Sullivan CW, Desai
K. Classifications in Brief: Mayo Classification of Olecranon Fractures. *Clin Orthop Relat Res.*
2019 (PMID 30614914). The three classifying factors (displacement, ulnohumeral stability,
comminution), the I/II/III boundaries, and the A/B subtype convention were source-verified across
StatPearls, the Classifications-in-Brief review, and Orthobullets. The ~3 mm displacement figure
is the commonly-cited quantification of "displaced"; instability (not a millimeter value) is the
defining feature that promotes a displaced fracture from Type II to Type III.
