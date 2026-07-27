# spec-v524.md — Gray-Weale carotid plaque type (ultrasound echogenicity) tile

> Status: **SHIPPED (2026-07-27).** Builds the `gray-weale` tile — the four B-mode echogenicity types of
> carotid plaque. Catalog **1374 → 1375**, group G.

## Why

`gray-weale`, `weale`, `echolucent`, `nicolaides`, and `gsm` were all zero-hit across `corpus.json`,
`app.js`, and `lib/meta.js`. (`echogenicity` and `plaque` do have hits, but they belong to the ACR TI-RADS
thyroid tile and to unrelated prose — vet what a token is *doing*, not just that it appears.)

**A different axis on the same vessel** from the existing `nascet-carotid-stenosis` tile, which is why this
is not a second answer to a question already answered. NASCET measures **how narrow the lumen is**.
Gray-Weale describes **what the plaque appears to be made of**. The two are known to disagree — a tight
stenosis can be uniformly echogenic and a modest one uniformly echolucent — so neither substitutes for the
other, and each tile now names the other.

## What it does

Four types, dark to bright:

| Type | Appearance | Group |
| --- | --- | --- |
| 1 | Uniformly echolucent, typically beneath a thin echogenic cap | Echolucent |
| 2 | Predominantly echolucent, small areas of echogenicity | Echolucent |
| 3 | Predominantly echogenic, small areas of echolucency | Echogenic |
| 4 | Uniformly echogenic, including the extensively calcified plaque | Echogenic |

The tile returns the **group** alongside the type, because most of the published association is reported at
the group level rather than per type.

**It is a grade read by eye, and the tile says so.** The reading is anchored to structures in the same
image — the vessel **lumen** anchors what counts as echolucent, the bright **media-adventitia interface in
the far wall** anchors what counts as echogenic — so it depends on gain settings and on the operator. That
subjectivity is why computerized grayscale-median measurement exists as an alternative; this tile records the
visual type and does **not** compute a grayscale median. Type 4 additionally names the **acoustic shadow**
dense calcification casts, which can hide plaque behind it.

- `lib/gray-weale-v524.js` — pure type → description, group, and caveats. Exports `GRAY_WEALE_TYPES`. Accepts
  roman numerals as aliases.
- `views/group-v524.js` (RV524) — one select (dom `gw-type`) under an **h2** heading, whose option text
  carries each type's appearance so the reader picks the picture rather than a number.
- `lib/meta.js` — Gray-Weale and colleagues 1988 citation + accessed date + bands, related to
  `nascet-carotid-stenosis`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1375.

**HIGH-STAKES:** echolucent plaque has been **associated** with symptomatic disease in published series. That
is a group-level association, not a risk for the patient in front of you, so the tile states the direction
and attaches **no stroke rate** to any type (a test asserts this). Most importantly, the plaque type is
**not an indication for carotid endarterectomy or stenting**: the trials that established when to intervene
selected patients on **degree of stenosis and symptom status**, not on echogenicity, so a type 1 plaque is
not a reason to operate and a type 4 plaque is not a reason not to ([spec-v11](spec-v11.md) §5.3). A test
asserts every one of the four results carries both the not-stenosis and not-an-indication disclaimers.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`gray-weale`, `weale`), the co-eponym
(`nicolaides`), the concept's own name word (`echolucent`), and the computerized alternative (`gsm`) — each
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. All zero. The two
non-zero neighbors (`echogenicity`, `plaque`) were read in context and belong elsewhere.

## Sourcing (spec-v97)

- **Citation:** Gray-Weale AC, Graham JC, Burnett JR, Byrne K, Lusby RJ. Carotid artery atheroma: comparison
  of preoperative B-mode ultrasound appearance with carotid endarterectomy specimen pathology. *J Cardiovasc
  Surg (Torino).* 1988;29(6):676-681.
- Cross-verified against carotid-ultrasound references reproducing the same four types in the same order, the
  same echolucent/echogenic grouping, and the lumen and far-wall media-adventitia reference structures.

## Verification

Lint (all catalog-truth surfaces at 1375), unit suite (+9 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute a grayscale median, measure stenosis, apply the type 5 (heavily calcified,
unclassifiable) designation some later series add, assess plaque surface irregularity or ulceration, or
recommend intervention. The MCP adapter + golden-probe promotion follow in the next wave (350).
