# spec-v374.md — Pauwels classification (femoral neck fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `pauwels-femoral-neck` tile — the Pauwels classification of
> a femoral neck fracture (types I–III). Catalog **1225 → 1226**, group G.

## Why

The catalog carries the Garden classification of femoral neck fractures (`garden-classification`, by
displacement) but not the Pauwels classification — the classic biomechanical grading by the angle of the
fracture line from the horizontal (the compression-vs-shear balance). `pauwels` / `pauwels
classification` / `femoral neck fracture angle` routed to nothing. (Companion-gap: Garden grades by
displacement, Pauwels by shear angle.)

## What it does

The clinician picks the type; the tile reports the type, its angle/force description, and whether it is a
high-shear (type III) pattern.

- `lib/pauwels-femoral-neck-v374.js` — pure type → description. **I:** < 30° (compression dominant, most
  stable). **II:** 30–50° (shear appears, intermediate). **III:** > 50° (shear dominant, highest nonunion
  / AVN risk) — flagged. Accepts I/II/III or 1–3, case-insensitive.
- `views/group-v374.js` (RV374) — one select (dom `pauwels-type`), real `<label for>`.
- `lib/meta.js` — Pauwels 1935 citation + accessed date + grouped bands. No citation-staleness row (the
  citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v95 → v96); corpus → 1226.

**HIGH-STAKES:** it reports the Pauwels type the clinician has determined from the radiograph, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The rising-nonunion-risk
association (I → III) is the classically taught pattern, not an order; the fixation / osteotomy decision
stays with the orthopedic surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Pauwels F. Der Schenkelhalsbruch, ein mechanisches Problem. Stuttgart: Ferdinand Enke;
  1935 (the original type I–III angle thresholds).
- Cross-verified against orthopedic references (OrthopaedicsOne / Radiopaedia / "An update on the Pauwels
  classification") reproducing the same < 30 / 30–50 / > 50 degree thresholds and the compression-to-shear
  gradient.

## Verification

Lint (all catalog-truth surfaces at 1226), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type III renders the flagged "> 50° / shear dominant / nonunion" description, type I flips to
the "< 30° / compression dominant" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not measure the fracture angle, read imaging, or
recommend a fixation construct. The MCP adapter + golden-probe promotion follow in a separate wave.
