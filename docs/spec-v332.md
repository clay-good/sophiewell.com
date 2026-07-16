# spec-v332.md — Haggitt classification (malignant colorectal polyp) tile

> Status: **SHIPPED (2026-07-16).** Builds the `haggitt-level` tile — the Haggitt classification of
> invasion in a malignant colorectal polyp (levels 0–4). Catalog **1183 → 1184**, group G.

## Why

The catalog carries the neighboring GI endoscopy / staging classifications (Paris, Montreal, Siewert,
Forrest, Rockall) but had no Haggitt level — the standard grading of how deeply an invasive carcinoma
arising in an adenomatous polyp has invaded, which drives the endoscopic-vs-surgical management decision
after polypectomy. `haggitt` / `malignant polyp invasion level` routed to nothing.

## What it does

The pathologist / clinician picks the level from the depth of invasion relative to the polyp anatomy; the
tile reports the level, its description, and whether it is a higher-risk lesion.

- `lib/haggitt-v332.js` — pure level → description. **0:** carcinoma limited to the mucosa (carcinoma in
  situ / intramucosal, not truly invasive). **1:** submucosa of the polyp head. **2:** neck (head–stalk
  junction). **3:** stalk. **4:** bowel-wall submucosa below the stalk. Level 4 is flagged higher-risk; all
  sessile invasive polyps are level 4 by definition. Accepts `0`–`4` as string or number.
- `views/group-v332.js` (RV332) — one select, real `<label for>`.
- `lib/meta.js` — Haggitt 1985 citation + accessed date + grouped bands. No citation-staleness row (the
  Gastroenterology citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v53 → v54); corpus → 1184.

**HIGH-STAKES:** it reports the invasion level the pathologist has determined, never a diagnosis, a
resection recommendation, or an individual metastasis prediction ([spec-v11](spec-v11.md) §5.3); the
endoscopic-vs-surgical decision stays with the clinician and the patient.

## Sourcing (spec-v97)

- **Citation:** Haggitt RC, Glotzbach RE, Soffer EE, Wruble LD. Prognostic factors in colorectal carcinomas
  arising in adenomas: implications for lesions removed by endoscopic polypectomy. *Gastroenterology.*
  1985;89(2):328-336 (the original five-level scale).
- Cross-verified against Gastroenterology Research (Kuo 2020) and Pathology Outlines reproductions of the
  same level-0–4 definitions, including "any invasion in a sessile polyp = level 4" and the level-4 /
  sessile higher-metastasis-risk distinction (levels 1–3 ~0–1% node-positive; level 4 up to ~27% in some
  series).

## Verification

Lint (all catalog-truth surfaces at 1184), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (level 4) renders the "below the stalk" higher-risk description, level 1 flips to the
"head of the polyp" low-risk description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the level the pathologist selects; it does not read histology, estimate a numeric metastasis
probability, or recommend resection. The MCP adapter + golden-probe promotion follow in a separate wave.
