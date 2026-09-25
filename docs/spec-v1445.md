# spec-v1445 — nasogastric tube insertion length (corrected NEX)

Found by the nurse-facing gap scan: `nasogastric`, `feeding tube` and `nex` matched nothing. Placing
a nasogastric tube is daily bedside work, and the classic nose-earlobe-xiphoid (NEX) length often
leaves the tip in the esophagus.

## Source, read 2026-09-24

Boeykens K et al, *Crit Care* 2023;27:317 (open access, PMC10439641; DOI checked on Crossref):

- Hanson: NEX x 0.38696 + 30.37 cm. In an RCT of 183 ICU patients, NEX and Hanson both
  underestimated the needed depth in more than 20%.
- Corrected NEX (CoNEX): NEX x 0.38696 + 30.37 + 6 cm. In 218 ICU patients, a correct tip position
  (more than 3 cm into the stomach) in all of them.
- Table 1 converts NEX 40-69 cm to CoNEX; **the formula reproduces all 30 rows** when rounded, and
  the unit test checks every one.
- On verification: an X-ray is the reference standard, and misread X-rays caused 57% of
  tube-related deaths in a UK safety report.

## Behavior

One input, NEX in cm. The answer gives the CoNEX length, shows the NEX and Hanson lengths for
comparison, and always says the length does not confirm where the tip is: verify before any feed or
medication. Outside the table's 40-69 cm the answer says the formula was not checked there; under 20
or over 120 cm is refused as a transcription error (a check on the typing, not a clinical range).

## Tests

`test/unit/ng-tube-length.test.js`: all 30 rows of Table 1, the comparison lengths, the
out-of-table note, and refusals.
