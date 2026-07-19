# spec-v440.md — Barrow classification (carotid-cavernous fistula) tile

> Status: **SHIPPED (2026-07-19).** Builds the `barrow-ccf` tile — the Barrow classification of
> carotid-cavernous fistula, types A/B/C/D. Catalog **1291 → 1292**, group G.

## Why

The catalog had no classification for carotid-cavernous fistula — the standard Barrow angiographic typing
that directs CCF management. `barrow` / `carotid cavernous fistula type` routed to nothing. This fills that
neurovascular / neuroradiology gap.

## What it does

The clinician picks the type; the tile reports the type and its arterial-supply description.

- `lib/barrow-ccf-v440.js` — pure type → description, the four Barrow types by arterial supply and flow. **A:**
  direct high-flow ICA-to-cavernous-sinus shunt (often traumatic). **B:** dural shunt from ICA meningeal
  branches. **C:** dural shunt from ECA meningeal branches. **D:** dural shunt from both. Accepts A-D and 1-4.
- `views/group-v440.js` (RV440) — one select (dom `barrow-type`), real `<label for>`.
- `lib/meta.js` — Barrow 1985 (J Neurosurg) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v161 → v162); corpus → 1292.

**HIGH-STAKES:** it reports the angiographic type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the neurosurgery /
neurointervention team.

## Sourcing (spec-v97)

- **Citation:** Barrow DL, Spector RH, Braun IF, Landman JA, Tindall SC, Tindall GT. Classification and
  treatment of spontaneous carotid-cavernous sinus fistulas. *J Neurosurg.* 1985;62(2):248-256.
- Cross-verified against neuroradiology / neurosurgery references reproducing the same direct-ICA (A) /
  dural-ICA (B) / dural-ECA (C) / dural-both (D) grouping.

## Verification

Lint (all catalog-truth surfaces at 1292), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type A renders "direct high-flow shunt," the other types flip to their descriptions; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the angiogram, choose between observation and
embolization, or estimate outcome. The MCP adapter + golden-probe promotion follow in a separate wave.
