# v11 audit - Anticoagulation Reversal Reference (`anticoag-reversal`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: ASH 2018 guideline for management of anticoagulant-associated bleeding; Tomaselli et al. *2020 ACC Expert Consensus Decision Pathway on Management of Bleeding in Patients on Oral Anticoagulants* (JACC 2020;76(5):594-622); Frontera et al. *Reversal of Antithrombotic Agents in Major Bleeding* (Neurocritical Care Society / Society of Critical Care Medicine, Crit Care Med 2016).

## Boundary examples added (table coverage rows)
This is a pure reference table tile (no inputs). Per spec-v11 §3.3 step 10, coverage rows are individual table entries verified against the cited consensus statements:
- Warfarin -> 4-factor PCC + Vitamin K 10 mg IV (FFP only if PCC unavailable). Matches the ACC 2020 pathway; FFP-only is acknowledged as second-line, not equivalent.
- Dabigatran -> Idarucizumab 5 g IV; hemodialysis as adjunct. Matches REVERSE-AD and the ACC 2020 pathway.
- Apixaban / Rivaroxaban -> Andexanet alfa per dosing nomogram; 4F-PCC 50 units/kg if andexanet unavailable. Matches ANNEXA-4 and ACC 2020.
- Heparin (UFH) -> Protamine 1 mg per 100 units last 2-3 h; max 50 mg single dose. Matches the Frontera 2016 consensus.
- LMWH -> Protamine 1 mg per 1 mg LMWH within 8 h; partial reversal only. Matches Frontera 2016.
- Antiplatelets -> Platelet transfusion in life-threatening bleed (evidence mixed). Matches the AHA/ASA ICH guideline framing.

All six rows verified against the cited consensus statements; no numerical drift in dose strings or interval framing.

## Cross-implementation differential
- Reference implementation: ACC 2020 Expert Consensus Decision Pathway (Tomaselli et al.) Tables 2-4.
- Test case: apixaban-associated life-threatening bleed.
- Sophie reference: andexanet alfa per dosing nomogram; 4F-PCC 50 units/kg if andexanet unavailable.
- Reference result: identical recommendation (ACC 2020 pathway Table 4).
- Delta: 0%. PASS.

## Edge-input handling notes
- No inputs. The "Reference table. Always confirm against your institution's protocol and current literature." muted paragraph above the table frames the tile as reference only. PASS.

## A11y / keyboard notes
- `<table class="lookup-table">` with `scope="col"` headers. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
