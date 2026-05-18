# v11 audit - Insurance Card Decoder (`insurance`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NUBC UB-04 institutional claim form and CMS-1500 (02/12) professional claim form (OMB Control No. 0938-1197). NPI field per 45 CFR 162.406. All cited regulations and form versions current as of 2026-05-18.

## Boundary examples added
- META example: card with member id W123456789, group 0001, plan Gold PPO 1500, BIN 003858, PCN A4, rx group RXANTHEM, etc. -> renderer populates each labelled field and the worked-example panel explains the source of each label.
- Edge: missing rx-group / BIN -> renderer surfaces only the populated fields without falsely implying pharmacy benefits are carved out.

## Cross-implementation differential
- N/A; this is a decoder/explainer tile, not a calculator. The differential is "do the field labels match the source form?" — confirmed against the NUBC UB-04 specification and CMS-1500 (02/12).

## Edge-input handling notes
- BIN format is 6-digit (industry standard for pharmacy claims routing); PCN is typically up to 10 alphanumeric. Field validation is light by design — insurance cards from different payers vary in how strictly they format these fields.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Multiple labelled inputs; output region is a printable card layout. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
