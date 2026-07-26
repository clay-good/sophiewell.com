# spec-v487.md — Rockwood classification (acromioclavicular joint injury) tile

> Status: **SHIPPED (2026-07-19).** Builds the `rockwood-ac` tile — the Rockwood classification of
> acromioclavicular (AC) joint injuries, types I-VI. Catalog **1337 → 1338**, group G.

## Why

The shoulder tiles had no AC-joint injury classification. `rockwood ac` / `acromioclavicular injury` routed to
nothing (the existing "Rockwood" match is the Clinical Frailty Scale — a different Rockwood). This fills the
AC-injury gap.

## What it does

The clinician picks the type; the tile reports the type and its ligament-injury / displacement description.

- `lib/rockwood-ac-v487.js` — pure type → description, the six Rockwood types. **I:** AC sprain, ligaments
  intact. **II:** AC torn, CC intact, slight widening. **III:** both torn, CC distance 25-100% increased. **IV:**
  posterior displacement. **V:** gross superior displacement (CC 100-300%). **VI:** inferior displacement.
  Accepts I-VI and 1-6.
- `views/group-v487.js` (RV487) — one select (dom `rockwood-type`), real `<label for>`.
- `lib/meta.js` — Rockwood 1984 (Fractures in Adults) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author book chapter, no guideline-issuer acronym).
- 8 worked-example unit tests + fuzz registration; synonym entry (v207 → v208; AC-focused to avoid the CFS);
  corpus → 1338.

**HIGH-STAKES:** it reports the injury type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Rockwood CA. Injuries to the acromioclavicular joint. In: Rockwood CA, Green DP, eds. *Fractures
  in Adults.* Philadelphia: JB Lippincott; 1984. The citation URL is a PubMed term search.
- Cross-verified against orthopedic references reproducing the same AC-sprain (I) / AC-torn-CC-intact (II) /
  both-torn-25-100% (III) / posterior (IV) / gross-superior-100-300% (V) / inferior (VI) grouping.

## Verification

Lint (all catalog-truth surfaces at 1338), unit suite (+8 + fuzz), build — all green. Verified in a real
browser: type III renders "coracoclavicular distance is increased 25% to 100%," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or recommend management
(nonoperative vs reconstruction). The MCP adapter + golden-probe promotion follow in the next wave (312).
