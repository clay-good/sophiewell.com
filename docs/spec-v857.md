# spec-v857 — Acute Otitis Media: Diagnosis and the Observation Option

## What this gives you

Whether the ear meets the criteria at all — and, if it does, whether this child's age and
laterality leave observation on the table.

## §1 The diagnosis

There must be **objective evidence of a middle-ear effusion**. Then one of:

| | |
|---|---|
| Moderate to severe bulging of the drum | |
| New otorrhea not from otitis externa | |
| **Mild** bulging **and** ear pain starting within 48 hours, or intense erythema | |

## §2 A red drum is not otitis media

This is the whole reason the tile exists.

Erythema alone meets none of the three criteria, and the guideline says outright that the
diagnosis should not be made without objective evidence of an effusion. A crying child has a red
drum. So when erythema is recorded without an effusion, or without bulging, the tile says the
criteria are **not** met and says why rather than returning a bare no.

Mild bulging is likewise not enough on its own: it is diagnostic only when paired with recent
pain or intense erythema.

## §3 Severity, and the two things that remove the observation option

**Severe** is moderate or severe ear pain, **or** pain lasting 48 hours or more, **or** a
temperature of 102.2°F (39°C) or higher.

| | |
|---|---|
| Severe, any age | Antibiotics recommended |
| 6-23 months, **bilateral** | Antibiotics recommended, mild or not |
| 6-23 months, unilateral, mild | Observation is an option |
| 24 months and over, mild | Observation is an option |

Laterality decides the answer at 6 to 23 months and nowhere else, which is the part most easily
carried across ages. The tile names it where it applies.

Observation always carries a backup prescription or a scheduled review in 48 to 72 hours, and
the tile says so every time it offers it.

## §4 Under 6 months is outside the guideline

It covers 6 months through 12 years. Below that the tile reports the diagnostic finding and
states that the management recommendation does not apply, rather than extrapolating one.

## §5 Sourcing (spec-v97 gate)

- Lieberthal AS, Carroll AE, Chonmaitree T, et al. The diagnosis and management of acute otitis
  media. *Pediatrics.* 2013;131(3):e964-e999.

The citation string does not carry the `AAP` token, so the mechanical issuer gate does not
demand a staleness row. One is carried in `docs/citation-staleness.md` anyway: this is an AAP
clinical practice guideline and it will be revised, which is exactly what that ledger is for.

## §6 Posture

Decision support, not a verdict. It reports a published criterion and a published management
option. It does not prescribe, and it does not select an antibiotic or a dose.

Catalog 1648 → 1649.
