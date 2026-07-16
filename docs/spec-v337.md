# spec-v337.md — Outerbridge cartilage classification tile

> Status: **SHIPPED (2026-07-16).** Builds the `outerbridge-cartilage` tile — the Outerbridge
> classification of articular cartilage damage (grades 0–IV). Catalog **1188 → 1189**, group G.

## Why

The catalog carries the Kellgren-Lawrence radiographic osteoarthritis grade but had no Outerbridge — the
standard arthroscopic / operative grading of chondral (cartilage) damage, the scale a surgeon actually
records at knee/hip arthroscopy. The two are complementary: KL grades the X-ray, Outerbridge grades the
cartilage seen directly. `outerbridge` / `chondromalacia grade` routed to nothing. (Companion-gap pattern:
the osteoarthritis-assessment domain grades both the radiograph and the cartilage.)

## What it does

The surgeon picks the grade seen at arthroscopy; the tile reports the grade, its description, and whether it
is a full-thickness (grade IV) lesion.

- `lib/outerbridge-v337.js` — pure grade → description. **0:** normal. **I:** softening/swelling (surface
  intact). **II:** partial-thickness fissures not reaching bone and ≤ 1.5 cm. **III:** fissuring to
  subchondral bone in an area > 1.5 cm. **IV:** exposed subchondral bone (full-thickness loss) — flagged.
  Accepts roman I–IV or numeric 0–4, case-insensitive.
- `views/group-v337.js` (RV337) — one select, real `<label for>`.
- `lib/meta.js` — Outerbridge 1961 citation + accessed date + grouped bands. No citation-staleness row (the
  JBJS citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v58 → v59); corpus → 1189.

**HIGH-STAKES:** it reports the cartilage grade the surgeon has determined, never a diagnosis, a surgical
recommendation, or an outcome prediction ([spec-v11](spec-v11.md) §5.3); the cartilage-repair / management
decision stays with the surgeon and the patient.

## Sourcing (spec-v97)

- **Citation:** Outerbridge RE. The etiology of chondromalacia patellae. *J Bone Joint Surg Br.*
  1961;43-B(4):752-757 (the original 0–IV grading; the II/III split is by lesion **diameter**, 1.5 cm).
- Cross-verified against "Classifications in Brief: Outerbridge Classification of Chondral Lesions" (*Clin
  Orthop Relat Res* 2018), which reproduces the same definitions and notes the widely used modified
  (depth-based, < 50% vs > 50% thickness) version — surfaced in the tile's note.

## Verification

Lint (all catalog-truth surfaces at 1189), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade IV) renders the "exposed subchondral bone / full-thickness" warn description,
grade 0 flips to "normal articular cartilage," and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the surgeon selects; it does not measure the lesion, distinguish the modified
depth-based version as a separate input, or recommend repair. The MCP adapter + golden-probe promotion
follow in a separate wave.
