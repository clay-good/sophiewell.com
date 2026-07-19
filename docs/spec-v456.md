# spec-v456.md — Leddy-Packer classification (jersey finger) tile

> Status: **SHIPPED (2026-07-19).** Builds the `leddy-packer` tile — the Leddy-Packer classification of flexor
> digitorum profundus (FDP) avulsion ("jersey finger"), types I/II/III. Catalog **1306 → 1307**, group G.

## Why

The catalog's hand / finger injury tiles (Eaton-Littler thumb CMC, Wassel thumb polydactyly, Geissler carpal)
had no Leddy-Packer grade — the standard grading of the FDP avulsion ("jersey finger"). `leddy` / `jersey
finger` routed to nothing. This fills that hand-injury gap.

## What it does

The clinician picks the type; the tile reports the type and its retraction / bony-fragment description.

- `lib/leddy-packer-v456.js` — pure type → description, the three Leddy-Packer types by retraction level and
  bony fragment. **I:** retraction into the palm (both vincula ruptured, blood supply lost — the most
  time-critical). **II:** retraction to the PIP joint, held by the vinculum longus (the most common). **III:**
  a large bony fragment caught at the A4 pulley. Accepts I-III and 1-3.
- `views/group-v456.js` (RV456) — one select (dom `leddy-type`), real `<label for>`.
- `lib/meta.js` — Leddy & Packer 1977 (J Hand Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v176 → v177); corpus → 1307.

**HIGH-STAKES:** it reports the injury type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the hand /
orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Leddy JP, Packer JW. Avulsion of the profundus tendon insertion in athletes. *J Hand Surg Am.*
  1977;2(1):66-69.
- Cross-verified against hand-surgery / orthopedic references reproducing the same palm-retraction (I) /
  PIP-retraction (II) / bony-fragment-at-A4 (III) grouping. Later authors extended the scheme (type IV: a bony
  fragment with a separate tendon avulsion off the fragment; type V: an associated distal-phalanx fracture);
  this tile grades the three original Leddy-Packer types, noting the extension.

## Verification

Lint (all catalog-truth surfaces at 1307), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type II renders "retracts to the level of the PIP joint," the other types flip to their descriptions;
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph, grade the type IV/V
extensions, or recommend management. The MCP adapter + golden-probe promotion follow in the next wave (281).
