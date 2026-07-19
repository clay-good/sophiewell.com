// spec-v450: the Reid classification of bronchiectasis by bronchial morphology on imaging — cylindrical /
// varicose / cystic. It is the standard morphologic description of bronchiectasis. "reid bronchiectasis" /
// "bronchiectasis type" routed to nothing.
//
// HIGH-STAKES: this reports the imaging morphology the radiologist has determined, NOT a diagnosis, a
// severity determination, a treatment decision, or a prognosis for an individual patient (spec-v11 §5.3). The
// management decision stays with the pulmonology team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Reid LM. Reduction in bronchial subdivision in bronchiectasis. Thorax. 1950;5(3):233-247.
//   - Pulmonology / radiology references reproducing the same cylindrical (tubular) / varicose (beaded) /
//     cystic (saccular) morphologic grouping.
//
// Types (bronchial morphology):
//   cylindrical : bronchi uniformly dilated with a regular, tubular outline; the least severe.
//   varicose    : bronchi dilated with an irregular, beaded outline (alternating constrictions and
//                 dilatations, like varicose veins).
//   cystic      : bronchi ending in large cyst-like (saccular / balloon-like) dilatations; the most severe.

const TYPES = {
  CYLINDRICAL: { type: 'cylindrical', text: 'Reid cylindrical (tubular) bronchiectasis - bronchi uniformly dilated with a regular outline; the least severe.' },
  VARICOSE: { type: 'varicose', text: 'Reid varicose bronchiectasis - bronchi dilated with an irregular, beaded outline (alternating constrictions and dilatations, like varicose veins).' },
  CYSTIC: { type: 'cystic', text: 'Reid cystic (saccular) bronchiectasis - bronchi ending in large cyst-like (balloon-like) dilatations; the most severe.' },
};

const NOTE = 'The Reid classification (Reid 1950) describes bronchiectasis by bronchial morphology on imaging. Cylindrical (tubular): uniformly dilated, regular outline (least severe). Varicose: irregular, beaded outline. Cystic (saccular): large cyst-like dilatations (most severe). This reports the morphology the radiologist has determined, not a diagnosis, a severity determination, a treatment decision, or a prognosis.';

const ALIAS = {
  CYLINDRICAL: 'CYLINDRICAL', TUBULAR: 'CYLINDRICAL', '1': 'CYLINDRICAL',
  VARICOSE: 'VARICOSE', '2': 'VARICOSE',
  CYSTIC: 'CYSTIC', SACCULAR: 'CYSTIC', '3': 'CYSTIC',
};

// input:
//   type: 'cylindrical' / 'varicose' / 'cystic' (case-insensitive; tubular/saccular and 1-3 accepted).
export function reidBronchiectasis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Reid type (cylindrical, varicose, or cystic).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Reid ${t.type} bronchiectasis`,
    band: t.text,
    note: NOTE,
  };
}
