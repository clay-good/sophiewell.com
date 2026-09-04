// spec-v927: inspiratory airway resistance on a ventilated patient, and the distinction the
// number exists to make.
//
// Sources:
//   Tobin MJ, ed. Principles and Practice of Mechanical Ventilation. 3rd ed. New York:
//   McGraw-Hill; 2013.
//   Hess DR. Respiratory mechanics in mechanically ventilated patients. Respir Care.
//   2014;59(11):1773-1794.
//
//   Resistance = (peak inspiratory pressure - plateau pressure) / inspiratory flow in liters per
//   second. The numerator is the resistive pressure drop; everything above the plateau is spent
//   pushing gas through the tube and the airways rather than distending the lung.
//
// A RISING PEAK WITH AN UNCHANGED PLATEAU IS A RESISTANCE PROBLEM. Secretions, a kinked or bitten
// tube, bronchospasm. A RISING PLATEAU IS A COMPLIANCE PROBLEM: edema, consolidation, a
// pneumothorax, abdominal pressure, the chest wall. That single distinction is what this
// arithmetic is for, and the peak on its own cannot make it.
//
// IT NEEDS A REAL PLATEAU. The plateau has to be measured during an end-inspiratory hold with no
// flow. A number read off the pressure waveform without a hold is not a plateau, and the
// resistance computed from it is not resistance.
//
// IT ASSUMES CONSTANT INSPIRATORY FLOW. The formula is written for square-wave flow in volume
// control. Under pressure control, or with a decelerating flow pattern, flow at end-inspiration
// is not the flow that produced the peak, and this is not the calculation to use.
//
// THE ENDOTRACHEAL TUBE IS PART OF WHAT IS MEASURED. A smaller tube raises the number with no
// airway disease at all, which is why the trend in one patient says more than the absolute.
//
// IT ALSO ASSUMES A PASSIVE PATIENT. Any inspiratory effort changes the pressures the ventilator
// reads, and the arithmetic cannot see that it happened.
//
// Pure: no DOM, no clock, no network.

export const AIRWAY_RESISTANCE_NOTE = 'Inspiratory airway resistance on a ventilated patient is the peak inspiratory pressure minus the plateau pressure, divided by the inspiratory flow in liters per second. The numerator is the resistive pressure drop: everything above the plateau is spent pushing gas through the tube and the airways rather than distending the lung. The distinction it exists to make is this. A rising peak pressure with an unchanged plateau is a resistance problem -- secretions, a kinked or bitten tube, bronchospasm. A rising plateau is a compliance problem -- edema, consolidation, a pneumothorax, abdominal pressure, the chest wall. The peak on its own cannot tell those apart, and treating one as the other wastes time on the wrong intervention. Four conditions have to hold. The plateau must come from a real end-inspiratory hold with no flow, because a number read off the waveform without a hold is not a plateau. The flow must be constant, since the formula is written for square-wave flow in volume control and is not the right calculation under pressure control or a decelerating pattern. The endotracheal tube is part of what is measured, so a smaller tube raises the number with no airway disease at all and the trend in one patient says more than the absolute. And the patient must be passive, because any inspiratory effort changes the pressures the ventilator reads and this arithmetic cannot see that it happened. This is arithmetic on three ventilator numbers. It does not diagnose the cause and it does not choose a treatment.';

const USUAL_UPPER = 10;

function num(v) {
  // spec-v1040: `Number(null)` and `Number('')` are both 0, and 0 is finite, so
  // this returned a measurement of zero for a value nobody entered -- and every
  // guard written as `if (x === null)` downstream stopped firing.
  if (v === null || v === undefined || (typeof v !== 'number' && String(v).trim() === '')) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function safeRound(n, places = 2) {
  const f = 10 ** places;
  const r = Math.round(n * f) / f;
  return Number.isFinite(r) ? r : n;
}

export function airwayResistance(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const pip = num(o.peakPressure);
  const plateau = num(o.plateauPressure);
  const flowLpm = num(o.inspiratoryFlow);

  if (pip === null || plateau === null) {
    return { valid: false, message: 'Enter the peak inspiratory pressure and the plateau pressure, both in cmH2O. The plateau has to come from an end-inspiratory hold; a number read off the waveform without a hold is not a plateau.' };
  }
  if (flowLpm === null || flowLpm <= 0) {
    return { valid: false, message: 'Enter the set inspiratory flow in liters per minute, above zero. The formula is written for constant square-wave flow in volume control.' };
  }
  if (plateau > pip) {
    return { valid: false, message: 'The plateau is higher than the peak, which cannot happen: the peak includes the resistive pressure drop on top of the plateau. Check which number is which.' };
  }

  const drop = pip - plateau;
  const flowLps = flowLpm / 60;
  const resistance = drop / flowLps;

  const raised = resistance > USUAL_UPPER;

  const bandLabel = raised
    ? `Resistance ${safeRound(resistance)} cmH2O per liter per second - raised`
    : `Resistance ${safeRound(resistance)} cmH2O per liter per second - within the usual range`;

  const band = `A resistive pressure drop of ${safeRound(drop)} cmH2O at ${safeRound(flowLpm)} liters per minute gives a resistance of ${safeRound(resistance)} cmH2O per liter per second. ${raised ? `Above the ${USUAL_UPPER} that is usual on a passive adult through an endotracheal tube.` : `Within the range usual on a passive adult through an endotracheal tube, up to about ${USUAL_UPPER}.`}`;

  const distinctionNote = 'A rising peak with an unchanged plateau is a resistance problem: secretions, a kinked or bitten tube, bronchospasm. A rising plateau is a compliance problem: edema, consolidation, a pneumothorax, abdominal pressure, the chest wall. The peak on its own cannot tell them apart.';

  const plateauNote = drop === 0
    ? 'The peak and the plateau are equal, so no pressure at all is being spent on resistance. That is worth checking before it is believed: it usually means the plateau was not measured during a real end-inspiratory hold.'
    : 'The plateau has to come from an end-inspiratory hold with no flow. A number read off the pressure waveform without a hold is not a plateau, and the resistance computed from it is not resistance.';

  const flowNote = 'The formula assumes constant square-wave flow in volume control. Under pressure control, or with a decelerating flow pattern, the flow at end-inspiration is not the flow that produced the peak and this is not the calculation to use.';

  const tubeNote = 'The endotracheal tube is part of what is measured. A smaller tube raises the number with no airway disease at all, which is why the trend in one patient says more than the absolute.';

  const passiveNote = 'It assumes a passive patient. Any inspiratory effort changes the pressures the ventilator reads, and this arithmetic cannot see that it happened.';

  const complianceNote = 'This says nothing about compliance. That question is the plateau against the tidal volume, and it has its own tool.';

  const scopeNote = 'This is arithmetic on three ventilator numbers. It does not diagnose the cause and it does not choose a treatment.';

  return {
    valid: true,
    resistance: safeRound(resistance),
    resistiveDrop: safeRound(drop),
    peakPressure: pip,
    plateauPressure: plateau,
    inspiratoryFlowLpm: safeRound(flowLpm),
    inspiratoryFlowLps: safeRound(flowLps),
    raised,
    distinctionNote,
    plateauNote,
    flowNote,
    tubeNote,
    passiveNote,
    complianceNote,
    scopeNote,
    abnormal: raised,
    bandLabel,
    band,
    detail: 'Resistance = (peak inspiratory pressure minus plateau pressure) divided by the inspiratory flow in liters per second. Flow in liters per minute is divided by 60 first.',
    note: AIRWAY_RESISTANCE_NOTE,
  };
}
