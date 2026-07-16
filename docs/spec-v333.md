# spec-v333.md — Kikuchi classification (sessile submucosal invasion) tile

> Status: **SHIPPED (2026-07-16).** Builds the `kikuchi-level` tile — the Kikuchi classification of
> submucosal invasion in a sessile malignant colorectal lesion (Sm1 / Sm2 / Sm3). Catalog
> **1184 → 1185**, group G.

## Why

spec-v332 shipped the Haggitt classification for **pedunculated** malignant polyps. Kikuchi is its direct
**sessile-lesion** counterpart — it grades submucosal invasion depth by dividing the submucosa into thirds,
and (with Haggitt) completes the malignant-polyp invasion-staging pair a pathologist reaches for after
polypectomy. `kikuchi` / `submucosal invasion depth` routed to nothing. (Companion-gap pattern: after a
grading tile, check whether the source domain defines a companion scale.)

## What it does

The pathologist / clinician picks the level from the depth of submucosal invasion; the tile reports the
level, its description, and whether it is a higher-risk lesion.

- `lib/kikuchi-v333.js` — pure level → description. **Sm1:** upper (superficial) third of the submucosa
  (~0–3% node metastasis, low risk). **Sm2:** middle third (~10%). **Sm3:** lower third, adjacent to the
  muscularis propria (~25%). Sm2 / Sm3 are flagged higher-risk. Accepts `Sm1`–`Sm3` (case-insensitive) or
  `1`–`3`.
- `views/group-v333.js` (RV333) — one select, real `<label for>`.
- `lib/meta.js` — Kikuchi 1995 citation + accessed date + grouped bands. No citation-staleness row (the Dis
  Colon Rectum citation carries no guideline-issuer acronym).
- 4 worked-example unit tests + fuzz registration; synonym entry (v54 → v55); corpus → 1185.

**HIGH-STAKES:** it reports the submucosal-invasion level the pathologist has determined, never a diagnosis,
a resection recommendation, or an individual metastasis prediction ([spec-v11](spec-v11.md) §5.3); the
endoscopic-vs-surgical decision stays with the clinician and the patient.

## Sourcing (spec-v97)

- **Citation:** Kikuchi R, Takano M, Takagi K, et al. Management of early invasive colorectal cancer: risk
  of recurrence and clinical guidelines. *Dis Colon Rectum.* 1995;38(12):1286-1295 (the submucosa-in-thirds
  Sm1/Sm2/Sm3 scale).
- Cross-verified against the Haggitt/Kikuchi comparison literature and endoscopy references giving the same
  thirds, the ~0% / ~10% / ~25% lymph-node-metastasis figures, and the practical Sm1 < 1000-micron shallow /
  Sm2–3 deep threshold.

## Verification

Lint (all catalog-truth surfaces at 1185), unit suite (+4 + fuzz), build — all green. Verified in a real
browser: the example (Sm3) renders the "lower third" higher-risk description, Sm1 flips to the "upper third"
low-risk description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the level the pathologist selects; it does not read histology, measure the invasion in
microns, estimate a numeric metastasis probability, or recommend resection. The MCP adapter + golden-probe
promotion follow in a separate wave.
