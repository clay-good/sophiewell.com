# spec-v532.md — Columbia classification of FSGS (biopsy variant) tile

> Status: **SHIPPED (2026-07-28).** Builds the `columbia-fsgs` tile — the five-variant morphologic
> classification of focal segmental glomerulosclerosis. Catalog **1381 → 1382**, group G.

## Why

`fsgs`, `dagati`, `podocyte`, and `collapsing` were all zero-hit across `corpus.json`, `app.js`, and
`lib/meta.js`. The two non-zero probes were read in context and are false positives: `columbia` is the C-SSRS
suicide-severity scale, and `perihilar` is the Bismuth-Corlette cholangiocarcinoma tile — a bile duct, not a
glomerulus.

## What it does

**This is not a score. It is a decision procedure** over five *mutually exclusive* variants applied in a
fixed order of precedence — and the whole value of implementing it is that the order is easy to get wrong by
hand. The tile therefore takes the **findings** and applies the hierarchy, rather than asking the reader to
name a variant they have already decided on.

| # | Variant | Defining lesion |
| --- | --- | --- |
| 1 | **Collapsing** | Segmental or global collapse **with** overlying podocyte hypertrophy and hyperplasia. **No exclusions — trumps everything.** |
| 2 | **Tip** | A segmental lesion in the tip domain (outer 25% of the tuft next to the proximal tubule origin), tubular pole identified, with an adhesion or confluence of podocytes with parietal or tubular cells. |
| 3 | **Cellular** | Segmental endocapillary hypercellularity occluding lumina, ± foam cells and karyorrhexis. |
| 4 | **Perihilar** | Perihilar hyalinosis ± sclerosis, **and** more than 50% of glomeruli bearing segmental lesions show perihilar sclerosis or hyalinosis. |
| 5 | **NOS** | Segmental increase in matrix obliterating capillary lumina. Diagnosis of exclusion; may show collapse **without** podocyte hyperplasia, which is what separates it from collapsing. |

### The tip veto is not a rank comparison, and this is the trap

Tip **outranks** perihilar in the order above — yet the tip definition itself says to exclude **any**
perihilar sclerosis. So a biopsy with a qualifying tip lesion *and* perihilar sclerosis anywhere is **not
tip**; it falls through to the next variant whose criteria it meets. Implemented as a rank comparison ("tip
beats perihilar, so call it tip"), this returns the wrong answer on exactly the biopsies where the
distinction matters. It is encoded as a hard veto, surfaced in the result when it fires, and pinned by two
tests — one of which is deliberately constructed so a naive rank comparison would return `tip` and the
correct answer is `perihilar`.

**The perihilar threshold is strictly greater than 50%** — exactly half does not qualify. One reproduction
renders it as "at least 50%"; the criteria table's own wording was shipped.

**The cellular 25%-of-tuft qualifier is named but not enforced.** Several references add it, but it appears
in narrative text rather than the criteria table. Enforcing a criterion the table does not state would make
the tile stricter than the classification, so it is described in the field's help text and left out of the
logic. A test asserts both halves of that decision.

**No defining lesion yields no variant**, not a default — the classification sorts a biopsy that already
shows FSGS, so with nothing to sort the tile says so.

- `lib/columbia-fsgs-v532.js` — pure findings → variant, plus a `tipVetoed` flag. Exports `FSGS_FINDINGS`.
- `views/group-v532.js` (RV532) — six yes/no selects (dom `fsgs-*`) under an **h2** heading.
- `lib/meta.js` — D'Agati and colleagues 2004 citation + accessed date + bands, related to `mest-c`. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 13 worked-example unit tests + fuzz registration; synonym entry; corpus → 1382.

**HIGH-STAKES:** this names a **morphologic variant**. It does **not diagnose FSGS**, and — the point that
actually changes management — it does **not distinguish primary FSGS from a secondary or adaptive form**
(obesity, reflux, reduced nephron mass, viral, drug). That distinction is made from clinical context, the
degree of proteinuria, and electron microscopy showing diffuse foot-process effacement, and *it* is what
decides whether immunosuppression is even considered — not the variant
([spec-v11](spec-v11.md) §5.3). The variants carry reported prognostic associations at the group level; those
are not a prediction for an individual, and **no outcome figure is attached to any variant** (a test asserts
this). The variants are scored on the tissue sampled, and a tip lesion in particular can be missed on a
biopsy with few glomeruli.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`fsgs`), the first author (`dagati`), the
classification's name (`columbia`), and the lesion words (`podocyte`, `collapsing`, `perihilar`) — each
against **both** `corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The two non-zero
hits are the false positives named above.

## Sourcing (spec-v97)

- **Citation:** D'Agati VD, Fogo AB, Bruijn JA, Jennette JC. Pathologic classification of focal segmental
  glomerulosclerosis: a working proposal. *Am J Kidney Dis.* 2004;43(2):368-382.
- The publisher's full text is not openly accessible; the criteria and both exclusion columns were
  transcribed from independent sources reproducing the classification's criteria table, which agree on all
  five inclusion criteria, all four exclusion columns, and the perihilar threshold. Where a secondary source
  gave an incomplete exclusion list for the perihilar variant (omitting tip), the criteria table's three-way
  exclusion was shipped.

## Verification

Lint (all catalog-truth surfaces at 1382), unit suite (+13 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not diagnose FSGS, distinguish primary from secondary disease, apply the Oxford MEST-C lesions
(that is `mest-c`), grade electron-microscopy findings, attach an outcome to a variant, or recommend therapy.
The MCP adapter + golden-probe promotion follow in the next wave (357).
