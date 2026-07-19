// spec-v442: the Zabramski classification of a cerebral cavernous malformation (CCM), by its MRI appearance
// (hemorrhage age and signal) — types I / II / III / IV. It is a standard descriptor in neuroimaging of
// cavernomas and joins the neurovascular / neuro-imaging tiles. "zabramski" / "cavernous malformation type"
// routed to nothing.
//
// HIGH-STAKES: this reports the imaging TYPE the radiologist has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// neurosurgery / neuroradiology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Zabramski JM, Wascher TM, Spetzler RF, et al. The natural history of familial cavernous malformations:
//     results of an ongoing study. J Neurosurg. 1994;80(3):422-432.
//   - Neuroradiology references reproducing the same subacute-hyperintense (I) / popcorn-with-hemosiderin-rim
//     (II) / chronic-hypointense (III) / punctate-GRE-only (IV) grouping.
//
// Types (MRI appearance):
//   I   : subacute hemorrhage - hyperintense core on T1 and T2 (methemoglobin).
//   II  : classic "popcorn" / mulberry - mixed-signal core (hemorrhage of varying ages) with a surrounding
//         hypointense hemosiderin rim on T1 and T2.
//   III : chronic hemorrhage - iso- to hypointense on T1 and T2, with hemosiderin.
//   IV  : multiple punctate microhemorrhages - best seen as punctate hypointense foci on gradient-echo
//         (GRE) / susceptibility-weighted imaging, often not visible on T1/T2.

const TYPES = {
  I: { type: 'I', text: 'Zabramski type I - subacute hemorrhage: hyperintense core on T1 and T2 (methemoglobin).' },
  II: { type: 'II', text: 'Zabramski type II - classic "popcorn" / mulberry: mixed-signal core (hemorrhage of varying ages) with a surrounding hypointense hemosiderin rim on T1 and T2.' },
  III: { type: 'III', text: 'Zabramski type III - chronic hemorrhage: iso- to hypointense on T1 and T2, with hemosiderin.' },
  IV: { type: 'IV', text: 'Zabramski type IV - multiple punctate microhemorrhages: punctate hypointense foci best seen on gradient-echo (GRE) / susceptibility-weighted imaging, often not visible on T1/T2.' },
};

const NOTE = 'The Zabramski classification (Zabramski 1994) types a cerebral cavernous malformation by its MRI appearance. I: subacute hemorrhage (hyperintense on T1/T2). II: classic popcorn/mulberry with a hemosiderin rim (mixed signal). III: chronic hemorrhage (iso- to hypointense). IV: punctate microhemorrhages seen only on GRE/SWI. This reports the type the radiologist has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  I: 'I', II: 'II', III: 'III', IV: 'IV',
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
};

// input:
//   type: 'I' / 'II' / 'III' / 'IV' (case-insensitive; also accepts 1-4).
export function zabramski(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Zabramski type (I, II, III, or IV).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Zabramski type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
