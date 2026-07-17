# spec-v402.md — Lauge-Hansen classification (rotational ankle fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `lauge-hansen` tile — the Lauge-Hansen classification of
> rotational ankle fractures by mechanism (SA/SER/PAB/PER/PD). Catalog **1253 → 1254**, group G.

## Why

The catalog carries the anatomic Danis-Weber ankle classification (`weber-ankle`) but had no tile for the
mechanistic classification that pairs with it. The Lauge-Hansen classification groups a rotational ankle
fracture by mechanism (foot position + deforming force) and describes the sequential injuries. `lauge
hansen` / `ankle fracture mechanism` routed to nothing. This is the Weber↔Lauge-Hansen ankle
companion-gap (anatomic ↔ mechanistic).

## What it does

The clinician picks the mechanism; the tile reports the mechanism and its injury-sequence description.

- `lib/lauge-hansen-v402.js` — pure mechanism → description. **SA:** supination-adduction. **SER:**
  supination-external-rotation (the most common; Weber B). **PAB:** pronation-abduction (Weber C). **PER:**
  pronation-external-rotation (Weber C; Maisonneuve if very proximal). **PD:** pronation-dorsiflexion
  (pilon-type). Accepts the codes and the spelled-out mechanism names.
- `views/group-v402.js` (RV402) — one select (dom `lh-mech`), real `<label for>`.
- `lib/meta.js` — Lauge-Hansen 1950 (Arch Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v123 → v124); corpus → 1254.

**HIGH-STAKES:** it reports the mechanism pattern the clinician has determined from the radiographs, never
a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The pattern describes the
injury sequence; the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Lauge-Hansen N. Fractures of the ankle. II. Combined experimental-surgical and
  experimental-roentgenologic investigations. *Arch Surg.* 1950;60(5):957-985.
- Cross-verified against orthopedic / radiology references reproducing the same SA / SER / PAB / PER (/ PD)
  mechanism grouping and the fibula-level correlation with Danis-Weber (SER → Weber B, PAB / PER → Weber C).

## Verification

Lint (all catalog-truth surfaces at 1254), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: SER renders "supination-external-rotation ... Weber B," SA / PAB / PER / PD each flip to their
injury sequence; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the mechanism the clinician selects; it does not read the radiographs, resolve the stage
number within a mechanism, or recommend fixation. The MCP adapter + golden-probe promotion follow in a
separate wave.
