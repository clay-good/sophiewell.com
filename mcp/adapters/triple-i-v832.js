// spec-v832 MCP adapter: NICHD Triple I framework in lib/triple-i-v832.js.
// The dom keys mirror the browser renderer (views/group-v832.js) and META['triple-i'].example.
// Clinical domain.

import { tripleI } from '../../lib/triple-i-v832.js';

export default [
  {
    id: 'triple-i',
    summary: 'Applies the NICHD 2015 Triple I framework. It replaced the single label of clinical chorioamnionitis with three graded categories. ISOLATED MATERNAL FEVER is a category in its own right and NOT an infection diagnosis - that separation was the point of the reform. Suspected Triple I adds fetal tachycardia, leukocytosis without recent steroids, or purulent cervical fluid. Confirmed adds amniotic fluid or placental evidence.',
    compute: tripleI,
    fields: [
      { dom: 'ti-temp', arg: 'temperature', kind: 'number', required: false, label: 'Maternal temperature' },
      { dom: 'ti-unit', arg: 'temperatureUnit', kind: 'enum', required: false, label: 'Temperature unit', values: ['c', 'f'] },
      { dom: 'ti-repeat', arg: 'repeatedAfter30Min', kind: 'boolean', required: false, label: 'Second reading 30 minutes later' },
      { dom: 'ti-altsource', arg: 'alternativeSource', kind: 'boolean', required: false, label: 'Clear alternative source for the fever' },
      { dom: 'ti-fhr', arg: 'fetalHeartRate', kind: 'number', required: false, label: 'Fetal heart rate, bpm' },
      { dom: 'ti-wbc', arg: 'whiteCellCount', kind: 'number', required: false, label: 'Maternal white cell count per mm3' },
      { dom: 'ti-steroids', arg: 'recentCorticosteroids', kind: 'boolean', required: false, label: 'Recent corticosteroids' },
      { dom: 'ti-purulent', arg: 'purulentDischarge', kind: 'boolean', required: false, label: 'Purulent fluid from the cervical os' },
      { dom: 'ti-gram', arg: 'positiveGramStain', kind: 'boolean', required: false, label: 'Positive amniotic fluid Gram stain' },
      { dom: 'ti-glucose', arg: 'lowGlucoseOrCulture', kind: 'boolean', required: false, label: 'Low amniotic glucose or positive culture' },
      { dom: 'ti-histology', arg: 'placentalHistology', kind: 'boolean', required: false, label: 'Placental histologic infection' },
    ],
  },
];
