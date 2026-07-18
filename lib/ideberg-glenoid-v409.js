// spec-v409: Ideberg (with the Goss type VI) classification of glenoid-fossa (intra-articular scapular)
// fractures, by which border of the scapula the fracture line exits — types I / II / III / IV / V / VI. A
// shoulder-trauma classification the clinician determines from imaging (usually CT). "ideberg" / "glenoid
// fracture" / "glenoid fossa fracture" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined from imaging, NOT a diagnosis, a
// treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). Displaced articular
// fractures are classically more often operative, but this reports the type; the management decision stays
// with the orthopedic team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ideberg R. Fractures of the scapula involving the glenoid fossa. In: Bateman JE, Welsh RP, eds.
//     Surgery of the Shoulder. Philadelphia: BC Decker; 1984:63-66 (the original I-V classification).
//   - Goss TP. Fractures of the glenoid cavity. J Bone Joint Surg Am. 1992;74(2):299-305 (added type VI,
//     the severely comminuted glenoid fracture).
//
// Types (exit border of the glenoid-fossa fracture line):
//   I   : glenoid rim fracture (Ia anterior rim, Ib posterior rim).
//   II  : fracture through the fossa exiting the LATERAL (axillary) scapular border - an inferior
//         triangular fragment.
//   III : fracture through the fossa exiting the SUPERIOR scapular border (often with the coracoid /
//         acromion).
//   IV  : fracture through the fossa exiting the MEDIAL (vertebral) scapular border - horizontal, through
//         the body.
//   V   : a combination of types II, III, and IV (Va II+IV, Vb III+IV, Vc II+III+IV).
//   VI  : a severely comminuted glenoid fracture (Goss).

const TYPES = {
  I: { type: 'I', text: 'Ideberg type I - a glenoid rim fracture (Ia anterior rim, Ib posterior rim).' },
  II: { type: 'II', text: 'Ideberg type II - a fracture through the fossa exiting the lateral (axillary) scapular border, with an inferior triangular fragment.' },
  III: { type: 'III', text: 'Ideberg type III - a fracture through the fossa exiting the superior scapular border (often with the coracoid / acromion).' },
  IV: { type: 'IV', text: 'Ideberg type IV - a fracture through the fossa exiting the medial (vertebral) scapular border, horizontal through the body.' },
  V: { type: 'V', text: 'Ideberg type V - a combination of types II, III, and IV (Va II+IV, Vb III+IV, Vc II+III+IV).' },
  VI: { type: 'VI', text: 'Ideberg type VI (Goss) - a severely comminuted glenoid fracture.' },
};

const NOTE = 'The Ideberg classification (Ideberg 1984; type VI added by Goss 1992) groups an intra-articular glenoid-fossa fracture by which scapular border the fracture line exits. I: glenoid rim (a anterior, b posterior). II: exits the lateral border (inferior triangular fragment). III: exits the superior border (coracoid/acromion). IV: exits the medial border (through the body). V: a combination of II/III/IV. VI: severely comminuted. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  IA: 'I', IB: 'I', VA: 'V', VB: 'V', VC: 'V',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' / 'V' / 'VI' (case-insensitive; also accepts 1-6 and the Ia/Ib, Va-Vc
//   subtypes -> the base type).
export function idebergGlenoid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Ideberg type (I, II, III, IV, V, or VI).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Ideberg type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
