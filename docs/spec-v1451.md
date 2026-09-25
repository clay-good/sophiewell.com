# spec-v1451 — Raymond-Roy occlusion classification (coiled aneurysms)

From the classification-gap queue. Aneurysm care had the bleed grades (`hunt-hess-wfns`) and
stroke reperfusion had its angiographic grade (`tici`), but there was no tool for the angiographic
result of coiling an aneurysm, which is what every follow-up angiogram reports.

## Sources

- Roy D, Milot G, Raymond J, *Stroke* 2001;32:1998-2004 (DOI confirmed via Crossref): the three
  original classes. Not open access.
- Mascitelli JR et al, *J Neurointerv Surg* 2015;7:496-502 (DOI confirmed via Crossref): the
  IIIa/IIIb update, from 370 patients with 390 aneurysms. Not open access.
- Beaman C et al, *Imaging of Intracranial Saccular Aneurysms*, Stroke Vasc Interv Neurol
  2023;3:e000757 (open access, PMC12778686), read 2026-09-24. It states both, and is the text this
  tool applies:

| class | definition (as stated) | this tool asks |
|---|---|---|
| I | complete aneurysm occlusion | no contrast filling |
| II | residual aneurysm neck | neck fills only |
| III | residual aneurysm | part of the sac fills |
| IIIa | residual aneurysm with contrast within coil interstices | sac fills, within the coils |
| IIIb | residual aneurysm with contrast along aneurysm wall | sac fills, along the wall |

## Behavior

The class is **derived** from the angiogram: where contrast fills sets I, II or III; for a residual
sac, where the contrast sits sets IIIa or IIIb. Without that second answer the tool gives class III
and asks for the location. A location entered for class I or II is reported as unused. A subclassed
residual carries the 2015 comparison the review quotes (IIIb less likely to improve, 14.89% vs
83.34%; more likely to stay incompletely occluded, 85.11% vs 16.67%; a trend toward more later
rupture, 3.23% vs 0.00%, P = 0.068; validated in an external cohort). Every answer says the scale
is inadequate for flow-diverted aneurysms and does not decide retreatment. A blank filling refuses.

## Tests

`test/unit/raymond-roy.test.js`: each class and its exact band; class III asking for the subclass;
an unused location reported; the outcome figures only for IIIa/IIIb; the refusals.
