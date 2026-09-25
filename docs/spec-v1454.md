# spec-v1454 — Powers ratio (anterior atlanto-occipital dissociation)

From the classification-gap queue. The craniocervical junction had the Traynelis type of an
atlanto-occipital dislocation (`traynelis`), the Fielding-Hawkins atlantoaxial rotatory types
(`fielding-hawkins`) and the Anderson-D'Alonzo odontoid types (`anderson-dalonzo`), and nothing
that turns the measured distances into the number a reader checks first.

## Sources

- Powers B, Miller MD, Kramer RS, Martinez S, Gehweiler JA Jr, *Neurosurgery* 1979;4:12-17
  (DOI confirmed via Crossref): the original, not open access.
- Rojas CA, Bertozzi JC, Martinez CR, Whitlow J, *Reassessment of the Craniocervical Junction:
  Normal Values on CT*, AJNR Am J Neuroradiol 2007;28:1819-1823 (open access, PMC8134200), read
  2026-09-24. It states the method (basion to the spinolaminar line of C1, divided by opisthion to
  the posterior aspect of the anterior arch of C1) and, in its Table 1, the limits applied here:

| measurement | normal on plain radiograph | normal on CT (97.5% of 200 adults, 20 to 40 years) |
|---|---|---|
| Powers ratio | < 1.0 | < 0.9 |
| Basion-dens interval | < 12.0 mm | < 8.5 mm |
| Basion-axial interval | < 12.0 mm | not reliable |

## Behavior

Two distances in mm (each refused when blank, zero, negative or over 100 mm) and the modality
(required, because the limits differ). The ratio is rounded to two decimals and that printed value
is compared with the limit, so an answer never prints 0.90 and calls it below 0.9. A ratio of 1 or
more is outside the normal range; on CT, 0.9 to 0.99 is reported as above the CT normal value. A
normal ratio says it does not exclude a posterior or vertical distraction injury. The basion-dens
interval is optional; when entered it is read against its own limit and a disagreement with the
ratio is noted; when blank the answer says it was not entered. The basion-axial interval is left out:
it is signed, the source gives no lower bound, and it found it unreliable on CT. Every answer carries
the source's limits: sensitive to anterior dissociation only, the opisthion seen in 56% to 84% of
radiographs, sensitivity 33% to 60%, and no spinolaminar line in posterior arch nonfusion.

## Tests

`test/unit/powers-ratio.test.js`: the division; the radiograph limit at exactly 1; the CT limit at
0.9 and the rounding edge; the basion-dens interval on both modalities, its disagreement note and
its not-entered disclosure; the limitation notes; refusals for blank, whitespace, zero, negative,
out-of-range and unchosen inputs.
