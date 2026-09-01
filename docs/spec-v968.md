# spec-v968 — The three links that opened the wrong paper

## Why

`check-citation-agreement` does not ask whether a link resolves. It asks whether the record
behind the link is the paper the citation names. Three tiles had been frozen in
`KNOWN_DISAGREEMENTS` since spec-v945 as needing human source review. Two of them did not.

## What each link actually opened

| Tile | Its citation names | Its link opened |
| --- | --- | --- |
| `delbet-femoral-neck` | Spence D, et al. *J Am Acad Orthop Surg* 2018;26(11):389-402 | "Basic Science and Clinical Application of Reamed Sources for Autogenous Bone Graft Harvest," *JAAOS* 26:420-428 |
| `rhig-dose` | Sandler SG, AABB RhIG dosing after fetomaternal hemorrhage, *Transfusion* 2015;55(3):680-689 | "Plasma transfusion trials and tribulations," *Transfusion* 55:14-16 |
| `savary-miller` | Savary & Miller, *The Esophagus: Handbook and Atlas of Endoscopy*, 1978 | "Intestinal permeability in patients with Crohn's disease and their first degree relatives," *Gut* 1992 |

### `delbet-femoral-neck` — a review that does not exist

PubMed carries no *JAAOS* 2018 paper titled "Management of pediatric femoral neck fractures," at
that pagination or any other, and the linked PMID is a different article from the same volume.
The real Spence paper on this subject is **Spence D, DiMauro JP, Miller PE, et al.
"Osteonecrosis After Femoral Neck Fractures in Children and Adolescents: Analysis of Risk
Factors." *J Pediatr Orthop.* 2016;36(2):111-116**, which reports osteonecrosis in 20 of 70
children and finds **fracture location** among its two multivariable predictors — the fact the
tile's per-type AVN risk rests on. Cited and linked.

### `rhig-dose` — the numbers were right and the subject was not

*Transfusion* 2015;55(3):680-689 is a real Sandler paper: "It's time to phase in RHD genotyping
for patients with a serologic weak D phenotype." The tile's citation described AABB **RhIG
dosing after fetomaternal hemorrhage** and attached those numbers to it. The paper that states
the procedure the tile implements is **Sandler SG, Gottschall JL. "Postpartum Rh
immunoprophylaxis." *Obstet Gynecol.* 2012;120(6):1428-1438**:

> "a four-step procedure determines the postpartum dose (number of vials of 300 micrograms …)
> … whether an excessive (greater than 30 mL fetal whole blood) fetomaternal hemorrhage
> occurred … the formula for calculating the dose includes a precautionary adjustment, adding
> an extra vial in borderline situations to prevent underdosing."

That is the tile's rule — 300 µg per 30 mL, round, add one — in the source's own words.

## The one that needs an owner's decision

`savary-miller` currently sends a reader looking up esophagitis grades to a 1992 study of
intestinal permeability in Crohn's disease. **No index carries its actual source.** PubMed has no
Savary-Miller classification paper; a search of Ollyo, Monnier and Savary returns nothing
defining the grades; and Europe PMC full-text search finds the grades *quoted* in twenty-one
open-access papers and *defined* in none.

Deleting the wrong link is the obvious move, and it is blocked. A dated citation with no link
violates rule 6 unless the tile joins `data/citation-url-backlog.json`, and a "Search PubMed"
link is only allowed for tiles in `SEARCH_URL_GRANDFATHERED`. **Both lists are declared
shrink-only.** A 1978 book belongs in the second by its own definition — every other member is a
book chapter, a meeting abstract or a pre-1946 paper — but admitting it is a policy change, not
a lint fix, so it is left for the owner rather than made quietly here.

## Proof

| Check | Result |
| --- | --- |
| `KNOWN_DISAGREEMENTS` | **3 → 1** (twelve at spec-v945) |
| replacement papers | both verified against the PubMed record on journal, volume, pages, year, author and title |
| `check-citation-agreement.mjs` | clean — 1,508 links checked, 1 known disagreement |
| `citation-agreement.test.js` | 11 pass; the frozen list and both new links are pinned |
| `npm run lint` | clean |

No computed answer changed.
