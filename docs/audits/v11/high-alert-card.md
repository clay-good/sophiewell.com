# v11 audit - High-Alert Medications Wallet Card (`high-alert-card`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Institute for Safe Medication Practices (ISMP) "High-Alert Medications in Acute Care Settings" — Sophie surfaces medication identities only; ISMP maintains the authoritative formatted list. Bundled `data/clinical/ismp-high-alert.json` (fetchDate 2026-05-07) currently lists the headline categories (Insulin, Heparin, Opioids, Concentrated electrolytes, Chemotherapy); these have been ISMP high-alert categories continuously since the list's inception and remain on the current ISMP list as of audit date.

## Boundary examples added
- Coverage check: the bundled five categories are each rendered as a `name - note` row under "High-alert medications". The "My medications (write below)" section provides five blank lines for handwritten patient entry on a printed card.
- Renderer path: `loadFile('clinical', 'ismp-high-alert.json')` -> `renderPrintable` with the warnings array containing the ISMP attribution + the patient-do-not-stop reminder.

## Cross-implementation differential
- N/A (reference list). The differential is "are the bundled high-alert categories represented on the current ISMP list?" — manually cross-checked against the current ISMP Acute Care list; all five categories present. The Sophie note text is original brief notes by the project author (per the `attribution` field), not ISMP's formatted text.

## Edge-input handling notes
- No user input on this tile; it is a printable wallet-card scaffold.
- Citation passes spec-v11 §3.5 no-bare-URL guard. The bundled data file attribution contains a URL, but the tile's META citation (audited against here) does not.

## A11y / keyboard notes
- Printable output uses the shared `renderPrintable` semantics; warnings render as a notice block. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
