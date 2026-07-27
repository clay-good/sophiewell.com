# spec-v520.md — Spigelman stage (duodenal polyposis in FAP) tile

> Status: **SHIPPED (2026-07-27).** Builds the `spigelman` tile — the four-parameter duodenal-polyposis stage
> for familial adenomatous polyposis, total 4-12, stages 0/I/II/III/IV. Catalog **1369 → 1370**, group G.

## Why

`spigelman`, `duodenal polyposis`, and `ampullary` were all zero-hit across `corpus.json`, `app.js`, and
`lib/meta.js`.

The catalog carries several colorectal-polyposis and hereditary-cancer instruments, but every one of them
looks at the **colon**. The duodenum is where FAP patients who have already had a colectomy face their
remaining cancer risk, and Spigelman is the score that drives duodenal surveillance. This is a site gap, not
a second answer to a question the catalog already answers.

## What it does

Four parameters, each **1-3 points**, total **4-12**:

| Parameter | 1 point | 2 points | 3 points |
| --- | --- | --- | --- |
| Polyp number | 1-4 | 5-20 | over 20 |
| Largest polyp size | 1-4 mm | 5-10 mm | over 10 mm |
| Histology | tubular | tubulovillous | villous |
| Dysplasia | mild | moderate | severe |

Stages: **0 points → 0**, **1-4 → I** (mild), **5-6 → II** (moderate), **7-8 → III**, **9-12 → IV** (both
severe).

### Two things the tile refuses to paper over

**Stage 0 is not four zeros.** No parameter has a zero row, so once *any* adenoma is present the lowest
reachable total is **4**. Stage 0 means no duodenal adenomas were found at all — a finding established
*before* the score is computed, not by computing it. It also makes the published stage-I band of "1-4 points"
reachable only at its top end. The tile offers no zero option (a test asserts this), says so in the result
when the total is 4, and explains it in the invalid-input message rather than inventing a row the source does
not define.

**The dysplasia terminology changed; the score did not.** Spigelman's 1989 table graded dysplasia
mild/moderate/severe for 1/2/3 points. Pathology has since moved to a two-tiered **low-grade / high-grade**
report to reduce interobserver variability, and a two-tiered report maps to the original ends: low grade
scores 1, high grade scores 3. Each option therefore names **both** wordings, and the middle option states
plainly that a two-tiered report will not contain it. Offering low/high only would misstate the original
instrument; offering mild/moderate/severe without the mapping would leave a reader holding a modern pathology
report unable to use the tile.

- `lib/spigelman-v520.js` — pure parameters → total, stage, severity reading. Exports `SPIGELMAN_ITEMS`.
- `views/group-v520.js` (RV520) — four selects (dom `spig-number`, `spig-size`, `spig-histology`,
  `spig-dysplasia`) under two **h2** headings separating what the *endoscopist* scores from what the
  *pathologist* scores, since the two halves of the score come from two different reports.
- `lib/meta.js` — Spigelman and colleagues 1989 citation + accessed date + bands. No citation-staleness row
  (a named-author article, no guideline-issuer acronym).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1370.

**HIGH-STAKES:** this is a severity stage, **not** a management instruction. Published surveillance intervals
differ by guideline and by registry and depend on far more than the stage — ampullary involvement,
resectability, prior duodenal surgery, colonic status, age. The tile therefore emits the stage and its
standard severity reading and **stops**: no surveillance interval, no indication for endoscopic resection,
duodenectomy, or pancreas-preserving surgery ([spec-v11](spec-v11.md) §5.3). A unit test asserts no
"every N years" string can appear in the output. It also does not stage the **ampulla**, which is assessed
separately and can harbor advanced disease at a low duodenal stage.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`spigelman`), the concept (`duodenal polyposis`),
and the neighboring site (`ampullary`) — each against **both** `corpus.json` and `app.js` (and
`lib/meta.js`), plus a `test/unit/` scan. All zero.

## Sourcing (spec-v97)

- **Citation:** Spigelman AD, Williams CB, Talbot IC, Domizio P, Phillips RK. Upper gastrointestinal cancer
  in patients with familial adenomatous polyposis. *Lancet.* 1989;2(8666):783-785.
- Cross-verified against FAP duodenal-surveillance reviews reproducing the same four parameters, the same
  1/2/3 point values, and the same stage bands, and against sources documenting the mild/moderate/severe to
  low-grade/high-grade transition in dysplasia grading.

## Verification

Lint (all catalog-truth surfaces at 1370), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not stage the ampulla, emit a surveillance interval, score the colonic polyp burden, or apply
any of the proposed modified Spigelman variants. The MCP adapter + golden-probe promotion follow in the next
wave (345).
