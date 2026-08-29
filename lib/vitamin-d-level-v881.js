// spec-v881: interpreting a serum 25-hydroxyvitamin D level under the two frameworks that
// disagree about it.
//
// Sources:
//   Institute of Medicine (now the National Academy of Medicine). Dietary Reference Intakes for
//   Calcium and Vitamin D. Washington DC: National Academies Press; 2011.
//   Demay MB, Pittas AG, Bikle DD, et al. Vitamin D for the Prevention of Disease: an Endocrine
//   Society Clinical Practice Guideline. J Clin Endocrinol Metab. 2024;109(8):1907-1947.
//
//   Institute of Medicine: 20 ng/mL (50 nmol/L) meets the needs of at least 97.5% of the
//   population for bone health; below 12 ng/mL (30 nmol/L) is deficiency.
//   Endocrine Society (2011 treatment guideline): below 20 ng/mL is deficiency, 21 to 29 ng/mL
//   insufficiency, 30 ng/mL and above sufficiency.
//
// THE WORD "DEFICIENT" DEPENDS ON WHICH FRAMEWORK YOU USE, AND THAT IS WHY THIS TILE EXISTS. A
// level of 25 ng/mL is adequate under the Institute of Medicine and insufficient under the older
// Endocrine Society thresholds. The tile prints both and does not pick one.
//
// THE 20 ng/mL FIGURE IS A POPULATION REFERENCE, NOT AN INDIVIDUAL TREATMENT TARGET. It was
// derived to cover 97.5% of the population for bone health, and it is routinely read as a
// personal cutoff, which is not what it is.
//
// THE 2024 ENDOCRINE SOCIETY GUIDELINE RECOMMENDS AGAINST ROUTINE TESTING IN HEALTHY ADULTS. It
// found no threshold that reliably guides supplementation in people without an indication, so
// the most defensible reading of many levels is that the test should not have been sent.
//
// THE ASSAY ITSELF VARIES. Total 25-hydroxyvitamin D moves with vitamin D binding protein, and
// interassay variation is well documented, so a value near a threshold does not separate cleanly
// from the value on the other side of it.
//
// Pure: no DOM, no clock, no network.

export const VITAMIN_D_NOTE = 'A serum 25-hydroxyvitamin D level is read against two frameworks that disagree. The Institute of Medicine, in its 2011 dietary reference intakes, concluded that 20 ng/mL meets the needs of at least 97.5 percent of the population for bone health and that below 12 ng/mL is deficiency. The Endocrine Society treatment guideline of 2011 set deficiency below 20 ng/mL, insufficiency at 21 to 29, and sufficiency at 30 and above. Four things about the reading are worth stating plainly. The word deficient depends on which framework is used, so a level of 25 ng/mL is adequate under the Institute of Medicine and insufficient under the Endocrine Society thresholds, and this tile prints both rather than picking one. The 20 ng/mL figure is a population reference derived to cover 97.5 percent of people for bone health, not an individual treatment target, and it is routinely read as a personal cutoff, which is not what it is. The 2024 Endocrine Society guideline recommends against routine testing in healthy adults, having found no threshold that reliably guides supplementation in people without an indication, so for many levels the most defensible reading is that the test should not have been sent. And the assay itself varies with vitamin D binding protein and between laboratories, so a value near a threshold does not separate cleanly from the value on the other side of it. It reads a number against published thresholds. It does not diagnose deficiency, and it does not decide whether to supplement.';

export const NG_PER_NMOL = 0.4005;

export const IOM_DEFICIENCY = 12;
export const IOM_SUFFICIENCY = 20;
export const ENDO_DEFICIENCY = 20;
export const ENDO_SUFFICIENCY = 30;
export const TOXICITY_CONCERN = 100;

