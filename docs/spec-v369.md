# spec-v369.md — Nohria-Stevenson profiles (acute heart failure) tile

> Status: **SHIPPED (2026-07-17).** Builds the `nohria-stevenson` tile — the Nohria-Stevenson clinical
> hemodynamic profiles for acute heart failure (A / B / C / L). Catalog **1220 → 1221**, group G.

## Why

The catalog carries the invasive Forrester classification (`forrester-hemodynamic`, CI + PCWP) but not
its bedside clinical counterpart. The Nohria-Stevenson classification assigns a hemodynamic profile from
CONGESTION (dry vs wet) and PERFUSION (warm vs cold) on clinical signs alone. `nohria stevenson` / `warm
and wet heart failure` / `hemodynamic profile heart failure` routed to nothing. (Companion-gap: Forrester
is the invasive version; Nohria-Stevenson is the clinical one.)

## What it does

The clinician selects congestion (dry/wet) and perfusion (warm/cold); the tile computes the profile and
flags any profile other than A (compensated). A two-select compute.

- `lib/nohria-stevenson-v369.js` — maps the 2×2. **A** dry-warm (compensated). **B** wet-warm (congested;
  most common ADHF) — flagged. **C** wet-cold (congested + hypoperfused; worst outcomes) — flagged. **L**
  dry-cold (low output) — flagged. Congestion/perfusion enums; invalid inputs guarded.
- `views/group-v369.js` (RV369) — two selects (dom `ns-congestion`, `ns-perfusion`), real `<label for>`.
- `lib/meta.js` — Nohria et al. 2003 (JACC) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v90 → v91); corpus → 1221.

**HIGH-STAKES:** it reports the profile from the congestion and perfusion the clinician has assessed,
never a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The profile-guided
therapy pattern (diurese the wet, support the cold) is the classically taught association, not an order;
the management decision stays with the treating clinician (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Nohria A, Tsang SW, Fang JC, et al. Clinical assessment identifies hemodynamic profiles
  that predict outcomes in patients admitted with heart failure. *J Am Coll Cardiol.*
  2003;41(10):1797-1804.
- Cross-verified against heart-failure references reproducing the same A (dry-warm) / B (wet-warm) / C
  (wet-cold) / L (dry-cold) profiles, with the cold profiles carrying the worst outcomes.

## Verification

Lint (all catalog-truth surfaces at 1221), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: wet + cold renders the flagged "profile C … worst outcomes", dry + warm flips to the un-flagged
"profile A … compensated", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile computes the profile from the entered congestion/perfusion; it does not assess the patient,
measure hemodynamics, or recommend therapy. The MCP adapter + golden-probe promotion follow in a separate
wave.
