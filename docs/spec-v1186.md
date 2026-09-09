# spec-v1186 — two matches were worth less than one

[spec-v1185](spec-v1185.md) put every tile's picklist options into the search
index and closed by naming the defect it had run into rather than fixing it. This
is that wave.

## The arithmetic

A one-word query **is** a phrase, so a single word appearing in a description
collects `exactPhraseInDesc` (5) as well as `tokenInDesc` (1). Two words that both
appear, but not adjacently, collect 1 + 1. The threshold is 3:

| query | score for `opioid-conversion` | result |
|---|---|---|
| `hydromorphone` | **6** — phrase 5 + token 1 | found |
| `morphine hydromorphone` | **2** — token 1 + token 1 | **nothing** |

Naming one drug the converter handles found it. Naming two — which is how anyone
actually asks for a conversion — found nothing at all.

`tokenInDesc` stays at 1, for the reason it was set to 1: scaffolding words each
collect +1 across hundreds of tiles, and raising it drowns the clinical terms.
Lowering the threshold has the same problem from the other side.

## Coverage is a different signal

`allTokensMatched: 2` is awarded only where **every** word of a two-or-more word
query matched the same tile. It does not ask how good one word is; it asks
whether the reader's whole question landed here. A partial match cannot claim it,
so it lifts a complete answer over the threshold without letting an incomplete
one through — the property that separates it from simply lowering the bar.

It is worth less than `tokenInName` (3), so a tile that merely matches every word
can never displace one the reader named.

## Measured

**Treatment** — 205 queries pairing a word from a tile's summary with a word from
its picklist, the `morphine to hydromorphone` shape exactly:

| | before | after |
|---|---|---|
| return nothing | 23 | **1** |
| find their tile | 151 | **201** |

**Regression, catalog-wide** — every one of the 1,706 tiles queried by its own
name:

| | before | after |
|---|---|---|
| finds itself at rank 1 | 1,639 | 1,639 |
| finds itself in the top 5 | 1,706 | 1,706 |
| **tiles whose top-1 changed** | — | **0** |

Not one tile in the catalog answers its own name differently. Twenty ordinary
two-word queries (`blood pressure`, `chest pain`, `renal dose`, …) return the same
top-1 as before.

## A note on the phrase artifact

spec-v1185 writes a tile's option words as one sorted, space-joined string, so two
adjacent words in it match as an exact phrase they are not — `"codeine fentanyl"`
scores as a phrase. It is bounded (only same-tile options, only adjacent pairs)
and it flatters the measurement, so the treatment set here deliberately draws its
two words from **different fields**, where no phrase can span them. The first
version of this experiment did not, reported 146 of 146 already passing, and was
measuring its own artifact.

## Verification

`npm run release:check` green, exit code read directly rather than through a
pipe. `test/unit/whole-query-matched.test.js` negative-tested both ways: removing
the bonus fails the four findability cases, and firing it on a *partial* match
fails the synthetic coverage check. That second check is synthetic on purpose —
its first version read the live catalog, carried an escape hatch for tiles that
matched some other way, and passed while the bonus was wired to fire on a single
token.
