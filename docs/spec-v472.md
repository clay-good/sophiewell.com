# spec-v472.md — Yerdel grade (portal vein thrombosis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `yerdel-pvt` tile — the Yerdel classification of portal vein
> thrombosis, grades 1-4. Catalog **1322 → 1323**, group G.

## Why

The hepatology tiles (Child-Pugh, MELD, Baveno portal-hypertension staging) had no portal-vein-thrombosis
grade. `yerdel` / `portal vein thrombosis grade` routed to nothing. This fills the PVT gap used in
liver-transplant assessment.

## What it does

The clinician picks the grade; the tile reports the grade and its thrombus-extent description.

- `lib/yerdel-pvt-v472.js` — pure grade → description, the four Yerdel grades by extent in the portal vein and
  superior mesenteric vein (SMV). **1:** partial PVT, 50% or less of the lumen. **2:** more than 50% occlusion
  (including total) of the portal vein. **3:** complete portal vein and proximal SMV thrombosis, distal SMV
  patent. **4:** complete portal vein and entire SMV thrombosis. Accepts 1-4 and I-IV.
- `views/group-v472.js` (RV472) — one select (dom `yerdel-grade`), real `<label for>`.
- `lib/meta.js` — Yerdel 2000 (Transplantation) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v192 → v193); corpus → 1323.

**HIGH-STAKES:** it reports the imaging grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the hepatology /
transplant team.

## Sourcing (spec-v97)

- **Citation:** Yerdel MA, Gunson B, Mirza D, et al. Portal vein thrombosis in adults undergoing liver
  transplantation: risk factors, screening, management, and outcome. *Transplantation.* 2000;69(9):1873-1881.
  The citation URL is a PubMed term search for the classic paper.
- Cross-verified against hepatology / transplant references reproducing the same partial-<=50% (1) /
  >50%-or-total (2) / PV-plus-proximal-SMV (3) / PV-plus-entire-SMV (4) grading.

## Verification

Lint (all catalog-truth surfaces at 1323), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "more than 50% occlusion of the portal vein, including total occlusion," the other
grades flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the imaging or recommend management
(anticoagulation, thrombectomy, transplant technique). The MCP adapter + golden-probe promotion follow in the
next wave (297).
