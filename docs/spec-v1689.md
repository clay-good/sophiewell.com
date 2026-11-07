# spec-v1689 — Hand hygiene compliance, and the gate that was not a gate

> Status: **SHIPPED (2026-11-07)**. Closes the one tool [spec-v1655](spec-v1655.md) specified and could
> not build. One new tile; catalog 2,362 → 2,363.

## The gate was stale, not real

spec-v1655 shipped seven infection-prevention tools and left the eighth, `hand-hygiene-compliance`,
unbuilt for one stated reason: the WHO *Hand Hygiene Technical Reference Manual* (2009) "returned a
bot-check page from WHO IRIS and PAHO on October 19, 2026, so its compliance formula and its
definitions of opportunity and action were not read."

That is no longer true, and it is worth recording how it was found out rather than assumed. The WHO
publication page gives a direct IRIS bitstream URL for the English PDF. `WebFetch` on that URL returns
**HTTP 403**; `curl` with an ordinary browser user-agent returns **HTTP 200** and an 840 KB, 34-page
PDF. The wall is on one fetcher, not on the document. A build gate that records "the source would not
load" is a claim about a tool, and it needs re-testing before it is inherited — the same lesson as the
"known miniflare failure" in [spec-v939](spec-v939.md), which turned out to be an incomplete local
install rather than a defect.

## What the source says

Read from WHO IRIS (`iris.who.int/handle/10665/44196`) on November 7, 2026.

Section III.7, *Reporting hand hygiene compliance*:

> Compliance with hand hygiene is the ratio of the number of performed actions to the number of
> opportunities and is expressed by the following formula: **Compliance (%) = Performed actions /
> Opportunities × 100**

The same section's five reporting rules decide what may be counted: at least one indication defines an
opportunity; each opportunity requires one action; one action may apply to more than one indication; a
documented action counts only where it corresponds to an opportunity; and **observation of a positive
action does not always imply the existence of an opportunity**.

An opportunity is the "[m]oment during health-care activities when hand hygiene is necessary to
interrupt germ transmission by hands. It constitutes the denominator for calculating hand hygiene
compliance." An indication is the "[r]eason for a hand hygiene action."

## The misread the tile is built around

Figure 8 is the manual's own worked observation: nine indications, **six opportunities**, and "four
positive (performed) hand hygiene actions of which three are linked to opportunities." The numerator is
the three. The observation is 50%, not the 66.7% that dividing the four actions seen would give.

A calculator taking two numbers cannot detect that error — 4 over 6 is a perfectly dividable 66.7%, and
nothing in the pair reveals that one action answered no opportunity. So the tile does the only honest
thing available to it: it **names what belongs in the numerator on every result**, not only when
something looks wrong, and its input labels ask for "hand hygiene actions performed **at those
opportunities**" rather than for actions seen.

Where the arithmetic *can* refuse, it does. More actions than opportunities means actions without an
opportunity were included, and compliance above 100% contradicts the manual's own definition
("Compliance describes an exact equivalence between the number of actions and the number of
opportunities. Non-compliance is when the number of opportunities exceeds the number of actions
performed"). That is refused, with the manual's example quoted back.

## No target rate

The manual sets none, so the tile sets none: `abnormal` is always false, nothing is banded, and the
result is the percentage and its denominator. The manual's own observation principle — "gather data on
200 opportunities per observation per unit ... per observation period" — is reported as a **precision
caveat on the denominator**, in as many words ("It is not a failing figure, only a smaller
denominator"), because a 10-opportunity audit reading 90% is imprecise, not good. A unit test asserts
no target, goal, benchmark or pass mark appears in any output string.

## Per moment, because that is the form

Compliance is reported per WHO moment and overall, with each moment's own denominator beside its
figure, because that is the shape the manual's observation form records. A moment that was not observed
is **left blank, never entered as zero**: zero opportunities is not zero percent, and the tile refuses
that pair rather than printing a 0% no one observed. When fewer than five moments are entered, the
result says so — "this figure covers 2 of the five moments and not hand hygiene overall" — so a partial
audit cannot be read as a facility rate.

## Proof

- `test/unit/hand-hygiene-compliance-v1689.test.js` — twelve cases: the manual's Figure 8 at 50%, the
  4-of-6 counting trap and the note that answers it, the above-100% refusal, per-moment denominators,
  the partial-observation sentence, the 200-opportunity caveat firing below and silent at 200, the
  no-target scan, zero actions as a real 0%, zero opportunities refused, whole-number counts, and
  whitespace not read as a measured zero.
- `check-citations` — WHO matches the guideline-issuer pattern, so the tile carries an `accessed` date
  and a `docs/citation-staleness.md` row.
- `check-catalog-truth` — 2,363 across 13 surfaces, group J 61 → 62, README source-link count 2,263.
- `check-mcp-catalog` — 2,321 adapters, example round-trips.
- `docs/unbuilt-tools.md` regenerates to 368 shipped and 14 unbuilt, down one.
