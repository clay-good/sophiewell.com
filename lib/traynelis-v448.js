// spec-v448: the Traynelis classification of traumatic atlanto-occipital dislocation (AOD), by the direction
// of occiput displacement relative to the atlas — types I / II / III. It joins the craniocervical fracture /
// dislocation tiles (Anderson-Montesano, Levine-Edwards). "traynelis" / "atlanto-occipital dislocation type"
// routed to nothing.
//
// HIGH-STAKES: this reports the imaging TYPE the clinician / radiologist has determined, NOT a diagnosis, a
// stability determination, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3).
// Atlanto-occipital dislocation is a high-mortality craniocervical injury; the management decision stays with
// the spine / neurosurgery team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Traynelis VC, Marano GD, Dunker RO, Kaufman HH. Traumatic atlanto-occipital dislocation. Case report.
//     J Neurosurg. 1986;65(6):863-870.
//   - Neuroradiology / spine references reproducing the same anterior (I) / longitudinal-distraction (II) /
//     posterior (III) displacement grouping.
//
// Types (direction of occiput displacement relative to the atlas):
//   I   : anterior displacement of the occiput relative to the atlas.
//   II  : longitudinal distraction (vertical separation) of the occiput from the atlas.
//   III : posterior displacement of the occiput relative to the atlas.

const TYPES = {
  I: { type: 'I', text: 'Traynelis type I - anterior displacement of the occiput relative to the atlas.' },
  II: { type: 'II', text: 'Traynelis type II - longitudinal distraction (vertical separation) of the occiput from the atlas.' },
  III: { type: 'III', text: 'Traynelis type III - posterior displacement of the occiput relative to the atlas.' },
};

const NOTE = 'The Traynelis classification (Traynelis 1986) groups traumatic atlanto-occipital dislocation by the direction of occiput displacement relative to the atlas. I: anterior. II: longitudinal distraction (vertical). III: posterior. Atlanto-occipital dislocation is a high-mortality craniocervical injury. This reports the type the clinician has determined, not a diagnosis, a stability determination, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function traynelis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Traynelis type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Traynelis type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
