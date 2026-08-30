// spec-v905 MCP adapter: DKA resolution criteria in lib/dka-resolution-v905.js. The dom keys
// mirror the browser renderer (views/group-v905.js) and META['dka-resolution'].example.
//
// A value that is missing is not a value that is met. Clinical domain.

import { dkaResolution } from '../../lib/dka-resolution-v905.js';

export default [
  {
    id: 'dka-resolution',
    summary: 'Applies the published criteria for resolution of diabetic ketoacidosis: a glucose below 200 mg/dL together with at least two of a serum bicarbonate at or above 15 mEq/L, a venous pH above 7.30, and an anion gap at or below 12 mEq/L. RESOLUTION IS NOT THE GLUCOSE: a normal glucose is one of four conditions, and stopping the insulin infusion when it falls is the commonest way rebound ketoacidosis happens, because the infusion is what closes the gap and the glucose falls first. IT IS TWO OF THE THREE, NOT ALL THREE, so a patient whose gap and bicarbonate have come back still qualifies while the venous pH lags. THE ANION GAP TRACKS THE KETOSIS, NOT MEASURED KETONES, since the nitroprusside reaction misses beta-hydroxybutyrate. Subcutaneous insulin is overlapped with the infusion before it comes down.',
    compute: dkaResolution,
    fields: [
      { dom: 'dr-glucosemgdl', arg: 'glucoseMgDl', kind: 'number', required: false, label: 'Glucose, mg/dL (resolution needs it below 200)', unit: 'mg/dL' },
      { dom: 'dr-bicarbonate', arg: 'bicarbonate', kind: 'number', required: false, label: 'Serum bicarbonate, mEq/L (met at 15 or above)', unit: 'mEq/L' },
      { dom: 'dr-venousph', arg: 'venousPh', kind: 'number', required: false, label: 'Venous pH (met above 7.30)' },
      { dom: 'dr-aniongap', arg: 'anionGap', kind: 'number', required: false, label: 'Anion gap, mEq/L (met at 12 or below; this is the variable that tracks the ketosis)', unit: 'mEq/L' },
    ],
  },
];
