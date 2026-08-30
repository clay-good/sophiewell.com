// spec-v909 MCP adapter: the four threshold definitions of biochemical response to
// ursodeoxycholic acid in lib/udca-response-v909.js. The dom keys mirror the browser renderer
// (views/group-v909.js) and META['udca-response'].example.
//
// Where the sets part, the result reports the split rather than picking one. Clinical domain.

import { udcaResponse } from '../../lib/udca-response-v909.js';

export default [
  {
    id: 'udca-response',
    summary: 'Reports which definitions of biochemical response to ursodeoxycholic acid a patient meets. The disease is primary biliary cholangitis, and four sets are in common use. Barcelona, read at 12 months, asks that the alkaline phosphatase fall more than 40% from baseline or normalize. Paris I, at 12 months, asks for alkaline phosphatase at or below 3x the upper limit of normal, AST at or below 2x, and bilirubin at or below 1 mg/dL. Paris II tightens those to 1.5x, 1.5x and 1 mg/dL for early-stage disease. Toronto, at 24 months, asks only for alkaline phosphatase at or below 1.67x. THE SETS DO NOT AGREE: each was drawn on a different cohort against a different endpoint, so a patient can be a responder by one and a non-responder by another on the same blood draw, and where they part this reports the split and picks none of them. THE TIME POINT IS PART OF THE CRITERION, so a set read early is reported as not that set. NON-RESPONSE IS A REASON TO CONSIDER SECOND-LINE THERAPY, not a treatment decision and not a reason to stop ursodeoxycholic acid.',
    compute: udcaResponse,
    fields: [
      { dom: 'ur-months', arg: 'monthsOnUdca', kind: 'number', required: true, label: 'Months on ursodeoxycholic acid (the time point is part of each criterion)' },
      { dom: 'ur-alp', arg: 'alp', kind: 'number', required: true, label: 'Alkaline phosphatase now', unit: 'U/L' },
      { dom: 'ur-alpuln', arg: 'alpUln', kind: 'number', required: true, label: 'Alkaline phosphatase upper limit of normal', unit: 'U/L' },
      { dom: 'ur-baselinealp', arg: 'baselineAlp', kind: 'number', required: false, label: 'Alkaline phosphatase before treatment (Barcelona only)', unit: 'U/L' },
      { dom: 'ur-ast', arg: 'ast', kind: 'number', required: false, label: 'AST (the Paris sets only)', unit: 'U/L' },
      { dom: 'ur-astuln', arg: 'astUln', kind: 'number', required: false, label: 'AST upper limit of normal', unit: 'U/L' },
      { dom: 'ur-bilirubin', arg: 'bilirubin', kind: 'number', required: false, label: 'Total bilirubin (the Paris sets only)', unit: 'mg/dL' },
    ],
  },
];
