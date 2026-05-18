# v11 audit - ABN (CMS-R-131) Explainer (`abn-explainer`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS Form CMS-R-131 (Advance Beneficiary Notice of Noncoverage). The form is published by CMS with an OMB control number that is periodically renewed. The structural elements (Option 1/2/3 boxes, beneficiary signature, reason-for-noncoverage detail) and the patient-protection logic (provider must give ABN before non-covered service or cannot bill the beneficiary) remain stable across renewal cycles.

## Boundary examples added
- Renderer walks the user through the three ABN option boxes (1: want service + bill Medicare; 2: want service + don't bill Medicare; 3: do not want service) and explains the patient-rights consequence of each.

## Cross-implementation differential
- N/A (explainer; reads the CMS-R-131 form structure). The differential is "does the explainer text match the current CMS-R-131 form sections?" — confirmed by re-reading the CMS-R-131 form layout as published by CMS.

## Edge-input handling notes
- The tile does not generate a filled-in CMS-R-131 (that requires the provider's NPI and the specific item/service being denied); it explains the choices a patient is asked to make.
- Plain-English summaries by the project author; CMS publishes the authoritative form and instructions.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Decision-tree selects labelled; output region surfaces the chosen-option explanation. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
