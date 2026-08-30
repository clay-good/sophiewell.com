// spec-v906: telling transfusion-associated circulatory overload from transfusion-related acute
// lung injury.
//
// Sources:
//   Vlaar APJ, Toy P, Fung M, et al. A consensus redefinition of transfusion-related acute lung
//   injury. Transfusion. 2019;59(7):2465-2476.
//   International Society of Blood Transfusion / AABB. Transfusion-associated circulatory
//   overload surveillance case definition (2018 revision).
//
//   Both begin within 6 hours of transfusion and both present as new hypoxemia with bilateral
//   pulmonary infiltrates. What separates them is whether the picture is hydrostatic.
//
//   Pointing to CIRCULATORY OVERLOAD: a raised natriuretic peptide, a positive fluid balance,
//   raised central venous or pulmonary artery pressure, cardiogenic features such as a third
//   heart sound or widened pulse pressure, and improvement with diuresis.
//   Pointing to ACUTE LUNG INJURY: no evidence of hydrostatic overload, and no other risk factor
//   for acute respiratory distress syndrome, or one that is present but stable.
//
// THE TREATMENTS DIVERGE, AND THAT IS WHY THIS TILE EXISTS. Circulatory overload is treated by
// removing volume; acute lung injury is not, and a diuretic given to a patient who is not
// overloaded makes them worse. Getting the direction wrong is harmful in a way that getting the
// label wrong is not.
//
// STOP THE TRANSFUSION FOR BOTH, AND REPORT BOTH. That step does not wait on the distinction, and
// nothing on this page is a reason to delay it.
//
// THEY CAN COEXIST. A patient can be volume overloaded and have acute lung injury at once, and
// features on both sides do not resolve to one answer.
//
// THESE ARE SURVEILLANCE DEFINITIONS. They were written so that cases can be counted and compared
// between centers, not to be applied at the bedside in the first ten minutes.
//
// Pure: no DOM, no clock, no network.

export const TACO_TRALI_NOTE = 'Transfusion-associated circulatory overload and transfusion-related acute lung injury both begin within six hours of a transfusion and both present as new hypoxemia with bilateral pulmonary infiltrates. What separates them is whether the picture is hydrostatic. Features pointing to circulatory overload are a raised natriuretic peptide, a positive fluid balance, raised central venous or pulmonary artery pressure, cardiogenic signs such as a third heart sound or a widened pulse pressure, and improvement with diuresis. Acute lung injury is supported by the absence of hydrostatic overload together with no other risk factor for acute respiratory distress syndrome, or one that is present but stable. Four things about the distinction are worth stating plainly. The treatments diverge, and that is the whole reason it matters: circulatory overload is treated by removing volume, acute lung injury is not, and a diuretic given to a patient who is not overloaded makes them worse. The transfusion is stopped and the event reported for both, and that step does not wait on the distinction. They can coexist, so features on both sides do not resolve to one answer. And these are surveillance definitions, written so cases can be counted and compared between centers rather than applied at the bedside in the first ten minutes. It weighs features already observed against published definitions. It does not diagnose, and it does not decide whether to give a diuretic.';

export const OVERLOAD_FEATURES = [
  { key: 'raisedNatriureticPeptide', text: 'Raised natriuretic peptide, or a rise from the pre-transfusion value' },
  { key: 'positiveFluidBalance', text: 'Positive fluid balance' },
  { key: 'raisedFillingPressure', text: 'Raised central venous or pulmonary artery pressure' },
  { key: 'cardiogenicSigns', text: 'Cardiogenic signs: a third heart sound, widened pulse pressure, or raised jugular venous pressure' },
  { key: 'improvedWithDiuresis', text: 'Improvement with diuresis' },
];

export const INJURY_FEATURES = [
  { key: 'noHydrostaticEvidence', text: 'No evidence of hydrostatic pulmonary edema' },
  { key: 'noOtherArdsRiskFactor', text: 'No other risk factor for acute respiratory distress syndrome, or one present but stable' },
];

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

