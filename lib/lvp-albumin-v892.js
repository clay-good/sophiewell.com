// spec-v892: albumin replacement after a large-volume paracentesis.
//
// Sources:
//   Runyon BA; AASLD. Introduction to the revised American Association for the Study of Liver
//   Diseases Practice Guideline management of adult patients with ascites due to cirrhosis 2012.
//   Hepatology. 2013;57(4):1651-1653.
//   European Association for the Study of the Liver. EASL Clinical Practice Guidelines for the
//   management of patients with decompensated cirrhosis. J Hepatol. 2018;69(2):406-460.
//
//   Above 5 liters removed, give 6 to 8 g of albumin per liter removed. At or below 5 liters,
//   albumin is not routinely required.
//
// THE THRESHOLD IS THE VOLUME REMOVED, NOT THE PATIENT'S ALBUMIN LEVEL, AND THAT IS WHY THIS TILE
// EXISTS. Post-paracentesis circulatory dysfunction follows the volume shift, so the serum
// albumin does not decide whether replacement is given and a normal one does not excuse it.
//
// THE DOSE IS PER LITRE REMOVED, ACROSS THE WHOLE VOLUME, not per liter above the five-liter
// line. That arithmetic is the one most often done wrong.
//
// ALBUMIN HERE IS NOT NUTRITIONAL SUPPORT AND IT IS NOT A PLASMA EXPANDER OF CONVENIENCE. It is
// given for this indication, and the same product given for hypoalbuminemia alone has no such
// evidence behind it.
//
// A TAP IS ALSO A DIAGNOSTIC OPPORTUNITY. Ascitic fluid should be sent for a cell count and
// culture whether or not the paracentesis is therapeutic, and this tile does not do that for you.
//
// Pure: no DOM, no clock, no network.

export const LVP_NOTE = 'After a large-volume paracentesis, albumin is given to prevent post-paracentesis circulatory dysfunction. Above five liters removed, the guidelines give 6 to 8 g of albumin per liter removed; at or below five liters it is not routinely required. Four things about this are worth stating plainly. The threshold is the volume removed rather than the patient\\u2019s albumin level, because the circulatory dysfunction follows the volume shift, so a serum albumin does not decide whether replacement is given and a normal one does not excuse it. The dose is per liter removed across the whole volume, not per liter above the five-liter line, and that arithmetic is the one most often done wrong. Albumin for this indication is neither nutritional support nor a plasma expander of convenience, and the same product given for a low albumin alone does not have this evidence behind it. And a tap is also a diagnostic opportunity, since ascitic fluid should be sent for a cell count and culture whether or not the paracentesis is therapeutic. It computes a published dose from a volume already removed. It does not decide whether to drain, and it does not prescribe.';

export const THRESHOLD_LITRES = 5;
export const GRAMS_PER_LITRE_LOW = 6;
export const GRAMS_PER_LITRE_HIGH = 8;

// The common vial strengths, so a gram figure can be read as something orderable.
export const CONCENTRATIONS = [
  { value: '25', text: '25 percent (12.5 g per 50 mL bottle)' },
  { value: '20', text: '20 percent (10 g per 50 mL bottle)' },
  { value: '5', text: '5 percent (12.5 g per 250 mL bottle)' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const oneOf = (list, v, fallback) => (list.some((i) => i.value === v) ? v : fallback);
const round1 = (n) => Math.round(n * 10) / 10;

export function lvpAlbumin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const liters = num(o.litersRemoved);
  const concentration = oneOf(CONCENTRATIONS, o.concentration, '25');

  if (liters === null) {
    return { valid: false, message: 'Enter the volume of ascitic fluid removed, in liters.' };
  }
  if (liters < 0 || liters > 30) {
    return { valid: false, message: 'Enter the volume removed between 0 and 30 liters.' };
  }

  const indicated = liters > THRESHOLD_LITRES;
  // Per liter removed, across the WHOLE volume.
  const low = indicated ? round1(liters * GRAMS_PER_LITRE_LOW) : 0;
  const high = indicated ? round1(liters * GRAMS_PER_LITRE_HIGH) : 0;

  const gramsPerBottle = concentration === '20' ? 10 : 12.5;
  const bottlesLow = indicated ? Math.ceil(low / gramsPerBottle) : 0;
  const bottlesHigh = indicated ? Math.ceil(high / gramsPerBottle) : 0;

  const action = indicated
    ? `${liters} liters removed, above ${THRESHOLD_LITRES}: ${low} to ${high} g of albumin, which is ${GRAMS_PER_LITRE_LOW} to ${GRAMS_PER_LITRE_HIGH} g per liter across the whole volume removed.`
    : `${liters} liters removed, at or below ${THRESHOLD_LITRES}: albumin is not routinely required for this volume.`;

  // The reason the tile exists, on every result.
  const volumeNotLevelNote = 'The threshold is the volume removed, not the patient\'s albumin level. Post-paracentesis circulatory dysfunction follows the volume shift, so a serum albumin does not decide whether replacement is given, and a normal one does not excuse it.';

  const arithmeticNote = indicated
    ? `The dose is per liter across the whole volume, not per liter above ${THRESHOLD_LITRES}. Counting only the excess would give ${round1((liters - THRESHOLD_LITRES) * GRAMS_PER_LITRE_LOW)} to ${round1((liters - THRESHOLD_LITRES) * GRAMS_PER_LITRE_HIGH)} g here, and that is the error this arithmetic invites.`
    : `Above ${THRESHOLD_LITRES} liters the dose is per liter across the whole volume, not per liter above the line.`;

  const bottlesNote = indicated
    ? `At ${concentration} percent, ${gramsPerBottle} g per bottle, that is about ${bottlesLow} to ${bottlesHigh} bottles. Confirm the strength stocked before ordering; concentrations differ between formularies.`
    : null;

  const notNutritionNote = 'Albumin for this indication is neither nutritional support nor a plasma expander of convenience. The same product given for a low albumin alone does not have this evidence behind it.';

  const diagnosticNote = 'A tap is also a diagnostic opportunity. Ascitic fluid should be sent for a cell count and culture whether or not the paracentesis is therapeutic.';

  const scopeNote = 'This computes a published dose from a volume already removed. It does not decide whether to drain, and it does not prescribe.';

  return {
    valid: true,
    litersRemoved: liters,
    indicated,
    gramsLow: low,
    gramsHigh: high,
    concentration,
    bottlesLow,
    bottlesHigh,
    action,
    volumeNotLevelNote,
    arithmeticNote,
    bottlesNote,
    notNutritionNote,
    diagnosticNote,
    scopeNote,
    abnormal: indicated,
    bandLabel: indicated ? `${low} to ${high} g` : 'Not routinely required',
    band: action,
    detail: `Above ${THRESHOLD_LITRES} liters removed, ${GRAMS_PER_LITRE_LOW} to ${GRAMS_PER_LITRE_HIGH} g of albumin per liter removed, counted across the whole volume. At or below ${THRESHOLD_LITRES} liters, albumin is not routinely required. The trigger is the volume, not the serum albumin.`,
    note: LVP_NOTE,
  };
}
