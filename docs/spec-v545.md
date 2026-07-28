# spec-v545.md — FIGO PALM-COEIN (abnormal uterine bleeding causes) tile

> Status: **SHIPPED (2026-07-28).** Builds the `palm-coein` tile — the nine-category TNM-style notation for
> AUB causes, 2018 revision. Catalog **1394 → 1395**, group G.

## Why

`palm-coein`, `coein`, `munro`, `abnormal uterine bleeding`, and `leiomyoma` were all zero-hit.

**A different axis from the existing `pbac-hmb` tile.** The pictorial blood loss assessment chart quantifies
**how much** a woman is bleeding. PALM-COEIN classifies **why**. A heavy PBAC says nothing about cause and a
PALM-COEIN code says nothing about volume; the two are routinely reported together and neither substitutes
for the other.

## What it does

**This is not a score. It is a notation, and every category is reported for every patient.** The system is
explicitly modelled on TNM staging, so a complete classification reads
`AUB P0 A0 L1(SM) M0 - C0 O1 E0 I0 N0`. Categories are not omitted when absent; they are recorded as 0.

**There are three values per category, not two: `0` absent, `1` present, `?` not yet assessed.** A tile
offering only present/absent would force a clinician who has not done imaging or a coagulation screen to
assert an absence they have not established. The `?` is a first-class answer, and a test asserts that `?` and
`0` produce different notations.

| Group | Categories |
| --- | --- |
| **PALM** — visually objective structural criteria | Polyp, Adenomyosis, Leiomyoma, Malignancy and atypical hyperplasia |
| **COEI** — unrelated to structural anomalies | Coagulopathy, Ovulatory dysfunction, Endometrial, Iatrogenic |
| **N** | Not otherwise classified |

**More than one category can be positive at once**, and commonly is — the system exists partly because
assuming the visible structural lesion is the cause is a known error.

**The leiomyoma category has three tiers**, and the second is the one that matters clinically: **SM**
(submucosal, involving the endometrial cavity) versus **O** (all others), because submucosal lesions are
generally considered most likely to cause the bleeding. The tile **requires** the secondary tier when L is
present. The tertiary tier gives types 0-8 and is optional. A transmural lesion is notated endometrial-first,
serosal-second, hyphenated.

### This tile implements the 2018 revision and says so

The editions disagree in two ways that change a case's classification:

- **Type 3** sits *outside* the submucous group in 2011 and *inside* it from 2018 (SM spans 0-3, O spans
  3-8, with type 3 straddling).
- **Anticoagulant-associated bleeding** was AUB-**C** in 2011 and moved to AUB-**I** in 2018, along with
  medications causing ovulatory disorders.

Both editions remain in active clinical use, so a record classified under one cannot be silently compared
with one classified under the other. The edition is returned in every result rather than assumed.

- `lib/palm-coein-v545.js` — pure categories → full notation, abbreviated form, positives, and the
  `unassessed` list. Exports `PALM_COEIN_CATEGORIES`, `CATEGORY_VALUES`, `LEIOMYOMA_SECONDARY`,
  `LEIOMYOMA_TYPES`.
- `views/group-v545.js` (RV545) — nine category selects plus the two leiomyoma sub-tiers under **h2**
  headings following the acronym's own split.
- `lib/meta.js` — 2018 revision citation with the 2011 original + accessed date + bands, related to
  `pbac-hmb`. No citation-staleness row (a named-author article; FIGO is not in `ISSUER_PATTERN`).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1395.

**HIGH-STAKES:** this is a framework for **organising** a diagnosis, not a diagnosis. It does not establish
that any category is present — each requires its own assessment, and the structural categories require
imaging or histology. **It does not exclude malignancy:** `M0` records that malignancy was *assessed and not
found*, and a classification made before endometrial sampling says nothing about whether cancer is present.
It does not quantify bleeding, does not assess anemia, does not identify **pregnancy** — which must be
excluded first in any woman of reproductive age — and is not a treatment algorithm
([spec-v11](spec-v11.md) §5.3).

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the system name (`palm-coein`, `coein`), the lead author
(`munro`), the condition (`abnormal uterine bleeding`), a category (`leiomyoma`), and the volume instrument
(`pbac`) — each against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan.
Only `pbac` is non-zero, and it is the volume tile addressed above.

## Sourcing (spec-v97)

- **Citation:** Munro MG, Critchley HOD, Fraser IS. The two FIGO systems … 2018 revisions. *Int J Gynaecol
  Obstet.* 2018;143(3):393-408. Original: Munro MG, Critchley HOD, Broder MS, Fraser IS. *Int J Gynaecol
  Obstet.* 2011;113(1):3-13.
- Categories, the three-valued cells, the leiomyoma tiers, the type 0-8 definitions, the hyphenated
  transmural rule, and the exact case notation were transcribed from the **primary 2011 text** and the
  post-2018 state confirmed against a 2024 restatement by the same lead author.

## Verification

Lint (all catalog-truth surfaces at 1395), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not implement the 2011 edition, quantify bleeding (that is `pbac-hmb`), classify bleeding
patterns under FIGO System 1, exclude pregnancy or malignancy, or recommend treatment. The MCP adapter +
golden-probe promotion ship in the same wave (370).
