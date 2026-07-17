// spec-v356: CEAP CLINICAL classification (C-class C0-C6) of chronic venous disease — the
// internationally accepted standard for describing the clinical signs of a chronic venous disorder.
// CEAP = Clinical-Etiologic-Anatomic-Pathophysiologic; this tile reports the C (clinical) class, the
// commonly-used bedside part. The catalog carries the Venous Clinical Severity Score (vcss) but not the
// CEAP class it complements. "ceap classification" / "ceap clinical class" / "chronic venous disease
// class" routed to nothing.
//
// HIGH-STAKES: this reports the CEAP clinical CLASS the clinician has determined from the exam, NOT a
// diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// management decision stays with the treating (vascular) clinician.
//
// CLASSES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Eklof B, Rutherford RB, Bergan JJ, et al. Revision of the CEAP classification for chronic venous
//     disorders: consensus statement. J Vasc Surg. 2004;40(6):1248-1252 (C0-C6, C4 split C4a/C4b).
//   - Lurie F, et al. The 2020 update of the CEAP classification. J Vasc Surg Venous Lymphat Disord.
//     2020, and StatPearls, reproducing the same clinical classes.
//
// Clinical classes (visible / palpable signs of chronic venous disease):
//   C0  : no visible or palpable signs of venous disease.
//   C1  : telangiectasias or reticular veins.
//   C2  : varicose veins (diameter 3 mm or more).
//   C3  : edema.
//   C4a : pigmentation or eczema. Flagged (skin changes).
//   C4b : lipodermatosclerosis or atrophie blanche. Flagged.
//   C5  : healed venous ulcer. Flagged.
//   C6  : active venous ulcer. Flagged.

const CLASSES = {
  C0: { cls: 'C0', advanced: false, text: 'CEAP C0 - no visible or palpable signs of venous disease.' },
  C1: { cls: 'C1', advanced: false, text: 'CEAP C1 - telangiectasias or reticular veins.' },
  C2: { cls: 'C2', advanced: false, text: 'CEAP C2 - varicose veins (diameter 3 mm or more).' },
  C3: { cls: 'C3', advanced: false, text: 'CEAP C3 - edema.' },
  C4A: { cls: 'C4a', advanced: true, text: 'CEAP C4a - pigmentation or eczema (skin changes of chronic venous disease).' },
  C4B: { cls: 'C4b', advanced: true, text: 'CEAP C4b - lipodermatosclerosis or atrophie blanche (advanced skin changes).' },
  C5: { cls: 'C5', advanced: true, text: 'CEAP C5 - healed venous ulcer.' },
  C6: { cls: 'C6', advanced: true, text: 'CEAP C6 - active venous ulcer.' },
};

const NOTE = 'The CEAP classification (Eklof 2004; 2020 update) is the international standard for chronic venous disorders; this reports the C (clinical) class. C0: no signs. C1: telangiectasias / reticular veins. C2: varicose veins (>=3 mm). C3: edema. C4a: pigmentation or eczema. C4b: lipodermatosclerosis or atrophie blanche. C5: healed venous ulcer. C6: active venous ulcer. C4-C6 are the advanced (skin-change and ulcer) classes. It complements the Venous Clinical Severity Score. This reports the class the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  C0: 'C0', C1: 'C1', C2: 'C2', C3: 'C3', C4A: 'C4A', C4B: 'C4B', C5: 'C5', C6: 'C6',
  0: 'C0', 1: 'C1', 2: 'C2', 3: 'C3', 5: 'C5', 6: 'C6',
  C4: 'C4A',
};

// input:
//   cls: 'C0'..'C6' incl. 'C4a'/'C4b' (case-insensitive; also accepts 0-6, and bare 'C4' -> C4a)
export function ceapVenous(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.cls == null ? '' : o.cls).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CLASSES[key];
  if (!c) {
    return { valid: false, message: 'Select the CEAP clinical class (C0-C6, including C4a / C4b).' };
  }
  return {
    valid: true,
    ceapClass: c.cls,
    advanced: c.advanced,
    abnormal: c.advanced,
    bandLabel: `CEAP ${c.cls}`,
    band: c.text,
    note: NOTE,
  };
}
