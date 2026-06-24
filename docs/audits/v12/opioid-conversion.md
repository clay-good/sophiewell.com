# v12 audit - opioid-conversion

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: McPherson ML. Demystifying Opioid Conversion Calculations: A Guide for Effective Dosing. 2nd ed. ASHP; 2018 (standard equianalgesic table; OME factors cross-verified against the CDC MME conversion-factor file and the University of Iowa adult opioid equianalgesic chart; cross-tolerance reduction against the Palliative Care Network of Wisconsin).

`lib/rheum-v148.js opioidConversion()` converts the source daily dose to oral
morphine equivalents (OME) and back to the target opioid, then applies an
incomplete-cross-tolerance reduction. Class A (fixed constants); the renderer
surfaces the mandatory independent-second-check caveat (spec-v11 §5.3).

## Source-governance notes
- OME factors (oral morphine = 1): oxycodone 1.5, hydromorphone PO 4 (CDC; the
  equianalgesic table's 5 is the parenteral ratio -- a documented divergence),
  hydrocodone 1, codeine 0.15, tramadol 0.1, tapentadol 0.4, oxymorphone PO 3;
  parenteral morphine 3 (oral:IV 3:1 chronic), hydromorphone IV 20, oxymorphone IV
  30, IV fentanyl 0.3 OME/mcg, transdermal fentanyl 2.4 OME per mcg/h (25 mcg/h ~
  60 mg OME/day).
- Cross-tolerance reduction 25-50% (default 50%, most conservative).
- METHADONE and BUPRENORPHINE are EXCLUDED by design -- their ratios are
  non-linear / ceiling-limited and unsafe to reduce to a constant (spec-v100 §8).
- Distinct from opioid-mme (surveillance MME sum); both kept and cross-linked.

## Boundary worked examples added
- 60 mg PO morphine -> oxycodone 40 mg, start 20 mg at 50%; oral:IV morphine 3:1;
  hydromorphone PO factor 4; transdermal fentanyl 120 OME -> 50 mcg/h with the
  patch-rounding note; zero/blank/negative-dose fallback; methadone/buprenorphine
  not selectable.

## Edge-input handling notes
- Source and target are fixed positive factors; division by the target factor is
  domain-safe. A zero/blank/negative dose surfaces a complete-the-fields fallback
  rather than Infinity/NaN. Covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Two labeled agent selects + a dose number input + a reduction select; output
  aria-live. 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
