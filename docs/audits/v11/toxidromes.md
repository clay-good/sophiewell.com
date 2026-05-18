# v11 audit - Toxidrome Reference (`toxidromes`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC/ATSDR toxicological profiles and standard medical toxicology references (Goldfrank's Toxicologic Emergencies, current edition; Tintinalli's Emergency Medicine, 9th ed. toxicology chapters). Bundled shard `data/toxidromes/toxidromes.json`.

## Boundary examples added (coverage rows per spec-v11 §3.3 step 10)
Pure data-render tile; the shard ships canonical toxidromes:
- Cholinergic: SLUDGE/BBB signs; organophosphates / carbamates / nerve agents / muscarinic mushrooms; atropine + pralidoxime. PASS (matches Goldfrank Ch. organophosphates).
- Anticholinergic: hyperthermia, dry skin, mydriasis, delirium, urinary retention, decreased bowel sounds; antihistamines / TCAs / jimsonweed / atropine; supportive, physostigmine in select cases. PASS.
- Sympathomimetic: tachycardia/HTN/hyperthermia/mydriasis/agitation/diaphoresis vs anticholinergic dry skin; cocaine/amphetamines; benzodiazepines + cooling. PASS.
- Opioid: CNS + respiratory depression, miosis, hypotension, decreased bowel sounds; naloxone titration. PASS.
- Coverage spans cholinergic, anticholinergic, sympathomimetic, and opioid toxidromes (the four classic textbook syndromes).

## Cross-implementation differential
- Reference implementation: Goldfrank's Toxicologic Emergencies 11th ed., toxidrome quick-reference table.
- Test case: cholinergic row.
- Sophie result: "SLUDGE/BBB ... Atropine + pralidoxime."
- Reference result: Goldfrank cholinergic toxidrome — same constellation, same antidotes.
- Delta: text-faithful. PASS.

## Edge-input handling notes
- Pure reference tile; no numeric inputs. Bundled shard hash gated by `scripts/verify-integrity.mjs`.
- The "antidote / management" column carries the verb "supportive" or a named drug; the renderer does not invent dose ranges (those live in dedicated tiles like `naloxone`).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `<table class="lookup-table">` with four `<th scope="col">` headers (Syndrome / Signs / Causes / Antidote). `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
