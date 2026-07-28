# spec-v541.md — RACHS-1 (congenital heart surgery risk category) tile

> Status: **SHIPPED (2026-07-28).** Builds the `rachs1` tile — the six consensus risk categories for
> congenital heart surgery. Catalog **1390 → 1391**, group G.

## Why

`rachs`, `jenkins`, `aristotle`, and `congenital heart surgery` were all zero-hit across `corpus.json`,
`app.js`, and `lib/meta.js`.

**A population gap next to the existing `euroscore` tile**, which estimates operative mortality in **adult
acquired** cardiac surgery. RACHS-1 covers **congenital** heart surgery, mostly in infants and children. The
two share the phrase "cardiac surgery risk" and nothing else — EuroSCORE's predictors are prior cardiac
surgery, pulmonary hypertension, left-ventricular function, none of which carry the same meaning in a neonate
having an arterial switch.

## What it does

**The category comes from the procedure, not from the patient.** RACHS-1 is a consensus grouping of surgical
procedures into six categories of expected risk — unusual among the catalog's risk tools, which mostly score
patient features, and why the tile takes a procedure category rather than a comorbidity list.

| Category | Derivation-cohort in-hospital mortality |
| --- | --- |
| 1 | 0.4% |
| 2 | 3.8% |
| 3 | 8.5% |
| 4 | 19.4% |
| **5** | **none published** |
| 6 | 47.7% |

### Category 5 has no published mortality, and the tile returns none

The derivation reported **no estimate** for category 5, because there were too few cases. It was nonetheless
kept as its own category: the panel judged those patients at higher risk than category 4 and lower than
category 6, and merging it into a neighbor would have degraded comparisons.

This is the shape most likely to produce a fabricated number — category 5 sits *between* two categories that
do have figures, so "it's between 19.4 and 47.7, call it thirty-something" is an easy and entirely invented
inference. The tile returns `mortality: null` with a `mortalityPublished` flag and only the ordering the
panel actually asserted. A test verifies **no percentage string can appear** in a category 5 result.

### The modifiers are adjusted odds ratios, not points

Age at surgery ≤30 days carried an adjusted OR of about **3.0** and 31 days–1 year about **1.9** (both vs
>1 year); prematurity about **1.8**; a major non-cardiac structural anomaly about **1.8**. These *multiply*
risk within the model. They do not move a patient into a different category and cannot be summed with it. The
tile reports them as a separate `modifiers` list and says so; a test asserts the category is unchanged by
them.

**The mortality figures are historical and labeled as such** — from a registry cohort analysed for the 2002
publication. Congenital cardiac surgical outcomes have improved substantially since, so these are the numbers
the instrument was *calibrated on*, not the risk facing a child operated on today. A test asserts every
category carries that framing.

**The procedure lists are representative, not exhaustive.** The published appendix assigns many more; the
tile carries a subset for orientation and accepts a category directly, so an unlisted procedure can still be
scored once its category is known from the source.

- `lib/rachs1-v541.js` — pure category + modifiers → category, mortality-or-null, modifier list. Exports
  `RACHS_CATEGORIES` and `RACHS_MODIFIERS`.
- `views/group-v541.js` (RV541) — a category select plus three modifier controls under two **h2** headings.
- `lib/meta.js` — Jenkins and colleagues 2002 citation + accessed date + bands, related to `euroscore`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 10 worked-example unit tests + fuzz registration; synonym entry; corpus → 1391.

**HIGH-STAKES:** this is a **risk-adjustment** tool built to compare outcomes **between programs and between
case-mixes**. It was not designed to predict an individual child's outcome, and it is not a basis for
counselling a family about their own child, for choosing between operations, or for declining surgery
([spec-v11](spec-v11.md) §5.3). It says nothing about the surgeon, the institution, the timing, or the
child's physiology beyond the three modifiers, and **a category is not a difficulty rating for the operating
room**. A test asserts every category refuses the individual-prediction reading.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`rachs`), the first author (`jenkins`), the
competing system (`aristotle`), the concept (`congenital heart surgery`), and the adult neighbor
(`euroscore`) — each against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/`
scan. Only `euroscore` is non-zero, and it is the adult tile addressed above.

## Sourcing (spec-v97)

- **Citation:** Jenkins KJ, Gauvreau K, Newburger JW, Spray TL, Moller JH, Iezzoni LI. Consensus-based method
  for risk adjustment for surgery for congenital heart disease. *J Thorac Cardiovasc Surg.*
  2002;123(1):110-118.
- Categories, mortality, and the adjusted odds ratios were confirmed across two independent sources,
  including a later summary by the first author. The **absence** of a category 5 estimate was verified in
  both — it is a stated finding, not a gap in the reporting.
- The published appendix's category 6 list carried a second entry that was illegible in the available scan;
  only the Norwood operation is shipped rather than a single-sourced guess.

## Verification

Lint (all catalog-truth surfaces at 1391), unit suite (+10 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute an Aristotle or STAT mortality score, assign a category from a free-text procedure
name, adjust mortality for the modifiers arithmetically (they are odds ratios in a model this tile does not
run), or predict an individual outcome. The MCP adapter + golden-probe promotion ship in the same wave (366).
