# spec-v359.md — NPIAP pressure injury staging tile

> Status: **SHIPPED (2026-07-16).** Builds the `pressure-injury-stage` tile — NPIAP pressure injury
> staging (Stage 1–4, Unstageable, Deep Tissue Pressure Injury). Catalog **1210 → 1211**, group G.

## Why

The catalog carries the Braden Scale (pressure-injury *risk*) and the Bates-Jensen wound assessment, but
not the NPIAP *staging* — the standard classification of a pressure injury by depth of tissue loss once
an injury has developed. It is used constantly at the bedside by nursing (a primary audience). `pressure
injury stage` / `pressure ulcer stage` / `npiap stage` routed to nothing.

## What it does

The clinician/nurse picks the stage; the tile reports the stage, its depth-of-tissue-loss description,
and whether it is a full-thickness or serious (Stage 3–4 / Unstageable / DTPI) injury.

- `lib/pressure-injury-stage-v359.js` — pure stage → description. **1:** non-blanchable erythema, intact
  skin. **2:** partial-thickness loss, exposed dermis. **3:** full-thickness loss (fat may show) —
  flagged. **4:** full-thickness loss, fascia/muscle/bone exposed — flagged. **Unstageable:** obscured by
  slough/eschar — flagged. **DTPI:** persistent non-blanchable deep discoloration — flagged. Accepts
  1–4 / roman I–IV / `unstageable` (`u`) / `dtpi` (`dti`), case-insensitive.
- `views/group-v359.js` (RV359) — one select (dom `pi-stage`), real `<label for>`.
- `lib/meta.js` — Edsberg et al. 2016 (JWOCN) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym; NPIAP/NPUAP are not in
  ISSUER_PATTERN).
- 5 worked-example unit tests + fuzz registration; synonym entry (v80 → v81); corpus → 1211.

**HIGH-STAKES:** it reports the NPIAP stage the clinician has determined from the wound, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Staging describes tissue
loss, not healing (a healing wound is not reverse-staged); the care decision stays with the wound-care
team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Edsberg LE, Black JM, Goldberg M, McNichol L, Moore L, Sieggreen M. Revised National
  Pressure Ulcer Advisory Panel Pressure Injury Staging System. *J Wound Ostomy Continence Nurs.*
  2016;43(6):585-597 (the 2016 revision: "injury" not "ulcer", Arabic numerals, DTPI without
  "suspected").
- Cross-verified against NPIAP and wound-care references reproducing the same Stage 1–4 / Unstageable /
  DTPI definitions.

## Verification

Lint (all catalog-truth surfaces at 1211), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (Stage 3) renders the "full-thickness skin loss" warn description, Stage 1 flips to
the "non-blanchable erythema" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not assess the wound, recommend a dressing, or
predict healing. The MCP adapter + golden-probe promotion follow in a separate wave.
