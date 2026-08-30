// spec-v906 MCP adapter: the TACO / TRALI distinction in lib/taco-trali-v906.js. The dom keys
// mirror the browser renderer (views/group-v906.js) and META['taco-trali'].example.
//
// Features on both sides are a real answer, not a tie to be broken. Clinical domain.

import { tacoTrali } from '../../lib/taco-trali-v906.js';

export default [
  {
    id: 'taco-trali',
    summary: 'Weighs a post-transfusion respiratory event toward circulatory overload or acute lung injury. Both begin within 6 hours of transfusion with new hypoxemia and bilateral infiltrates; what separates them is whether the picture is hydrostatic. A raised natriuretic peptide, positive fluid balance, raised filling pressures, cardiogenic signs or improvement with diuresis point to circulatory overload; the absence of hydrostatic evidence with no other, or a stable, risk factor for acute respiratory distress syndrome points to acute lung injury. THE TREATMENTS DIVERGE, which is the whole reason it matters: overload is treated by removing volume, lung injury is not, and a diuretic given to a patient who is not overloaded makes them worse. STOP THE TRANSFUSION AND REPORT THE EVENT FOR BOTH -- that does not wait on the distinction. THEY CAN COEXIST, so features on both sides do not resolve to one answer. These are surveillance definitions, not a bedside algorithm.',
    compute: tacoTrali,
    fields: [
      { dom: 'tt-withinsixhours', arg: 'withinSixHours', kind: 'boolean', required: false, label: 'Onset within 6 hours of the transfusion (an entry criterion for both)' },
      { dom: 'tt-newhypoxemiawithinfiltrates', arg: 'newHypoxemiaWithInfiltrates', kind: 'boolean', required: false, label: 'New hypoxemia with bilateral pulmonary infiltrates (an entry criterion for both)' },
      { dom: 'tt-raisednatriureticpeptide', arg: 'raisedNatriureticPeptide', kind: 'boolean', required: false, label: 'Raised natriuretic peptide, or a rise from the pre-transfusion value (points to circulatory overload)' },
      { dom: 'tt-positivefluidbalance', arg: 'positiveFluidBalance', kind: 'boolean', required: false, label: 'Positive fluid balance (points to circulatory overload)' },
      { dom: 'tt-raisedfillingpressure', arg: 'raisedFillingPressure', kind: 'boolean', required: false, label: 'Raised central venous or pulmonary artery pressure (points to circulatory overload)' },
      { dom: 'tt-cardiogenicsigns', arg: 'cardiogenicSigns', kind: 'boolean', required: false, label: 'Cardiogenic signs: a third heart sound, widened pulse pressure, or raised jugular venous pressure (points to circulatory overload)' },
      { dom: 'tt-improvedwithdiuresis', arg: 'improvedWithDiuresis', kind: 'boolean', required: false, label: 'Improvement with diuresis (points to circulatory overload)' },
      { dom: 'tt-nohydrostaticevidence', arg: 'noHydrostaticEvidence', kind: 'boolean', required: false, label: 'No evidence of hydrostatic pulmonary edema (points to acute lung injury)' },
      { dom: 'tt-nootherardsriskfactor', arg: 'noOtherArdsRiskFactor', kind: 'boolean', required: false, label: 'No other risk factor for acute respiratory distress syndrome, or one present but stable (points to acute lung injury)' },
    ],
  },
];
