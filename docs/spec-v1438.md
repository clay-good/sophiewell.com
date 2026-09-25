# spec-v1438 — UKELD

Found by the gap finder: `ukeld` matched nothing. The catalog has the US allocation scores
(`meld-na`, `meld3`) and nothing for the score UK liver units list against.

## Sources, read 2026-09-24

- Barber K et al, *Transplantation* 2011;92:469-476 (abstract, PubMed 21775931; DOI checked on
  Crossref): derived in 1,103 adults registered for a first elective UK liver transplant and
  validated in 452; a better predictor of waiting-list death than MELD or MELD-Na; "not associated
  with overall posttransplant survival".
- The formula, stated identically **with its units** in two open papers (PMC5304182, PMC4907519):

  UKELD = 5.395 ln(INR) + 1.485 ln(creatinine, umol/L) + 3.13 ln(bilirubin, umol/L)
  − 81.565 ln(sodium, mmol/L) + 435

- The listing line, "UKELD score ≥49", among current UK listing criteria (*Transplantation Direct*
  2025, PMC11809985).

## The unit is the trap

The coefficients are a claim about µmol/L. Entered in mg/dL, a creatinine of 1.2 is 106 µmol/L; fed
to the formula unconverted it would move the score by about 6.7 points on the creatinine term alone.
The page accepts mg/dL or µmol/L for creatinine and bilirubin (canonical mg/dL, as everywhere in the
catalog), the library converts with the repository's own factors (`lib/unit-convert.js`: 88.4 and
17.1), and every answer prints the µmol/L values it used.

## Behavior

The score is rounded to a whole number and compared with 49. Below 49, the answer says that does
not rule out listing, since UK criteria also list for recurrent ascites, recurrent encephalopathy or
hepatocellular carcinoma. Every input is required and checked against the shared plausible ranges
(`lib/bounds.js`); a zero is refused because the score takes its logarithm.

## Tests

`test/unit/ukeld.test.js`: two hand-computed cases (47.15 and 58.84), the 49 line, the notes, and
refusals.
