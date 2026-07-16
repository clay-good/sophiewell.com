// spec-v340: Clark level of a cutaneous melanoma (levels I-V) — the anatomic level of dermal
// invasion. Clark grades how deep a melanoma has invaded by the skin layer it reaches: I is confined
// to the epidermis (in situ), rising through the papillary dermis (II-III) and reticular dermis (IV)
// to the subcutaneous fat (V). The catalog carries the AJCC melanoma T category (Breslow depth in
// mm) but had no Clark level (the anatomic-compartment companion). "clark level" / "melanoma
// invasion level" routed to nothing.
//
// HIGH-STAKES: this reports the Clark LEVEL the pathologist has determined, NOT a diagnosis, a
// staging decision, or a prognosis for an individual patient (spec-v11 §5.3). Modern staging uses
// AJCC TNM with Breslow thickness; Clark level is largely of historical / descriptive value. The
// staging and management decisions stay with the clinician and the pathologist.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Clark WH Jr, From L, Bernardino EA, Mihm MC. The histogenesis and biologic behavior of
//     primary human malignant melanomas of the skin. Cancer Res. 1969;29(3):705-727 (the five
//     anatomic levels).
//   - Melanoma-staging references (ScienceDirect / dermatopathology reviews) reproducing the same
//     level-I-V anatomic-compartment definitions.
//
// Levels (anatomic compartment reached):
//   I  : intraepidermal — melanoma in situ, confined to the epidermis (does not invade the dermis).
//   II : invasion into the papillary dermis (partial; single cells or small nests).
//   III: melanoma fills and expands the papillary dermis, impinging on the reticular dermis
//        (papillary-reticular interface).
//   IV : invasion into the reticular dermis.
//   V  : invasion into the subcutaneous fat.

const LEVELS = {
  I: { level: 'I', deep: false, text: 'Clark level I — intraepidermal melanoma (melanoma in situ), confined to the epidermis; the dermis is not invaded.' },
  II: { level: 'II', deep: false, text: 'Clark level II — invasion into the papillary dermis (partial; single cells or small nests).' },
  III: { level: 'III', deep: false, text: 'Clark level III — melanoma fills and expands the papillary dermis, impinging on the reticular dermis (papillary-reticular interface).' },
  IV: { level: 'IV', deep: true, text: 'Clark level IV — invasion into the reticular dermis. A deeper level of invasion.' },
  V: { level: 'V', deep: true, text: 'Clark level V — invasion into the subcutaneous fat. The deepest level of invasion.' },
};

const NOTE = 'Clark level (Clark 1969) reports the anatomic skin layer a cutaneous melanoma has invaded. I: intraepidermal (in situ). II: papillary dermis (partial). III: fills the papillary dermis, up to the reticular interface. IV: reticular dermis. V: subcutaneous fat. Deeper levels (IV-V) historically carried a higher metastasis / recurrence risk. Modern melanoma staging uses the AJCC TNM system with Breslow thickness (mm) rather than Clark level, which is now largely historical / descriptive. This reports the level the pathologist has determined, not a diagnosis, a staging decision, or a prognosis.';

const ALIAS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V' };

// input:
//   level: 'I' .. 'V' (case-insensitive; also accepts 1-5)
export function clarkLevel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.level == null ? '' : o.level).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = LEVELS[key];
  if (!t) {
    return { valid: false, message: 'Select the Clark level (I, II, III, IV, or V).' };
  }
  return {
    valid: true,
    level: t.level,
    deep: t.deep,
    abnormal: t.deep,
    bandLabel: `Clark level ${t.level}`,
    band: t.text,
    note: NOTE,
  };
}
