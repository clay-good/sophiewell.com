# spec-v490.md — Ruedi-Allgower classification (tibial pilon fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `ruedi-allgower-pilon` tile — the Ruedi-Allgower classification
> of tibial pilon (plafond) fractures, types I/II/III. Catalog **1340 → 1341**, group G.

## Why

The ankle fracture tiles (Lauge-Hansen, Weber) had no pilon (plafond) fracture classification. `ruedi allgower`
/ `pilon fracture type` routed to nothing. This fills that ankle gap.

## What it does

The clinician picks the type; the tile reports the type and its articular displacement / comminution
description.

- `lib/ruedi-allgower-pilon-v490.js` — pure type → description, the three Ruedi-Allgower types. **I:**
  nondisplaced cleavage fracture. **II:** significant displacement with minimal comminution. **III:**
  comminution and impaction of the articular surface. Accepts I-III and 1-3.
- `views/group-v490.js` (RV490) — one select (dom `ruedi-type`), real `<label for>`.
- `lib/meta.js` — Ruedi & Allgower 1979 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym). Names rendered ASCII
  ("Ruedi", "Allgower").
- 5 worked-example unit tests + fuzz registration; synonym entry (v210 → v211); corpus → 1341.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic-trauma team.

## Sourcing (spec-v97)

- **Citation:** Ruedi TP, Allgower M. The operative treatment of intra-articular fractures of the lower end of
  the tibia. *Clin Orthop Relat Res.* 1979;(138):105-110. The citation URL is a PubMed term search.
- Cross-verified against orthopedic-trauma references reproducing the same nondisplaced-cleavage (I) /
  displaced-minimal-comminution (II) / comminuted-impacted (III) grouping.

## Verification

Lint (all catalog-truth surfaces at 1341), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "significant displacement of the articular surface, but with minimal comminution," the
other types flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph/CT or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (315).
