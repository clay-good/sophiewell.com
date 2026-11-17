# spec-v1753 — Just past the ceiling

> Status: **SHIPPED (2026-11-16)**: the envelope finder drives a second value; 41 tools fixed. The catalog stays
> 2,387.

`scripts/probe-envelope-unbounded.mjs` drove each mapped field to ten times its `lib/bounds.js` ceiling. spec-v1752
found fullPIERS refusing an SpO2 of 1,000 and scoring 150: a tool with its own looser limit refuses the absurd and
answers the merely impossible. The finder now drives 1.5 times the ceiling first, then ten times; the first that
answers is the row.

That found 60 fields across 41 tools, each refusing ten times the ceiling but answering just past it: a creatinine of
37.5 mg/dL in MELD-Na, MELD 3.0, LODS, CLIF-C AD, FIPS, ADHERE and others; platelets of 3,000 in Binet, Rai, Hasford,
PALBI, the fibrosis scores and the inflammation indices; an INR of 30; a WBC of 300; a respiratory rate of 120; a
bilirubin of 90; an age of 195 in two energy equations. Each library now checks the entered value with
`boundsAdvisory` after its missing-value branch, in its own refusal shape; MELD's scoring caps (creatinine 4, floors
of 1) are unchanged, and the entered value is what is checked.

The envelopes refuse below their floor too, so a few low entries that used to score now refuse: a respiratory rate
below 3/min (OASIS, REMS, CART, ventilation index, Wang, consistent with spec-v1742), ALT or AST below 1 U/L,
calcium below 3 mg/dL, INR below 0.5, creatinine below 0.1 mg/dL, PaCO2 below 5 mmHg.

Done by three parallel agents split by library file. The finder reports 0.

Tests: one spec-v1753 case in each tool's own unit test file.

Follow-ups: the page test `envelope-refused-on-page.spec.js` now drives 1.5 times the ceiling too (951 fields, all
refused), and `scripts/probe-adapter-only-bounds.mjs` drives just past each adapter bound. That found `batt`'s own
GCS check at 0-15 where its label and adapter say 3-15; it is now 3-15 in whole steps. The finder's other rows are
range sliders, `o2-cylinder-duration` (spec-v1744) and `peds-weight-est`'s 0.5 years, which it reads correctly as 6
months.
