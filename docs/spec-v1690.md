# spec-v1690 — DALYs, and a typo in the source table

> Status: **SHIPPED (2026-11-07)**. Closes [spec-v1659](spec-v1659.md) tool 9. One new tile; catalog
> 2,363 → 2,364. Follows [spec-v1689](spec-v1689.md), which closed the other gate of its kind.

## The gate, re-tested

spec-v1659 left `daly` unbuilt for one line: "The WHO global burden of disease methods paper was not
read." It is freely published on WHO's own CDN. The current edition downloads over `curl` in one call:
**HTTP 200**, 1.3 MB, 48 pages — *WHO methods and data sources for global burden of disease estimates
2000-2023*, Global Health Estimates Technical Paper **WHO/DSA/DDA/GHE/2026.3, September 2026**.

That is two gates in a row (see spec-v1689) where the recorded reason was a property of a fetch
attempt rather than of the document.

## What the paper governs

- **Section 2.** "DALYs for a specific cause are calculated as the sum of the YLLs from that cause and
  the YLDs ... DALY = YLL + YLD".
- **Section 2, YLL.** `YLL = N × L(s,a)`, deaths times "a standard loss function specifying years of
  life lost for a death at age a".
- **Section 2.1, the simplified form WHO adopted.** YLDs "simply as the prevalence of each sequela
  multiplied by the relevant disability weight"; adjustment for comorbidity; and **"No discounting for
  time or unequal age weights."**
- **Section 2.2 and Table 2.1.** The loss function is normative, "based on the projected frontier life
  expectancy for 2050", life expectancy at birth 92.7 years, and is "intended to represent the
  potential maximum life span of an individual in good health at a given age". One column for both
  sexes.

## A typo in Table 2.1, recorded rather than silently corrected

Table 2.1's WHO GHE cell for ages **75-79 is printed `17,19`** — a comma where every other cell in the
column uses a decimal point. This is in the PDF itself, not an extraction artifact; it reproduces when
that page alone is re-extracted.

`17.19` is the only reading consistent with the source: the column falls monotonically (70-74 is 21.62,
80-84 is 13.08), and the GBD 2010 column beside it runs 16.78 / 12.85. It is entered as 17.19, the lib
comment is the audit trail, and a unit test asserts both the value and the monotonicity that justifies
it — so a future transcription cannot quietly put the comma back as a thousands separator.

## What the tile refuses to pretend

- **A blank side is not a zero.** Deaths alone reports "the fatal side only; a cause with a long
  non-fatal course loses most of its burden that way". Prevalence alone says it is the disability side
  only. Neither reads as the cause's burden.
- **The age range is required whenever deaths are entered**, because the years lost *are* the age: the
  refusal names the span it turns on (92.65 years for a neonatal death down to 7.28 at 85 and over).
- **The disability side is unadjusted.** WHO adjusts YLDs for independent comorbidity, which needs
  every sequela in the population. The tile says so whenever it shows a YLD, and warns that adding
  several causes computed this way overstates the total.
- **Not comparable with older WHO figures**, which used a 3% discount rate, age weights, and an
  incidence basis. A neonatal death here is 92.65 years; under the old method the paper says "a death
  in infancy corresponds to 33 DALYs". A test asserts the figure is not 33.
- **Nothing is banded.** A DALY count is a quantity, not a graded verdict, and the paper sets no
  threshold.

## Proof

- `test/unit/daly-v1690.test.js` — nine cases: the two sides added with each one's arithmetic shown,
  every Table 2.1 figure plus the mistyped cell and the monotonicity that fixes it, the required age
  range, each side alone naming what it lacks, the comorbidity caveat present only when a YLD is shown,
  the no-discounting check against the old 33-DALY infant figure, the 0-to-1 weight bounds, no banding,
  and whitespace not read as a measured zero.
- `check-citations` — WHO is a tracked issuer, so the tile carries an `accessed` date and a
  `docs/citation-staleness.md` row. That row carries a **watch**: the loss function is re-tabulated at
  each edition, so a new technical paper moves every years-lost figure in the tile.
- `check-catalog-truth` — 2,364 across 13 surfaces, group J 62 → 63, README source-link count 2,264.
- `docs/unbuilt-tools.md` regenerates to 13 unbuilt, down from 14.

## Still gated in spec-v1659, with the evidence

- **Tool 6, `herd-immunity-threshold`.** Fine 1993 (*Epidemiol Rev*) and Fine, Eames and Heymann 2011
  (*Clin Infect Dis* 52:911, doi:10.1093/cid/cir007) are behind the publisher. The only full texts
  reachable are a course-site PDF and a Scribd upload, neither a publisher copy nor a verified reprint.
- **Tools 10 and 11, the sample-size pair.** Lwanga and Lemeshow 1991 is a priced WHO publication
  (ISBN 9241544058) with no copy in WHO IRIS; the reachable PDFs are third-party scans on university
  and document-sharing sites. A scan on an unaffiliated server is not the verified reprint the owner's
  November rule allows, so these stay gated on a copy of the manual rather than on a search.
