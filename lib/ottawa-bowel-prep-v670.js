// spec-v670: Ottawa Bowel Preparation Scale (OBPS) — colonoscopy prep quality.
//
// Companion to the built Boston Bowel Preparation Scale (bbps-boston). The Ottawa
// scale scores cleanliness of three colon segments (0-4 each) PLUS a single overall
// fluid-quantity score (0-2), summed to a total of 0-14 where LOWER is better prep.
// Source:
//   Rostom A, Jolicoeur E. Validation of a new scale for the assessment of bowel
//   preparation quality. Gastrointest Endosc. 2004;59(4):482-486. PMID 15044882.
//
// Segment cleanliness (each 0-4): 0 excellent, 1 good, 2 fair, 3 poor, 4 inadequate.
// Fluid quantity (whole colon, 0-2): 0 small, 1 moderate, 2 large amount of fluid.
// The original paper presents the score as a continuous quality measure and does NOT
// define a single adequate/inadequate cutoff; later trials use study-specific cutoffs.
//
// Pure: no DOM, no clock, no network.

export const OBPS_NOTE = 'Ottawa Bowel Preparation Scale (Rostom A, Jolicoeur E, Gastrointest Endosc 2004;59(4):482-486). It rates colonoscopy preparation by summing the cleanliness of three colon segments (right/ascending, mid [transverse and descending], and rectosigmoid), each scored 0 = excellent, 1 = good, 2 = fair, 3 = poor, 4 = inadequate, plus a single overall fluid-quantity score for the whole colon (0 = small, 1 = moderate, 2 = large amount of fluid), for a total of 0 to 14. Lower scores mean a better preparation: 0 is a perfect prep and 14 is solid stool obscuring every segment with a large fluid volume. The 2004 validation paper treats the total as a continuous quality measure and does not set a single adequate-versus-inadequate cutoff, so any threshold is study-dependent; a segment scored 3 or 4 means its mucosa is obscured and that part of the examination may need repeat washing or a repeat colonoscopy. It grades preparation quality and is not by itself an order to repeat the procedure.';

const SEG_LABEL = { 0: 'excellent', 1: 'good', 2: 'fair', 3: 'poor', 4: 'inadequate' };
const FLUID_LABEL = { 0: 'small', 1: 'moderate', 2: 'large' };

function intIn(v, lo, hi) {
  if (v === '' || v === null || v === undefined) return NaN;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < lo || n > hi) return NaN;
  return n;
}

export function ottawaBowelPrep(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const segs = [
    { key: 'right', name: 'right/ascending colon', v: intIn(o.right, 0, 4) },
    { key: 'mid', name: 'mid colon (transverse + descending)', v: intIn(o.mid, 0, 4) },
    { key: 'rectosigmoid', name: 'rectosigmoid', v: intIn(o.rectosigmoid, 0, 4) },
  ];
  for (const s of segs) {
    if (Number.isNaN(s.v)) {
      return { valid: false, code: 'MISSING_INPUT', field: s.key, message: `Score the ${s.name} cleanliness 0 (excellent) to 4 (inadequate).` };
    }
  }
  const fluid = intIn(o.fluid, 0, 2);
  if (Number.isNaN(fluid)) {
    return { valid: false, code: 'MISSING_INPUT', field: 'fluid', message: 'Score the overall fluid quantity 0 (small), 1 (moderate), or 2 (large).' };
  }

  const segTotal = segs.reduce((a, s) => a + s.v, 0);
  const total = segTotal + fluid;
  const maxSeg = Math.max(...segs.map((s) => s.v));
  // A segment scored 3 or 4 has obscured mucosa (objective from the anchors); flag it.
  const abnormal = maxSeg >= 3;

  return {
    valid: true,
    total,
    segmentTotal: segTotal,
    fluid,
    abnormal,
    detail: `Segments: right ${SEG_LABEL[segs[0].v]} (${segs[0].v}), mid ${SEG_LABEL[segs[1].v]} (${segs[1].v}), rectosigmoid ${SEG_LABEL[segs[2].v]} (${segs[2].v}); fluid ${FLUID_LABEL[fluid]} (${fluid}).`,
    band: `Ottawa bowel prep ${total}/14 (lower is better)${abnormal ? ' — at least one segment poor/inadequate' : ''}.`,
    note: OBPS_NOTE,
  };
}
