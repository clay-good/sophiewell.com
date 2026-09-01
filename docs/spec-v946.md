# spec-v946 — Seven citations whose own numbers were wrong

## The finding

spec-v945 corrected 49 links that opened the wrong paper and froze twelve it could not fix by
swapping a link, because for those the *citation* was wrong, not the URL. This is that follow-up.

Seven of the twelve name a real paper under numbers that belong to something else:

| Tile | Citation said | The paper is |
| --- | --- | --- |
| `femg` | Miner Electrolyte Metab. 1998;24(2-3):315-318 | **Magnes Res. 1997;10(4):315-320** |
| `std-ktv` | Hemodial Int. 2003;7(2):138-143 | **Semin Dial. 2004;17(2):142-145** |
| `increment-cpe` | Mayo Clin Proc. 2017;92(1):74-84 | **Mayo Clin Proc. 2016;91(10):1362-1371** |
| `goligher-hemorrhoids` | Tech Coloproctol. 2022;26(5):341-349 | **26(5):387-392** |

The page number carried over and the journal did not — `femg`'s citation kept "315" through a
change of journal, volume and year, which is why it looked plausible for so long.

`dimeglio-clubfoot` and `prisma-7` had correct citations and a wrong link;
`eat-sleep-console` names two papers and linked neither, and now links both (Grossman 2017 and
the 2023 Eat-Sleep-Console trial).

Running the liveness checker again with a browser User-Agent — society and publisher sites
answer an unfamiliar agent with 504 or 403 while serving a browser normally — surfaced two
more dead links: `priapism-gas` (the AUA moved its guideline; it now links the J Urol paper
itself) and `pa-turnaround` (a truncated Federal Register URL).

## What changed

Four citations corrected, seven links repointed, two dead links fixed, and
`KNOWN_DISAGREEMENTS` cut from **twelve to five**. The five that remain need a human with the
source in hand: three cite a paper no index carries under the numbers given
(`delbet-femoral-neck`, `no-apnea-score`, `rdw-index`), one names a book chapter with no
numbers at all (`savary-miller`), and `rhig-dose` describes AABB dosing guidance while its
numbers name a paper about RHD genotyping — deciding what that tile's source actually is, is
source review, not a link swap.

`check-citation-links.mjs` now asks as a browser does, which is the question that matters: can
a reader open this page.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-citation-agreement.mjs` | clean — **5** known disagreements (was 12) |
| `node scripts/check-citation-links.mjs` | clean — 1,579 distinct links across 1,628 references |
| `node scripts/check-citations.mjs` | clean |
| `npm run lint`, `npm run build` | clean |
