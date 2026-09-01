# spec-v954 — Nine more, and a surname the checker could not read

## The backlog was not as drained as it looked

spec-v944 matched citations on a structured `year;volume:page` reference. That pattern is how a
*paper* is cited, and it is not how a **guideline** is cited: `kdigo-aki` names "KDIGO Clinical
Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012;2:1-138", `code-blue-clock`
names an AHA Circulation supplement, `insulin-correction` names an ADA Standards-of-Care
chapter. The matcher either never tried them or rejected them on the journal token, and they
sat on the frozen backlog looking unfixable.

Nine now link, each verified against the citation's own year and pages:

| Tile | Source |
| --- | --- |
| `kdigo-aki` | the KDIGO 2012 AKI guideline's own DOI |
| `crrt-dose` | KDIGO 2012 **and** Davenport 2009, a labelled pair |
| `code-blue-clock` | AHA 2020 Part 3 |
| `peds-resus` | AHA 2020 Part 4 (PALS) |
| `digoxin` | 2022 AHA/ACC/HFSA heart-failure guideline |
| `insulin-correction` | ADA Standards of Care 2024 §16 |
| `finnegan` | Finnegan 1975 |
| `maint-fluids` | Holliday & Segar 1957 |
| `shock-index` | Allgöwer & Burri 1967 |

Backlog **49 → 40**.

## What the agreement checker caught, and what that exposed

`shock-index` failed `check-citation-agreement.mjs` the moment it was linked, on two counts —
and **the link was right**. Its citation read only "Allgower & Burri 1967 (shock index)": no
page, so one strike; and the checker read PubMed's **"Allgöwer"** against the citation's
"Allgower" as a different author, so a second.

Both are fixed, and the second one is the more useful. Medical citations write surnames without
their diacritics far more often than the index does — Allgöwer, Raîche, Rüedi. The checker now
decomposes and drops combining marks before comparing, so a citation that spells a name plainly
is not accused of naming a different paper. Without that, every such author was one missing
page number away from a false positive.

`shock-index` also gained the reference it never had: **Dtsch Med Wochenschr. 1967;92(43):1947-1950**.

## Still on the backlog

**40.** Books and manuals with no DOI (`norton-push`, `retic-index`, `cci-platelet`),
compound citations naming a work no index carries, and three where the citation's own numbers
name something the record does not (`saag` cites Hepatology 1992;16:240 for a paper PubMed
places in Ann Intern Med; `electrolyte-replacement` cites JAMA Netw Open for one PubMed places
in Crit Care Nurse). Those need the source in hand, not another lookup.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citations.mjs` | clean — **40** unlinked (was 49) |
| `node scripts/check-citation-links.mjs` | clean — 1,585 distinct links |
| `node scripts/check-citation-agreement.mjs` | clean — 4 known disagreements |
| the same, before the diacritic fold | **failed** on `shock-index`, whose link is correct |
| `citation-agreement.test.js` | 11 pass, including Allgöwer and Raîche |
| `npm run lint`, `npm run build` | clean |
