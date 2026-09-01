# spec-v962 — A citation lives in more than one file, and mine only fixed one of them

## The finding

spec-v961 corrected `no-apnea-score`'s citation and threshold. Checking whether the same class
of error existed elsewhere, I asked a narrower question first: **when I corrected a citation in
`lib/meta.js` this session, did the same reference appear anywhere else?**

It did, in **eight places across four files** — and two of them are printed to readers, in the
explanation note under the result:

| File | Said | Should say |
| --- | --- | --- |
| `lib/renal-v128.js` ×4 | Elisaf, *Miner Electrolyte Metab* 1998 | *Magnes Res* 1997;10(4):315-320 |
| `lib/renal-v128.js` | Leypoldt, *Hemodial Int* 2003 | *Semin Dial* 2004;17(2):142-145 |
| `lib/clinical-v5.js` | Adrogué NEJM 2000;342:**1493-1499** | **1581-1589** — the sibling paper's pages |
| `lib/goligher-hemorrhoids-v351.js` | Tech Coloproctol 26(5):**341-349** | **387-392** |
| `lib/nyhus-hernia-v400.js` | Surgery **1991;110** | **1993;114** |

So a reader saw the corrected citation in one part of the page and the stale journal in the
paragraph beneath it. Self-inflicted, in specs v941 through v954.

## Sweeping the rest of the catalog

Rather than assume, I extracted every `year;volume:page` reference from the **live explanation
note** of all 1,708 tiles and compared it with that tile's own citation. **457 notes carry a
structured reference; 5 did not match.** Four are benign — a note naming a derivation paper the
citation does not repeat. One was real:

**`srivastava-index`.** The note cited *Lancet 1973;1(7807):832*; the citation cited
*Lancet 1973;2(7821):154-155*. **Both papers exist**, both are Srivastava, both are 1973 Lancet
letters on the same subject. Reading how the literature cites the MCH/RBC discriminant settles
nothing: of five citing papers found in PMC, **four use the April letter and one uses the July
paper**. That is a split, and the spec-v97 rule says a split is not a thing to pick a side of.
It now **cites and links both**, using the `citationUrls` machinery spec-v942 added for exactly
this — and the note that disagreed turns out to have been the one that was right.

## Two more, while the sources were open

**`femg`** now states what its source actually observed rather than a rule of thumb. Elisaf's
series: extra-renal hypomagnesemia 0.5–2.7%, renal loss 4–48%, controls averaging 1.8% — so a
value between 2.7 and 4% fell in neither observed group, which the old "above ~2% means renal
wasting" wording papered over.

**`nms-criteria`** linked a publisher page returning a persistent 503. It now points at the
PubMed record, which is the house preference anyway: a DOI or a record, not a publisher page.

## Proof

| Check | Result |
| --- | --- |
| stale references outside `lib/meta.js` | 8 found, 8 fixed, 0 remaining |
| notes carrying a structured reference | **457** swept |
| notes disagreeing with their citation | 5 — 4 benign, 1 real and now citing both papers |
| `node scripts/check-citation-links.mjs` | clean — 1,588 distinct links |
| `node scripts/check-citation-agreement.mjs` | clean — 3 known disagreements |
| `npm run lint`, `npm run build` | clean |
| `npm run test:unit` / `test:mcp` | 12,976 / 421 |

The 300-character citation gate and the 200-character band gate both caught my first drafts.
They are working.
