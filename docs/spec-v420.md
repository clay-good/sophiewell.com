# spec-v420.md — Friedman tongue position (OSA staging) tile

> Status: **SHIPPED (2026-07-18).** Builds the `friedman-tongue` tile — the Friedman tongue position (FTP),
> grades I/II/III/IV, used in obstructive-sleep-apnea staging. Catalog **1271 → 1272**, group G.

## Why

The catalog's airway/otolaryngology tiles (Cotton-Myer subglottic stenosis, Brodsky tonsil size) had no
Friedman tongue position, a standard part of the sleep-surgery exam. `friedman tongue position` / `FTP grade`
routed to nothing. This fills that airway gap.

## What it does

The clinician picks the grade; the tile reports the grade and its visualization description.

- `lib/friedman-tongue-v420.js` — pure grade → description, the base four-grade FTP. **I:** the observer can
  visualize the entire uvula and the tonsils / pillars. **II:** the uvula but not the tonsils / pillars.
  **III:** the soft palate but not the uvula. **IV:** only the hard palate. Accepts I/II/III/IV and 1-4. Some
  sources subdivide grade II into IIa/IIb; the tile reports the widely published base grading.
- `views/group-v420.js` (RV420) — one select (dom `ft-grade`), real `<label for>`.
- `lib/meta.js` — Friedman 2002 (Otolaryngol Head Neck Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v141 → v142); corpus → 1272.

**HIGH-STAKES:** it reports the anatomical grade the clinician has observed, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). It is one input to the Friedman OSA clinical stage
(with tonsil size and BMI), not the stage itself; the management decision stays with the sleep /
otolaryngology team.

## Sourcing (spec-v97)

- **Citation:** Friedman M, Ibrahim H, Bass L. Clinical staging for sleep-disordered breathing. *Otolaryngol
  Head Neck Surg.* 2002;127(1):13-21.
- Cross-verified against sleep-surgery / otolaryngology references reproducing the same uvula-and-tonsils (I)
  / uvula (II) / soft-palate (III) / hard-palate-only (IV) grading.

## Verification

Lint (all catalog-truth surfaces at 1272), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade II renders "the uvula but not the tonsils," the other grades flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not examine the patient, add the tonsil size / BMI
to produce the full Friedman stage, or recommend surgery. The MCP adapter + golden-probe promotion follow in
a separate wave.
