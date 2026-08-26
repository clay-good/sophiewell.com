# spec-v796.md — EU-TIRADS (thyroid nodule ultrasound stratification)

> Status: **SHIPPED (2026-08-26).** Builds the `eu-tirads` tile. Catalog **1587 → 1588**,
> group G.

## Why

The catalog had `acr-tirads` (the American system) and `bethesda-thyroid` (the cytology that
follows the needle). It did not have the **European** system, which is what most of the world
outside North America reports — and which reaches its answer a completely different way.

## What it does

**Four high-risk features. Any ONE makes the nodule category 5, whatever else it looks like:**

- taller-than-wide shape
- irregular margins
- microcalcifications
- marked hypoechogenicity

With none of them, the category comes from the basic appearance:

| Appearance | Category | FNA indicated above |
| --- | --- | --- |
| No nodule | 1 | — |
| Pure cyst or entirely spongiform | 2, benign | **never on ultrasound grounds** |
| Ovoid, smooth, iso- or hyperechoic | 3, low risk | 20 mm |
| Ovoid, smooth, mildly hypoechoic | 4, intermediate | 15 mm |
| Any high-risk feature | 5, high risk | 10 mm |

**The thresholds shrink as suspicion rises** — the more worrying the nodule, the smaller it
needs to be before a needle is warranted. That inversion is the whole practical point, and
tests pin all four thresholds.

Two further behaviors are pinned because they are easy to get wrong:

- **The threshold is *above*, not *at or above*.** A 20 mm category-3 nodule is not indicated
  on size; 20.1 mm is.
- **A category 2 nodule never triggers FNA on size**, however large — a 90 mm spongiform
  nodule still returns "not indicated on ultrasound grounds."

**Worked example:** a 12 mm nodule that looks benign but has microcalcifications →
**EU-TIRADS 5**, and FNA is indicated because 12 mm clears the 10 mm threshold. The same
12 mm nodule without that one feature needs no needle at all. A test asserts both halves of
that comparison side by side.

## Posture (spec-v97)

Reports an ultrasound category and the size rule that goes with it. It **does not read the
images**, and a needle decision also weighs clinical risk factors, suspicious lymph nodes and
what the patient wants.

**No malignancy percentages are shipped.** The category-to-FNA-threshold mapping was
confirmed by two sources; the per-category risk percentages were not, so under the spec-v97
gate they are left out rather than quoted from one place.

## Files

- `lib/eu-tirads-v796.js` — `euTirads()`, `EU_TIRADS_NOTE`.
- `views/group-v796.js` (RV796) — an appearance select, the four high-risk features under a heading that states the override, and a size input; a11y-checked.
- `mcp/adapters/eu-tirads-v796.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, all five categories with their thresholds, related (acr-tirads, bethesda-thyroid).
- `test/unit/eu-tirads.test.js` — 8 tests (appearance mapping, each of the four overrides against two appearances, the shrinking thresholds, the strictly-above boundary, the worked example with and without the feature, category 2 at 90 mm, no-nodule immunity, invalid input).
- `docs/spec-v796.md` (this file).

## Sourcing (spec-v97)

Russ G, Bonnema SJ, Erdogan MF, Durante C, Ngu R, Leenhardt L. *Eur Thyroid J.*
2017;6(5):225-237 (PMID 29167761). The four high-risk features and the category-to-threshold
mapping (20 / 15 / 10 mm) were confirmed against two independent sources. **A third rendering
was rejected**: it shifted every category by one, putting the 20 mm threshold on category 2
and "FNA regardless of size" on category 5. Two sources agreeing against one garbled
extraction is what settled it, and the disagreement is recorded here rather than quietly
resolved.
