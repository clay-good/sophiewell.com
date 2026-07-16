# spec-v335.md — NICE classification (NBI colorectal lesion) tile

> Status: **SHIPPED (2026-07-16).** Builds the `nice-classification` tile — the NICE (NBI
> International Colorectal Endoscopic) classification of a colorectal lesion (types 1 / 2 / 3).
> Catalog **1186 → 1187**, group G.

## Why

spec-v334 shipped the Kudo pit pattern (chromoendoscopy). NICE is its narrow-band-imaging counterpart — it
predicts a colorectal lesion's histology from color, vessels, and surface pattern **without requiring
optical magnification**, which is why it is the most widely used optical-diagnosis scheme at routine
colonoscopy. `nice classification` / `nbi polyp` routed to nothing. (Companion-gap pattern: the same
optical-diagnosis domain defines the non-magnified NBI scheme alongside Kudo's magnified pit pattern.)

## What it does

The endoscopist picks the NICE type from the lesion's color, vessels, and surface pattern on NBI; the tile
reports the type, its usual histologic correlate, and whether the pattern raises concern for deep invasion.

- `lib/nice-v335.js` — pure type → description. **1:** same/lighter color, absent or lacy vessels, uniform
  or absent surface (hyperplastic, non-neoplastic). **2:** browner, brown vessels around white structures,
  oval/tubular/branched white structures (adenoma, or superficial cancer). **3:** brown to dark brown,
  disrupted/missing vessels, amorphous/absent surface (deep submucosal invasive cancer) — flagged. Result
  also carries a `neoplastic` flag (true for 2–3). Accepts `1`–`3` as string or number.
- `views/group-v335.js` (RV335) — one select, real `<label for>`.
- `lib/meta.js` — Hewett 2012 (types 1–2) citation + accessed date + grouped bands. No citation-staleness
  row (the Gastroenterology citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v56 → v57); corpus → 1187.

**HIGH-STAKES:** it reports the NICE type the endoscopist has determined and its usual histologic correlate,
never a tissue diagnosis, a resection recommendation, or a cancer diagnosis ([spec-v11](spec-v11.md) §5.3);
the biopsy / resection / referral decision stays with the endoscopist and the pathologist.

## Sourcing (spec-v97)

- **Citation:** Hewett DG, Kaltenbach T, Sano Y, et al. Validation of a simple classification system for
  endoscopic diagnosis of small colorectal polyps using narrow-band imaging. *Gastroenterology.*
  2012;143(3):599-607 (types 1–2). Type 3 (deep submucosal invasion) added by Hayashi N, Tanaka S, Hewett
  DG, et al. *Gastrointest Endosc.* 2013;78(4):625-632.
- Cross-verified against Endoscopy-Campus / review reproductions of the same color / vessels / surface
  three-feature table and the hyperplastic (1) / adenoma (2) / deep-invasive-cancer (3) correlates.

## Verification

Lint (all catalog-truth surfaces at 1187), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (type 3) renders the "disrupted/missing vessels / deep submucosal invasive cancer"
warn description, type 1 flips to the "same/lighter color / hyperplastic" non-neoplastic description, and
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the endoscopist selects; it does not read the NBI image, take the three features as
separate inputs, or recommend resection. The MCP adapter + golden-probe promotion follow in a separate wave.
