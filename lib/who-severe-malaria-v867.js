// spec-v867: the WHO severe malaria criteria.
//
// Source:
//   World Health Organization. WHO Guidelines for Malaria. Geneva: WHO; 2023. (Severe malaria
//   definition, carried forward from Severe malaria. Trop Med Int Health. 2014;19(Suppl 1):7-131.)
//
//   In a patient with P. falciparum asexual parasitemia and no other identified cause, ANY ONE
//   of the following features is severe malaria:
//     impaired consciousness, prostration, multiple convulsions, acidosis, hypoglycemia,
//     severe malarial anemia, renal impairment, jaundice, pulmonary edema, significant bleeding,
//     shock, hyperparasitemia (> 10%).
//
// ANY ONE FEATURE IS ENOUGH, AND THAT IS WHY THIS TILE EXISTS. This is a list of defining
// features, not a score. The count is descriptive; it does not have to be totaled, and there is
// no threshold to cross above one.
//
// THE PARASITE COUNT DOES NOT GRADE SEVERITY, except as its own feature above 10%. Sequestered
// parasites are not on the film, so a low peripheral count does NOT exclude severe malaria.
//
// TWO FEATURES ARE CONJUNCTIVE. Severe malarial anemia and jaundice are each defined together
// with a parasite density; the lab value on its own does not meet either one.
//
// THRESHOLDS DIFFER BY AGE for consciousness, anemia and hypotension.
//
// Pure: no DOM, no clock, no network.

export const SEVERE_MALARIA_NOTE = 'The WHO severe malaria criteria (WHO Guidelines for Malaria, 2023) define severe falciparum malaria as any one of twelve clinical or laboratory features in a patient with P. falciparum asexual parasitemia and no other identified cause: impaired consciousness, prostration, more than two convulsions in 24 hours, acidosis, hypoglycemia, severe malarial anemia, renal impairment, jaundice, pulmonary edema, significant bleeding, shock, and parasitemia above 10 percent. Four things about it are worth stating plainly. It is a list of defining features and not a score, so one feature is enough and the count is descriptive only. The parasite count does not grade severity except as the hyperparasitemia feature itself, because sequestered parasites are not on the film and a low peripheral count therefore does not exclude severe disease. Severe malarial anemia and jaundice are each defined together with a parasite density, so the hemoglobin or the bilirubin on its own does not meet either feature. And the thresholds for consciousness, anemia and hypotension differ between adults and children. It applies published criteria to values that have already been measured. It does not diagnose malaria, and it does not prescribe treatment.';

// Each feature carries the published threshold in its text, and whether that threshold is
// age-dependent or conjunctive with a parasite density.
export const FEATURES = [
  { key: 'impairedConsciousness', text: 'Impaired consciousness', detail: 'Glasgow Coma Scale below 11 in adults, or Blantyre Coma Scale below 3 in children.', ageDependent: true },
  { key: 'prostration', text: 'Prostration', detail: 'Generalized weakness: unable to sit, stand or walk without assistance.' },
  { key: 'convulsions', text: 'Multiple convulsions', detail: 'More than two episodes in 24 hours.' },
  { key: 'acidosis', text: 'Acidosis', detail: 'Base deficit above 8 mEq/L, or plasma bicarbonate below 15 mmol/L, or venous lactate at or above 5 mmol/L.' },
  { key: 'hypoglycemia', text: 'Hypoglycemia', detail: 'Blood glucose below 40 mg/dL (2.2 mmol/L).' },
  { key: 'anemia', text: 'Severe malarial anemia', detail: 'Hemoglobin at or below 5 g/dL in children under 12 years, or below 7 g/dL in adults, together with a parasite count above 10,000 per microliter.', ageDependent: true, conjunctive: true },
  { key: 'renal', text: 'Renal impairment', detail: 'Creatinine above 3 mg/dL (265 micromol/L), or blood urea above 20 mmol/L.' },
  { key: 'jaundice', text: 'Jaundice', detail: 'Total bilirubin above 3 mg/dL (50 micromol/L) together with a parasite count above 100,000 per microliter.', conjunctive: true },
  { key: 'pulmonaryEdema', text: 'Pulmonary edema', detail: 'Confirmed radiologically, or oxygen saturation below 92 percent on room air with a respiratory rate above 30 per minute.' },
  { key: 'bleeding', text: 'Significant bleeding', detail: 'Recurrent or prolonged bleeding, hematemesis, or melena.' },
  { key: 'shock', text: 'Shock', detail: 'Compensated shock with a capillary refill time at or above 3 seconds, or decompensated shock with a systolic pressure below 70 mmHg in children or below 80 mmHg in adults.', ageDependent: true },
];

