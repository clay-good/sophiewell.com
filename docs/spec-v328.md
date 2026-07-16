# spec-v328.md — Montreal classification of IBD tile

> Status: **SHIPPED (2026-07-15).** Builds the `montreal-ibd` tile — the Montreal classification of
> inflammatory bowel disease (Crohn's A/L/B or UC E/S phenotype). Catalog **1179 → 1180**, group G.

## Why

The catalog carries IBD activity/endoscopic indices (`harvey-bradshaw`, `mayo-uc`, `rutgeerts`, …) but had
no Montreal phenotype classification (the only "Montreal" corpus hit was a geographic reference in the PRAM
asthma note). Montreal is the standard IBD phenotype system, used in every IBD clinic. `montreal
classification` / `crohn phenotype` routed to nothing.

## What it does

The clinician picks the disease (Crohn's or UC) and the relevant axes; the tile composes the Montreal
phenotype.

- `lib/montreal-ibd-v328.js` — pure inputs → phenotype string + description. **Crohn's:** age **A1** (≤ 16
  y) / **A2** (17–40 y) / **A3** (> 40 y); location **L1** ileal / **L2** colonic / **L3** ileocolonic, with
  **+L4** for isolated upper-GI disease; behavior **B1** inflammatory / **B2** stricturing / **B3**
  penetrating, with a **p** suffix for perianal disease (e.g. `A2 L3 B2`, `A1 L1+L4 B3p`). **UC:** extent
  **E1** proctitis / **E2** left-sided / **E3** extensive; severity **S0** remission / **S1** mild / **S2**
  moderate / **S3** severe (e.g. `E3 S2`).
- `views/group-v328.js` (RV328) — a disease selector plus the Crohn's and UC axis selects/checkboxes, real
  `<label for>`.
- `lib/meta.js` — Silverberg 2005 citation + accessed date + bands. No citation-staleness row (the Can J
  Gastroenterol citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v49 → v50); corpus → 1180.

**HIGH-STAKES:** it composes and reports the cited phenotype from the categories selected, never a diagnosis
or a treatment order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

- **Citation:** Silverberg MS, Satsangi J, Ahmad T, et al. Toward an integrated clinical, molecular and
  serological classification of IBD: Report of a Working Party of the 2005 Montreal World Congress of
  Gastroenterology. *Can J Gastroenterol.* 2005;19 Suppl A:5A-36A. Cross-verified against Satsangi J, et al.
  *Gut.* 2006;55(6):749-753, which reproduces the A/L/B and E/S tables.
- The A1–A3 / L1–L4 / B1–B3 (+p) Crohn's axes and the E1–E3 / S0–S3 UC axes are as published.

## Verification

Lint (all catalog-truth surfaces at 1180), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the example (Crohn's A2 L3 B2) composes "A2 L3 B2," switching the disease to UC and setting E3/S3
composes "E3 S3," and the tile does not scroll horizontally at 320px.

## Out of scope

The tile composes the phenotype from the categories the clinician selects; it does not stage disease
activity (Harvey-Bradshaw, Mayo), assign the categories from records, or apply the paediatric (Paris)
modifications. The MCP adapter + golden-probe promotion follow in a separate wave.
