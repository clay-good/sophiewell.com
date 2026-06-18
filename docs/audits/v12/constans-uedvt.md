# v12 audit - constans-uedvt

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Constans J, Salmi LR, Sevestre-Pietri MA, et al. Thromb Haemost. 2008;99(1):202-207.

`lib/vte-v106.js constansUedvt()` sums three +1 items and one signed -1 item to a
total clamped -1..+3 and maps the SIGNED total (not its absolute value) to the low /
intermediate / high pretest-probability bands. Class A.

## Boundary worked examples added
- no items -> 0, low.
- one +1 item -> 1, intermediate.
- all three +1 items -> 3, high.
- band flip via the signed term: localized pain (1, intermediate) + alternative
  diagnosis (-1) -> 0, low.
- the signed total can be negative (-1) and stays in the low band; -1 is shown.

## Cross-implementation differential
- Reference: items/points re-fetched from the Constans 2008 PubMed abstract and
  cross-verified against practical-haemostasis. Venous material +1, localized pain
  +1, unilateral pitting edema +1, alternative diagnosis at least as plausible -1;
  range -1..+3. Low <= 0 (~9-13% UE-DVT across the three samples), intermediate 1,
  high 2-3 (~64-70%). Match. PASS.

## Edge-input handling notes
- the -1 alternative-diagnosis term is a signed value; the band logic keys on the
  signed sum, mirroring the signed-value handling elsewhere in the program.

## A11y / keyboard notes
- Four labeled checkboxes; output aria-live="polite". 320px sweep passes with no
  horizontal scroll. The only validated UE-DVT pretest tool; a pretest aid, not an
  imaging order.

## Defects opened
- none

## Status
- PASS
