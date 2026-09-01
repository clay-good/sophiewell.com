# spec-v947 — The duplicate finder had a blind spot shaped exactly like a duplicate

## The finding

spec-v913 audited the catalog for tiles that are the same instrument twice, and its finder was
built on one insight: *two authors building the same instrument years apart write nearly the
same name, because the instrument has a name.* To cut noise, it drops each name's parenthetical
— "the parenthetical is where a tile says which VARIANT it is."

That is true about half the time. The other half, the parenthetical holds the instrument's whole
name and an acronym stands outside it:

```
Cincinnati Prehospital Stroke Scale   ->  cincinnati, prehospital, stroke
CPSS (Cincinnati Prehospital Stroke Scale)   ->  cpss
                                                similarity 0.00
```

Two tiles of the identical instrument, scoring **zero** on the one signal the finder trusts.
Keeping the parenthetical scores the same pair **0.80**.

The pair surfaced from an unrelated direction: spec-v941 gave `cincinnati` a source link and it
turned out to be the link `cpss` already had — the same Kothari 1999 paper.

## What changed

Every pair is now scored **both ways** and keeps the higher score. The dropped-parenthetical
reading is not removed — it is right for the case it was written for, and the test proves a
variant parenthetical still matches its sibling.

Candidate pairs **89 → 129**. Forty are newly visible, thirty-six of them legitimate families
(the Kawasaki IVIG-resistance trio, the thalassemia discriminant indices, the ACC/AHA valve
stages). **Four are the same instrument built twice**, each confirmed by reading both adapters:

| Pair | Same how | Survivor |
| --- | --- | --- |
| `cincinnati` / `cpss` | the same three Kothari 1999 items, the same ≥1-abnormal rule | `cpss` — it carries interpretation bands; the other has none |
| `abc-mtp` / `abc-transfusion-score` | the same four Nunez 2009 items, the same ≥2 threshold | `abc-transfusion-score` — its bands carry the derivation sensitivity and specificity |
| `hodgkin-ips` / `ips-hodgkin` | the same seven Hasenclever adverse factors | `hodgkin-ips` — its bands give freedom-from-progression per band |
| `sort` / `sort-mortality` | the same model, coefficient for coefficient; **both worked examples return 14.67%** | `sort-mortality` — its name says what the number is |

All four are recorded in `RULED`, so a re-run reports the verdict instead of asking again.

## Why this spec does not retire them

Retiring a tile touches the alias map, the browser router, the MCP catalog and every count
surface, and spec-v914 found two things that had to be *transplanted* rather than deleted —
both discovered by a test failing, not by reading. That is its own change, done carefully.
This spec fixes the instrument that failed to find them and records what it found. Retirement
is spec-v948.

## Proof

| Check | Result |
| --- | --- |
| `similarity` on the CPSS pair, parenthetical dropped | **0.00** |
| the same pair, parenthetical kept | **0.80** |
| `node scripts/find-duplicate-tiles.mjs` | 129 candidate pairs, 12 ruled on (was 89 and 8) |
| a variant parenthetical still matches its sibling | `nameScore` = 1.00 |
| `find-duplicate-tiles.test.js` | 4 pass |
| `npm run lint`, `npm run build` | clean |
