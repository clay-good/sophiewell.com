// spec-v488: the Bigliani classification of acromion morphology, by the shape of the acromial undersurface on
// the supraspinatus-outlet (scapular Y) view — types I / II / III. It underlies subacromial-impingement
// assessment and joins the shoulder tiles (Goutallier, Hamada). "bigliani" / "acromion morphology" routed to
// nothing.
//
// HIGH-STAKES: this reports the imaging TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Bigliani LU, Morrison DS, April EW. The morphology of the acromion and its relationship to rotator cuff
//     tears. Orthop Trans. 1986;10:228.
//   - Shoulder references reproducing the same flat (I) / curved (II) / hooked (III) acromial-undersurface
//     grouping; the hooked (III) type is most associated with impingement and cuff tears.
//
// Types (acromial undersurface shape):
//   I   : flat acromion (a flat undersurface).
//   II  : curved acromion (the undersurface curves, roughly paralleling the humeral head).
//   III : hooked acromion (an anterior hook on the undersurface); most associated with subacromial impingement
//         and rotator cuff tears.

const TYPES = {
  I: { type: 'I', text: 'Bigliani type I - flat acromion (a flat undersurface).' },
  II: { type: 'II', text: 'Bigliani type II - curved acromion (the undersurface curves, roughly paralleling the humeral head).' },
  III: { type: 'III', text: 'Bigliani type III - hooked acromion (an anterior hook on the undersurface); most associated with subacromial impingement and rotator cuff tears.' },
};

const NOTE = 'The Bigliani classification (Bigliani 1986) grades acromion morphology by the shape of the acromial undersurface on the supraspinatus-outlet view. I: flat. II: curved (paralleling the humeral head). III: hooked (anterior hook), most associated with subacromial impingement and rotator cuff tears. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function biglianiAcromion(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Bigliani type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Bigliani type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