const pick = (list, o) => list.filter((i) => on(o[i.key]));

export function tacoTrali(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const overload = pick(OVERLOAD_FEATURES, o);
  const injury = pick(INJURY_FEATURES, o);
  const withinSixHours = on(o.withinSixHours);
  const newHypoxemia = on(o.newHypoxemiaWithInfiltrates);

  const gateMet = withinSixHours && newHypoxemia;

  const direction = !gateMet
    ? 'gate-not-met'
    : overload.length && injury.length
      ? 'both'
      : overload.length
        ? 'overload'
        : injury.length
          ? 'injury'
          : 'undifferentiated';

  const action = {
    'gate-not-met': `Both definitions begin with a new hypoxemia and bilateral infiltrates within six hours of the transfusion, and ${!withinSixHours && !newHypoxemia ? 'neither is recorded' : !withinSixHours ? 'the six-hour window is not recorded' : 'the hypoxemia with infiltrates is not recorded'}. Neither definition is reached from what is here.`,
    overload: `${overload.length} feature${overload.length === 1 ? '' : 's'} pointing to circulatory overload and none pointing away from it: ${overload.map((f) => f.text.split(':')[0].toLowerCase()).join('; ')}.`,
    injury: `No hydrostatic feature is recorded, and ${injury.length === 2 ? 'both supporting features are' : 'one supporting feature is'} present. That is the pattern of acute lung injury rather than circulatory overload.`,
    both: `Features on both sides: ${overload.length} pointing to circulatory overload and ${injury.length} away from it. They can coexist, and this does not resolve to one answer.`,
    undifferentiated: 'The entry criteria are met, but no feature on either side is recorded. The distinction rests on whether the picture is hydrostatic, and nothing here says.',
  }[direction];

  // The reason the tile exists, on every result.
  const treatmentNote = 'The treatments diverge, and that is why the distinction matters. Circulatory overload is treated by removing volume; acute lung injury is not, and a diuretic given to a patient who is not overloaded makes them worse.';

  const stopNote = 'Stop the transfusion and report the event for both. That step does not wait on this distinction, and nothing here is a reason to delay it.';

  const coexistNote = direction === 'both'
    ? 'A patient can be volume overloaded and have acute lung injury at the same time. Features on both sides are a reason to treat the picture in front of you, not to pick a label.'
    : 'The two can coexist, and a case with features on both sides does not resolve to one answer.';

  const surveillanceNote = 'These are surveillance definitions, written so cases can be counted and compared between centers. They are not a bedside algorithm for the first ten minutes.';

  const recordedNote = `Recorded: ${overload.length} of ${OVERLOAD_FEATURES.length} features pointing to circulatory overload, ${injury.length} of ${INJURY_FEATURES.length} pointing to acute lung injury.`;

  const scopeNote = 'This weighs features already observed against published definitions. It does not diagnose, and it does not decide whether to give a diuretic.';

  return {
    valid: true,
    direction,
    gateMet,
    overload: overload.map((f) => f.text),
    injury: injury.map((f) => f.text),
    action,
    recordedNote,
    treatmentNote,
    stopNote,
    coexistNote,
    surveillanceNote,
    scopeNote,
    abnormal: gateMet,
    bandLabel: {
      'gate-not-met': 'Entry criteria not met',
      overload: 'Points to circulatory overload',
      injury: 'Points to acute lung injury',
      both: 'Features on both sides',
      undifferentiated: 'Not differentiated',
    }[direction],
    band: action,
    detail: 'Both begin within six hours of transfusion with new hypoxemia and bilateral infiltrates. Circulatory overload is supported by a raised natriuretic peptide, positive fluid balance, raised filling pressures, cardiogenic signs, or improvement with diuresis. Acute lung injury is supported by the absence of hydrostatic evidence and no other stable-or-absent risk factor for acute respiratory distress syndrome.',
    note: TACO_TRALI_NOTE,
  };
}
