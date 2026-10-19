# spec-v1644: Two neuro bands that named a source for a row it does not have

> Status: **SHIPPED (2026-10-19).**

Both were left open by the threshold re-read of 2026-10-09 because the full texts sit behind the
ahajournals.org bot check. What the open record says was enough to fix the wording without reading past it.

| Tile | Was | Now | What was read |
|---|---|---|---|
| `ich-score` | Score 6: "30-day mortality 100% per Hemphill 2001 Table 4." | Score 6: the paper reports no rate for 6; its highest reported score, 5, had 100% (6 of 6). `mortality30d` is `not reported`. | Abstract (PMID 11283388): 26 patients at 0 survived, all 6 at 5 died. PMC12875701 re-reports Hemphill's rates as 13/26/72/97/100% for scores 1 to 5, none for 6. PMC7539942: 152 patients. |
| `mnihss` | "mNIHSS 12 of 31: moderate stroke per Meyer 2002." | "...moderate stroke on the bands used with the full NIHSS." plus one sentence: the mNIHSS leaves out NIHSS items, so a band read from it can only understate. | Abstract (PMID 11988601): validity was measured by correlation with the NIHSS. The mNIHSS drops items 1a, 4, 7 and 10 and caps sensory at 1, so one exam's mNIHSS is never above its NIHSS. |

The band numbers are unchanged for scores 0 to 5 and for every mNIHSS total.

## Proof

- `test/unit/ich-score.test.js`: score 5 is 100%; score 6 is `not reported` and its band no longer says 100%.
- `test/unit/mnihss.test.js`: the worked example's band names the full NIHSS bands, not Meyer 2002.

## Not done here

- The full `nihss` tile prints four bands (5-20 is "moderate") while `mnihss` prints five (16-20 is
  "moderate-severe"). Which set the site uses for both needs a readable source for the five-band convention.
- "Table 4" for the ICH rates is still unread; only the rates themselves were confirmed.
