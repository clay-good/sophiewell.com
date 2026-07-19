// spec-v440: the Barrow classification of carotid-cavernous fistula (CCF), by the arterial supply and flow —
// types A / B / C / D. It is the standard angiographic classification directing CCF management. "barrow" /
// "carotid cavernous fistula type" routed to nothing.
//
// HIGH-STAKES: this reports the angiographic TYPE the clinician / neurointerventionalist has determined, NOT
// a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The management
// decision stays with the neurosurgery / neurointervention team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Barrow DL, Spector RH, Braun IF, Landman JA, Tindall SC, Tindall GT. Classification and treatment of
//     spontaneous carotid-cavernous sinus fistulas. J Neurosurg. 1985;62(2):248-256.
//   - Neuroradiology / neurosurgery references reproducing the same direct-ICA (A) / dural-ICA (B) /
//     dural-ECA (C) / dural-both (D) grouping.
//
// Types (arterial supply to the cavernous sinus):
//   A : direct high-flow shunt between the internal carotid artery (ICA) and the cavernous sinus (usually
//       traumatic or from a ruptured ICA aneurysm).
//   B : dural (indirect) shunt supplied by meningeal branches of the ICA.
//   C : dural (indirect) shunt supplied by meningeal branches of the external carotid artery (ECA).
//   D : dural (indirect) shunt supplied by meningeal branches of both the ICA and the ECA.

const TYPES = {
  A: { type: 'A', text: 'Barrow type A - direct high-flow shunt between the internal carotid artery (ICA) and the cavernous sinus (usually traumatic or a ruptured ICA aneurysm).' },
  B: { type: 'B', text: 'Barrow type B - dural (indirect) shunt supplied by meningeal branches of the ICA.' },
  C: { type: 'C', text: 'Barrow type C - dural (indirect) shunt supplied by meningeal branches of the external carotid artery (ECA).' },
  D: { type: 'D', text: 'Barrow type D - dural (indirect) shunt supplied by meningeal branches of both the ICA and the ECA.' },
};

const NOTE = 'The Barrow classification (Barrow 1985) groups carotid-cavernous fistulas by arterial supply and flow. A: direct high-flow ICA-to-cavernous-sinus shunt (often traumatic). B: dural shunt from ICA meningeal branches. C: dural shunt from ECA meningeal branches. D: dural shunt from both ICA and ECA. B/C/D are the indirect (dural) fistulas. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C', D: 'D',
  1: 'A', 2: 'B', 3: 'C', 4: 'D',
};

// input:
//   type: 'A' / 'B' / 'C' / 'D' (case-insensitive; also accepts 1-4).
export function barrowCcf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Barrow type (A, B, C, or D).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Barrow type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
