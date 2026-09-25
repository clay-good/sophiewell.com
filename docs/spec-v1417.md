# spec-v1417 — Snyder classification of SLAP lesions

From the classification-gap queue: the catalog grades shoulder instability (`isis-shoulder`), cuff
fatty infiltration (`goutallier`) and glenoid morphology (`walch-glenoid`), and had nothing for the
superior labrum.

## Sources

- Snyder SJ et al, *SLAP lesions of the shoulder*, Arthroscopy 1990;6:274-279 (abstract read via
  PubMed 2264894): 27 lesions in more than 700 arthroscopies; four types; the lesion "can be
  diagnosed only arthroscopically", and no imaging test defined it beforehand. The abstract names
  the four types but does not define them.
- Hahn AK et al, *Orthop J Sports Med* 2023;11(11):23259671231204851 (open access, PMC10638887)
  gives the four definitions, and measured **fair** interobserver agreement for the Snyder system
  on arthroscopy video (kappa 0.31).

| type | definition (Hahn 2023) | derived from |
|---|---|---|
| I | fraying of the free edge with a stable biceps tendon | frayed, attached labrum + biceps intact |
| II | labrum and biceps tendon detach from the top of the glenoid | detached labrum (biceps not asked) |
| III | bucket-handle tear with an intact biceps tendon | bucket-handle + biceps intact |
| IV | displaced bucket-handle tear extending into the biceps root | bucket-handle + extends into biceps |

## Behavior

The type is derived from the two findings a surgeon records, rather than picked from a list, so a
report that says "type III" and "extends into the biceps" cannot both stand. Fraying that extends
into the tendon fits none of the four types and is reported as such, not forced into one. Every
answer carries the arthroscopy-only and kappa 0.31 caveats. Later expanded schemes added more
types; the note says this covers Snyder's four only.

## Tests

`test/unit/snyder-slap.test.js`: each type, type I as the only unflagged one, the combination that
fits no type, both caveats, and the refusals.
