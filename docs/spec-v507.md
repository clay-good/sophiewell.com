# spec-v507.md — Degree of hearing loss (pure-tone average) tile

> Status: **SHIPPED (2026-07-23).** Builds the `hearing-loss-degree` tile — the degree-of-hearing-loss
> classification from a pure-tone average in dB HL. Catalog **1357 → 1358**, group G.

## Why

Second tile of the audiology modality gap that spec-v506 opened. `audiogram` and `hearing loss` were zero-hit
across the whole corpus; the tympanogram tile covered middle-ear function, but nothing banded the hearing
threshold itself — the single number every audiogram report leads with.

## What it does

Unlike the recent enum tiles, this one **computes**: the clinician enters the PTA already averaged from the
audiogram, and the tile returns the degree band it falls in.

- `lib/hearing-loss-degree-v507.js` — pure PTA → degree band. **-10 to 15:** normal. **16 to 25:** slight.
  **26 to 40:** mild. **41 to 55:** moderate. **56 to 70:** moderately severe. **71 to 90:** severe.
  **above 90:** profound. Each band owns its upper cut point (15 is normal, 16 is slight), pinned by a unit
  test. Accepts a string or number; rejects non-numeric input and anything outside -10 to 130 dB HL.
- `views/group-v507.js` (RV507) — one number input (dom `hl-pta`), real `<label for>`, and it surfaces the
  lib's validation message rather than rendering a half-result.
- `lib/meta.js` — Clark 1981 (ASHA) citation + accessed date + grouped bands. No citation-staleness row (a
  named-author article; `ASHA` does not match `ISSUER_PATTERN`'s `\bAHA\b` because of the word boundary).
- 7 worked-example unit tests + fuzz registration; synonym entry (v227 → v228); corpus → 1358.

**HIGH-STAKES:** it bands a number the clinician supplies. It is **not** an audiogram interpretation — it says
nothing about conductive versus sensorineural loss, asymmetry, or configuration — **not** a diagnosis, and
**not** a recommendation for amplification or a cochlear implant ([spec-v11](spec-v11.md) §5.3). Both the tile
copy and the note state this explicitly. The management decision stays with the audiology and ENT team.

## Sourcing (spec-v97)

- **Citation:** Clark JG. Uses and abuses of hearing loss classification. *ASHA.* 1981;23(7):493-500. The
  citation URL is a PubMed term search.
- Cross-verified against audiology references reproducing the same normal / slight / mild / moderate /
  moderately severe / severe / profound cut points in dB HL.

## Verification

Lint (all catalog-truth surfaces at 1358), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: PTA 45 renders "moderate hearing loss," the boundary values flip bands correctly, and an out-of-range
entry shows the validation message; the tile does not scroll horizontally at 320px.

## Out of scope

The tile does not average the audiogram frequencies into a PTA, choose which frequencies to include, separate
air from bone conduction, or handle each ear. Those are separate builds. The MCP adapter + golden-probe
promotion follow in the next wave (332).
