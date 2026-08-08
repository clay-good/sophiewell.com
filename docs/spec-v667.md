# spec-v667.md — FGSI (Fournier's Gangrene Severity Index)

> Status: **SHIPPED (2026-08-08).** Builds the `fgsi` tile. Catalog **1497 → 1498**, group G.

## Why

A companion gap in the critical-care severity vein. The catalog had APACHE II (`apache2`) and SAPS II
(`saps-ii`), but not the FGSI — the disease-specific severity index for Fournier gangrene, built on the same
APACHE-II acute-physiology score.

## What it does

FGSI is the **acute-physiology portion of APACHE II applied to 9 parameters**, each scored 0–4 by deviation
from normal in either direction, summed to **0–36**:

temperature, heart rate, respiratory rate, serum sodium, potassium, creatinine, hematocrit, WBC, and serum
bicarbonate (APACHE II's standard substitute for arterial pH). It drops APACHE II's mean arterial pressure,
oxygenation, and Glasgow Coma Scale.

A total **> 9 predicts high mortality** (the original series: survivors averaged ~6.9, non-survivors ~13.5). An
**acute-renal-failure** toggle doubles the creatinine points (the APACHE II rule), raising the maximum to 40;
it is exposed explicitly because some published FGSI implementations omit it.

## Key implementation decision (spec-v97)

The eight parameter bands shared with APACHE II are **reused verbatim from the repo's own verified `apache2`**
(lib/scoring-v6.js) rather than transcribed from a paywalled/reconstructed table — the source subagent could
not access the primary tables directly and flagged one bicarbonate band, so anchoring to the in-repo verified
bands is the safer choice. The ninth (serum bicarbonate) uses the standard APACHE II HCO3 substitution row, with
the 32–40.9 → +1 band confirmed (it mirrors the pH 7.5–7.59 → +1 row).

## Files

- `lib/fgsi-v667.js` — `fgsi()`, `FGSI_PARAMS`, `FGSI_NOTE`.
- `views/group-v667.js` (RV667) — nine numeric inputs + an acute-renal-failure checkbox; a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/fgsi-v667.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/fgsi.test.js` — 6 tests (9 params / all-normal 0, band scoring incl. the HCO3 32–40.9→+1 check,
  creatinine doubling, > 9 threshold boundary, example = 17, required inputs).
- `docs/spec-v667.md` (this file).

## Sourcing (spec-v97)

Laor E, Palmer LS, Tolia BM, Reid RE, Winter HI. Outcome prediction in patients with Fournier's gangrene. *J
Urol.* 1995;154(1):89-92 (PMID 7776464). A source-verification subagent confirmed the 9 parameters, the > 9
threshold, the survivor/non-survivor means, and the creatinine-doubling rule; the numeric bands are anchored to
the repo's verified `apache2` implementation (Knaus 1985 APACHE II tables) plus the standard bicarbonate row.
