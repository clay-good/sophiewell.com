// spec-v381: Winquist-Hansen classification of a femoral SHAFT fracture (types 0-IV), by the extent of
// comminution and the amount of cortical contact between the two main fragments — the standard grading
// that stratifies axial/rotational stability (and, classically, whether an intramedullary nail can be
// dynamically vs statically locked). It sits beside the other fracture-eponym tiles in the catalog.
// "winquist" / "femoral shaft comminution" routed to nothing.
//
// HIGH-STAKES: this reports the Winquist-Hansen TYPE the clinician has determined from the imaging, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// falling-cortical-contact association (0 -> IV) is the classically taught pattern, not an order; the
// management (including nail-locking) decision stays with the orthopedic / trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Winquist RA, Hansen ST Jr, Clawson DK. Closed intramedullary nailing of femoral fractures. A report
//     of five hundred and twenty cases. J Bone Joint Surg Am. 1984;66(4):529-539 (the 0-IV comminution
//     grades).
//   - Orthopedic references reproducing the same butterfly-size / cortical-contact grading (0 none, I
//     <25% width, II <50% width with >=50% cortical contact, III >50% width with <50% contact, IV
//     circumferential / no contact).
//
// Types (extent of comminution / cortical contact between the two main fragments):
//   0   : no comminution (transverse or short oblique).
//   I   : a small butterfly fragment (< 25% of the bone width); does not affect stability.
//   II  : a larger butterfly (< 50% of the bone width); at least 50% cortical contact remains between the
//         two main fragments.
//   III : a large fragment (> 50% of the bone width); less than 50% cortical contact remains. Flagged
//         (unstable).
//   IV  : circumferential comminution over a segment; NO cortical contact between the main fragments.
//         Flagged (unstable).

const TYPES = {
  0: { type: '0', unstable: false, text: 'Winquist-Hansen type 0 - no comminution (a transverse or short oblique fracture).' },
  I: { type: 'I', unstable: false, text: 'Winquist-Hansen type I - a small butterfly fragment (under 25% of the bone width); does not affect stability.' },
  II: { type: 'II', unstable: false, text: 'Winquist-Hansen type II - a larger butterfly (under 50% of the bone width); at least 50% cortical contact remains between the two main fragments.' },
  III: { type: 'III', unstable: true, text: 'Winquist-Hansen type III - a large fragment (over 50% of the bone width); less than 50% cortical contact remains.' },
  IV: { type: 'IV', unstable: true, text: 'Winquist-Hansen type IV - circumferential comminution over a segment; no cortical contact between the main fragments.' },
};

const NOTE = 'The Winquist-Hansen classification grades a femoral shaft fracture by the extent of comminution and the cortical contact between the two main fragments. 0: none. I: small butterfly (<25% width). II: larger butterfly (<50% width, >=50% contact). III: large fragment (>50% width, <50% contact). IV: circumferential, no contact. Cortical contact (and axial/rotational stability) falls 0 to IV, which is the classically taught pattern, not an order. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  0: '0', I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: '0' / 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 0-4)
export function winquistHansen(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Winquist-Hansen type (0, I, II, III, or IV; equivalently 0-4).' };
  }
  return {
    valid: true,
    type: t.type,
    unstable: t.unstable,
    abnormal: t.unstable,
    bandLabel: `Winquist-Hansen type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
