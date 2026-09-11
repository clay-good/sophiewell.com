# spec-v1240 — Four gallbladder grades, and the rung each one is read wrongly on

The catalog had two tiles for acute cholecystitis, both Tokyo Guidelines: `cholecystitis-diagnosis`
and `cholecystitis-severity`. Both grade **the patient**. Nothing graded **the gallbladder**, or the
operation, or the damage a stone had done to the bile duct — the three questions a surgeon actually
has in front of them. This wave builds those four.

| tile | what it grades | the branch it gets read wrongly on |
| --- | --- | --- |
| `parkland-gallbladder` | the operative field, 1-5 | grade 4's anatomy clause attaches to an **otherwise mild** picture |
| `nassar-gallbladder` | the operation, three axes 1-4 | the overall grade is the **worst axis**, not the average and not the gallbladder |
| `aast-cholecystitis` | the disease, I-V | an imaging grade is a **floor**; the highest category wins |
| `csendes-mirizzi` | the bile duct | type V is a **second axis**, not a sixth rung |

Each tile therefore derives the grade from the findings rather than asking the reader for it. Asking
for the grade would leave exactly the branch that goes wrong to the person who came for help with it.

## Parkland: a normal-looking gallbladder can be a grade 4

Madni 2018 defines grade 4 as *either* adhesions obscuring most of the gallbladder *or* a grade 1-3
picture **with** abnormal liver anatomy, an intrahepatic gallbladder, or an impacted stone. Read as a
ladder of inflammation — which is how a 1-to-5 scale invites you to read it — that second clause
disappears, and a gallbladder with no adhesions at all grades 1 when it is a 4. The tile computes it
and prints a sentence naming the clause **only when the clause is what did the work**.

The grade is also the highest finding, never a sum. The worked example ticks hyperemia (grade 3) and
an impacted stone (grade 4) and returns 4, not 7.

`emptyNote` closes the other end: grade 1 is a *finding* — a gallbladder that has been exposed and
looks normal — and an unfilled form is not that finding. Without the note, this tile would answer a
blank form with the most reassuring rung on the scale ([incomplete-input-program](incomplete-input-program.md)).

## Nassar: the axis nobody looks at is the one that decides

Three findings, graded 1-4 each, overall grade = the worst. A floppy, non-adherent gallbladder with a
cystic pedicle that cannot be clarified is a **grade 4 operation**, and grading off the gallbladder —
the easiest of the three to see — reports a far easier operation than the one being done. The tile
prints that sentence exactly when that is the case.

An ungraded axis can only raise the answer, so with one missing the tile returns a **floor**, not a
grade. The one exception is the ceiling: once any axis is 4 there is nothing left for the others to
add, and refusing there would ask for values that change nothing.

One defect fixed in review: the "the gallbladder looks benign" sentence tested `parts.gallbladder <= 2`,
and `null <= 2` is true — so grading only the pedicle as 4 printed a claim about a gallbladder that had
never been graded. It now requires an actual grade.

## AAST: and the 2022 revision this is not

Tominaga 2016 grades on four categories — clinical, imaging, operative, pathologic — and **where they
disagree the highest is the final grade**, the same rule `aast-organ-injury` already applies to the
trauma organ scales here. The consequence worth printing is that an imaging-only grade is a floor:
wall necrosis and a walled-off perforation are both routinely found in a gallbladder that imaged as
grade I.

A **2022 revision exists** (Schuster, *J Trauma Acute Care Surg* 92(4):664-674, PMID 34936593), which
re-cut the grades by modified Delphi and added clinical variables. This tile implements the original
2016 anatomic criteria — the ones a source prints in full — and says so on screen and in the note, so
that a grade produced here is never reported as a revised-scale grade. A unit test pins the sentence.
That revision's own conclusion is worth the reader's time too: even revised, the AAST grade did not
outperform the Parkland grade, which is the tile beside it.

## Csendes: "type V" leaves out the question the operation turns on

Types I-IV are a ladder: external compression, then a cholecystobiliary fistula taking under a third,
up to two thirds, or the whole duct circumference. Type V (Beltran 2008) is **not** a fifth rung — it
is a cholecystoenteric fistula sitting on top of any of I-IV, Vb if there is gallstone ileus. A case
recorded only as "type V" has not said how much bile duct is left, which is the question the
reconstruction turns on. So this tool reports both: *type Va on a type III duct*.

Two more things it prints. Gallstone ileus ticked **without** an enteric fistula does not make a Vb —
the a/b split only exists once the fistula is there — and saying so keeps an entered value from being
silently dropped. And type I, the picture everyone carries, was 11% of Csendes' own 219-patient
series: in roughly five cases out of six the stone had already eroded into the duct.

## Sources

All four verified against PubMed metadata before the citation was written, not after.

- Madni TD, et al. The Parkland grading scale for cholecystitis. *Am J Surg.* 2018;215(4):625-630. PMID 28619262.
- Griffiths EA, et al. (CholeS Study Group). Utilisation of an operative difficulty grading scale for laparoscopic cholecystectomy. *Surg Endosc.* 2019;33(1):110-121. PMID 29956029.
- Tominaga GT, et al. The AAST grading scale for 16 emergency general surgery conditions. *J Trauma Acute Care Surg.* 2016;81(3):593-602. PMID 27257696.
- Csendes A, et al. Mirizzi syndrome and cholecystobiliary fistula: a unifying classification. *Br J Surg.* 1989;76(11):1139-1143. PMID 2597969.

A fifth PMID was wrong on the first pass — 27540858 is a tympanic-membrane paper, not the AAST scale.
It was caught by fetching every citation from NCBI eutils rather than trusting the number. Do that.

Catalog 1,706 → 1,710.
