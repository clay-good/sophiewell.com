# spec-v1034 — All-zero examples, wave 3: the risk scores

Third wave of `docs/spec-v1031.md`. Ten more tiles, all of them scores whose zero band is a reason
to *withhold* something:

| Tile | Opening line | What the low band means |
| --- | --- | --- |
| `atria-bleeding`, `orbit-bleeding`, `hemorr2hages` | low annual major-bleed risk | anticoagulate |
| `improve-vte` | prophylaxis not routinely indicated | no extended prophylaxis |
| `padua` | low risk; 90-day VTE 0.3% | no inpatient prophylaxis |
| `dash-vte`, `herdoo2` | low recurrence risk; safe to discontinue | stop anticoagulation |
| `spesi` | low risk; 30-day mortality 1.0% | outpatient management |
| `aims65` | in-hospital mortality 0.3% | no escalation for a GI bleed |
| `sirs` | SIRS-negative | no sepsis trigger |

Each now opens on a patient: an anemic 78-year-old with hypertension (ATRIA 6), an immobilized
patient with active cancer (IMPROVE-VTE 4), a febrile tachycardic tachypneic patient (SIRS 3 of 4).

The bleeding-versus-clotting pairs are the sharpest case in this program so far. A reader comparing
`atria-bleeding` with `padua` on the same patient was, before this, shown "low bleed risk" beside
"low clot risk" — two opposite reassurances, both from forms nobody had filled in.

**Remaining:** 19 all-zero examples. `rockall`, `crb65` and `lips` are next; they take select and
number fields rather than checkboxes, so each needs its own reading of the renderer.
