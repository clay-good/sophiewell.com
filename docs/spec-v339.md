# spec-v339.md — Cormack-Lehane laryngoscopy grade tile

> Status: **SHIPPED (2026-07-16).** Builds the `cormack-lehane` tile — the Cormack-Lehane
> classification of the laryngeal view at direct laryngoscopy (grades 1–4). Catalog **1190 → 1191**,
> group G.

## Why

The catalog carries several difficult-intubation *predictors* (Wilson risk sum, El-Ganzouri, MACOCHA, IDS)
but had no Cormack-Lehane grade — the scale that actually *documents* the laryngeal view obtained at
laryngoscopy, and the reference standard those predictors are validated against. `cormack` / `laryngoscopy
grade` routed to nothing. (Different domain from the recent classification tiles — a deliberate pivot into
airway/anesthesia.)

## What it does

The laryngoscopist picks the grade seen at direct laryngoscopy; the tile reports the grade, its
description, and whether it is a difficult (grade 3–4) view.

- `lib/cormack-lehane-v339.js` — pure grade → description. **1:** most of the glottis visible. **2:** only
  the posterior glottis / arytenoids (modified 2a cords / 2b arytenoids). **3:** only the epiglottis
  (modified 3a liftable / 3b adherent) — difficult. **4:** neither glottis nor epiglottis (only soft
  palate) — difficult. Grades 3–4 are flagged. Accepts numeric 1–4, and the modified 2a/2b/3a/3b subtypes
  map to the parent grade.
- `views/group-v339.js` (RV339) — one select, real `<label for>`.
- `lib/meta.js` — Cormack & Lehane 1984 citation + accessed date + grouped bands. No citation-staleness row
  (the Anaesthesia citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v60 → v61); corpus → 1191.

**HIGH-STAKES:** it reports the laryngeal-view grade the laryngoscopist has observed, never a diagnosis, an
airway-management plan, or an intubation-success prediction ([spec-v11](spec-v11.md) §5.3); the airway plan
stays with the anesthetist / proceduralist.

## Sourcing (spec-v97)

- **Citation:** Cormack RS, Lehane J. Difficult tracheal intubation in obstetrics. *Anaesthesia.*
  1984;39(11):1105-1111 (the original grades 1–4).
- Cross-verified against Yentis SM, Lee DJ (*Anaesthesia* 1998; the 2a/2b subdivision) and Cook TM
  (*Anaesthesia* 2000; the 3a/3b subdivision), surfaced in the tile note.

## Verification

Lint (all catalog-truth surfaces at 1191), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade 3) renders the "only the epiglottis / difficult" warn description, grade 1 flips
to the "most of the glottis" straightforward view, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the laryngoscopist selects; it does not take the modified 2a/2b/3a/3b subtypes as
distinct outputs (they map to the parent grade) or recommend an airway technique. The MCP adapter +
golden-probe promotion follow in a separate wave.
