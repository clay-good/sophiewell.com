// spec-v456: the Leddy-Packer classification of flexor digitorum profundus (FDP) avulsion injuries — "jersey
// finger" — by the level of tendon retraction and the presence of a bony fragment: types I / II / III. It is
// the standard grading of the FDP avulsion and joins the hand/finger injury tiles. "leddy" / "jersey finger"
// routed to nothing.
//
// HIGH-STAKES: this reports the injury TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// hand / orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Leddy JP, Packer JW. Avulsion of the profundus tendon insertion in athletes. J Hand Surg Am.
//     1977;2(1):66-69.
//   - Hand-surgery / orthopedic references reproducing the same palm-retraction (I) / PIP-retraction (II) /
//     bony-fragment-at-A4 (III) grouping. Later authors added a type IV (bony fragment with a separate tendon
//     avulsion off the fragment) and type V (associated distal-phalanx fracture); this tile grades the three
//     original Leddy-Packer types.
//
// Types (level of retraction / bony fragment):
//   I   : the FDP tendon retracts into the palm; both vincula rupture, disrupting the blood supply — the most
//         time-critical, needing repair within roughly 7 to 10 days.
//   II  : the FDP retracts to the level of the PIP joint, held by the intact vinculum longus (the most
//         common type); a small avulsion fleck may be seen at the PIP level.
//   III : a large bony avulsion fragment is caught at the A4 pulley, which prevents retraction proximal to
//         the middle phalanx.

const TYPES = {
  I: { type: 'I', text: 'Leddy-Packer type I - the FDP tendon retracts into the palm; both vincula rupture, disrupting the blood supply (the most time-critical, needing repair within roughly 7 to 10 days).' },
  II: { type: 'II', text: 'Leddy-Packer type II - the FDP retracts to the level of the PIP joint, held by the intact vinculum longus (the most common type); a small avulsion fleck may be seen.' },
  III: { type: 'III', text: 'Leddy-Packer type III - a large bony avulsion fragment is caught at the A4 pulley, preventing retraction proximal to the middle phalanx.' },
};

const NOTE = 'The Leddy-Packer classification (Leddy & Packer 1977) grades FDP avulsion ("jersey finger") by the level of tendon retraction and any bony fragment. I: retraction into the palm (blood supply lost, most time-critical). II: retraction to the PIP joint, held by the vinculum longus (most common). III: a large bony fragment caught at the A4 pulley. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function leddyPacker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Leddy-Packer type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Leddy-Packer type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
