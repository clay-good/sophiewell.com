# spec-v368.md — Ross classification (pediatric heart failure) tile

> Status: **SHIPPED (2026-07-17).** Builds the `ross-hf-peds` tile — the Ross classification of heart
> failure in infants and children (classes I–IV). Catalog **1219 → 1220**, group G.

## Why

The catalog now carries the adult NYHA class (`nyha-class`) but had no pediatric counterpart. The Ross
classification is the pediatric functional classification of heart-failure severity — the pediatric
analog to NYHA, comparable class-for-class. `ross classification` / `ross heart failure` / `pediatric
heart failure class` routed to nothing. (Companion-gap: adult NYHA ↔ pediatric Ross, like Karnofsky ↔
Lansky.)

## What it does

The clinician picks the functional class; the tile reports the class, its symptom description, and
whether it is an advanced (class III–IV) heart failure.

- `lib/ross-hf-peds-v368.js` — pure class → description. **I:** no symptoms. **II:** mild tachypnea /
  diaphoresis with feeds (infants) or dyspnea on exertion (older children); no growth failure. **III:**
  marked symptoms with growth failure — flagged. **IV:** symptomatic at rest — flagged. Accepts I/II/III/IV
  or 1–4, case-insensitive.
- `views/group-v368.js` (RV368) — one select (dom `ross-class`), real `<label for>`.
- `lib/meta.js` — Ross 1992 / modified 2012 (Pediatr Cardiol) citation + accessed date + grouped bands.
  No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v89 → v90); corpus → 1220.

**HIGH-STAKES:** it reports the Ross class the clinician has determined from the child's symptoms, never
a diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The class is
symptom-based and can vary visit to visit; the management decision stays with the pediatric cardiology
team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Ross RD, Bollinger RO, Pinsky WW. Grading the severity of congestive heart failure in
  infants. *Pediatr Cardiol.* 1992;13(2):72-75; modified Ross RD. *Pediatr Cardiol.*
  2012;33(8):1295-1300.
- Cross-verified against pediatric-cardiology references reproducing the same class I–IV
  feeding/growth/symptom definitions, comparable with the adult NYHA classes.

## Verification

Lint (all catalog-truth surfaces at 1220), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: class III renders the flagged "marked symptoms with growth failure" description, class I flips to
the "no symptoms" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the class the clinician selects; it does not assess the child or compute the modified
Ross numeric score (the tile reports the functional class). The MCP adapter + golden-probe promotion
follow in a separate wave.
