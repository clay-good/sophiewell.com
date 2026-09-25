# spec-v1448 — ABC classification of posterior shoulder instability

Found through the EFORT Open Reviews series (PMC11099582): `posterior shoulder instability` and
`moroder` matched nothing. The catalog scores anterior instability (`isis-shoulder`) and grades
labral lesions (`snyder-slap`), and had nothing for posterior instability.

## Sources, read 2026-09-24

- Moroder P et al, *J Shoulder Elbow Surg* 2024;33 (SECEC Didier Patte Prize 2023; DOI checked on
  Crossref): the classification.
- Paksoy A et al, *EFORT Open Rev* 2024;9:403-412 (open access; DOI checked): the definitions.

| group | defined by | 1 | 2 |
|---|---|---|---|
| A | a first-time single event, less than 3 months ago | subluxation with immediate spontaneous reduction | dislocation needing a reduction maneuver |
| B | recurrent dynamic instability, any time since onset | functional (abnormal muscle activation) | structural (posterior Bankart, glenoid bone loss, reverse Hill-Sachs) |
| C | static posterior decentering, more than 3 months | constitutional (inherent, atraumatic) | acquired |

## Behavior

The pattern is chosen first; only that group's question is asked, and answers to the other groups'
questions are ignored. Every answer notes that the type can change (the review shows A1 becoming C2
over three years) and that treatment is a separate decision.

## Tests

`test/unit/abc-psi.test.js`: all six types, cross-group answers ignored, and the missing question
asked for.
