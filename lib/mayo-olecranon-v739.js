// spec-v739: Mayo classification of olecranon fractures.
//
// A decision-logic classifier that returns a type code (IA, IB, IIA, IIB, IIIA, IIIB)
// from three radiographic factors: displacement, ulnohumeral joint stability, and
// comminution.
// Source:
//   Morrey BF, Adams RA. Fractures of the proximal ulna and olecranon. In: Morrey BF,
//   ed. The Elbow and Its Disorders. 2nd ed. Philadelphia: WB Saunders; 1993:405-428.
//   Reviewed: Sullivan CW, Desai K. Classifications in Brief: Mayo Classification of
//   Olecranon Fractures. Clin Orthop Relat Res. 2019 (PMID 30614914).
//
// Logic: Type I undisplaced (< 3 mm); Type II displaced with the ulnohumeral joint
// stable (collateral ligaments intact, joint congruent); Type III displaced with the
// ulnohumeral joint unstable (a fracture-dislocation). Subtype A = noncomminuted,
// B = comminuted. Displacement separates I from II/III; ulnohumeral stability separates
// II from III.
//
// Pure: no DOM, no clock, no network.

export const MAYO_OLECRANON_NOTE = "Mayo classification of olecranon fractures (Morrey BF, Adams RA, in The Elbow and Its Disorders, 2nd ed, 1993; reviewed by Sullivan CW, Desai K, Clin Orthop Relat Res 2019, PMID 30614914). Three radiographic factors set the type: displacement, ulnohumeral joint stability, and comminution. Type I is undisplaced (under about 3 mm). Type II is displaced with the ulnohumeral joint stable (collateral ligaments intact and the joint congruent). Type III is displaced with the ulnohumeral joint unstable, that is a fracture-dislocation. Subtype A is noncomminuted and subtype B is comminuted, giving six codes from IA to IIIB. It is a radiographic classification read from imaging and the clinical exam; management decisions stay with the treating surgeon.";

function enumIn(v, allowed) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  return allowed.includes(s) ? s : null;
}

const TYPE_LABEL = {
  I: 'undisplaced',
  II: 'displaced, ulnohumeral joint stable',
  III: 'displaced, ulnohumeral joint unstable (fracture-dislocation)',
};

export function mayoOlecranon(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const displacement = enumIn(o.displacement, ['undisplaced', 'displaced']);
  if (displacement === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'displacement', message: 'Select displacement: undisplaced or displaced.', note: MAYO_OLECRANON_NOTE };
  }
  const comminution = enumIn(o.comminution, ['noncomminuted', 'comminuted']);
  if (comminution === null) {
    return { valid: false, code: 'MISSING_INPUT', field: 'comminution', message: 'Select comminution: noncomminuted or comminuted.', note: MAYO_OLECRANON_NOTE };
  }

  let type;
  if (displacement === 'undisplaced') {
    type = 'I'; // undisplaced fractures are stable by definition
  } else {
    const stability = enumIn(o.stability, ['stable', 'unstable']);
    if (stability === null) {
      return { valid: false, code: 'MISSING_INPUT', field: 'stability', message: 'For a displaced fracture, select ulnohumeral stability: stable or unstable.', note: MAYO_OLECRANON_NOTE };
    }
    type = stability === 'stable' ? 'II' : 'III';
  }

  const subtype = comminution === 'comminuted' ? 'B' : 'A';
  const code = type + subtype;
  // Type III is the unstable fracture-dislocation - the most concerning pattern.
  const abnormal = type === 'III';
  return {
    valid: true,
    type,
    subtype,
    code,
    abnormal,
    bandLabel: `Mayo type ${code}`,
    band: `Mayo type ${code} — ${TYPE_LABEL[type]}, ${subtype === 'B' ? 'comminuted' : 'noncomminuted'}.`,
    detail: type === 'I'
      ? 'Type I (undisplaced): typically managed nonoperatively with immobilization then early motion.'
      : type === 'II'
        ? 'Type II (displaced, stable): operative fixation - tension-band wiring for IIA, plate fixation for IIB (comminution).'
        : 'Type III (displaced, unstable fracture-dislocation): plate fixation with reduction and restoration of ulnohumeral stability.',
    note: MAYO_OLECRANON_NOTE,
  };
}
