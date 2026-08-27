# spec-v824 — Graus Criteria (Autoimmune Encephalitis)

## What this gives you

Tick the presentation, the supporting features and the exclusion; get whether the Graus 2016
criteria for **possible autoimmune encephalitis** and for **definite autoimmune limbic
encephalitis** are met.

`neos` predicts one-year outcome in anti-NMDAR encephalitis and `bickerstaff` covers a
brainstem variant. Nothing here made the diagnosis.

## §1 The two panels

**Possible autoimmune encephalitis** — all three:
1. Subacute onset (rapid progression of **less than 3 months**) of working memory deficits,
   altered mental status, or psychiatric symptoms.
2. At least **one** of: new focal CNS findings; seizures not explained by a previously known
   seizure disorder; CSF pleocytosis (**more than five** white cells/mm³); MRI features
   suggestive of encephalitis.
3. Reasonable exclusion of alternative causes.

**Definite autoimmune limbic encephalitis** — all four: a subacute limbic presentation;
**bilateral T2-FLAIR abnormalities highly restricted to the medial temporal lobes**; CSF
pleocytosis **or** a temporal-lobe EEG abnormality; and exclusion.

## §2 There is deliberately no antibody field

Neither criteria set mentions an antibody, and that is the central design decision of the
paper rather than an omission. Serology takes weeks, antibody-negative autoimmune
encephalitis is real, and a diagnostic approach that waits for it delays immunotherapy in a
disease where delay costs outcome.

So this tile **does not ask**. Offering the input would invite a reader — or an agent — to
withhold a result pending a test the criteria were written to avoid waiting for. When a
diagnosis is reached, the result says plainly that a negative or pending antibody does not
undo it. A test asserts no antibody field exists.

## §3 The MRI requirement is not the same requirement twice

In **possible AE**, "MRI features suggestive of encephalitis" is one of *four* alternatives —
a normal or non-specific scan is entirely compatible with the diagnosis.

In **definite limbic encephalitis**, bilateral medial temporal T2-FLAIR change is a
*mandatory* criterion in its own right.

The same normal scan therefore leaves one diagnosis open and rules the other out, and the
tile says so rather than reporting two bare verdicts. Tested.

## §4 One threshold worth a number field

CSF pleocytosis is **more than** five white cells/mm³. Exactly five does not count, which is
why the tile takes a count rather than a "pleocytosis: yes/no" checkbox — five is a common
near-miss and a boolean invites rounding it the wrong way. Tested at 5 and 6.

The result also carries the paper's warning about the commonest mimic: herpes simplex
encephalitis, whose CSF PCR can be falsely negative within the first 24 hours and should be
repeated if suspicion remains high.

## §5 Sourcing (spec-v97 gate)

- Graus F, Titulaer MJ, Balu R, et al. A clinical approach to diagnosis of autoimmune
  encephalitis. *Lancet Neurol.* 2016;15(4):391-404 — both diagnostic panels taken verbatim
  from the paper's own text, after two secondary sources declined to reproduce them.

## §6 Posture

Decision support, not a verdict. It applies published criteria to findings already gathered.
It does not start immunotherapy or aciclovir.

Catalog 1615 → 1616.
