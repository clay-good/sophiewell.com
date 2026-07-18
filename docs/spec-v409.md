# spec-v409.md — Ideberg classification (glenoid fossa fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `ideberg-glenoid` tile — the Ideberg classification of
> glenoid-fossa fractures (types I/II/III/IV/V/VI). Catalog **1260 → 1261**, group G.

## Why

The shoulder-fracture classification tiles had no tile for the intra-articular glenoid-fossa fracture. The
Ideberg classification (with the Goss type VI), by which scapular border the fracture line exits, is the
standard. `ideberg` / `glenoid fracture` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type and its exit-border description.

- `lib/ideberg-glenoid-v409.js` — pure type → description. **I:** glenoid rim (Ia anterior, Ib posterior).
  **II:** exits the lateral (axillary) border. **III:** exits the superior border. **IV:** exits the medial
  (vertebral) border. **V:** a combination of II/III/IV. **VI:** severely comminuted (Goss). Accepts
  I-VI, 1-6, and the Ia/Ib, Va-Vc subtypes → base type.
- `views/group-v409.js` (RV409) — one select (dom `idb-type`), real `<label for>`.
- `lib/meta.js` — Ideberg 1984 (+ Goss 1992) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v130 → v131); corpus → 1261.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Displaced articular fractures are classically more
often operative, but the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Ideberg R. Fractures of the scapula involving the glenoid fossa. In: Bateman JE, Welsh RP,
  eds. *Surgery of the Shoulder.* Philadelphia: BC Decker; 1984:63-66; type VI added by Goss TP. Fractures
  of the glenoid cavity. *J Bone Joint Surg Am.* 1992;74(2):299-305.
- Cross-verified against orthopedic references reproducing the same rim (I) / lateral-border (II) /
  superior-border (III) / medial-border (IV) / combination (V) / comminuted (VI) grouping.

## Verification

Lint (all catalog-truth surfaces at 1261), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "exits the lateral (axillary) scapular border," I / III / IV / VI flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the CT, resolve the Ia/Ib or Va-Vc
subtype, or recommend fixation. The MCP adapter + golden-probe promotion follow in a separate wave.
