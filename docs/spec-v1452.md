# spec-v1452 — posterior circulation ASPECTS (pc-ASPECTS)

From the classification-gap queue. The catalog scores early ischemic change in the anterior
circulation (`aspects`) and grades the deficit (`nihss`), and had nothing for the posterior
circulation, where basilar artery occlusion is read on the same kind of 10-point template.

## Sources

- Puetz V, Sylaja PN, Coutts SB, et al, *Stroke* 2008;39:2485-2490 (DOI confirmed via Crossref):
  the original, on CT angiography source images in basilar artery occlusion. Not open access.
- Lu WZ, Lin HA, Bai CH, et al, *PLoS One* 2021;16:e0246906 (open access, PMC7886215), read
  2026-09-24: the weights, and a pooled cutoff of below 7.
- Garg R, Biller J, *Front Neurol* 2017;8:293 (open access, PMC5474464), read 2026-09-24: the same
  weights, and the original's 8 to 10 versus 0 to 7 dichotomy with its relative risk.
- Puetz V, et al, *AJNR* 2009;30:1877 (PMC7051302): non-contrast CT against CT angiography source
  images.

| region | points subtracted |
|---|---|
| left thalamus, right thalamus | 1 each |
| left cerebellar hemisphere, right cerebellar hemisphere | 1 each |
| left PCA territory, right PCA territory (occipital lobe) | 1 each |
| midbrain | 2 |
| pons | 2 |

The weights total 10, so a normal scan is 10 and change in every region is 0.

## Behavior

Each of the eight regions is a select (early ischemic change / none), not a checkbox, so a region
nobody read stays blank. Any blank refuses with "Choose ... still needed: <regions>" and no partial
score. Unlike the sibling `aspects`, whose checkboxes read an unticked region as normal, this tile
never counts an unread region as unaffected. The band states the score, the affected regions, and
which side of the original 8-to-10 / 0-to-7 dichotomy it falls on, flagged as derived on CT
angiography source images. Notes add the relative risk the source reports, the weak non-contrast CT
correlation, and the meta-analysis cutoff. The score does not decide reperfusion.

## Tests

`test/unit/pc-aspects.test.js`: a clean scan is 10; each region's weight; all regions reach 0;
bilateral thalami cost 2; the 8/7 boundary and the exact example band; blanks refuse by name with
no score; the notes carry the source facts.
