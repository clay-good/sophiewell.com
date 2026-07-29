# spec-v593 — Revised Bethesda guidelines (MSI testing)

## What this gives you

Whether a colorectal tumor should be tested for microsatellite instability — and an explicit account of why
this tile and `amsterdam-ii` will sometimes disagree.

## Why it exists

A **companion with inverted logic** to the Amsterdam II criteria shipped one wave earlier. Amsterdam II is an
**AND of six**; Bethesda is an **OR of five**. They were written to catch the families Amsterdam II misses,
and running one without the other is the commonest way a Lynch family is lost.

## The five criteria — any one is enough

| # | Criterion | Age rule |
|---|---|---|
| 1 | Colorectal cancer | under 50 |
| 2 | Synchronous or metachronous Lynch-associated tumors | **none** |
| 3 | Colorectal cancer with MSI-high **histology** | under 60 |
| 4 | ≥ 1 **first-degree** relative with a Lynch tumor | one cancer under 50 |
| 5 | ≥ 2 **first- or second-degree** relatives with Lynch tumors | **none** |

**Three different age rules, and two criteria with none.** Carrying one threshold across the set is the
easiest way to get this wrong.

## Why this tile and Amsterdam II disagree

The Bethesda spectrum is far broader: it adds **stomach, ovarian, pancreas, biliary tract, brain** and
sebaceous lesions to Amsterdam II's five. A family whose cancers are gastric and ovarian **fails Amsterdam II
on spectrum alone and still triggers Bethesda**. That disagreement is correct.

## Two things about criterion 3

- **The 60-year threshold was settled by a vote, not by data.** The revision's own account records that there
  was no consensus on whether to include an age criterion at all.
- **It uses a pathologist's impression of MSI to decide whether to test for MSI.** "MSI-H histology" —
  tumor-infiltrating lymphocytes, Crohn's-like reaction, mucinous/signet-ring differentiation, medullary
  growth — is a morphological judgment, not a laboratory result. A screening step for the screening test.

## Scope (spec-v11 §5.3)

Decides **who gets a test**, not who has Lynch syndrome. Meeting a criterion is not a diagnosis and not a
prediction. **Failing all five does not exclude Lynch syndrome** — many centers moved to universal tumor
testing because criteria-driven selection misses cases — and a normal MSI or MMR result does not exclude it
either. Germline testing has implications for relatives and belongs with genetic counseling.

## Sourcing (spec-v97)

Two renderings disagreed on three cells: whether criterion 1 includes endometrial cancer, whether criterion 3
carries the under-60 limit, and whether criterion 5 admits second-degree relatives. A third source — which
records the vote on the 60-year threshold and quotes criterion 5 as "first- or second-degree" — resolved all
three in favour of the verbatim 2004 text, which is what is implemented. The dissenting rendering was a
modernized paraphrase in a genetics reference, not a competing account of the same text.

- Umar A, Boland CR, Terdiman JP, et al. *J Natl Cancer Inst.* 2004;96(4):261-268.

## Files

`lib/bethesda-v593.js`, `views/group-v593.js`, `mcp/adapters/bethesda-v593.js` (wave 418),
`test/unit/bethesda.test.js`. Catalog 1442 → 1443; MCP 1379 → 1380.
