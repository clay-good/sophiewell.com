// spec-v725: Glickman furcation involvement grade.
//
// Grades the extent of interradicular (furcation) bone loss in multi-rooted teeth. Source:
//   Glickman I. Clinical Periodontology. Philadelphia: WB Saunders; 1953 (the Glickman
//   furcation-involvement classification, Grades I-IV).
//
// Decision logic on the furcation findings:
//   Grade I   = incipient; the pocket is suprabony and involves the soft tissue, the
//               interradicular bone is intact (no radiographic change)
//   Grade II  = a partial / cul-de-sac furcation: horizontal bone loss into the furcation but
//               NOT through-and-through (bone remains on the opposite side)
//   Grade III = interradicular bone is completely absent (a through-and-through defect) but the
//               furcation orifice is occluded by gingiva and is NOT clinically visible
//   Grade IV  = through-and-through defect with the gingiva receded so the furcation opening is
//               clinically visible
//
// Returns the grade code. Pure: no DOM, no clock, no network.

export const GLICKMAN_NOTE = 'Glickman furcation involvement grade (Glickman I, Clinical Periodontology, WB Saunders 1953), which grades interradicular bone loss in multi-rooted teeth. Grade I is incipient, with a suprabony soft-tissue pocket and intact interradicular bone. Grade II is a partial or cul-de-sac furcation with horizontal bone loss into the furcation that is not through-and-through, so bone remains on the opposite side. Grade III is a through-and-through defect in which the interradicular bone is completely absent but the orifice is occluded by gingiva and is not clinically visible. Grade IV is a through-and-through defect with the gingiva receded so the furcation opening is clinically visible. It grades the defect to guide the prognosis and periodontal treatment plan and does not by itself prescribe a procedure; it supports rather than replaces the periodontal examination and clinical judgment.';

const GRADE = {
  I: { label: 'incipient; interradicular bone intact', probe: 'suprabony soft-tissue pocket' },
  II: { label: 'partial (cul-de-sac) furcation, not through-and-through', probe: 'horizontal bone loss into the furcation' },
  III: { label: 'through-and-through defect, occluded by gingiva (not visible)', probe: 'interradicular bone completely absent' },
  IV: { label: 'through-and-through defect, clinically visible', probe: 'gingiva receded, furcation opening visible' },
};

export function glickmanFurcation(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const g = o.furcation;
  if (!(g === 'I' || g === 'II' || g === 'III' || g === 'IV')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'furcation', message: 'Select the furcation finding (Grade I incipient, II partial, III through occluded, IV through visible).', note: GLICKMAN_NOTE };
  }

  const c = GRADE[g];
  const advanced = g === 'III' || g === 'IV';
  return {
    valid: true,
    grade: g,
    tier: `grade-${g.toLowerCase()}`,
    // A through-and-through defect (Grade III/IV) is the advanced, actionable finding.
    abnormal: advanced,
    bandLabel: `Glickman Grade ${g}`,
    band: `Glickman Grade ${g} — ${c.label}.`,
    detail: `${c.probe}. Grade I incipient, II partial (cul-de-sac), III through-and-through occluded, IV through-and-through visible.`,
    note: GLICKMAN_NOTE,
  };
}
