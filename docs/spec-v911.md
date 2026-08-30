# spec-v911 — Chronic GVHD severity, beside the two acute ones

## Why

The catalog graded **acute** graft-versus-host disease twice — modified Glucksberg and MAGIC — and
held nothing for the chronic disease, which is scored on an entirely different system.
`chronic gvhd` and `nih consensus` were zero-hit across the 1699 tile names.

## What it does

Eight organs are each scored 0–3: skin, mouth, eyes, gastrointestinal tract, liver, lungs, joints
and fascia, genital tract. The global severity follows.

| Severity | Rule |
| --- | --- |
| Severe | any organ at **3**, or a **lung score of 2 or 3** |
| Moderate | any organ at **2**, or **three or more** organs at 1, or a **lung score of 1** |
| Mild | one or two organs at **1**, with the lung at **0** |

## The three things it is for

**The lung scores on its own.** A lung score of 1 makes the disease at least moderate; 2 or 3
makes it severe — whatever every other organ shows. That override is the part of the algorithm
most often missed, so it prints on every result, and the headline names it as the reason when it
is what decided the grade.

**Not assessed is not zero.** An organ never looked at is not an organ known to be uninvolved.
Each organ carries an explicit *not assessed* option, blanks are never read as zeros, and the
result says how many were left out and which — because leaving one out can only pull the grade
down.

**The diagnosis is assumed already made.** Chronic graft-versus-host disease needs at least one
diagnostic manifestation, or a distinctive one with confirmatory testing. Severity scoring is not
that test, and the tile says so rather than letting a grade stand in for a diagnosis.

Every organ scored 0 returns *no organ involvement recorded*, not "mild".

## Files

New: `lib/cgvhd-severity-v911.js`, `views/group-v911.js`, `mcp/adapters/cgvhd-severity-v911.js`,
`test/unit/cgvhd-severity.test.js`, this file.
Wired: `app.js`, `mcp/catalog.js`, `lib/meta.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `docs/mcp-coverage.md`, `data/synonyms.json`, and the
count surfaces.

Note on the view: each select is written as `'<dom-id>', C.ORGAN_SCORE_OPTIONS` so that
`scripts/lib/option-labels.mjs` resolves the option text from the exported list. Eight selects
sharing one list would otherwise have printed forty raw values on the tool page, against a cap
that is currently exactly full.

## Sourcing

Jagasia 2015 (*Biol Blood Marrow Transplant*), the 2014 NIH consensus Diagnosis and Staging
Working Group report, cross-checked against the same algorithm as tabulated in the EBMT-EHA
chronic graft-versus-host disease handbook. Neither issuer is in `ISSUER_PATTERN`, so no
`docs/citation-staleness.md` row is owed.

Catalog 1699 → 1700.
