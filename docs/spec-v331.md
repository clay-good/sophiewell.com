# spec-v331.md — Fitzpatrick skin phototype tile

> Status: **SHIPPED (2026-07-15).** Builds the `fitzpatrick-skin-type` tile — the Fitzpatrick skin
> phototype (I–VI). Catalog **1182 → 1183**, group G.

## Why

The catalog carries many dermatology severity tiles (PASI, EASI, SCORAD, SCORTEN, DLQI, UAS7) but had no
Fitzpatrick phototype — the standard classification of constitutive skin color by UV response, used to
stratify photosensitivity, skin-cancer risk, phototherapy dosing, and laser settings. `fitzpatrick` / `skin
type` / `phototype` routed to nothing.

## What it does

The clinician picks the phototype from the skin's sunburn/tan response; the tile reports the type, its
description, and whether it is a higher-photosensitivity (type I–II) skin.

- `lib/fitzpatrick-v331.js` — pure type → description. **I:** always burns, never tans. **II:** usually
  burns, tans minimally. **III:** sometimes burns, tans gradually. **IV:** burns minimally, tans well.
  **V:** rarely burns, tans darkly. **VI:** never burns, deeply pigmented. Types I–II are flagged
  higher-photosensitivity. Accepts roman I–VI or numeric 1–6.
- `views/group-v331.js` (RV331) — one select, real `<label for>`.
- `lib/meta.js` — Fitzpatrick 1988 citation + accessed date + grouped bands. No citation-staleness row (the
  Arch Dermatol citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v52 → v53); corpus → 1183.

**HIGH-STAKES:** it reports the phototype the clinician has determined, never a diagnosis or a treatment
order ([spec-v11](spec-v11.md) §5.3); the sun-protection, phototherapy, and laser decisions stay with the
clinician.

## Sourcing (spec-v97)

- **Citation:** Fitzpatrick TB. The validity and practicality of sun-reactive skin types I through VI.
  *Arch Dermatol.* 1988;124(6):869-871. Cross-verified against DermNet / StatPearls reproductions of the
  same I–VI sunburn/tan descriptions.
- The six phototypes are defined by the UV sunburn/tan response as above; the scale is stable.

## Verification

Lint (all catalog-truth surfaces at 1183), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the example (type III) renders the "sometimes burns, then tans gradually" description, and the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the phototype the clinician selects; it does not estimate MED (minimal erythema dose),
compute a phototherapy dose, or predict skin-cancer risk quantitatively. The MCP adapter + golden-probe
promotion follow in a separate wave.
