# spec-v618 — EREFS endoscopic reference score (eosinophilic esophagitis)

**Status:** shipped. Catalog 1467 -> 1468. MCP wave 443, 1404 -> 1405 adapters.

This is the hundredth pair of the post-parity program, taking the catalog from 1368 to **1468**.

## Why this tile

A **whole-concept gap**. "Eosinophilic esophagitis" was zero-hit across `app.js`, and every slug spelling
returned zero — while the neighbouring esophageal tiles (`la-esophagitis`, `savary-miller`,
`prague-barrett`) were all present.

## What it does for the reader

Grade five features in each of the two esophageal regions; get both regional scores, the total, and **all
three published composite variants**, named — because a bare EREFS number does not say which one it is.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **Proximal and distal are scored separately**: 0–9 each, 0–18 overall. | Reporting a single 0–9 as "the EREFS" halves the scale. Both regional scores and the total are returned. |
| **The five features have different maxima** (1, 3, 2, 2, 1). | They are not equally weighted. |
| **Stricture — the most consequential finding — is present-or-absent only.** | It moves the score by the same single point as edema, while rings can move it by three. |
| **"The EREFS score" is ambiguous**: a full composite (0–18), an inflammatory subscore excluding rings and stricture (0–10), and a modified presence-or-absence score (0–10). | A bare number is uninterpretable. All three are returned, named. Severe rings contribute 6, 0 and 2 respectively. |
| **No validated severity bands exist.** | `band` is always `null`. The instrument is used as a trial endpoint by **change** from a patient's own baseline. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. The five features, their maxima, and the separate-region
0–9 / 0–18 structure were each confirmed twice.

- **Furrows resolved 2-to-1.** One source graded furrows absent/present (0–1); two graded them
  absent/mild/severe (0–2). A third source adjudicated in favour of three grades — the same resolvable-split
  handling used for the IGCCCG primary-site cell.
- **Rings descriptors withheld.** The published descriptors for *mild*, *moderate* and *severe* rings differ
  between renderings and were not double-confirmed, so the four grade labels ship without a descriptor for
  each. Withholding a single-sourced descriptor beats printing one.
- **Exudate 10% boundary disclosed at that grade only.** One rendering makes mild "under 10%" and severe "10%
  or more"; another makes mild "10% or less" and severe "over 10%". The tile states which it uses and
  discloses the divergence at the severe grade alone — the renderings agree at every other value.

## A bug the tests caught before release

Grade 0 is a real grade here, and `Number('')` is `0`, so an unanswered item was silently graded as *absent*.
The lookup now rejects empty values before coercion, and a test pins it. Worth remembering: the same
`findGrade` shape is safe in `pedis` only because its grades start at 1.

## Posture (spec-v11 §5.3)

Describes endoscopic **appearance**. It does not diagnose eosinophilic esophagitis — that requires an
esophageal biopsy with an eosinophil count, and **a normal-looking esophagus can still be histologically
active** — does not measure symptoms or dysphagia, does not decide dilation, diet elimination, topical steroid
or biologic therapy, and does not establish treatment response on its own.

## Files

`lib/erefs-v618.js`, `views/group-v618.js`, `mcp/adapters/erefs-v618.js`, `test/unit/erefs.test.js`.
Registered in `app.js` (tile + RV618), `mcp/catalog.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`, `lib/meta.js`, `docs/mcp-coverage.md`.
