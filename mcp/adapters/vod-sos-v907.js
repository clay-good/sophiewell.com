// spec-v907 MCP adapter: the three published definitions of hepatic veno-occlusive disease in
// lib/vod-sos-v907.js. The dom keys mirror the browser renderer (views/group-v907.js) and
// META['vod-sos'].example.
//
// Where the definitions part, the result reports the split rather than picking one. Clinical
// domain.

import { vodSos } from '../../lib/vod-sos-v907.js';

export default [
  {
    id: 'vod-sos',
    summary: 'Reports which of three published definitions of hepatic veno-occlusive disease a case meets. The disease is also called sinusoidal obstruction syndrome. Modified Seattle asks for two of three within 20 days: bilirubin above 2 mg/dL, hepatomegaly or right upper quadrant pain, weight gain above 2%. Baltimore asks, within 21 days, for a bilirubin at or above 2 mg/dL and then two of three: painful hepatomegaly, ascites, weight gain above 5%. The EBMT 2016 adult criteria keep those items for classical disease and add a late-onset route beyond day 21 met by the classical picture, by histological proof, or by two or more classical items with hemodynamic or ultrasound evidence. THE DEFINITIONS DISAGREE: Baltimore and the 2016 criteria count nothing until the bilirubin is raised, while modified Seattle counts it as one of three, so a normal bilirubin with hepatomegaly and a rising weight meets one and neither of the others -- where they part this reports the split and picks neither. DAY 21 IS NOT AN EXIT; the late-onset category exists because disease beyond the window is real. Severity grading is separate and not done here, and these are the adult criteria.',
    compute: vodSos,
    fields: [
      { dom: 'vs-days', arg: 'daysSinceTransplant', kind: 'number', required: true, label: 'Days since transplant (every definition is written around this count)' },
      { dom: 'vs-bilirubinatleasttwo', arg: 'bilirubinAtLeastTwo', kind: 'boolean', required: false, label: 'Bilirubin at or above 2 mg/dL' },
      { dom: 'vs-hepatomegalyorruqpain', arg: 'hepatomegalyOrRuqPain', kind: 'boolean', required: false, label: 'Hepatomegaly or right upper quadrant pain of liver origin (the modified Seattle wording)' },
      { dom: 'vs-painfulhepatomegaly', arg: 'painfulHepatomegaly', kind: 'boolean', required: false, label: 'Painful hepatomegaly (the Baltimore and EBMT wording; it satisfies the broader item above as well)' },
      { dom: 'vs-ascites', arg: 'ascites', kind: 'boolean', required: false, label: 'Ascites' },
      { dom: 'vs-weightgain', arg: 'weightGain', kind: 'enum', required: false, label: 'Weight gain from baseline', values: ['none', 'over2', 'over5'] },
      { dom: 'vs-hemodynamicorultrasoundevidence', arg: 'hemodynamicOrUltrasoundEvidence', kind: 'boolean', required: false, label: 'Hemodynamic or ultrasound evidence of veno-occlusive disease (a late-onset route beyond day 21)' },
      { dom: 'vs-histologicallyproven', arg: 'histologicallyProven', kind: 'boolean', required: false, label: 'Histologically proven (a late-onset route beyond day 21)' },
    ],
  },
];
