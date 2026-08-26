// spec-v791 MCP adapter: HRS 2014 cardiac sarcoidosis criteria in
// lib/cardiac-sarcoidosis-v791.js. The dom keys mirror the browser renderer
// (views/group-v791.js) and META['cardiac-sarcoidosis'].example. Two independent pathways;
// the histological one stands alone. Clinical domain.

import { cardiacSarcoidosis } from '../../lib/cardiac-sarcoidosis-v791.js';

export default [
  {
    id: 'cardiac-sarcoidosis',
    summary: 'HRS 2014 criteria for cardiac sarcoidosis (Birnie 2014). Two independent pathways. HISTOLOGICAL: an endomyocardial biopsy showing non-caseating granuloma with no alternative cause is definite on its own. CLINICAL: needs ALL THREE of a histological diagnosis of extracardiac sarcoidosis, one or more qualifying cardiac findings (steroid-responsive cardiomyopathy or block, unexplained LVEF <=40%, unexplained sustained VT, Mobitz II or third-degree block, patchy cardiac FDG-PET uptake, cardiac MRI late gadolinium enhancement, gallium uptake), and reasonable exclusion of other causes; that yields a probable diagnosis.',
    compute: cardiacSarcoidosis,
    fields: [
      { dom: 'cs-biopsy', arg: 'myocardialGranuloma', kind: 'boolean', required: false, label: 'Myocardial granuloma on biopsy' },
      { dom: 'cs-extracardiac', arg: 'extracardiacSarcoid', kind: 'boolean', required: false, label: 'Extracardiac sarcoidosis proven' },
      { dom: 'cs-steroid', arg: 'steroidResponsive', kind: 'boolean', required: false, label: 'Steroid-responsive cardiac disease' },
      { dom: 'cs-ef', arg: 'lowEf', kind: 'boolean', required: false, label: 'Unexplained LVEF 40% or less' },
      { dom: 'cs-vt', arg: 'sustainedVt', kind: 'boolean', required: false, label: 'Unexplained sustained VT' },
      { dom: 'cs-block', arg: 'heartBlock', kind: 'boolean', required: false, label: 'Mobitz II or complete block' },
      { dom: 'cs-pet', arg: 'petUptake', kind: 'boolean', required: false, label: 'Patchy cardiac FDG-PET uptake' },
      { dom: 'cs-cmr', arg: 'cmrLge', kind: 'boolean', required: false, label: 'Cardiac MRI late enhancement' },
      { dom: 'cs-gallium', arg: 'galliumUptake', kind: 'boolean', required: false, label: 'Gallium uptake' },
      { dom: 'cs-excluded', arg: 'otherCausesExcluded', kind: 'boolean', required: false, label: 'Other causes excluded' },
    ],
  },
];
