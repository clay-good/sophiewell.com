// spec-v502: the Norwood (Hamilton-Norwood) scale of male-pattern hair loss, the seven canonical stages I-VII.
// It is the male-pattern companion to the Ludwig female-pattern tile (ludwig-hairloss). The catalog has SALT
// for alopecia areata and now Ludwig for the female pattern, but nothing for the male pattern. "norwood"
// routed to nothing.
//
// SYNONYM NOTE: the scale is also called Hamilton-Norwood, but "Hamilton" collides in search with the
// Hamilton anxiety / depression rating scales; the synonyms use "norwood" and pattern-specific phrases, not
// the bare word "hamilton".
//
// HIGH-STAKES: this reports the pattern STAGE the clinician has determined on examination, NOT a diagnosis of
// androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision (spec-v11 section
// 5.3). The workup and management decision stay with the treating clinician.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Norwood OT. Male pattern baldness: classification and incidence. South Med J. 1975;68(11):1359-1365.
//   - Dermatology references reproducing the same no-recession (I) through most-extensive (VII) staging.
//
// Stages (increasing frontotemporal recession and vertex loss). The separate Type A variant series
// (IIa, IIIa, IVa, Va), which progresses front to back without a distinct vertex bald spot, is out of scope.
//   I   : no recession, or minimal recession along the frontal hairline.
//   II  : triangular frontotemporal recession.
//   III : the minimal extent considered balding: deeper frontotemporal recession.
//   III vertex : mainly vertex (crown) hair loss, with frontotemporal recession no worse than stage II-III.
//   IV  : more severe frontotemporal recession and vertex loss, separated by a band of hair across the top.
//   V   : the bridging band between the front and vertex is narrower and sparser.
//   VI  : the bridging band is gone; the frontal and vertex areas are confluent.
//   VII : the most extensive: only a horseshoe band of hair remains at the sides and back.

const STAGES = {
  I: { stage: 'I', text: 'Norwood stage I - no recession, or minimal recession along the frontal hairline.' },
  II: { stage: 'II', text: 'Norwood stage II - triangular frontotemporal recession.' },
  III: { stage: 'III', text: 'Norwood stage III - the minimal extent considered balding: deeper frontotemporal recession.' },
  'III VERTEX': { stage: 'III vertex', text: 'Norwood stage III vertex - mainly vertex (crown) hair loss, with frontotemporal recession no worse than stage II-III.' },
  IV: { stage: 'IV', text: 'Norwood stage IV - more severe frontotemporal recession and vertex loss, separated by a band of hair across the top of the scalp.' },
  V: { stage: 'V', text: 'Norwood stage V - the bridging band between the frontal and vertex areas is narrower and sparser.' },
  VI: { stage: 'VI', text: 'Norwood stage VI - the bridging band is gone; the frontal and vertex bald areas are confluent.' },
  VII: { stage: 'VII', text: 'Norwood stage VII - the most extensive: only a horseshoe band of hair remains at the sides and back of the scalp.' },
};

const NOTE = 'The Norwood (Hamilton-Norwood) scale (Norwood 1975) stages male-pattern (androgenetic) hair loss by increasing frontotemporal recession and vertex loss, I to VII, with a distinct III vertex stage for crown-predominant loss. This reports the pattern stage the clinician has determined on examination, not a diagnosis of androgenetic alopecia, an exclusion of other causes of hair loss, or a treatment decision.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI', VII: 'VII',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII',
  'III VERTEX': 'III VERTEX', '3 VERTEX': 'III VERTEX', '3V': 'III VERTEX', 'IIIV': 'III VERTEX',
};

// input:
//   stage: 'I'..'VII' or 'III vertex' (case-insensitive; also accepts 1-7, and '3 vertex' / '3v' / 'IIIv').
export function norwoodHairloss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase().replace(/\s+/g, ' ');
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Norwood stage (I, II, III, III vertex, IV, V, VI, or VII).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Norwood stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
