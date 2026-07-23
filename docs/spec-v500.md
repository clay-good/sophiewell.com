# spec-v500.md — Tegner activity scale (knee) tile

> Status: **SHIPPED (2026-07-23).** Builds the `tegner-activity` tile — the Tegner activity scale, levels 0-10.
> Catalog **1350 → 1351**, group G.

## Why

The catalog already has `lysholm-knee-score`. Tegner and Lysholm published the two instruments **in the same
1985 paper**, and they are normally reported together: the Lysholm score measures symptoms, the Tegner scale
records the activity level those symptoms are measured against. A Lysholm score without a Tegner level is
half the report. `tegner` routed to nothing — a textbook companion-gap.

## What it does

The patient and clinician agree the level; the tile reports the level and its work / sport anchors.

- `lib/tegner-activity-v500.js` — pure level → description, the eleven Tegner levels. **0:** sick leave or a
  disability pension because of knee problems. **1-3:** sedentary to light labor. **4-5:** moderately heavy to
  heavy labor, recreational then competitive cycling and jogging. **6-7:** recreational racquet sports and
  frequent jogging up to competitive tennis or running. **8-10:** competitive sport, topping out at national
  elite team sport. Accepts `0`-`10` as strings or numbers.
- `views/group-v500.js` (RV500) — one select (dom `tegner-level`), real `<label for>`.
- `lib/meta.js` — Tegner and Lysholm 1985 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v220 → v221); corpus → 1351.

**ACTIVITY-LEVEL DESCRIPTOR, NOT A PATHOLOGY GRADE:** no level is "abnormal" — the scale records what the
patient does, not how bad a knee is. This follows the same pattern as the existing Karnofsky / ECOG / Tanner /
Risser / Schwab-England tiles.

**HIGH-STAKES:** it reports the level agreed on, never a diagnosis, a **return-to-sport clearance**, or a
prediction of what the knee will tolerate ([spec-v11](spec-v11.md) §5.3). The return-to-play decision stays
with the treating clinician.

## Sourcing (spec-v97)

- **Citation:** Tegner Y, Lysholm J. Rating systems in the evaluation of knee ligament injuries. *Clin Orthop
  Relat Res.* 1985;(198):43-49 — the same paper the sibling `lysholm-knee-score` tile cites. The citation URL
  is a PubMed term search.
- Cross-verified against sports-medicine references reproducing the same 0-through-10 ordering with the same
  work and sport anchors. **Transcription note:** each level in the source lists several representative
  activities; the tile names the representative work and sport anchors for each level and says so in its copy
  rather than implying the list is exhaustive.

## Verification

Lint (all catalog-truth surfaces at 1351), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: level 5 renders the heavy-labor / competitive-cycling anchors, 0 and 10 flip to the endpoints; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the level selected; it does not compute the Lysholm score, compare pre- and post-injury levels
(a common use of the scale), or clear anyone for sport. The MCP adapter + golden-probe promotion follow in the
next wave (325).
