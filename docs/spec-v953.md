# spec-v953 — The visible group name is written five times and nothing kept them in step

## The finding

`GROUP_LABELS` is what a reader sees above a list of tools: **"Clinical Scoring & Risk"**,
**"EMS & Field Medicine"**, **"Billing & Reimbursement"**. It is declared **five times**:

| File | What it renders |
| --- | --- |
| `app.js` | the group name in the live app's breadcrumb and search results |
| `scripts/build-tool-pages.mjs` | every one of the 1,706 pre-rendered tool pages |
| `scripts/build-tools-index.mjs` | the section headings on `/tools/` |
| `scripts/build-hub-pages.mjs` | the section headings on each audience hub |
| `scripts/audit-coverage.mjs` | the maintainer's audit-coverage report |

Nothing held them in step, and **one had already drifted**: `audit-coverage.mjs` was missing
group **B** entirely, so its report printed a bare `B B` against the 25
billing-and-reimbursement tiles rather than naming them.

The four reader-facing copies happened to still agree. That is luck rather than design — the
next label edit had four chances to leave one behind, and this repo already knows what happens
then: a visible surface with more than one copy drifts unless something checks it.

## What changed

Group B is back in the audit report, and `check-catalog-truth.mjs` — the script whose whole
job is holding one truth across many surfaces — now compares all five maps against `app.js`
and fails on any of the four ways they can disagree:

- a **missing** group (the real defect: the report prints the bare letter),
- a **renamed** group, reported with both names,
- an **extra** group no other copy has,
- a file that has **lost its map** altogether.

The comparison lives in `scripts/lib/group-labels.mjs` as two pure functions, so the rule is
unit-tested without touching the filesystem, and one test reads the five shipped files and
asserts they agree.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/audit-coverage.mjs` | prints `B Billing & Reimbursement 0/25`, was `B B 0/25` |
| `node scripts/check-catalog-truth.mjs` | clean — **15 group labels agree across 5 files** |
| the same, with group B deleted again | **fails**, naming the file, the group and the label it should have |
| `group-labels.test.js` | 7 pass, one case per drift shape |
| `npm run lint`, `npm run build` | clean |
