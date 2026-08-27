// spec-v834 MCP adapter: 2024 ESHRE premature ovarian insufficiency algorithm in
// lib/poi-diagnosis-v834.js. The dom keys mirror the browser renderer (views/group-v834.js)
// and META['poi-diagnosis'].example. Clinical domain.

import { poiDiagnosis } from '../../lib/poi-diagnosis-v834.js';

export default [
  {
    id: 'poi-diagnosis',
    summary: 'Applies the 2024 ESHRE algorithm for premature ovarian insufficiency. Under 40, bilateral oophorectomy IS the diagnosis with no further testing needed; otherwise at least 4 months of amenorrhea or oligomenorrhea with an FSH above 25 IU/L. FSH needs no cycle-day timing, hormonal therapy can both conceal the disturbance and lower the FSH, and estradiol, ultrasound and anti-Mullerian hormone are not diagnostic.',
    compute: poiDiagnosis,
    fields: [
      { dom: 'poi-age', arg: 'age', kind: 'number', required: false, label: 'Age in years' },
      { dom: 'poi-oophorectomy', arg: 'bilateralOophorectomy', kind: 'boolean', required: false, label: 'Bilateral oophorectomy' },
      { dom: 'poi-months', arg: 'monthsOfDisturbance', kind: 'number', required: false, label: 'Months of menstrual disturbance' },
      { dom: 'poi-hormones', arg: 'onHormonalTherapy', kind: 'boolean', required: false, label: 'On hormonal therapy' },
      { dom: 'poi-fsh', arg: 'fsh', kind: 'number', required: false, label: 'FSH, IU/L' },
      { dom: 'poi-repeat', arg: 'repeatFshConfirmed', kind: 'boolean', required: false, label: 'Second raised FSH 4 weeks apart' },
      { dom: 'poi-estradiol', arg: 'estradiolLow', kind: 'boolean', required: false, label: 'Estradiol low' },
      { dom: 'poi-ultrasound', arg: 'ultrasoundDone', kind: 'boolean', required: false, label: 'Small ovaries or low antral follicle count' },
      { dom: 'poi-amh', arg: 'amhLow', kind: 'boolean', required: false, label: 'Anti-Mullerian hormone low' },
    ],
  },
];
