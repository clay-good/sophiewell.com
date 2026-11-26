# spec-v1804 — The developer's name, in nineteen more refusals

> Status: **SHIPPED (2026-11-26)**: all 58 refusals that named an input by its camelCase argument now name
> it the way the control does. `probe-identifier-in-refusal` is the nineteenth finder held to zero. No
> tool's arithmetic changed; the catalog stays 2,390.

[spec-v1790](spec-v1790.md) built the finder and fixed the first batch: `free-water-deficit` told a reader
to "extend replaceOverHours or raise targetNa", two camelCase identifiers where the boxes they had just
filled read "Replace over" and "Target Na". [spec-v1015](spec-v1015.md) had fixed the **shape** of that
sentence years earlier, when a nurse was shown `weightKg out of range [0.3, 500]` — "a refusal in the words
of a stack trace, from the tool that is supposed to be the plain-language one". This is the same complaint
about its **content**, and the remaining 58 rows across 19 tools are closed here.

| What a reader was told | What the control says |
|---|---|
| *Select a valid score for `functionalReach`* | Functional reach |
| *Still needed: `maximalStimulationPorEpisodes`* | Episodes of poor response after maximal stimulation |
| *Each value must be a non-negative number. Check: `trVelocity`* | Peak TR velocity |
| *Out of range: `sagittalDeviation` (0 to 3)* | Sagittal deviation |
| *Functional-System grade — still needed: `bowelBladder`* | Bowel & bladder FS |
| *Answer `fixedFee` with yes or no* | The fee is the only charge |
| *Lawton IADL not scored: rate `foodPrep`* | Food preparation |
| *Still needed: `nkCellActivity`* | NK-cell activity |
| *Score `motorProgramming` from 0 to 3* | Motor programming / Luria series |

The fix is the one `lib/thwaites-v529.js` has had since it was written: a `text` beside the key, printed
instead of it. Four tables already carried one and simply did not use it — `lupus-nephritis-indices` and
`twstrs-severity` each pass their items around with `text` on them and then interpolated `.key` in the
refusal. Seven needed the field added. Six assemble their message from a key list and now carry a small
map beside it.

## Why no gate caught any of this

`scripts/check-tile-copy.mjs` scans `views/` for house vocabulary on screen. These strings live in `lib/`,
and **the libraries are where the refusals are written** — so the one gate that looks for the wrong words in
front of a reader was looking in the wrong directory. The finder is that gate now, for this one shape, and
it carries **no ledger**: a refusal that names a camelCase argument is never the right answer, because no
control anywhere shows that word.

## Two tests pinned the defect

`test/unit/lupus-nephritis-indices.test.js` asserted `/fibrousCrescents/` under the title *"a missing
component is refused and named"*, and `test/unit/rucam.test.js` asserted `/priorInfo/` under *"every domain
is required and named when missing"*. Both titles state the rule correctly and both assertions pinned the
violation — the argument name, which is the thing spec-v1790 exists to keep out of a refusal. Each now
asserts the reader's words **and** that the argument name is absent, so the test fails if either half slips.

That is the third time this session a test has had to be rewritten because it pinned one layer's exact
wording rather than the rule the wording serves: [spec-v1793](spec-v1793.md)'s sign-flipped floors,
[spec-v1798](spec-v1798.md)'s lymphocyte-count refusal, and these two. A wording assertion is a liability
wherever the words are the thing being improved.