export const HYPERPARASITEMIA_PCT = 10;

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function whoSevereMalaria(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const age = o.age === 'child' ? 'child' : 'adult';
  const parasitemia = num(o.parasitemia);

  if (parasitemia !== null && (parasitemia < 0 || parasitemia > 100)) {
    return { valid: false, message: 'Enter the parasitemia as a percentage of parasitized red cells, between 0 and 100.' };
  }

  const met = FEATURES.filter((f) => on(o[f.key])).map((f) => f.text);
  const hyper = parasitemia !== null && parasitemia > HYPERPARASITEMIA_PCT;
  if (hyper) met.push(`Hyperparasitemia (${parasitemia}% parasitized red cells, above ${HYPERPARASITEMIA_PCT}%)`);

  const count = met.length;
  const severe = count >= 1;

  const action = severe
    ? `${count === 1 ? 'One feature' : `${count} features`} of severe falciparum malaria ${count === 1 ? 'is' : 'are'} recorded. Any one is enough: this meets the WHO definition of severe malaria.`
    : 'No feature on the WHO severe malaria list is recorded from what was entered.';

  // The reason the tile exists, on every result.
  const notAScoreNote = 'This is a list of defining features, not a score. One feature is enough, and the count above one adds nothing to the definition.';

  // The single most common misread, and it is worst when nothing else has been ticked.
  const parasiteCountNote = 'The parasite count does not grade severity, except as the hyperparasitemia feature itself. Sequestered parasites are not on the film, so a low peripheral count does not exclude severe malaria.';

  const negativeNote = severe
    ? null
    : 'That is not the same as uncomplicated malaria. It reflects only what was entered here, and several of these features are laboratory values that may not have been drawn yet.';

  const conjunctiveNote = (on(o.anemia) || on(o.jaundice))
    ? 'Severe malarial anemia and jaundice are each defined together with a parasite density. The hemoglobin or the bilirubin on its own does not meet either feature.'
    : null;

  const ageNote = age === 'child'
    ? 'Read for a child: consciousness is graded on the Blantyre scale, severe anemia is a hemoglobin at or below 5 g/dL, and decompensated shock is a systolic pressure below 70 mmHg.'
    : 'Read for an adult: consciousness is graded on the Glasgow Coma Scale, severe anemia is a hemoglobin below 7 g/dL, and decompensated shock is a systolic pressure below 80 mmHg.';

  const confirmationNote = 'The definition applies to a patient with confirmed P. falciparum asexual parasitemia and no other identified cause. A single negative film does not rule malaria out.';

  const metNote = count
    ? `Recorded: ${met.join('; ')}.`
    : 'None of the twelve features was recorded.';

  const scopeNote = 'This applies published criteria to values that have already been measured. It does not diagnose malaria, and it does not prescribe treatment.';

  return {
    valid: true,
    age,
    parasitemia,
    hyperparasitemia: hyper,
    count,
    severe,
    met,
    action,
    metNote,
    notAScoreNote,
    parasiteCountNote,
    negativeNote,
    conjunctiveNote,
    ageNote,
    confirmationNote,
    scopeNote,
    abnormal: severe,
    bandLabel: severe ? 'Severe falciparum malaria' : 'No listed feature recorded',
    band: action,
    detail: 'Twelve features define severe falciparum malaria: impaired consciousness, prostration, more than two convulsions in 24 hours, acidosis, hypoglycemia, severe malarial anemia, renal impairment, jaundice, pulmonary edema, significant bleeding, shock, and parasitemia above 10 percent. Any one of them is enough.',
    note: SEVERE_MALARIA_NOTE,
  };
}
