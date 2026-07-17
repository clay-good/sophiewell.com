# spec-v381.md — Winquist-Hansen classification (femoral shaft fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `winquist-hansen` tile — the Winquist-Hansen classification
> of a femoral shaft fracture (types 0-IV). Catalog **1232 → 1233**, group G.

## Why

The catalog carries the proximal-femur eponyms (Garden, Pauwels, Pipkin, Delbet) but not the
Winquist-Hansen grading of a femoral **shaft** fracture — the standard system for the extent of
comminution / cortical contact, which stratifies axial-rotational stability. `winquist` / `femoral shaft
comminution` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type, its comminution/cortical-contact description,
and whether it is a lower-cortical-contact (type III-IV) fracture.

- `lib/winquist-hansen-v381.js` — pure type → description. **0:** no comminution. **I:** small butterfly
  (<25% width); no stability effect. **II:** larger butterfly (<50% width); ≥50% cortical contact.
  **III:** large fragment (>50% width); <50% cortical contact — flagged. **IV:** circumferential, no
  cortical contact — flagged. Accepts 0/I/II/III/IV or 0-4, case-insensitive.
- `views/group-v381.js` (RV381) — one select (dom `wh-type`), real `<label for>`.
- `lib/meta.js` — Winquist 1984 (JBJS) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v102 → v103); corpus → 1233.

**HIGH-STAKES:** it reports the Winquist-Hansen type the clinician has determined from the imaging, never
a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The
falling-cortical-contact gradient (0 → IV) is the classically taught pattern, not an order; the management
(including nail-locking) decision stays with the orthopedic / trauma team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Winquist RA, Hansen ST Jr, Clawson DK. Closed intramedullary nailing of femoral
  fractures. A report of five hundred and twenty cases. *J Bone Joint Surg Am.* 1984;66(4):529-539 (the
  0-IV comminution grades).
- Cross-verified against orthopedic references reproducing the same butterfly-size / cortical-contact
  grading.

## Verification

Lint (all catalog-truth surfaces at 1233), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type III renders the flagged ">50% width / <50% cortical contact" description, type 0 flips to
the "no comminution" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, resolve the segmental variant,
or recommend nail-locking. The MCP adapter + golden-probe promotion follow in a separate wave.
