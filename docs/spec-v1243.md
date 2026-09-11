# spec-v1243 — Four things a liver clinic or an endoscopy reports

| tile | the reading it exists to prevent |
| --- | --- |
| `sarin-gastric-varices` | the commonest type read as the dangerous one |
| `hill-grade` | the valve confused with the esophagitis grade above it |
| `hepatopulmonary-syndrome` | the age cut on the gradient threshold dropped |
| `portopulmonary-hypertension` | one verdict printed where two definitions disagree |

## Sarin: they bleed less often and kill more

The four types turn on two things one endoscopy answers: are the gastric varices continuous with
esophageal varices, and where are they. What makes the classification worth doing is the ordering in
Sarin's own 568-patient series, which the tile prints from the primary abstract rather than from a
review: **GOV1 was the commonest type at 75% and the least likely to bleed; GOV2 bled in 55%; IGV1 in
78%.** The commonest type is not the dangerous one.

And one finding sits above all four. Gastric varices bled in **25%** of patients against **64%** for
esophageal varices — and still took 4.8 transfusion units per patient against 2.9, with **45%
mortality** once one had bled. A reader who learned "esophageal varices are the dangerous ones" from
how often they bleed learned the wrong half of the sentence.

IGV1 gets one more line: fundal varices with no esophageal varices raise splenic vein thrombosis,
which is a segmental portal hypertension treated differently.

## Hill: a grade of the valve, not of the mucosa

The flap valve is visible on every upper endoscopy, on retroflexion, and reported on almost none —
and it **cannot be recovered from a report that did not state it**. Grades III and IV are the
appearances associated with reflux disease.

The catalog already has `la-esophagitis` and `savary-miller`, and both grade **mucosal damage in the
esophagus**. Hill grades **the valve, in the stomach, looking up**. A Hill IV valve above a normal
esophagus is an ordinary combination, because the two answer different questions, and every grade
says so.

## Hepatopulmonary syndrome: the age cut, and two different measurements

Three criteria, all asked, none assumed — a blank contrast echo is not a negative one, and "does not
meet criteria" is the reassuring way to be wrong.

The gas exchange criterion is an alveolar-arterial gradient of **≥15 mmHg, or ≥20 over the age of
64**, because the gradient widens with age on its own. The age cut is the part most often dropped and
it fails in one direction only: applying 15 to an older patient calls an ordinary gradient a defect.
The worked example is exactly that case — 70 years old, gradient 18, **criteria not met**.

The diagnosis turns on the **gradient**; the severity grade runs off the **PaO2**. So a patient can
meet the criteria with a PaO2 above 80 — that is the *mild* grade, not a normal result.

## Portopulmonary hypertension: two definitions, both printed

| | 2004 ERS task force | 2022 ESC/ERS |
| --- | --- | --- |
| mean PA pressure | > 25 mmHg | > 20 mmHg |
| pulmonary vascular resistance | > 3 Wood units | > 2 Wood units |
| wedge pressure | < 15 mmHg | ≤ 15 mmHg |

A patient at 23 mmHg and 2.5 Wood units **has** pulmonary hypertension under the current definition
and **does not** under the one most portopulmonary literature was written against. Printing one
verdict silently picks one, so the tile reports both and labels which is which. The severity bands
(mild / moderate / severe by mean pressure) were derived under the older definition, and that is
stated where they are printed.

The wedge pressure is required rather than optional. A cirrhotic patient with a high output and a
volume-loaded left heart can have a raised mean pressure **with** a raised wedge — post-capillary,
not portopulmonary, treated in the opposite direction. It is the criterion that separates them and
the one a summary report most often leaves out.

## What was dropped, and why

**OLGA/OLGIM gastritis staging was cut from this wave.** It is a genuine gap and a good tile: two
compartment scores, 0-3 each, into a 4×4 frame giving stage 0-IV, with III-IV the gastric-cancer risk
group. Two attempts to read the staging frame returned **two different tables** — the version
extracted from the derivation paper disagrees with the widely circulated one on at least the
corpus-0 row. A 4×4 lookup is exactly the kind of table where one wrong cell is invisible and
permanent, so it waits for a source that can be read cell by cell.

**The Rotterdam Budd-Chiari index was cut too**, for a sharper reason. The formula is confirmed twice
(`1.27 × encephalopathy + 1.04 × ascites + 0.72 × PT + 0.004 × bilirubin`) and the class survivals
come straight from Murad's abstract (89% / 74% / 42% at 5 years). What could not be confirmed from
any accessible source is **the bilirubin unit** — one validation paper says mg/dL, and at that unit
the bilirubin term is worth about 0.02 against class boundaries near 1.1, which makes the term
pointless and the reading almost certainly wrong. That is [spec-v1205](spec-v1205.md)'s rule with the
stakes reversed: an envelope is a claim about a quantity **in a unit**, and so is a coefficient.
Neither could the class cut-offs be confirmed. A score with an unverifiable unit is not a score.

## Sources

Every citation fetched from NCBI eutils and checked against the sentence written for it.

- Sarin SK, et al. Prevalence, classification and natural history of gastric varices. *Hepatology.* 1992;16(6):1343-1349. PMID 1446890.
- Hill LD, et al. The gastroesophageal flap valve: in vitro and in vivo observations. *Gastrointest Endosc.* 1996;44(5):541-547. PMID 8934159.
- Rodriguez-Roisin R, et al. Pulmonary-Hepatic vascular Disorders (PHD). *Eur Respir J.* 2004;24(5):861-880. PMID 15516683.
- Humbert M, et al. 2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension. *Eur Heart J.* 2022;43(38):3618-3731. PMID 36017548.

Catalog 1,718 → 1,722.
