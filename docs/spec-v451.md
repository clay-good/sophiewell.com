# spec-v451.md — Sade grade (tympanic membrane retraction) tile

> Status: **SHIPPED (2026-07-19).** Builds the `sade-retraction` tile — the Sade classification of pars tensa
> tympanic-membrane retraction, grades I/II/III/IV. Catalog **1302 → 1303**, group G.

## Why

The catalog's otolaryngology tiles (Cotton-Myer, Brodsky, Friedman) had no Sade grade — the standard grading
of tympanic-membrane retraction pockets in otology. `sade` / `tympanic membrane retraction grade` routed to
nothing. This fills that otolaryngology gap.

## What it does

The clinician picks the grade; the tile reports the grade and its otoscopy description.

- `lib/sade-retraction-v451.js` — pure grade → description, the four Sade grades of pars tensa retraction.
  **I:** mild, not touching the incus. **II:** touching the incus or stapes. **III:** touching the promontory
  (atelectasis) but not adherent. **IV:** adherent to the promontory (adhesive otitis media). Accepts I-IV and
  1-4.
- `views/group-v451.js` (RV451) — one select (dom `sade-grade`), real `<label for>`.
- `lib/meta.js` — Sade & Berco 1976 (Ann Otol Rhinol Laryngol) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v172 → v173); corpus → 1303.

**HIGH-STAKES:** it reports the otoscopy grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the otolaryngology
team.

## Sourcing (spec-v97)

- **Citation:** Sade J, Berco E. Atelectasis and secretory otitis media. *Ann Otol Rhinol Laryngol.*
  1976;85(2 Suppl 25 Pt 2):66-72.
- Cross-verified against otology references reproducing the same mild (I) / touching-incus (II) /
  touching-promontory (III) / adherent (IV) grading. This grades pars tensa retraction; pars flaccida (attic)
  retraction is graded separately (the Tos classification) and is out of scope.

## Verification

Lint (all catalog-truth surfaces at 1303), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade III renders "touching the promontory (atelectasis)," the other grades flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not perform otoscopy, grade attic (pars flaccida)
retraction, or recommend management. The MCP adapter + golden-probe promotion follow in a separate wave.
