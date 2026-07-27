# spec-v528.md — Oxford MEST-C (IgA nephropathy biopsy) tile

> Status: **SHIPPED (2026-07-27).** Builds the `mest-c` tile — the five-lesion Oxford classification of an
> IgA nephropathy biopsy. Catalog **1377 → 1378**, group G.

## Why

`mest`, `mesangial`, `endocapillary`, and `berger` were all zero-hit across `corpus.json`, `app.js`, and
`lib/meta.js`. The four non-zero probe tokens were each read in context and belong elsewhere: `iga` is a
myeloma isotype *value*, `haas` is a Banff co-author, `oxford` is the OASIS severity score and a journal
name, `nephropathy` is the Mehran contrast-nephropathy tile.

**A different axis from the existing `kfre` tile**, which estimates kidney-failure risk from serum and urine
measures. MEST-C grades what the **biopsy** shows in one specific glomerulonephritis. A serum-based
progression estimate and a histologic grading are different quantities — the same reasoning under which the
catalog already carries both non-invasive liver-fibrosis estimates and the histologic METAVIR stage.

## What it does

**This tile returns a code, not a score, and that is the point.**

MEST-C is reported as its five lesion scores side by side — `M1 E0 S1 T1 C0` — and is **not summed**. Summed
"total Oxford scores" running 0-7, with grades I/II/III, exist only as a **research grading proposal** and
are not the standard biopsy report. A calculator that added the five up would invent a report format
pathologists do not issue, and would flatten five independent lesions — which carry different implications
and are acted on differently — into one number that means nothing on its own. So the tile emits the code,
reports each lesion separately with its definition, and **produces no total**. Three tests pin this: no
`total` or `score` field exists, and the copy states why.

| | Lesion | Levels |
| --- | --- | --- |
| **M** | Mesangial hypercellularity | M0 score ≤0.5 / M1 >0.5 |
| **E** | Endocapillary hypercellularity | E0 absent / E1 present in any glomerulus |
| **S** | Segmental glomerulosclerosis | S0 absent / S1 present |
| **T** | Tubular atrophy and interstitial fibrosis (share of **cortical area**) | T0 0-25% / T1 26-50% / T2 >50% |
| **C** | Cellular or fibrocellular crescents (share of **glomeruli**) | C0 none / C1 >0 and <25% / C2 ≥25% |

**The M threshold is deliberately the mesangial score, not a percentage of glomeruli.** Sources reproducing
M as "more than 50% of glomeruli" disagree with each other about whether the boundary is strictly above 50%
or at-or-above 50%. The underlying **mesangial hypercellularity score** threshold — above 0.5 — is
unambiguous and consistent across sources, so that is what the tile asks for and what its copy states. It is
also closer to how the biopsy is actually read: the pathologist has already computed that score.

T and C are shares of *different denominators* — cortical area versus glomeruli — and each option says which,
because mixing them is an easy and consequential error.

- `lib/mest-c-v528.js` — pure lesion scores → code plus a per-lesion breakdown. Exports `MEST_C_LESIONS`.
  Case-insensitive, and rejects a score borrowed from the wrong lesion (`M: 'E1'`) by name.
- `views/group-v528.js` (RV528) — five selects (dom `mest-M` … `mest-C`) under an **h2** heading, each
  labeled with the lesion's definition.
- `lib/meta.js` — 2009 Oxford classification citation with the 2016 C-lesion update + accessed date + bands,
  related to `kfre`. No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 12 worked-example unit tests + fuzz registration; synonym entry; corpus → 1378.

**HIGH-STAKES:** MEST-C describes a biopsy. It does **not diagnose IgA nephropathy**, which requires
mesangial IgA deposition on **immunofluorescence** rather than any of these five light-microscopy lesions. It
is **not a treatment algorithm**: management turns on proteinuria, blood pressure, and the eGFR trajectory
alongside the histology, and the decision to use immunosuppression in particular is not read off a letter
code ([spec-v11](spec-v11.md) §5.3). The lesions are scored on the tissue **sampled**, so a biopsy with few
glomeruli can miss focal findings, and C in particular can only be scored on what was sampled.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`mest`), the lesion name words (`mesangial`,
`endocapillary`), the eponym (`berger`), the disease (`iga`, `nephropathy`), the classification's home city
(`oxford`), and the competing eponym (`haas`) — each against **both** `corpus.json` and `app.js` (and
`lib/meta.js`), plus a `test/unit/` scan. The four non-zero hits were read in context and are all false
positives, listed above.

## Sourcing (spec-v97)

- **Citation:** Cattran DC, Coppo R, Cook HT, et al. The Oxford classification of IgA nephropathy: rationale,
  clinicopathological correlations, and classification. *Kidney Int.* 2009;76(5):534-545. C lesion added in
  Trimarchi H, Barratt J, Cattran DC, et al. *Kidney Int.* 2017;91(5):1014-1021.
- Every threshold was transcribed from **two independent sources agreeing on each value**. Where a third
  rendering disagreed — the C1 lower bound stated as "1-25%" rather than ">0 and <25%" — the majority
  rendering was shipped; and the M percentage form was avoided entirely in favor of the unambiguous score
  threshold, as described above.

## Verification

Lint (all catalog-truth surfaces at 1378), unit suite (+12 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not compute a summed Oxford score or O-grade (deliberately — see above), diagnose IgA
nephropathy, apply the Haas or Lee classifications, score the Banff transplant lesions, or recommend therapy.
The MCP adapter + golden-probe promotion follow in the next wave (353).
