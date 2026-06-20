# v12 audit - scoff

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Morgan JF, Reid F, Lacey JH. The SCOFF questionnaire: assessment of a new screening tool for eating disorders. BMJ. 1999;319(7223):1467-1468 (re-fetched; the five verbatim questions and the >= 2 cutoff cross-read from the open BMJ paper / PubMed PMID 10582927 and independent reproductions; the verbatim Q5 wording "food dominates your life" was confirmed over a paraphrased variant).

`lib/psych-v123.js scoff()` counts the five yes/no items (Sick, Control, One stone,
Fat, Food); a count of 2 or more flags a likely eating disorder warranting further
assessment. PROVENANCE: free to use -- the questions are reproduced in full in the
open BMJ paper (spec-v100 §8 cleared). Class A (fixed item set; journal+author
citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- no items -> 0/5, below threshold.
- one positive -> below the 2-positive threshold.
- two positives -> band-flip to a positive screen.
- all five positive -> 5/5.
- scalar fuzz arg -> valid 0/5, never NaN.

## Cross-implementation differential
- Reference: the five items and >= 2 cutoff match the open BMJ source; the verbatim
  original Q5 ("food dominates your life") is used, not the longer paraphrase some
  reproductions carry. Match. PASS.

## Edge-input handling notes
- Five labeled checkboxes; count clamped 0-5. A scalar fuzz arg yields a valid 0/5,
  never NaN.

## A11y / keyboard notes
- Five labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
