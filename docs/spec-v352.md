# spec-v352.md — Lansky Play-Performance Scale (pediatric functional status) tile

> Status: **SHIPPED (2026-07-16).** Builds the `lansky` tile — the Lansky Play-Performance Scale, the
> observer-rated pediatric functional-status scale (0–100 in steps of 10). Catalog **1203 → 1204**,
> group G.

## Why

The catalog carries the adult performance-status instruments (`ecog-karnofsky`, `pps`) but had no
pediatric analogue. The Lansky Play-Performance Scale is the standard performance score for children
(under ~16), conceptually analogous to the Karnofsky scale. `lansky score` / `lansky play performance
scale` / `pediatric performance status` routed to nothing. (Companion-gap pattern: adults have
Karnofsky/ECOG/PPS; children use Lansky.)

## What it does

The clinician picks the score describing the child's usual play and activity; the tile reports the score,
its play/activity description, the coarse functional band, and whether it is a reduced (0–40) status.

- `lib/lansky-v352.js` — pure score → description + band. **80–100:** able to carry on normal activity.
  **50–70:** reduced activity but up and about. **0–40:** mostly bedbound / disabled — flagged. Accepts
  a multiple of 10 from 0 to 100 (string or number); off-step or out-of-range is guarded.
- `views/group-v352.js` (RV352) — one select (dom `lansky-score`), real `<label for>`.
- `lib/meta.js` — Lansky et al. 1987 (Cancer) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v73 → v74); corpus → 1204.

**HIGH-STAKES:** it reports the Lansky score the clinician has determined, never a diagnosis, a
treatment/eligibility decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). Trial-eligibility
thresholds (e.g. Lansky ≥ 60, analogous to Karnofsky ≥ 60) are protocol-specific; the assessment stays
with the treating clinician (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Lansky SB, List MA, Lansky LL, Ritter-Sterr C, Miller DR. The measurement of performance
  in childhood cancer patients. *Cancer.* 1987;60(7):1651-1656 (the original 0–100 play-performance
  definitions).
- Cross-verified against pediatric-oncology references (COG / trial protocols) reproducing the same
  11-level scale.

## Verification

Lint (all catalog-truth surfaces at 1204), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (score 60) renders the "up and around, minimal active play" description with the
"reduced activity but up and about" band, score 30 flips to the flagged "in bed / needs assistance"
disabled band, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the score the clinician selects; it does not assess the child, apply a trial's eligibility
threshold, or recommend treatment. The MCP adapter + golden-probe promotion follow in a separate wave.
