# spec-v408.md — Meyers-McKeever classification (tibial eminence fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `meyers-mckeever` tile — the Meyers-McKeever classification
> of tibial intercondylar-eminence fractures (types I/II/III/IV). Catalog **1259 → 1260**, group G.

## Why

The knee-injury classification tiles had no tile for the tibial intercondylar-eminence fracture (the bony
ACL avulsion off the tibia) — a common pediatric/adolescent knee injury. The Meyers-McKeever classification,
by fragment displacement, is the standard. `meyers mckeever` / `tibial eminence fracture` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type and its displacement description.

- `lib/meyers-mckeever-v408.js` — pure type → description. **I:** minimally / non-displaced. **II:**
  anterior beak, hinged posteriorly. **III:** completely displaced, no bony apposition. **IV:** comminuted
  (Zaricznyj modification). Accepts I/II/III/IV and 1-4.
- `views/group-v408.js` (RV408) — one select (dom `mm-type`), real `<label for>`.
- `lib/meta.js` — Meyers-McKeever 1959 (+ Zaricznyj 1977) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v129 → v130); corpus → 1260.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Displaced types (III-IV) are classically more
often operative, but the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Meyers MH, McKeever FM. Fracture of the intercondylar eminence of the tibia. *J Bone Joint
  Surg Am.* 1959;41-A:209-222; type IV added by Zaricznyj B. *J Bone Joint Surg Am.* 1977;59(8):1111-1114.
- Cross-verified against orthopedic references reproducing the same non-displaced (I) / anterior-beak (II) /
  completely-displaced (III) / comminuted (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1260), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "anterior beak / hinged posteriorly," I / III / IV flip to their displacement
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging or recommend fixation vs
nonoperative care. The MCP adapter + golden-probe promotion follow in a separate wave.
