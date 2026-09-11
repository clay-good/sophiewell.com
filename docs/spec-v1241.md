# spec-v1241 — Four classifications that sit beside one already here

Every tile in this wave has a neighbor in the catalog that answers a *different* question about the
same injury. That is the point: when two systems classify one film, the reader's risk is not that
they cannot find a calculator, it is that they use the wrong one and never notice.

| new tile | the neighbor it is not | what separates them |
| --- | --- | --- |
| `ao-spine-tl` | `tlics-score` | different score, different thresholds, no conversion |
| `ao-spine-subaxial` | `slic-score` | SLIC sums to a number; this one deliberately does not |
| `herbert-scaphoid` | `russe-scaphoid` | Herbert sorts by stability; Russe by the fracture line |
| `lenke-scoliosis` | `cobb-angle`, `risser-sign` | the catalog measured the parts and never assembled them |

Each tile names its neighbor in its own copy, so the distinction is on the page the reader is on
rather than in a doc they will not open.

## One neurology vocabulary, written once

Both AO Spine classifications describe an injury as morphology + neurology + modifiers, and both use
the same letters N0-N4 and NX with the same meanings. Two tiles built in the same wave by the same
hand is exactly when the second copy looks harmless, so the letters live in
`lib/ao-spine-neuro-v1241.js` and both import them ([spec-v1201](spec-v1201.md)). A unit test asserts
both tiles read the same NX so a later paste cannot quietly fork them.

**NX is not N0.** It means the patient could not be examined — intubated, sedated, head injured — and
in the thoracolumbar score it is worth 3 points, more than a persistent radicular symptom. A tool
that let NX fall through to N0 would turn "we do not know" into "they are fine."

## The thoracolumbar tile: two papers, and the tile says which is which

Kepler 2016 publishes the TL AOSIS point values and states in as many words that surgical thresholds
"will be established later." The ≤3 / 4-5 / ≥6 bands everyone quotes are **Lambrechts 2023's**,
validated against 815 injuries. Printing them under Kepler's name would credit a paper with a
recommendation it declined to make, so the tile names the source of each half where the answer is
read.

**M2 scores zero and still matters.** A patient comorbidity — ankylosing spondylitis, DISH, severe
osteoporosis — changes the operation without changing the number. The total alone would make a
recorded M2 indistinguishable from an empty form, so it is printed beside the score.

## The subaxial tile: the one that refuses to add up

Schroeder 2021 publishes a severity value for every subaxial subtype, and it is tempting to sum them.
They are **perceived severity on a 0-100 scale, one value per subtype, from a survey of surgeons** —
not addends. A sum would have no denominator, no validation and no threshold, and a reader would
quite reasonably treat it as a score.

So this tile assembles the code, reports the single most severe component as a weight out of 100, and
says what it is not. The thoracolumbar side has a real additive score; this side does not; the two
tiles sit next to each other and the difference is the whole story.

The facet is a separate axis, and the code carries it: **an A1 body with an F4 facet is a dislocation**
that the morphology letter alone reads as minor. The tile prints that sentence exactly when that is
the case.

## Herbert: the letter is not the stability

A1 and A2 are stable, B1-B5 unstable — and C and D are neither. They record what happened *after* the
fracture, a union that came late or never came, so answering "stable" or "unstable" for a D2 would be
answering a question the classification stopped asking. The tile says which of the three questions it
has answered.

B3 gets its own sentence. It is a B like the others and it is the fragment whose blood supply enters
from the far end, which is why it carries the group's highest rates of avascular necrosis and
non-union. The letter does not say that.

## Lenke: the rung it is read wrongly on is 3 against 6

The type is derived, not read off a film. A minor curve is structural when its side-bending Cobb is
≥25°, or when its region is kyphotic ≥+20° (T2-T5 for the proximal thoracic curve, T10-L2 for the
other two); the major curve — the largest standing Cobb — is structural by definition.

Types 3 and 6 both have a structural main thoracic and a structural thoracolumbar/lumbar curve with a
non-structural proximal thoracic. **Type 6 is not "whichever is bigger."** Lenke requires the lumbar
curve to exceed the thoracic by at least 5°. A lumbar curve 4° larger is a type 3, and the worked
example is exactly that case, with the margin printed.

Two refusals rather than a guess:

- **A proximal thoracic major curve has no Lenke type.** All six types put the major curve in the
  main thoracic or thoracolumbar/lumbar region. The tile says so instead of naming the nearest.
- **Nine angles, each envelope-guarded.** A 400° Cobb is a transcription error and the classification
  would otherwise answer it without complaint ([envelope program](spec-v1205.md)).

### A bug found in the shared guard, and worked around rather than papered over

`inputFault` in `lib/num.js` tests `raw === ''` *before* it trims, and `Number('')` is `0` — so a
field holding only spaces arrives as a legitimate zero. That is [spec-v1155](spec-v1155.md)'s
whitespace trap, in the shared guard this time, and roughly a hundred tiles call it. Fixing it here
would be a helper change riding out inside a tile wave; this tile normalizes locally, names the
defect in a comment, and the helper is queued for a wave of its own.

## Sources

Every citation fetched from NCBI eutils and checked against the sentence written for it.

- Vaccaro AR, et al. AOSpine thoracolumbar spine injury classification system. *Spine.* 2013;38(23):2028-2037. PMID 23970107.
- Kepler CK, et al. The Thoracolumbar AOSpine Injury Score. *Global Spine J.* 2016;6(4):329-334. PMC4868575.
- Lambrechts MJ, et al. Validation of the AO Spine Thoracolumbar Injury Classification System Treatment Algorithm. *Spine.* 2023;48(14):994-1002. PMID 37141491.
- Vaccaro AR, et al. AOSpine subaxial cervical spine injury classification system. *Eur Spine J.* 2016;25(7):2173-2184. PMID 25716661.
- Schroeder GD, et al. Establishing the Injury Severity of Subaxial Cervical Spine Trauma. *Spine.* 2021;46(10):649-657. PMID 33337687.
- Herbert TJ, Fisher WE. Management of the fractured scaphoid using a new bone screw. *J Bone Joint Surg Br.* 1984;66(1):114-123. PMID 6693468.
- Lenke LG, et al. Adolescent idiopathic scoliosis: a new classification to determine extent of spinal arthrodesis. *J Bone Joint Surg Am.* 2001;83(8):1169-1181. PMID 11507125.

Catalog 1,710 → 1,714.
