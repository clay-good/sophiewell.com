# spec-v319.md — Canadian Cardiovascular Society (CCS) angina grade tile

> Status: **SHIPPED (2026-07-15).** Builds the `ccs-angina` tile — the Canadian Cardiovascular Society
> grading of angina pectoris (I–IV). Catalog **1170 → 1171**, group G.

## Why

The catalog used CCS class 4 only as an input flag inside EuroSCORE II (`euroscore2`) and had no standalone
CCS grading tile. CCS is the angina analog of the NYHA functional class and one of the most widely cited
severity grades; `ccs angina` / `canadian cardiovascular society` routed to nothing.

## What it does

The clinician picks the class (I–IV) from the activity that provokes angina; the tile reports the class and
its standard definition.

- `lib/ccs-angina-v319.js` — pure input → class + definition. **I:** ordinary activity does not cause
  angina (only strenuous/rapid/prolonged exertion). **II:** slight limitation (hurrying, uphill, after
  meals, cold, stress, or > 2 blocks / > 1 flight at a normal pace). **III:** marked limitation (1–2 blocks
  or 1 flight at a normal pace). **IV:** angina at rest or with any activity. Accepts numeric 1–4 or roman
  I–IV. Classes III–IV are severe.
- `views/group-v319.js` (RV319) — one select (NYHA/Deauville-style), real `<label for>`.
- `lib/meta.js` — Campeau 1976 citation + accessed date + per-class bands. No citation-staleness row (the
  Circulation citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v40 → v41); corpus → 1171.

**HIGH-STAKES:** it reports the functional class the clinician has determined from the history, never a
diagnosis or a treatment order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

- **Citation:** Campeau L. Grading of angina pectoris [letter]. *Circulation.* 1976;54(3):522-523.
  Cross-verified against the grade table reproduced in Campeau's 30-year-later revisit (Can J Cardiol
  2002;18(4):371-379) and standard references.
- The four classes are defined by the provoking activity as above; the "> 2 blocks / > 1 flight" (class II)
  and "1–2 blocks / 1 flight" (class III) thresholds are the canonical wording.

## Verification

Lint (all catalog-truth surfaces at 1171), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the example (class II) renders the "slight limitation … > 2 blocks / > 1 flight" definition, and
selecting class IV flips the result to the severe "angina at rest" band.

## Out of scope

The tile echoes the class the clinician selects; it does not diagnose angina, quantify ischemia, or choose
therapy. The MCP adapter + golden-probe promotion follow in a separate wave.
