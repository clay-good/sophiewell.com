// spec-v932: the hepatic iron index.
//
// Sources:
//   Bassett ML, Halliday JW, Powell LW. Value of hepatic iron measurements in early
//   hemochromatosis and determination of the critical iron level associated with fibrosis.
//   Hepatology. 1986;6(1):24-29.
//   Bacon BR, Adams PC, Kowdley KV, Powell LW, Tavill AS. Diagnosis and management of
//   hemochromatosis: 2011 practice guideline by the AASLD. Hepatology. 2011;54(1):328-343.
//
//   Hepatic iron index = hepatic iron concentration in MICROMOLES per gram dry weight, divided
//   by the age in years. At or above 1.9 is the level Bassett associated with homozygous
//   hemochromatosis.
//
// THE UNITS ARE THE TRAP. Laboratories report hepatic iron concentration in micromoles per gram
// OR in micrograms per gram, and the index is defined on the micromolar figure. Iron weighs
// 55.85 micrograms per micromole, so using a microgram figure without converting overstates the
// index about fifty-six-fold -- a normal liver reads as florid hemochromatosis. This converts
// when told which unit the number is in, and says which one it used.
//
// IT DIVIDES BY AGE ON PURPOSE. A homozygote accumulates iron progressively, so the same
// concentration means more in a young patient than an old one. A young homozygote can sit below
// the threshold for exactly that reason.
//
// IT HAS LARGELY BEEN SUPERSEDED. HFE genotyping and MRI-based iron quantification answer this
// question without a biopsy, and the 2011 AASLD guideline treats the index as a supporting
// measurement rather than the diagnostic test it was in 1986. A value below the threshold does
// not exclude iron overload from another cause.
//
// Pure: no DOM, no clock, no network.

export const HII_NOTE = 'The hepatic iron index is the hepatic iron concentration in micromoles per gram dry weight divided by the age in years, and at or above 1.9 is the level Bassett associated with homozygous hemochromatosis. Three things are worth stating plainly. The units are the trap: laboratories report hepatic iron concentration in micromoles per gram or in micrograms per gram, the index is defined on the micromolar figure, and iron weighs 55.85 micrograms per micromole -- so using a microgram figure without converting overstates the index about fifty-six-fold and a normal liver reads as florid hemochromatosis. It divides by age on purpose, because a homozygote accumulates iron progressively and the same concentration means more in a young patient than an old one, which is why a young homozygote can sit below the threshold. And it has largely been superseded: HFE genotyping and MRI-based iron quantification answer the question without a biopsy, the 2011 AASLD guideline treats the index as a supporting measurement rather than the diagnostic test it was in 1986, and a value below the threshold does not exclude iron overload from another cause. It needs a liver biopsy with dry-weight quantification, which is the reason it is rarely the first test. This divides one measured number by another. It does not diagnose hemochromatosis and it does not replace genotyping.';

export const CONCENTRATION_UNIT_OPTIONS = [
  { value: 'umol', text: 'micromoles per gram dry weight' },
  { value: 'ug', text: 'micrograms per gram dry weight' },
];

// Iron: 55.845 g/mol, so 1 micromole weighs 55.845 micrograms.
const UG_PER_UMOL = 55.845;
const THRESHOLD = 1.9;

function num(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 2) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function hepaticIronIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const concentration = num(o.hepaticIronConcentration);
  const age = num(o.ageYears);
  const unit = String(o.concentrationUnit) === 'ug' ? 'ug' : 'umol';

  if (concentration === null || concentration < 0) {
    return { valid: false, message: 'Enter the hepatic iron concentration from the biopsy, and say whether it is in micromoles or micrograms per gram dry weight. The index is defined on the micromolar figure.' };
  }
  if (age === null || age <= 0) {
    return { valid: false, message: 'Enter the age in years, above zero. The index divides by it, because a homozygote accumulates iron progressively.' };
  }

  const umolPerG = unit === 'ug' ? concentration / UG_PER_UMOL : concentration;
  const index = umolPerG / age;
  const met = index >= THRESHOLD;

  const bandLabel = met
    ? `Hepatic iron index ${safeRound(index)} - at or above 1.9`
    : `Hepatic iron index ${safeRound(index)} - below 1.9`;

  const band = met
    ? `Hepatic iron index ${safeRound(index)}: at or above the 1.9 Bassett associated with homozygous hemochromatosis. That is a supporting measurement, not a diagnosis.`
    : `Hepatic iron index ${safeRound(index)}: below 1.9. That does not exclude iron overload from another cause, and a young homozygote can sit below the threshold because the index divides by age.`;

  const unitNote = unit === 'ug'
    ? `The concentration was entered in micrograms per gram and converted to ${safeRound(umolPerG, 1)} micromoles per gram at 55.845 micrograms per micromole. Using the microgram figure directly would have given ${safeRound(concentration / age)}, about fifty-six times too high.`
    : `The concentration was taken as micromoles per gram, which is what the index is defined on. Had it been a microgram figure, the index would be about fifty-six times too high -- laboratories report both.`;

  const ageNote = 'The index divides by age on purpose: a homozygote accumulates iron progressively, so the same concentration means more in a young patient. A young homozygote can fall below the threshold for that reason alone.';

  const supersededNote = 'It has largely been superseded. HFE genotyping and MRI-based iron quantification answer this without a biopsy, and the 2011 AASLD guideline treats the index as a supporting measurement rather than the diagnostic test it was in 1986.';

  const biopsyNote = 'It needs a liver biopsy with dry-weight quantification, which is why it is rarely the first test.';

  const scopeNote = 'This divides one measured number by another. It does not diagnose hemochromatosis, and it does not replace genotyping.';

  return {
    valid: true,
    index: safeRound(index),
    concentrationUmolPerG: safeRound(umolPerG, 1),
    concentrationEntered: concentration,
    concentrationUnit: unit,
    ageYears: age,
    atOrAboveThreshold: met,
    unitNote,
    ageNote,
    supersededNote,
    biopsyNote,
    scopeNote,
    abnormal: met,
    bandLabel,
    band,
    detail: 'Hepatic iron index = hepatic iron concentration in micromoles per gram dry weight, divided by age in years. A microgram-per-gram figure is divided by 55.845 first.',
    note: HII_NOTE,
  };
}
