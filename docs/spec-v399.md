# spec-v399.md — Bismuth-Corlette classification (perihilar cholangiocarcinoma) tile

> Status: **SHIPPED (2026-07-17).** Builds the `bismuth-corlette` tile — the Bismuth-Corlette classification
> of perihilar cholangiocarcinoma (types I/II/IIIa/IIIb/IV). Catalog **1250 → 1251**, group G.

## Why

The biliary cluster (the Strasberg bile-duct-injury classification, the Tokyo Guidelines cholangitis /
cholecystitis tiles) had no tile for the hilar-tumor anatomy the hepatobiliary surgeon actually stages
from. The Bismuth-Corlette classification of a perihilar cholangiocarcinoma (Klatskin tumor), by the extent
of ductal involvement along the confluence, is the standard. `bismuth` / `bismuth corlette` / `klatskin
tumor type` routed to nothing. Companion to `strasberg-bdi` (both describe the biliary tree, one for injury,
one for tumor).

## What it does

The clinician picks the type; the tile reports the type and its ductal-extent description.

- `lib/bismuth-corlette-v399.js` — pure type → description. **I:** below (sparing) the confluence. **II:**
  reaching the confluence, secondary ducts spared. **IIIa:** extending to the right secondary ducts.
  **IIIb:** extending to the left secondary ducts. **IV:** bilateral secondary ducts or multifocal. Accepts
  I/II/IIIa/IIIb/IV, 1/2/4, and 3a/3b; bare `III` is ambiguous → invalid.
- `views/group-v399.js` (RV399) — one select (dom `bc-type`), real `<label for>`.
- `lib/meta.js` — Bismuth-Corlette 1975 (Surg Gynecol Obstet) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v120 → v121); corpus → 1251.

**HIGH-STAKES:** it reports the anatomic type the clinician has determined from the cholangiography /
cross-sectional imaging, never a diagnosis, a resectability determination, a treatment decision, or a
prognosis ([spec-v11](spec-v11.md) §5.3). The type informs the surgical plan (the side and extent of
hepatectomy), but the management decision stays with the hepatobiliary surgery / MDT team.

## Sourcing (spec-v97)

- **Citation:** Bismuth H, Corlette MB. Intrahepatic cholangioenteric anastomosis in carcinoma of the hilus
  of the liver. *Surg Gynecol Obstet.* 1975;140(2):170-178 (the original I / II / III / IV classification);
  the IIIa / IIIb split from Bismuth H, Nakache R, Diamond T. Management strategies in resection for hilar
  cholangiocarcinoma. *Ann Surg.* 1992;215(1):31-38.
- Cross-verified against hepatobiliary-surgery / radiology references reproducing the same
  confluence-sparing (I) / confluence-reaching (II) / unilateral-second-order (IIIa right, IIIb left) /
  bilateral-second-order or multifocal (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1251), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type II renders "reaching the confluence," IIIa and IIIb flip to the right / left secondary ducts,
IV to bilateral / multifocal, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, resolve the IIIa/IIIb side, or
assess resectability. The MCP adapter + golden-probe promotion follow in a separate wave.
