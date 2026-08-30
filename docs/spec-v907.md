# spec-v907 — Hepatic VOD / SOS: which definition is actually met

## Why

Hepatic veno-occlusive disease, also called sinusoidal obstruction syndrome, has three
definitions in common use and **they do not agree**. A unit working from one paper can call a
patient a case while a unit working from another cannot. Nothing in the catalog held that
disagreement: `veno-occlusive`, `sinusoidal obstruction`, `hepatic vod` and `baltimore` were all
zero-hit across the 1695 tile names, and `vod-sos` was free on `app.js` and `mcp/adapters`.

## What it does

Takes the days since transplant and the recorded findings, and reports **each definition
separately** — met or not, and why.

| Definition | Window | What it asks for |
| --- | --- | --- |
| Modified Seattle (1993) | ≤ 20 days | two of three: bilirubin > 2 mg/dL; hepatomegaly **or** right upper quadrant pain of liver origin; weight gain > 2% |
| Baltimore (1987) | ≤ 21 days | bilirubin ≥ 2 mg/dL **and then** two of three: painful hepatomegaly; ascites; weight gain > 5% |
| EBMT 2016 adult, classical | ≤ 21 days | the Baltimore items |
| EBMT 2016 adult, late-onset | > 21 days | the classical picture, **or** histological proof, **or** two or more classical items with hemodynamic or ultrasound evidence |

## The two things it is for

**The bilirubin gate.** Baltimore and the 2016 criteria count nothing until the bilirubin is
raised. Modified Seattle counts it as one of three. So a patient with hepatomegaly and a rising
weight but a normal bilirubin **meets modified Seattle and meets neither of the others** — and
which paper the unit works from decides whether that patient has the diagnosis. Where the
definitions part, the tile prints both readings and **offers neither as the answer**.

**Day 21 is not an exit.** The classical definitions put a hard window on the diagnosis; the 2016
criteria added a late-onset category precisely because disease beyond day 21 is real. A "not met"
from Seattle or Baltimore on day 30 says only that their window closed, and the tile says so in
those words.

## What it deliberately does not do

- **Severity grading.** The 2016 paper grades mild through very severe on bilirubin kinetics,
  transaminases, weight, renal function and organ dysfunction. That is a separate exercise and is
  not attempted here.
- **Pediatrics.** These are the adult criteria. The EBMT published separate pediatric criteria in
  2018 that carry no day limit and do not require a raised bilirubin at all. Stated on every
  result.

## Files

New: `lib/vod-sos-v907.js`, `views/group-v907.js`, `mcp/adapters/vod-sos-v907.js`,
`test/unit/vod-sos.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

## Sourcing

Two open sources per spec-v97: the 2016 EBMT position paper (Mohty et al, *Bone Marrow
Transplant*) and the original Seattle (McDonald 1993, *Ann Intern Med*) and Baltimore
(Jones 1987, *Transplantation*) reports. Neither the EBMT nor those journals is in
`ISSUER_PATTERN`, so no `docs/citation-staleness.md` row is owed.

Catalog 1695 → 1696.
