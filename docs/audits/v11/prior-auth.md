# v11 audit - Prior Authorization Checklist (`prior-auth`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS Interoperability and Prior Authorization Final Rule, CMS-0057-F, 89 FR 8758 (published 2024-02-08). Sophie surfaces a procedure-keyed checklist of the field categories the AMA model prior-authorization form requests (member ID, provider NPI, diagnosis code, procedure code(s), clinical justification, prior treatment trial, attached records). Payer-specific forms always supersede.

## Boundary examples added
- META example: procedure `imaging-mri-msk` -> renderer composes the MRI musculoskeletal prior-authorization checklist from the bundled bank (member info, ordering provider, MRI region + laterality, ICD-10 diagnosis, prior conservative care, contraindications).
- Empty selection: renderer surfaces "Select a procedure type." (verified in `views/group-h.js prior-auth`).
- Coverage: bundled `data/workflow/prior-auth.json` contains every procedure category exposed in the dropdown; renderer calls `selectChecklist(bank, procId)` which returns `null` only for an empty value.

## Cross-implementation differential
- N/A (checklist / template). The differential is "do the rendered items match the bundled bank?" — covered by `test/unit/keywords.test.js` selectChecklist fixture coverage.

## Edge-input handling notes
- Renderer prints the bundled `bank.notes` warning beneath the checklist, explicitly disclaiming payer-specific divergence.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Labelled `<select>` + two buttons; result list is a semantic `<h2>` + `<ul>`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
