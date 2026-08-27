# spec-v833 — FIGO Grading (Placenta Accreta Spectrum)

## What this gives you

Tick what is seen at operation; get the FIGO grade.

## §1 The grades

| | |
|---|---|
| **1** | No distension over the placental bed, no tissue through the uterine surface, little or no neovascularity; the placenta will not separate and manual removal brings heavy bleeding from the implantation site |
| **2** | Bluish or purple color, distension — the **placental bulge** — and significant neovascularity; the **dimple sign** on gentle cord traction; still **no** invasion through the uterine surface |
| **3a** | Placental tissue invading **through the serosa**, no other organ involved, with a **clear surgical plane** between bladder and uterus |
| **3b** | Invasion into the **bladder** wall or urothelium, no other organ, **no** clear surgical plane |
| **3c** | Invasion into the broad ligament, vaginal wall, pelvic sidewall or any other pelvic organ, **with or without** bladder involvement |

## §2 Every input is a finding, not a grade

The form asks only what the surgeon *observes* — separation, color, bulge, dimple, serosal
breach, plane, bladder, other organ — and derives the grade from that. Offering a "grade"
picklist would let a reader assert the conclusion the tile exists to reach.

## §3 Two rules that decide a grade and are easy to skip

**3c outranks 3b.** Parametrial or other pelvic involvement is 3c *whether or not* the
bladder is also involved. Finding bladder invasion does not end the question, so when both
are present the tile says which one settled it.

**The 3a / 3b line is the surgical plane, not proximity.** A serosal breach with a clear plane
between bladder and uterus stays at 3a however close the placenta looks. The tile names the
discriminator on every grade-3 result rather than leaving it to be inferred.

## §4 It grades the operation, not the pathology

FIGO grades what is seen at delivery **deliberately**, so that the grade can be applied
without histology and at the moment the decisions are being made. A later histological report
may not match it, and the grade does not depend on one. The result says so on every graded
answer.

## §5 Sourcing (spec-v97 gate)

- Jauniaux E, Ayres-de-Campos D, Langhoff-Roos J, Fox KA, Collins S. FIGO classification for
  the clinical diagnosis of placenta accreta spectrum disorders. *Int J Gynaecol Obstet.*
  2019;146(1):20-24.
- The observable criteria for each grade were taken from Table 1 of the accompanying review
  (PMC6929563) and corroborated against FIGO's own summary.

## §6 Posture

Decision support, not a verdict. It describes findings already made at operation. It does not
plan the surgery or decide about hysterectomy.

Catalog 1624 → 1625.
