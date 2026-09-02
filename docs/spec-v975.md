# spec-v975 — Sixteen calculators now print the abbreviation a clinician types

## What this is

spec-v974 fixed the ranker so a tile is findable by any acronym printed in its own name. This
change is the other half: **sixteen tiles were not printing theirs.**

`tsat` is the tile id of Transferrin Saturation, and the name read
*"Transferrin Saturation + iron-studies interpreter"*. Typing `tsat` returned an ICHD-3 headache
tile. Same shape for the Revised Cardiac Risk Index (`rcri`), Body Surface Area (`bsa`), the
Clinical Frailty Scale (`cfs`), the Mood Disorder Questionnaire (`mdq`) and eleven others: the
instrument has one universally used abbreviation, and the catalog spelled the name out without it.

## The fix

The acronym goes in the tile's name, in parentheses, the way 778 other tiles already do it. That
is one edit per tile with no ranking change, it fixes the pre-rendered page `<title>` and the
result row a reader scans, and the spec-v974 gate then covers each one for free.

| Tile | Now reads |
| --- | --- |
| `aec` | Absolute Eosinophil Count (**AEC**, eosinophilia grading) |
| `arr` | Aldosterone-Renin Ratio (**ARR**, primary-aldosteronism screen) |
| `bfcrs` | Bush-Francis Catatonia Rating Scale (**BFCRS**) |
| `bsa` | Body Surface Area (**BSA**) |
| `ccsr` | Canadian C-Spine Rule (**CCR**) |
| `cfs` | Clinical Frailty Scale (**CFS**, Rockwood) |
| `gahs` | Glasgow Alcoholic Hepatitis Score (**GAHS**) |
| `gir` | Glucose Infusion Rate (**GIR**, mg/kg/min) |
| `mdq` | Mood Disorder Questionnaire (**MDQ**, bipolar screen) |
| `mppr` | Multiple-Procedure Payment Reduction (**MPPR**) |
| `mrs` | Modified Rankin Scale (**mRS**, stroke outcome) |
| `nnt-arr` | Number Needed to Treat / Absolute Risk Reduction (**NNT, ARR**) |
| `pucai` | Pediatric Ulcerative Colitis Activity Index (**PUCAI**) |
| `rcri` | Revised Cardiac Risk Index (**RCRI**, Lee) |
| `tsat` | Transferrin Saturation (**TSAT**) + iron-studies interpreter |
| `yos` | Yale Observation Scale (**YOS**) |

Fourteen of the sixteen now return their own tile first. The other two are honest ambiguities the
catalog owns, and both now appear at rank 2 where they used to be nowhere:

- **`bsa`** — Body Surface Area against the Body Weight & BSA Suite.
- **`mrs`** — the Modified Rankin Scale against the Menopause Rating Scale, which already printed
  (MRS). `ARR` is the same shape and is why the NNT tile is on the list: the aldosterone-renin
  ratio and absolute risk reduction are both ARR, so **both** tiles print it rather than one
  claiming the query.

## Two the probe reported that were not defects

An earlier cut flagged `gds15`, `dast10`, `crb65`, `snot22`, `pss10`, `vhi10`, `puqe24`, `pfdi20`,
`sixcit` and `npass` as unreachable. They are the *tile ids* with the hyphen removed, and the
catalog names print the hyphenated form — `GDS-15`, `DAST-10`. Every one of those is already found
when typed the way it is written. **A tile id is not a query.** Only acronyms with no hyphenated
form in the name were changed.

`agr` was left alone: the name prints **(A/G)**, which is how the ratio is written, and `AGR` is
not a standard abbreviation. Inventing one to satisfy a probe would be the wrong direction.

## Proof

| Check | Result |
| --- | --- |
| the 16, typed as a clinician writes them | 14 rank 1, 2 rank 2 (from absent or rank 3+) |
| `test/unit/acronym-findable.test.js` | 7 pass — the 16 new acronyms are now inside its sweep |
| `npm run lint` / `test` / `test:mcp` | clean / 12,998 pass / 421 pass |
| `npm run test:mobile` | 38 pass, both 320px sweeps |

## Files

Changed: `app.js` (16 names), and the generated `data/search-corpus/`, `report-catalog.js`,
`index.html` JSON-LD feature list, `sbom`. New: this file.
