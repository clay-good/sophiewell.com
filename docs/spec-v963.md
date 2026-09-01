# spec-v963 — Auditing every threshold I could actually read

## Why

spec-v961 found a screening cutoff off by one because a wrong citation had hidden it. That
raised an obvious question I had not answered: **how many other tiles state a threshold that
their source does not?** I had checked nine — the ones whose citations I corrected. There are
1,708.

## The audit

Only a fraction is checkable without a paywall, and the funnel is worth recording:

| | |
| --- | --- |
| Tiles linking a PubMed record | **389** |
| …stating a numeric cutoff in their note or bands | **113** |
| …whose source has open-access full text | **18** |
| …not already verified this session | **16** |

For each, the tile's stated cutoff was put beside every "cutoff/threshold" sentence in the
paper's full text.

**A measurement error nearly buried the result.** The first pass reported **0 of 113** open
access. That was wrong: `elink` given a batch of ids merges them into one linkset with an empty
`links` array, so everything reads as closed. Repeating `&id=` does not fix it either. The PMC
**ID converter** (`/pmc/utils/idconv/`) batches correctly. A zero from a batch API deserves the
same suspicion as a zero from a grep.

## What it found

Fourteen agreed or had nothing comparable. One did not.

**`mcmahon-rhabdo` uses a cutoff of 6 and attributed it to "the authors."** The derivation says
something else:

> "A low risk score predicted a favorable outcome: **a score of less than 5** identified patients
> with a 3% risk of the primary outcome … **Using 5 as the cutoff**, the negative predictive
> value for the primary outcome was 97.0%."
> — McMahon 2013, *JAMA Intern Med* 173:1821-1828 (PMC5152583)

**The number was not changed, and that is the point.** Reading five citing papers shows ≥ 6 is
the settled clinical convention — "a McMahon risk score ≥ 6 has … sensitivity of 86% and
specificity of 68%", and "a clinical consensus statement from the Critical Care Committee in
Trauma Surgery also recommends a McMahon score ≥ 6". One citing paper states both plainly: *"In
the study conducted by McMahon et al, a score of 5 was identified as the threshold."*

So there are two cut-offs in circulation and the tile silently picked one while crediting it to
a paper that used the other. It now says so — the same treatment `tici` gets for the two TICI
scales, and what spec-v97 asks for when sources disagree: present both rather than pick.

A score of exactly **5** sits below the cut used here and at or above the derivation's. A reader
comparing a result against the original paper now finds that stated instead of surprising.

## Proof

| Check | Result |
| --- | --- |
| tiles whose threshold could be compared with an open-access source | **16 audited** |
| thresholds contradicting their source | 1 — `mcmahon-rhabdo`, an attribution rather than a number |
| the ≥ 6 computation | **unchanged**, and a test pins it so |
| the note | names both cut-offs; no longer says "per the authors" of the one they did not use |
| `mcmahon-rhabdo.test.js` | 9 pass, 2 new |
| `npm run lint`, `npm run build` | clean |
| `npm run test:unit` / `test:mcp` | 12,978 / 421 |
