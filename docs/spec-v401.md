# spec-v401.md — Zargar classification (caustic esophagogastric injury) tile

> Status: **SHIPPED (2026-07-17).** Builds the `zargar-caustic` tile — the modified Zargar endoscopic
> classification of caustic / corrosive esophagogastric injury (grades 0/1/2a/2b/3a/3b/4). Catalog
> **1252 → 1253**, group G.

## Why

The GI-endoscopy classification tiles had no grading for a caustic / corrosive ingestion — the injury an
endoscopist grades to gauge stricture risk and guide management. The modified Zargar classification is the
standard. `zargar` / `caustic ingestion grade` / `corrosive injury endoscopy grade` routed to nothing.

## What it does

The clinician picks the grade; the tile reports the grade and its endoscopic description.

- `lib/zargar-caustic-v401.js` — pure grade → description. **0:** normal. **1:** edema / hyperemia. **2a:**
  superficial (erosions, exudate, superficial ulcers). **2b:** deep discrete or circumferential ulceration.
  **3a:** focal necrosis. **3b:** extensive necrosis. **4:** perforation. Accepts 0/1/2a/2b/3a/3b/4 and the
  roman-subgrade forms; bare `2` or `3` is ambiguous → invalid.
- `views/group-v401.js` (RV401) — one select (dom `zargar-grade`), real `<label for>`.
- `lib/meta.js` — Zargar 1991 (Gastrointest Endosc) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v122 → v123); corpus → 1253.

**HIGH-STAKES:** it reports the endoscopic grade the clinician has determined, never a diagnosis, a
management decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Higher grades (2b and above) are
classically associated with a higher stricture risk and worse outcome, but the management decision stays
with the gastroenterology / surgery team.

## Sourcing (spec-v97)

- **Citation:** Zargar SA, Kochhar R, Mehta S, Mehta SK. The role of fiberoptic endoscopy in the management
  of corrosive ingestion and modified endoscopic classification of burns. *Gastrointest Endosc.*
  1991;37(2):165-169.
- Cross-verified against gastroenterology / toxicology references reproducing the same edema-hyperemia (1) /
  superficial (2a) / deep or circumferential (2b) / focal necrosis (3a) / extensive necrosis (3b) /
  perforation (4) grouping.

## Verification

Lint (all catalog-truth surfaces at 1253), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: grade 2b renders "deep or circumferential ulceration," 0/1 flip to normal / edema, 3a/3b/4 to
focal necrosis / extensive necrosis / perforation; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the endoscopy, resolve the a/b sub-grade,
or predict stricture. The MCP adapter + golden-probe promotion follow in a separate wave.
