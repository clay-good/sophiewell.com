# Design — IV alteplase eligibility decision aid

## Source

**PRIMARY (current): AHA/ASA 2026 guideline for the early management of acute ischemic stroke**
(*Stroke*, published 2026-01-26, doi:10.1161/STR.0000000000000513), which **replaces the 2018
guidelines and the 2019 update**. The 2026 update endorses **either tenecteplase (0.25 mg/kg,
max 25 mg) or alteplase (0.9 mg/kg, max 90 mg)** in the 4.5 h window — the tile is agent-neutral.

The criteria table below was drafted from the 2019 guideline (Powers WJ et al. *Stroke.*
2019;50(12):e344-e418) + ECASS-III (Hacke W et al. *NEJM.* 2008;359(13):1317-1329) BEFORE the
2026 update was known. **It is now a starting sketch ONLY.** Every time window, exclusion
criterion, and numeric cutoff MUST be re-verified against the **2026** guideline before shipping
(spec-v97 discipline; the spec-v292 build corrected a threshold the sketch got wrong). If any
criterion cannot be confirmed against the 2026 guideline text, PARK that criterion rather than
approximating it — a high-stakes tile with a stale exclusion is a safety defect.

## Time windows (verify at build)

| Window (from last known well) | Rule |
|---|---|
| ≤ 3 hours | Standard eligibility: apply the absolute-exclusion checklist |
| > 3 to ≤ 4.5 hours | Extended window: absolute exclusions PLUS the ECASS-III relative exclusions |
| > 4.5 to 9 hours | **2026 addition (COR 2a):** IV thrombolysis MAY be reasonable with salvageable penumbra on perfusion imaging — the tile must NOT hard-exclude this window; report "perfusion-imaging-dependent, decide with the stroke team," not a flat "outside window" |
| > 9 hours (or no penumbra) | Outside the IV thrombolysis window — no numeric verdict; route to imaging-based / thrombectomy pathway |

## Absolute exclusion checklist (verify at build — representative, not exhaustive)

Intracranial hemorrhage on CT; history of intracranial hemorrhage; ischemic stroke or severe
head trauma in the prior 3 months; intracranial or intraspinal surgery in the prior 3 months;
intracranial neoplasm / AVM / aneurysm (structural); active internal bleeding; platelets
< 100 ×10⁹/L; INR > 1.7 or aPTT > 40 s; therapeutic LMWH within 24 h; direct oral anticoagulant
within 48 h (unless assays normal); blood pressure > 185/110 mmHg not lowerable; blood glucose
< 50 mg/dL; CT showing extensive early hypodensity across a large region.

## 3–4.5 h extended-window relative exclusions (ECASS-III 2019 sketch; RE-VERIFY vs 2026)

Age > 80 years; NIHSS > 25 (severe stroke); oral anticoagulant use regardless of INR; history
of BOTH diabetes mellitus AND prior ischemic stroke.

**2026 CHANGE FLAGGED:** the 2026 guideline recommends IVT for **disabling deficits regardless
of NIHSS score** within 4.5 h — so the **NIHSS > 25 relative exclusion above may have been
removed or changed** in 2026. Do NOT carry it into the build without confirming against the 2026
text. This is a concrete example of why the whole criteria set MUST be re-sourced from the 2026
guideline, not the 2019 sketch.

## Compute contract

`M.tpaEligibility({ window, exclusions[], relativeExclusions[] })` returns:
- `window` — 'le3h' | '3to45h' | 'gt45h',
- `eligible` (bool | null — null for the > 4.5 h no-verdict window),
- `firedAbsolute` (string[]), `firedRelative` (string[]),
- `band` — the verdict string ("No absolute contraindication met in the ≤ 3 h window — meets the
  AHA/ASA 2026 IV thrombolysis checklist; the treatment decision stays with the stroke team." /
  "Excluded: [criteria]." / "More than 4.5 hours from last known well — outside the IV alteplase
  window; consider the thrombectomy / imaging-based pathway."),
- `note` — the dose reminder (tenecteplase 0.25 mg/kg max 25 mg, or alteplase 0.9 mg/kg max
  90 mg — verify against the 2026 guideline) framed as information, and the posture caveat.

## Decisions

**D1 — window drives the criteria set.** The 3–4.5 h window adds the four ECASS-III relative
exclusions to the absolute set; the ≤ 3 h window applies only the absolute set. **The window
enum must be REDESIGNED for the 2026 guideline's four-tier structure** (≤ 3 h / 3–4.5 h / 4.5–9 h
perfusion-imaging-dependent / > 9 h), not the three-tier 2019 sketch: the 4.5–9 h penumbra window
(COR 2a) returns a "perfusion-imaging-dependent, decide with the team" verdict, and only the > 9 h
(or no-penumbra) case returns `eligible: null` with the thrombectomy-pathway pointer — never a
fabricated verdict, mirroring the spec-v292 ACS `threshold: null` carve-out (Design D2 there).

**D2 — verdict is a checklist result, never an order (spec-v11 §5.3).** The single most
important correctness point: the band reports "meets / does not meet the AHA/ASA 2026 checklist"
and defers to the stroke team. It never renders "administer alteplase," a go/no-go order, or a
computed dose as an instruction. Reuses the existing high-stakes `clinical-notice` chrome and
the spec-v100 §2 clause-5 second-check caveat.

**D3 — absolute vs relative are reported separately.** An entered relative exclusion in the
3–4.5 h window yields "relative contraindication — weigh with the stroke team," not a hard
"excluded," so the tile does not overstate a soft criterion as an absolute bar.

**D4 — MCP example exercises an eligible ≤ 3 h path** so the round-trip has a determinate verdict
to assert; a second scenario-only path covers the > 4.5 h null-verdict branch.

## Risks

- **Overstating eligibility** — the failure mode that would make the tile clinically dangerous.
  Mitigated by D2 (never an order), D3 (relative ≠ absolute), and a posture note on every render;
  pinned by unit tests that assert the band contains no imperative dosing/administration verb.
- **Criteria drift** — the exclusion list has narrowed across guideline updates (the 2019 update
  reclassified several 1996-era absolutes as relative; the 2026 update supersedes 2019 and adds
  tenecteplase). The citation must name the **2026** guideline and every criterion must be
  re-verified at build against the 2026 text, not against recall or the 2019 sketch above.
