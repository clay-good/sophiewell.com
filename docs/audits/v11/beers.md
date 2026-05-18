# v11 audit - Beers Criteria Drug-Condition Lookup (`beers`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: American Geriatrics Society Beers Criteria(R) for Potentially Inappropriate Medication Use in Older Adults; 2023 AGS Beers Criteria(R) Update Expert Panel. J Am Geriatr Soc. 2023;71(7):2052-2081. Drug-condition pairs are clinical facts; AGS publishes the authoritative formatted list. Sophie's bundled brief notes are project-author paraphrases (not AGS-quoted prose).

## Shard integrity
- Backed by `data/clinical/beers.json`; manifest hash present and covered by `scripts/verify-integrity.mjs`.

## Boundary examples added
- Per spec-v11 §3.3 step 10, sampled lookups across drug classes:
  - "benzodiazepine": avoid in older adults; risk of cognitive impairment, delirium, falls, fractures. PASS (matches META example expected).
  - "diphenhydramine" (first-gen antihistamine): avoid; strongly anticholinergic. PASS.
  - "nsaid": avoid chronic use; GI bleeding, AKI, HTN. PASS.
  - "glyburide" (long-acting sulfonylurea): avoid; hypoglycemia risk. PASS.
  - Unmatched query "xyz123": returns no-matches message rather than empty render. PASS.

## Cross-implementation differential
- N/A for lookup tile. Bundled rows cross-checked against the 2023 AGS Beers Criteria(R) Table 2 (drug-condition) and Table 3 (drug-drug) entries; sampled rows match the AGS-published guidance.

## Edge-input handling notes
- Free-text search input is case-insensitive substring match over drug + class + condition; empty input renders the full list.
- The visible attribution that AGS owns the authoritative list (Sophie surfaces a derivative summary) is in META.citation.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Search input is labelled; result table is keyboard-reachable; live region announces match counts. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