export const UNITS = [
  { value: 'ng-ml', text: 'ng/mL' },
  { value: 'nmol-l', text: 'nmol/L' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function vitaminDLevel(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const raw = num(o.level);
  const unit = o.unit === 'nmol-l' ? 'nmol-l' : 'ng-ml';

  if (raw === null) {
    return {
      valid: false,
      message: 'Enter a serum 25-hydroxyvitamin D level.',
    };
  }
  const limit = unit === 'nmol-l' ? 1000 : 400;
  if (raw < 0 || raw > limit) {
    return { valid: false, message: `Enter the level between 0 and ${limit} ${unit === 'nmol-l' ? 'nmol/L' : 'ng/mL'}.` };
  }

  const ngml = unit === 'nmol-l' ? Math.round(raw * NG_PER_NMOL * 10) / 10 : raw;
  const nmoll = unit === 'nmol-l' ? raw : Math.round((raw / NG_PER_NMOL) * 10) / 10;

  const iom = ngml < IOM_DEFICIENCY
    ? 'deficient'
    : ngml < IOM_SUFFICIENCY
      ? 'below the population reference'
      : 'at or above the population reference';

  const endo = ngml < ENDO_DEFICIENCY
    ? 'deficient'
    : ngml < ENDO_SUFFICIENCY
      ? 'insufficient'
      : 'sufficient';

  const frameworksAgree = (iom === 'deficient' && endo === 'deficient')
    || (iom === 'at or above the population reference' && endo === 'sufficient');

  const action = `${ngml} ng/mL (${nmoll} nmol/L): ${iom} by the Institute of Medicine reading, and ${endo} by the Endocrine Society thresholds.`;

  // The reason the tile exists.
  const disagreementNote = frameworksAgree
    ? 'The two frameworks agree at this level. They do not agree everywhere: between 20 and 29 ng/mL the Institute of Medicine reads adequate and the Endocrine Society reads insufficient.'
    : `The two frameworks disagree at this level, and that is the point. ${ngml} ng/mL is ${iom} under the Institute of Medicine and ${endo} under the Endocrine Society thresholds. Neither is quoted here as the answer.`;

  const populationNote = 'The 20 ng/mL figure is a population reference, derived to cover 97.5 percent of people for bone health. It is not an individual treatment target, and it is routinely read as one.';

  const testingNote = 'The 2024 Endocrine Society guideline recommends against routine 25-hydroxyvitamin D testing in healthy adults: it found no threshold that reliably guides supplementation in people without an indication.';

  const assayNote = Math.abs(ngml - IOM_SUFFICIENCY) <= 3 || Math.abs(ngml - ENDO_SUFFICIENCY) <= 3 || Math.abs(ngml - IOM_DEFICIENCY) <= 3
    ? `At ${ngml} ng/mL this level sits within 3 ng/mL of a threshold. Total 25-hydroxyvitamin D moves with vitamin D binding protein and varies between laboratories, so it does not separate cleanly from the value on the other side.`
    : null;

  const toxicityNote = ngml > TOXICITY_CONCERN
    ? `Above ${TOXICITY_CONCERN} ng/mL, levels are in the range where toxicity is a concern; hypercalcemia is the finding that matters, not the level itself.`
    : null;

  const unitNote = unit === 'nmol-l'
    ? `Entered in nmol/L and converted at ${NG_PER_NMOL} ng/mL per nmol/L. The published thresholds are written in ng/mL.`
    : null;

  const scopeNote = 'This reads a number against published thresholds. It does not diagnose deficiency, and it does not decide whether to supplement.';

  return {
    valid: true,
    ngml,
    nmoll,
    unit,
    iom,
    endo,
    frameworksAgree,
    action,
    disagreementNote,
    populationNote,
    testingNote,
    assayNote,
    toxicityNote,
    unitNote,
    scopeNote,
    abnormal: endo !== 'sufficient' || iom === 'deficient',
    bandLabel: `${ngml} ng/mL`,
    band: action,
    detail: `Institute of Medicine: below ${IOM_DEFICIENCY} ng/mL is deficiency, and ${IOM_SUFFICIENCY} ng/mL meets the needs of at least 97.5 percent of the population for bone health. Endocrine Society: below ${ENDO_DEFICIENCY} ng/mL is deficiency, ${ENDO_DEFICIENCY + 1} to ${ENDO_SUFFICIENCY - 1} is insufficiency, and ${ENDO_SUFFICIENCY} or above is sufficiency.`,
    note: VITAMIN_D_NOTE,
  };
}
