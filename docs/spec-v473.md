# spec-v473.md — Todani classification (choledochal cyst) tile

> Status: **SHIPPED (2026-07-19).** Builds the `todani-choledochal` tile — the Todani classification of
> choledochal (congenital bile duct) cysts, types I-V. Catalog **1323 → 1324**, group G.

## Why

The biliary classification tiles (Strasberg bile duct injury, Bismuth-Corlette perihilar cholangiocarcinoma)
had no choledochal-cyst classification. `todani` / `choledochal cyst type` routed to nothing. This fills that
hepatobiliary / pediatric-surgery gap.

## What it does

The clinician picks the type; the tile reports the type and its location / shape description.

- `lib/todani-choledochal-v473.js` — pure type → description, the five Todani types. **I:** extrahepatic
  fusiform/cystic dilatation (most common). **II:** a true extrahepatic diverticulum. **III:** choledochocele
  (intraduodenal segment). **IV:** multiple cysts (IVa intra- and extrahepatic; IVb extrahepatic only). **V:**
  Caroli disease (intrahepatic only). Accepts I-V and 1-5; the note records the type I subtypes (Ia/Ib/Ic).
- `views/group-v473.js` (RV473) — one select (dom `todani-type`), real `<label for>`.
- `lib/meta.js` — Todani 1977 (Am J Surg) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v193 → v194); corpus → 1324.

**HIGH-STAKES:** it reports the anatomic type the clinician has determined from imaging, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
hepatobiliary / surgical team.

## Sourcing (spec-v97)

- **Citation:** Todani T, Watanabe Y, Narusue M, Tabuchi K, Okajima K. Congenital bile duct cysts:
  classification, operative procedures, and review of thirty-seven cases including cancer arising from
  choledochal cyst. *Am J Surg.* 1977;134(2):263-269. The citation URL is a PubMed term search.
- Cross-verified against hepatobiliary references reproducing the same extrahepatic (I) / diverticulum (II) /
  choledochocele (III) / multiple-cysts (IV) / intrahepatic-Caroli (V) grouping.

## Verification

Lint (all catalog-truth surfaces at 1324), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type I renders "cystic or fusiform dilatation of the extrahepatic bile duct," the other types flip to
their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging or recommend management
(excision, hepaticojejunostomy). The MCP adapter + golden-probe promotion follow in the next wave (298).
