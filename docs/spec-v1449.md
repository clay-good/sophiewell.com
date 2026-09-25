# spec-v1449 — Collin classification of massive rotator cuff tears

Found through the EFORT Open Reviews series (PMC5367545): `collin` matched only an unrelated tool.
The catalog grades cuff retraction by arthropathy stage (`hamada`), fatty infiltration
(`goutallier`) and partial tears (`ellman-partial-rc`), and had nothing that says which parts of a
massive tear are torn.

## Sources

- Collin P et al, *J Shoulder Elbow Surg* 2014;23:1195-1202 (DOI checked on Crossref): the
  classification.
- Lädermann A et al, *EFORT Open Rev* 2016;1:420-430 (open access, PMC5367545; DOI checked), read
  2026-09-24: five components (supraspinatus, superior subscapularis, inferior subscapularis,
  infraspinatus, teres minor) and the five types:

| type | torn components |
|---|---|
| A | supraspinatus, superior subscapularis |
| B | supraspinatus, entire subscapularis |
| C | supraspinatus, superior subscapularis, infraspinatus |
| D | supraspinatus, infraspinatus |
| E | supraspinatus, infraspinatus, teres minor |

## Behavior

Each component is marked torn or intact (none may be left blank). The torn set must match a type
exactly; any other combination is reported as fitting no type, and no tear at all as nothing to
classify. The note repeats the review's link to function (keeping active elevation) and that the
type does not choose the treatment.

## Tests

`test/unit/collin-rc.test.js`: the five types, two non-matching combinations and no tear, and a
blank component.
