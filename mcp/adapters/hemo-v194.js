// spec-v183 MCP wave 16: adapters for the four invasive- / echocardiographic-
// hemodynamics instruments in lib/hemo-v194.js — the Pulmonary Artery
// Pulsatility Index (PAPi), the transpulmonary / diastolic pressure gradients
// (TPG & DPG), the Tei myocardial performance index, and the pulmonary shunt
// fraction (Qs/Qt). dom keys mirror views/group-v194.js. The transpulmonary-
// gradient tile's compute is `pressureGradients` and its dom keys carry the
// `tpg-` prefix.

import * as F from '../../lib/hemo-v194.js';

export default [
  {
    id: 'papi',
    summary: 'Pulmonary Artery Pulsatility Index (Korabathina 2012): (PA systolic − PA diastolic) / right atrial pressure; a low index flags RV dysfunction in acute inferior MI, advanced heart failure, and post-LVAD RV failure.',
    compute: F.papi,
    fields: [
      { dom: 'papi-pasp', arg: 'pasp', kind: 'number', required: true, label: 'PA systolic pressure', unit: 'mmHg' },
      { dom: 'papi-padp', arg: 'padp', kind: 'number', required: true, label: 'PA diastolic pressure', unit: 'mmHg' },
      { dom: 'papi-rap', arg: 'rap', kind: 'number', required: true, label: 'Right atrial pressure', unit: 'mmHg' },
    ],
  },
  {
    id: 'transpulmonary-gradient',
    summary: 'Transpulmonary (mean PAP − PCWP) and diastolic (PA diastolic − PCWP) pressure gradients (Naeije 2013); with PCWP > 15 mmHg a DPG ≥ 7 marks a combined pre-/post-capillary pulmonary-hypertension pattern.',
    compute: F.pressureGradients,
    fields: [
      { dom: 'tpg-mpap', arg: 'mpap', kind: 'number', required: true, label: 'Mean PA pressure', unit: 'mmHg' },
      { dom: 'tpg-padp', arg: 'padp', kind: 'number', required: true, label: 'PA diastolic pressure', unit: 'mmHg' },
      { dom: 'tpg-pcwp', arg: 'pcwp', kind: 'number', required: true, label: 'Mean PCWP', unit: 'mmHg' },
    ],
  },
  {
    id: 'tei-index',
    summary: 'Tei myocardial performance index (Tei 1995): (isovolumic contraction + isovolumic relaxation time) / ejection time; a higher index marks worse combined systolic-diastolic function.',
    compute: F.teiIndex,
    fields: [
      { dom: 'tei-ivct', arg: 'ivct', kind: 'number', required: true, label: 'Isovolumic contraction time (IVCT)', unit: 'ms' },
      { dom: 'tei-ivrt', arg: 'ivrt', kind: 'number', required: true, label: 'Isovolumic relaxation time (IVRT)', unit: 'ms' },
      { dom: 'tei-et', arg: 'et', kind: 'number', required: true, label: 'Ejection time (ET)', unit: 'ms' },
    ],
  },
  {
    id: 'shunt-fraction',
    summary: 'Pulmonary shunt fraction Qs/Qt (Berggren 1942): from hemoglobin and the alveolar, arterial, and mixed-venous O₂ saturations and tensions, the fraction of cardiac output bypassing gas exchange; normal ~4–10%.',
    compute: F.shuntFraction,
    fields: [
      { dom: 'shunt-hb', arg: 'hb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'shunt-pao2a', arg: 'pAO2', kind: 'number', required: true, label: 'Alveolar / end-capillary O₂ tension', unit: 'mmHg' },
      { dom: 'shunt-sao2', arg: 'sao2', kind: 'number', required: true, label: 'Arterial SaO₂', unit: '%' },
      { dom: 'shunt-pao2', arg: 'pao2', kind: 'number', required: true, label: 'Arterial PaO₂', unit: 'mmHg' },
      { dom: 'shunt-svo2', arg: 'svo2', kind: 'number', required: true, label: 'Mixed-venous SvO₂', unit: '%' },
      { dom: 'shunt-pvo2', arg: 'pvo2', kind: 'number', required: true, label: 'Mixed-venous PvO₂', unit: 'mmHg' },
    ],
  },
];
