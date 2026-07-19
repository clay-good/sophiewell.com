// spec-v433: the Modic classification of vertebral endplate / subchondral bone-marrow changes on MRI in
// degenerative disc disease — types 1 / 2 / 3, by the T1 and T2 signal. It is a standard descriptor in spine
// MRI reporting and joins the spine tiles (meyerding-spondylolisthesis). "modic changes" / "modic type"
// routed to nothing.
//
// This tile reports the three base Modic types. Mixed types (e.g., type 1/2, 2/3) are described when features
// coexist or transition; the base three types reproduced here are the standard reporting units.
//
// HIGH-STAKES: this reports the imaging TYPE the radiologist has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The clinical decision stays with the
// treating team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Modic MT, Steinberg PM, Ross JS, Masaryk TJ, Carter JR. Degenerative disk disease: assessment of
//     changes in vertebral body marrow with MR imaging. Radiology. 1988;166(1 Pt 1):193-199.
//   - Radiology / spine references reproducing the same edema (1) / fatty (2) / sclerotic (3) signal pattern.
//
// Types (vertebral endplate / subchondral marrow signal on MRI):
//   1 : bone-marrow edema / inflammation - T1 hypointense, T2 hyperintense.
//   2 : fatty (yellow) marrow replacement - T1 hyperintense, T2 iso- to hyperintense.
//   3 : subchondral bony sclerosis - T1 hypointense, T2 hypointense.

const TYPES = {
  1: { type: '1', text: 'Modic type 1 - bone-marrow edema / inflammation: T1 hypointense, T2 hyperintense.' },
  2: { type: '2', text: 'Modic type 2 - fatty (yellow) marrow replacement: T1 hyperintense, T2 iso- to hyperintense.' },
  3: { type: '3', text: 'Modic type 3 - subchondral bony sclerosis: T1 hypointense, T2 hypointense.' },
};

const NOTE = 'The Modic classification (Modic 1988) describes vertebral endplate / subchondral bone-marrow changes on MRI in degenerative disc disease by the T1 and T2 signal. 1: edema/inflammation (T1 low, T2 high). 2: fatty marrow (T1 high, T2 iso-to-high). 3: bony sclerosis (T1 low, T2 low). Mixed types (1/2, 2/3) are described when features coexist. This reports the type the radiologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: 1, 2: 2, 3: 3,
  I: 1, II: 2, III: 3,
};

// input:
//   type: '1' / '2' / '3' (also accepts I/II/III).
export function modicChanges(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Modic type (1, 2, or 3).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Modic type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
