# spec-v334.md — Kudo pit-pattern classification tile

> Status: **SHIPPED (2026-07-16).** Builds the `kudo-pit-pattern` tile — the Kudo pit-pattern
> classification of a colorectal lesion (types I / II / IIIS / IIIL / IV / V). Catalog
> **1185 → 1186**, group G.

## Why

The catalog carries the Paris morphologic classification of superficial GI lesions and now the Haggitt /
Kikuchi invasion scales, but had no Kudo pit pattern — the magnifying-chromoendoscopy surface pattern that
predicts a colorectal lesion's histology (non-neoplastic vs adenoma vs invasive) at the time of endoscopy,
and the endoscopic companion a clinician reads alongside Paris morphology. `kudo` / `pit pattern` routed to
nothing. (Companion-gap pattern: after the invasion-staging pair, the same domain defines the surface-pattern
scale.)

## What it does

The endoscopist picks the pit pattern seen on magnifying chromoendoscopy; the tile reports the type, its
usual histologic correlate, and whether the pattern raises concern for invasion.

- `lib/kudo-v334.js` — pure type → description. **I:** roundish pits (normal, non-neoplastic). **II:**
  stellar / papillary (hyperplastic, non-neoplastic). **IIIS:** small tubular, smaller than type I (adenoma;
  often depressed, highest malignant potential of type III). **IIIL:** tubular, larger than type I
  (adenoma). **IV:** branch / gyrus-like (adenoma, often villous). **V:** non-structured / irregular
  (suggestive of invasive carcinoma / deep submucosal invasion). Type V is flagged (invasive concern); the
  result also carries a `neoplastic` flag (true for IIIS–V). Accepts the type strings case-insensitively.
- `views/group-v334.js` (RV334) — one select, real `<label for>`.
- `lib/meta.js` — Kudo 1996 citation + accessed date + grouped bands. No citation-staleness row (the
  Gastrointest Endosc citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v55 → v56); corpus → 1186.

**HIGH-STAKES:** it reports the pit-pattern type the endoscopist has determined and its usual histologic
correlate, never a tissue diagnosis, a resection recommendation, or a cancer diagnosis
([spec-v11](spec-v11.md) §5.3); the biopsy / resection / referral decision stays with the endoscopist and
the pathologist.

## Sourcing (spec-v97)

- **Citation:** Kudo S, Tamura S, Nakajima T, Yamano H, Kusaka H, Watanabe H. Diagnosis of colorectal
  tumorous lesions by magnifying endoscopy. *Gastrointest Endosc.* 1996;44(1):8-14 (the pit-pattern scale).
- Cross-verified against the Kudo's-pit-pattern meta-analysis (World J Gastroenterol 2014) and
  magnifying-endoscopy references reproducing the same type definitions and the non-neoplastic (I–II) /
  adenomatous (IIIS–IV) / invasive (V) histologic correlates.

## Verification

Lint (all catalog-truth surfaces at 1186), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (type V) renders the "non-structured pits / invasive carcinoma" warn description, type
I flips to the "roundish pits / normal" non-neoplastic description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the type the endoscopist selects; it does not read the endoscopic image, distinguish the
revised Vi/VN subtypes as separate inputs, or recommend resection. The MCP adapter + golden-probe promotion
follow in a separate wave.
