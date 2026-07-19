// spec-v441: the Borden classification of a dural arteriovenous fistula (DAVF), by the pattern of venous
// drainage — types I / II / III. It is a standard classification whose key discriminator is cortical venous
// drainage (the marker of an aggressive lesion). It joins the neurovascular tiles (Barrow CCF, Spetzler-Ponce
// AVM). "borden" / "dural av fistula type" routed to nothing.
//
// HIGH-STAKES: this reports the angiographic TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// neurosurgery / neurointervention team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Borden JA, Wu JK, Shucart WA. A proposed classification for spinal and cranial dural arteriovenous
//     fistulous malformations and implications for treatment. J Neurosurg. 1995;82(2):166-179.
//   - Neuroradiology / neurosurgery references reproducing the same sinus-antegrade (I) / sinus-with-cortical-
//     reflux (II) / cortical-only (III) drainage grouping.
//
// Types (venous drainage):
//   I   : drains into a dural venous sinus or meningeal vein with antegrade flow; no cortical venous
//         drainage (benign).
//   II  : drains into a dural sinus but with retrograde flow into cortical veins (cortical venous reflux).
//   III : drains directly into cortical veins only, without a dural sinus (aggressive).

const TYPES = {
  I: { type: 'I', text: 'Borden type I - drains into a dural venous sinus or meningeal vein with antegrade flow; no cortical venous drainage (benign).' },
  II: { type: 'II', text: 'Borden type II - drains into a dural sinus but with retrograde flow into cortical veins (cortical venous reflux).' },
  III: { type: 'III', text: 'Borden type III - drains directly into cortical veins only, without a dural sinus (aggressive).' },
};

const NOTE = 'The Borden classification (Borden 1995) groups a dural arteriovenous fistula by its venous drainage. I: dural sinus / meningeal vein with antegrade flow, no cortical venous drainage (benign). II: dural sinus with retrograde cortical venous reflux. III: cortical venous drainage only. The key discriminator is cortical venous drainage (types II and III), which marks an aggressive lesion. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III',
  1: 'I', 2: 'II', 3: 'III',
};

// input:
//   type: 'I' / 'II' / 'III' (case-insensitive; also accepts 1-3).
export function bordenDavf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Borden type (I, II, or III).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Borden type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
