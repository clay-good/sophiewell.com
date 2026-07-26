// spec-v471: the Gass classification of the stages of development of an idiopathic macular hole, by the
// biomicroscopic (and OCT) appearance — stages 1 / 2 / 3 / 4. It is the standard macular-hole staging and
// joins the retinal / macular tiles. "gass" / "macular hole stage" routed to nothing.
//
// HIGH-STAKES: this reports the STAGE the clinician has determined on examination / imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays
// with the ophthalmology team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Gass JD. Reappraisal of biomicroscopic classification of stages of development of a macular hole.
//     Am J Ophthalmol. 1995;119(6):752-759.
//   - Retina references reproducing the same impending (1) / small-full-thickness (2) /
//     larger-full-thickness-without-PVD (3) / full-thickness-with-complete-PVD (4) staging.
//
// Stages (macular-hole development):
//   1 : impending (incipient) macular hole - foveal detachment without a full-thickness defect (1A yellow
//       spot, 1B yellow ring), with loss of the foveal depression.
//   2 : a small full-thickness macular hole (less than 400 micrometers), often eccentric, sometimes with an
//       operculum.
//   3 : a larger full-thickness macular hole (400 micrometers or more) without a complete posterior vitreous
//       detachment.
//   4 : a full-thickness macular hole with a complete posterior vitreous detachment (a Weiss ring is present).

const STAGES = {
  1: { stage: '1', text: 'Gass stage 1 - impending (incipient) macular hole: foveal detachment without a full-thickness defect (1A yellow spot, 1B yellow ring), with loss of the foveal depression.' },
  2: { stage: '2', text: 'Gass stage 2 - a small full-thickness macular hole (less than 400 micrometers), often eccentric, sometimes with an operculum.' },
  3: { stage: '3', text: 'Gass stage 3 - a larger full-thickness macular hole (400 micrometers or more) without a complete posterior vitreous detachment.' },
  4: { stage: '4', text: 'Gass stage 4 - a full-thickness macular hole with a complete posterior vitreous detachment (a Weiss ring is present).' },
};

const NOTE = 'The Gass classification (Gass 1995) stages the development of an idiopathic macular hole. 1: impending (foveal detachment, no full-thickness defect). 2: small full-thickness hole (< 400 micrometers). 3: larger full-thickness hole (>= 400 micrometers) without a complete posterior vitreous detachment. 4: full-thickness hole with a complete posterior vitreous detachment (Weiss ring). This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: '1', 2: '2', 3: '3', 4: '4',
  I: '1', II: '2', III: '3', IV: '4',
};

// input:
//   stage: 1-4 (also accepts I-IV).
export function gassMacularHole(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Gass stage (1, 2, 3, or 4).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Gass stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
