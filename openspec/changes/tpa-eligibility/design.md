# Design — IV alteplase eligibility decision aid

## Source

AHA/ASA 2019 guideline for the early management of acute ischemic stroke (Powers WJ, Rabinstein
AA, Ackerson T, et al. *Stroke.* 2019;50(12):e344-e418), with the 3–4.5 h extended-window
criteria from ECASS-III (Hacke W et al. *N Engl J Med.* 2008;359(13):1317-1329) and the
alteplase (Activase) package insert for the coagulation cutoffs. **Every criterion below is a
build-time transcription target, not a source** — re-verify against the guideline before
shipping (spec-v97 discipline; the spec-v292 build corrected a cardiac-surgery threshold the
sketch got wrong).

## Time windows (verify at build)

| Window (from last known well) | Rule |
|---|---|
| ≤ 3 hours | Standard eligibility: apply the absolute-exclusion checklist |
| > 3 to ≤ 4.5 hours | Extended window: absolute exclusions PLUS the ECASS-III relative exclusions |
| > 4.5 hours | Outside the IV alteplase window — no numeric verdict; route to imaging-based / thrombectomy pathway |

## Absolute exclusion checklist (verify at build — representative, not exhaustive)

Intracranial hemorrhage on CT; history of intracranial hemorrhage; ischemic stroke or severe
head trauma in the prior 3 months; intracranial or intraspinal surgery in the prior 3 months;
intracranial neoplasm / AVM / aneurysm (structural); active internal bleeding; platelets
< 100 ×10⁹/L; INR > 1.7 or aPTT > 40 s; therapeutic LMWH within 24 h; direct oral anticoagulant
within 48 h (unless assays normal); blood pressure > 185/110 mmHg not lowerable; blood glucose
< 50 mg/dL; CT showing extensive early hypodensity across a large region.

## 3–4.5 h extended-window relative exclusions (ECASS-III; verify at build)

Age > 80 years; NIHSS > 25 (severe stroke); oral anticoagulant use regardless of INR; history
of BOTH diabetes mellitus AND prior ischemic stroke.

## Compute contract

`M.tpaEligibility({ window, exclusions[], relativeExclusions[] })` returns:
- `window` — 'le3h' | '3to45h' | 'gt45h',
- `eligible` (bool | null — null for the > 4.5 h no-verdict window),
- `firedAbsolute` (string[]), `firedRelative` (string[]),
- `band` — the verdict string ("No absolute contraindication met in the ≤ 3 h window — meets the
  AHA/ASA 2019 IV alteplase checklist; the treatment decision stays with the stroke team." /
  "Excluded: [criteria]." / "More than 4.5 hours from last known well — outside the IV alteplase
  window; consider the thrombectomy / imaging-based pathway."),
- `note` — the dose reminder (0.9 mg/kg, max 90 mg — verify) framed as information, and the
  posture caveat.

## Decisions

**D1 — window drives the criteria set.** The 3–4.5 h window adds the four ECASS-III relative
exclusions to the absolute set; the ≤ 3 h window applies only the absolute set. The > 4.5 h
window returns `eligible: null` with the thrombectomy-pathway pointer — never a fabricated
verdict, mirroring the spec-v292 ACS `threshold: null` carve-out (Design D2 there).

**D2 — verdict is a checklist result, never an order (spec-v11 §5.3).** The single most
important correctness point: the band reports "meets / does not meet the AHA/ASA 2019 checklist"
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
  reclassified several 1996-era absolutes as relative). The citation must name the 2019 guideline
  and the criteria must be re-verified at build against it, not against recall.
