// spec-v489: the Fernandez classification of distal radius fractures, by the mechanism of injury — types I / II
// / III / IV / V. It complements the Frykman classification (which grades by the fracture-line pattern) and
// joins the wrist tiles. "fernandez" / "distal radius mechanism" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic-trauma team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Fernandez DL. Fractures of the distal radius: operative treatment. Instr Course Lect. 1993;42:73-88.
//   - Orthopedic references reproducing the same bending (I) / shearing (II) / compression (III) /
//     avulsion-dislocation (IV) / combined-high-velocity (V) mechanism grouping.
//
// Types (mechanism of injury):
//   I   : bending fracture of the metaphysis (extra-articular) - Colles and Smith fractures.
//   II  : shearing fracture of the joint surface - Barton, reverse Barton, and radial styloid (chauffeur)
//         fractures.
//   III : compression of the articular surface - intra-articular comminution / die-punch impaction.
//   IV  : avulsion fractures and radiocarpal fracture-dislocations - ligament-attachment avulsions with carpal
//         instability.
//   V   : combined fractures - high-velocity injuries combining types I to IV.

const TYPES = {
  I: { type: 'I', text: 'Fernandez type I - a bending fracture of the metaphysis (extra-articular); Colles and Smith fractures.' },
  II: { type: 'II', text: 'Fernandez type II - a shearing fracture of the joint surface; Barton, reverse Barton, and radial styloid (chauffeur) fractures.' },
  III: { type: 'III', text: 'Fernandez type III - compression of the articular surface; intra-articular comminution / die-punch impaction.' },
  IV: { type: 'IV', text: 'Fernandez type IV - avulsion fractures and radiocarpal fracture-dislocations; ligament-attachment avulsions with carpal instability.' },
  V: { type: 'V', text: 'Fernandez type V - combined fractures; high-velocity injuries combining types I to IV.' },
};

const NOTE = 'The Fernandez classification (Fernandez 1993) groups distal radius fractures by the mechanism of injury. I: bending (Colles/Smith). II: shearing (Barton, radial styloid). III: compression (die-punch). IV: avulsion / radiocarpal fracture-dislocation. V: combined, high-velocity. It complements the Frykman classification (fracture-line pattern). This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

// input:
//   type: 'I'..'V' (case-insensitive; also accepts 1-5).
export function fernandezRadius(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Fernandez type (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Fernandez type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
