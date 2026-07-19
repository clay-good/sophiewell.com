// spec-v446: the International Classification of Retinopathy of Prematurity (ICROP) STAGE of acute ROP at the
// junction of vascularized and avascular retina — stages 1 / 2 / 3 / 4 / 5. It is the standard staging on the
// ROP screening exam and joins the neonatology / ophthalmology tiles. "rop stage" /
// "retinopathy of prematurity stage" routed to nothing.
//
// This tile reports the ICROP STAGE (1-5). Stage / zone / plus-disease are separate axes of the full ICROP
// description; this tile reports the stage only. Stage 4 is subdivided into 4A (extrafoveal) and 4B (foveal).
//
// HIGH-STAKES: this reports the imaging/exam STAGE the ophthalmologist has determined, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual infant (spec-v11 §5.3). The zone and the presence of
// plus disease also drive management; the decision stays with the ophthalmology / neonatology team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - International Committee for the Classification of Retinopathy of Prematurity. The International
//     Classification of Retinopathy of Prematurity revisited. Arch Ophthalmol. 2005;123(7):991-999.
//   - Ophthalmology / neonatology references reproducing the same demarcation-line (1) / ridge (2) /
//     ridge-with-proliferation (3) / partial-detachment (4) / total-detachment (5) staging.
//
// Stages (retinal appearance):
//   1 : a flat, white demarcation line separating vascularized from avascular retina.
//   2 : a ridge (the demarcation line has height and width, rising above the retinal plane).
//   3 : a ridge with extraretinal fibrovascular proliferation (neovascularization).
//   4 : partial retinal detachment (4A extrafoveal, fovea attached; 4B involving the fovea).
//   5 : total retinal detachment.

const STAGES = {
  1: { stage: '1', text: 'ROP stage 1 - a flat, white demarcation line separating vascularized from avascular retina.' },
  2: { stage: '2', text: 'ROP stage 2 - a ridge (the demarcation line has height and width, rising above the retinal plane).' },
  3: { stage: '3', text: 'ROP stage 3 - a ridge with extraretinal fibrovascular proliferation (neovascularization).' },
  4: { stage: '4', text: 'ROP stage 4 - partial retinal detachment (4A extrafoveal, fovea attached; 4B involving the fovea).' },
  5: { stage: '5', text: 'ROP stage 5 - total retinal detachment.' },
};

const NOTE = 'The International Classification of Retinopathy of Prematurity (ICROP) stage grades acute ROP at the vascular/avascular junction. 1: demarcation line. 2: ridge. 3: ridge with fibrovascular proliferation. 4: partial retinal detachment (4A extrafoveal, 4B foveal). 5: total retinal detachment. Zone and plus disease are separate axes that also drive management. This reports the stage the ophthalmologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  '4A': '4', '4B': '4',
};

// input:
//   stage: '1' / '2' / '3' / '4' / '5' (4a/4b also accepted, mapped to 4).
export function ropStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the ROP stage (1, 2, 3, 4, or 5).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `ROP stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
