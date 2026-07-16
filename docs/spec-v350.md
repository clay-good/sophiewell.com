# spec-v350.md — Tscherne classification (closed-fracture soft-tissue injury) tile

> Status: **SHIPPED (2026-07-16).** Builds the `tscherne-closed` tile — the Oestern-Tscherne
> classification of a closed-fracture soft-tissue injury (grades 0–III / C0–C3). Catalog **1201 →
> 1202**, group G.

## Why

The catalog carries the Gustilo-Anderson open-fracture classification (which grades the soft-tissue
injury of an *open* fracture) but had no closed-fracture counterpart. The Oestern-Tscherne classification
grades the soft-tissue envelope damage of a *closed* fracture — the standard closed-fracture soft-tissue
scale. `tscherne classification` / `closed fracture soft tissue grade` routed to nothing. (Companion-gap
pattern: the fracture-soft-tissue domain has both the open scale (Gustilo) and the closed scale
(Tscherne).)

## What it does

The clinician picks the soft-tissue grade; the tile reports the grade, its description, and whether it is
a higher-energy (grade II–III) injury.

- `lib/tscherne-closed-v350.js` — pure grade → description. **0/C0:** little or no injury (low-energy).
  **I/C1:** superficial abrasion / contusion. **II/C2:** deep contaminated abrasion, local contusion,
  impending compartment syndrome — flagged. **III/C3:** extensive crush, degloving, overt compartment
  syndrome, or major vascular injury — flagged. Accepts 0/I/II/III, C0–C3, or 0–3, case-insensitive.
- `views/group-v350.js` (RV350) — one select (dom `tscherne-grade`), real `<label for>`.
- `lib/meta.js` — Tscherne & Oestern 1982 citation + accessed date + grouped bands. No
  citation-staleness row (the Unfallheilkunde citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v71 → v72); corpus → 1202.

**HIGH-STAKES:** it reports the Tscherne grade the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The primary-fixation (lower grades)
vs staged-treatment (higher grades) association is the classically taught pattern, not an order; a
compartment syndrome is a clinical emergency assessed on its own, and the management decision stays with
the orthopedic / trauma surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Tscherne H, Oestern HJ. Die Klassifizierung des Weichteilschadens bei offenen und
  geschlossenen Frakturen. *Unfallheilkunde.* 1982;85(3):111-115 (the closed C0–C3 grades).
- Cross-verified against orthopedic-trauma references (AO / Radiopaedia / review articles) reproducing
  the same closed grade-0–III soft-tissue definitions.

## Verification

Lint (all catalog-truth surfaces at 1202), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade II / C2) renders the "deep abrasion / impending compartment syndrome" warn
description, grade 0 flips to the "little or no injury" description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read imaging, assess compartment pressures,
or recommend a fixation strategy. The MCP adapter + golden-probe promotion follow in a separate wave.
