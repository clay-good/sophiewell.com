# spec-v336.md — JNET classification (magnifying NBI colorectal) tile

> Status: **SHIPPED (2026-07-16).** Builds the `jnet-classification` tile — the JNET (Japan NBI
> Expert Team) classification of a colorectal lesion (types 1 / 2A / 2B / 3). Catalog
> **1187 → 1188**, group G.

## Why

spec-v335 shipped NICE (non-magnified NBI). JNET is its magnified-NBI refinement — it splits NICE type 2
into **2A** (low-grade adenoma) and **2B** (high-grade neoplasia / shallow submucosal cancer) using the
vessel and surface pattern on magnifying NBI, the distinction that actually changes management (2B lesions
warrant closer scrutiny before piecemeal resection). It completes the colorectal optical-diagnosis family
already in the catalog: Kudo (chromoendoscopy), NICE (non-magnified NBI), JNET (magnified NBI). `jnet`
routed to nothing. (Companion-gap pattern: the optical-diagnosis domain defines a magnified-NBI scheme
alongside the non-magnified one.)

## What it does

The endoscopist picks the JNET type from the lesion's vessel and surface pattern on magnifying NBI; the tile
reports the type, its usual histologic correlate, and whether the pattern raises concern for deep invasion.

- `lib/jnet-v336.js` — pure type → description. **1:** invisible vessels, regular spots
  (hyperplastic/sessile-serrated, non-neoplastic). **2A:** regular vessels and surface (low-grade adenoma).
  **2B:** irregular vessels and surface (high-grade neoplasia / shallow submucosal cancer). **3:**
  loose/interrupted vessels, amorphous surface (deep submucosal invasive cancer) — flagged. Result also
  carries a `neoplastic` flag (true for 2A–3). Accepts the type strings case-insensitively.
- `views/group-v336.js` (RV336) — one select, real `<label for>`.
- `lib/meta.js` — Sano 2016 citation + accessed date + grouped bands. No citation-staleness row (the Dig
  Endosc citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v57 → v58); corpus → 1188.

**HIGH-STAKES:** it reports the JNET type the endoscopist has determined and its usual histologic correlate,
never a tissue diagnosis, a resection recommendation, or a cancer diagnosis ([spec-v11](spec-v11.md) §5.3);
the biopsy / resection / referral decision stays with the endoscopist and the pathologist.

## Sourcing (spec-v97)

- **Citation:** Sano Y, Tanaka S, Kudo SE, et al. Narrow-band imaging (NBI) magnifying endoscopic
  classification of colorectal tumors proposed by the Japan NBI Expert Team (JNET). *Dig Endosc.*
  2016;28(5):526-533 (the four-category vessel/surface scale).
- Cross-verified against JNET validation / diagnostic-yield studies (Dig Endosc 2018; Gastrointest Endosc
  2019) reproducing the same vessel-pattern / surface-pattern / histology table.

## Verification

Lint (all catalog-truth surfaces at 1188), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (type 2B) renders the "irregular vessels/surface / high-grade" description, type 1
flips to the "invisible vessels / hyperplastic" non-neoplastic description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the type the endoscopist selects; it does not read the NBI image, take vessel and surface
patterns as separate inputs, or recommend resection. The MCP adapter + golden-probe promotion follow in a
separate wave.
