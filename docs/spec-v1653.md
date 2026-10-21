# spec-v1653: An agent summary states the bands its tool prints

> Status: **SHIPPED (2026-10-19).**

The Epworth tile was corrected on October 10 to the published interpretation (11-12 mild, 13-15 moderate,
16-24 severe), but its agent summary still said "11-14 mild, 15-17 moderate, 18-24 severe". An agent read
"14 is mild" in the summary and got "moderate" back. The summary now states the bands the result prints
and says they are the published interpretation, not stated in Johns 1991.

Found by sampling each agent tool whose summary names two or more "a-b word" bands and checking that a
score in each range gets that word. The only other hit, CISNE, was its "0-8" scale range, not a band.

## Proof

`test/mcp/summary-bands-epworth.test.js`: at both ends of each band the summary names, the result prints
that band's word.
