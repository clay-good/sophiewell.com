# spec-v821 — Revised Ghent Nosology (Marfan Syndrome)

## What this gives you

Enter the aortic root Z score, the eye, the genetics, the family history and the 20-point
systemic score; get which of the nosology's **four** diagnoses the findings support.

Marfan syndrome was a zero-hit word here, sitting in an otherwise dense aortic cluster —
`debakey`, `crawford-taaa`, `sievers-bav`, `el-khoury-ar` were all built, and the commonest
heritable cause of aortic root disease was not.

## §1 Box 1, the rules

**Without a family history**

| | |
|---|---|
| 1 | Ao (Z≥2) **and** ectopia lentis → Marfan syndrome\* |
| 2 | Ao (Z≥2) **and** FBN1 → Marfan syndrome |
| 3 | Ao (Z≥2) **and** systemic ≥7 → Marfan syndrome\* |
| 4 | Ectopia lentis **and** an FBN1 known to be associated with aortic disease → Marfan syndrome |
| | EL, with an FBN1 *not* known with Ao or no FBN1 → **ectopia lentis syndrome** |
| | Ao (Z<2), systemic ≥5 with ≥1 skeletal feature, no EL → **MASS phenotype** |
| | MVP, Ao (Z<2), systemic <5, no EL → **mitral valve prolapse syndrome** |

**With a family history** — 5: ectopia lentis alone. 6: systemic ≥7 alone\*. 7: Ao alone, at
**Z≥2 from 20 years old but Z≥3 below 20**.

\* carries the paper's own caveat: only without discriminating features of
Shprintzen-Goldberg, Loeys-Dietz or vascular Ehlers-Danlos, and after TGFBR1/2, collagen
biochemistry and COL3A1 testing where indicated. The tile prints that caveat on exactly those
three routes until the differential is confirmed excluded.

## §2 Three things summaries lose

**The aortic threshold is age-dependent — and only in rule 7.** With a family history,
someone under 20 needs Z≥3. Applying the adult figure to a child with an affected parent
calls Marfan syndrome at a root size the nosology does not. Without a family history the
Z≥2 threshold holds at every age. When a Z lands in the 2–3 gap for a child with a family
history, the tile says exactly why it does not satisfy rule 7 there but would at 20.

**FBN1 is not a yes/no.** A mutation *known* to be associated with aortic root disease
satisfies rule 4; one *not* known with it does not — and sends the same patient to ectopia
lentis syndrome instead. It is a three-way select for that reason, and when the middle state
is what changed the answer the tile says so.

**There are four answers, not one verdict.** MASS and MVPS are outcomes of the rules, not
"not Marfan". Collapsing them to a boolean would discard the distinction the 2010 revision
was largely written to draw.

## §3 Box 2, the systemic score

Wrist **and** thumb 3 (either alone 1); pectus carinatum 2 (excavatum or asymmetry 1);
hindfoot deformity 2 (plain pes planus 1); pneumothorax 2; dural ectasia 2; protrusio
acetabuli 2; reduced US/LS with increased arm span and no severe scoliosis 1; scoliosis or
thoracolumbar kyphosis 1; reduced elbow extension 1; facial features 3/5 1; skin striae 1;
myopia >3 diopters 1; MVP 1. **Maximum 20; ≥7 indicates systemic involvement.**

The MASS route additionally requires "at least one skeletal feature". The paper does not
enumerate which items count as skeletal, so this tile treats the musculoskeletal items as
skeletal (wrist/thumb, pectus, hindfoot, protrusio, segment ratio, scoliosis, elbow
extension, facial features) and the rest as not. That is a documented reading, not a guessed
weight, and a test pins it: five points made entirely of pneumothorax, dural ectasia and
striae does **not** yield MASS.

## §4 Sourcing (spec-v97 gate)

- Loeys BL, Dietz HC, Braverman AC, et al. The revised Ghent nosology for the Marfan
  syndrome. *J Med Genet.* 2010;47(7):476-485 — Box 1 and Box 2 extracted from the primary
  paper itself, not a summary.
- The Z≥2, systemic ≥7 and MASS ≥5 thresholds were independently corroborated before
  encoding.

## §5 Posture

Decision support, not a verdict. It applies published criteria to findings already gathered.
It does not order the echocardiogram, the slit-lamp examination or the genetic testing they
depend on.

Catalog 1612 → 1613.
