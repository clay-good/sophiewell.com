# v48 derivation provenance — Aldrete + PADSS (`aldrete-padss`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4f
- Citations re-verified against:
  - Aldrete JA. *The post-anesthesia recovery score revisited.* J Clin Anesth. 1995;7(1):89-91.
  - Chung F, Chan VW, Ong D. *A post-anesthetic discharge scoring system for home readiness after ambulatory surgery.* J Clin Anesth. 1995;7(6):500-506.

Two derivation blocks land on this tile: the primary `derivation` field (modified Aldrete) and the sibling `derivationPadss` field, following the dual-block pattern from `qsofa-sofa` (wave 48-1c) and `centor` / `derivationMcisaac` (wave 48-2a).

## Components (modified Aldrete) — verbatim source mapping

Five PACU criteria, each 0-2 (clamped). Range 0-10.

| # | Criterion | Levels (0 / 1 / 2) |
|---|---|---|
| 1 | Activity | unable / two extremities / all extremities |
| 2 | Respiration | apneic / dyspnea or limited / deep breath and cough freely |
| 3 | Circulation (BP vs preoperative) | > +/-50 mmHg / +/-20-50 / +/-20 |
| 4 | Consciousness | not responding / arousable on calling / fully awake |
| 5 | Oxygen saturation | < 90% with O2 / needs O2 to maintain > 90% / > 92% on room air |

Cutoff: Aldrete >= 9 = ready for PACU-to-floor discharge.

## Components (PADSS) — verbatim source mapping

Five ambulatory-surgery readiness criteria, each 0-2 (clamped). Range 0-10.

| # | Criterion | Levels (0 / 1 / 2) |
|---|---|---|
| 1 | Vital signs (vs preop) | > 40% deviation / within 40% / within 20% |
| 2 | Ambulation | unable / with assistance / steady gait, no dizziness |
| 3 | Nausea / vomiting | severe, persistent / moderate, treated / minimal |
| 4 | Pain | severe / moderate / acceptable to patient on oral analgesics |
| 5 | Surgical bleeding | severe / moderate / minimal, no dressing change |

Cutoff: PADSS >= 9 = ready for home discharge.

## Population

- Aldrete 1995: methodologic revision of the original 1970 score replacing the color-based oxygenation item with pulse oximetry; deployed across PACU populations.
- Chung 1995: 502 consecutive adult ambulatory-surgery patients at a Toronto tertiary center. Outcomes: delayed discharge, unplanned admission, post-discharge complications.

## Validity

Operational checklists, not statistically-derived risk scores. Aldrete >= 9 is the convention for floor discharge; PADSS >= 9 is the convention for home discharge. Pulse-oximetry items assume calibrated readings without dyshemoglobinemia. Not validated for ICU patients, procedural sedation outside an OR / PACU context, or for regional-only patients with residual motor block.

## Source quotes

- "Modification of the original Aldrete score: pulse oximetry replaces the color category." — Aldrete 1995 §Methods.
- "A post-anesthetic discharge scoring system (PADSS) ... was developed and prospectively assessed for the determination of patients' home readiness after ambulatory surgery." — Chung 1995 §Abstract.

## Renderer assertions

Verified locally:
- `META['aldrete-padss'].derivation` and `META['aldrete-padss'].derivationPadss` each have every required field per `lib/derivation.js validate()` and exactly 5 components.
- Component sums equal `aldrete().score` and `padss().score` at multiple boundary points including the 0-2 clamp on out-of-range inputs.
- The two blocks render independently in `views/group-g.js`; the renderer's no-op for sibling-block siblings exercises the `{ derivation: META[id].derivationPadss }` wrapper pattern.

## Defects opened
None.
