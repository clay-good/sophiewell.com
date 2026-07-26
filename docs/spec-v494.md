# spec-v494.md — INTERMACS profile (advanced heart failure) tile

> Status: **SHIPPED (2026-07-23).** Builds the `intermacs-profile` tile — the INTERMACS profiles of advanced
> heart failure, profiles 1-7. Catalog **1344 → 1345**, group G.

## Why

The heart-failure tiles grade functional class (NYHA) and congestion, but nothing describes the *acuity band*
used when mechanical circulatory support is on the table. `intermacs` / `advanced heart failure profile`
routed to nothing — no catalog tile mentioned circulatory support at all. This companions `nyha-class`, which
profile 7 is defined against.

## What it does

The clinician picks the profile; the tile reports the profile and its clinical-severity description.

- `lib/intermacs-profile-v494.js` — pure profile → description, the seven INTERMACS profiles.
  **1:** critical cardiogenic shock. **2:** progressive decline on inotropes. **3:** stable but inotrope
  dependent. **4:** resting symptoms. **5:** exertion intolerant. **6:** exertion limited. **7:** advanced NYHA
  class III. Accepts `1`-`7` as strings or numbers.
- `views/group-v494.js` (RV494) — one select (dom `intermacs-profile`), real `<label for>`.
- `lib/meta.js` — Stevenson and colleagues 2009 (J Heart Lung Transplant) citation + accessed date + grouped
  bands. No citation-staleness row (a named-author article; INTERMACS is not a guideline-issuer acronym in
  `ISSUER_PATTERN`).
- 8 worked-example unit tests + fuzz registration; synonym entry (v214 → v215); corpus → 1345.

**HIGH-STAKES:** it reports the profile the clinician has determined, never a diagnosis, a decision to implant
a device, a transplant-listing decision, or a survival prediction ([spec-v11](spec-v11.md) §5.3); the
management decision stays with the advanced-heart-failure team.

## Sourcing (spec-v97)

- **Citation:** Stevenson LW, Pagani FD, Young JB, et al. INTERMACS profiles of advanced heart failure: the
  current picture. *J Heart Lung Transplant.* 2009;28(6):535-541.
- Cross-verified against advanced-heart-failure references reproducing the same critical-shock (1) through
  advanced-class-III (7) ordering with the same shorthand labels.

## Verification

Lint (all catalog-truth surfaces at 1345), unit suite (+8 + fuzz), build — all green. Verified in a real
browser: profile 3 renders "stable but inotrope dependent," the other profiles flip to their descriptions; the
tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the profile the clinician selects; it does not assess the patient, weigh device candidacy, or
predict survival. The modifiers layered onto the profiles in registry use (arrhythmia, temporary support,
frequent flyer) are not modeled. The MCP adapter + golden-probe promotion follow in the next wave (319).
