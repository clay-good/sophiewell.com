# spec-v329.md — Paris endoscopic classification tile

> Status: **SHIPPED (2026-07-15).** Builds the `paris-classification` tile — the Paris endoscopic
> classification of superficial neoplastic lesions (0-Ip … 0-III). Catalog **1180 → 1181**, group G.

## Why

The catalog had no Paris classification tile ("paris classification" had zero corpus hits) — it is the
standard morphology classification for superficial GI lesions (esophagus, stomach, colon) and guides the
resection approach. `paris classification` / `polyp morphology` routed to nothing.

## What it does

The endoscopist picks the morphologic type; the tile reports the type, its description, and whether it is a
higher-risk (depressed/excavated) morphology.

- `lib/paris-classification-v329.js` — pure type → description. **0-Ip:** protruded, pedunculated. **0-Is:**
  protruded, sessile. **0-IIa:** slightly elevated. **0-IIb:** completely flat. **0-IIc:** slightly
  depressed. **0-III:** excavated. Depressed (0-IIc) and excavated (0-III) types are flagged higher-risk
  (higher risk of submucosal invasion). Input is normalized (optional "0-" prefix, case-insensitive).
- `views/group-v329.js` (RV329) — one select, real `<label for>`.
- `lib/meta.js` — Paris 2002/2003 GIE citation + accessed date + grouped bands. No citation-staleness row
  (the GIE citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v50 → v51); corpus → 1181.

**HIGH-STAKES:** it reports the morphologic type the endoscopist has determined, never a diagnosis or a
treatment order ([spec-v11](spec-v11.md) §5.3); the resection decision stays with the endoscopist.

## Sourcing (spec-v97)

- **Citation:** The Paris endoscopic classification of superficial neoplastic lesions: esophagus, stomach,
  and colon: November 30 to December 1, 2002. *Gastrointest Endosc.* 2003;58(6 Suppl):S3-S43 (update:
  *Endoscopy* 2005;37(6):570-578). Cross-verified against secondary reproductions (endoscopy-campus,
  textbooks) of the same 0-I / 0-II / 0-III types and Ip / Is / IIa / IIb / IIc subtypes.
- The endoscopic morphology predicts the depth of invasion: depressed (0-IIc) and excavated (0-III) lesions
  carry a higher risk of submucosal invasion, as published.

## Verification

Lint (all catalog-truth surfaces at 1181), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (0-IIc) renders the "slightly depressed … higher risk of submucosal invasion" band, and
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the endoscopist selects; it does not assign the type from images, describe mixed
patterns (e.g. 0-IIa+IIc) beyond the note, or estimate invasion depth quantitatively. The MCP adapter +
golden-probe promotion follow in a separate wave.
