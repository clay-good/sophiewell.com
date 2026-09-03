# spec-v999 — Four "Search PubMed for this source" links opened an empty page

## The finding

Twelve tiles cite a book chapter or a pre-1946 paper that no index carries. Rather than link a
paper that is not there, spec-v943 gave them a PubMed **search** link and the label "Search PubMed
for this source", and the README counts them separately from the 1,627 that link straight through.

`check-citation-links.mjs` passed all twelve, because a PubMed search URL answers `200` no matter
what it finds. Running the reader's own query instead of just fetching the page:

| Tile | Results |
| --- | --- |
| `russell-taylor-subtroch` | **0** |
| `simple-shoulder-test` | **0** |
| `shunt-fraction` | **0** |
| `lund-browder` | **0** |

Four readers in twelve clicked a link promising a route to the source and landed on an empty
results page. The terms were built by stringing the citation's words together —
`Lund+Browder+estimation+of+areas+of+burns+1944` — which is a phrase search against records that do
not exist.

**This is spec-v980 again in a different place: a 200 is not proof the page is there.** The
prior-auth ledger learned it about payer sites; the citation checker had the same blind spot for
search URLs.

## What changed

The four terms now find the literature the reader is actually after, verified by result count and
by reading the top hits:

| Tile | New query | Top hit |
| --- | --- | --- |
| `russell-taylor-subtroch` | `"Russell-Taylor" AND subtrochanteric` | *Classifications in Brief: The Russell-Taylor Classification of Subtrochanteric Hip Fracture* |
| `simple-shoulder-test` | `"simple shoulder test" AND (Matsen[au] OR Lippitt[au])` | *Is the Simple Shoulder Test a valid outcome instrument for shoulder arthroplasty?* |
| `shunt-fraction` | `"shunt fraction" AND "venous admixture"` | a pulmonary shunt-fraction measurement study |
| `lund-browder` | `"Lund-Browder" AND burn` | *Technical and Medical Aspects of Burn Size Assessment and Documentation* |

`kindOf()` gains a fourth kind, `pubmed-search`, and the checker runs the query through `esearch`
and fails on a zero count. Negative-tested: putting the old `lund-browder` term back fails with
"PubMed search returns no results".

## The other half: a 500 is not a dead link either

Three consecutive runs of this checker produced three *different* failures — an `esummary` batch,
`apps.who.int`, and `federalregister.gov` — and every one answered 200 on retry. DOIs were already
retried three times; plain web links were not, so a publisher's bad moment was reported as a dead
source. `checkWeb` now believes 404 and 410 the first time (the server saying the document is
gone) and retries 5xx and dropped connections three times before reporting. A report that cries
wolf is a report people stop reading.

`who-mucositis` was also moved from `apps.who.int` to `iris.who.int`, which is where it redirects.

## Proof

`node scripts/check-citation-links.mjs` — clean, 1,622 distinct links across 1,678 tile
references, with all twelve searches returning results.
