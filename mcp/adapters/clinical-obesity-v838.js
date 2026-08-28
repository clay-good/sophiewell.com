// spec-v838 MCP adapter: 2025 Lancet Commission clinical obesity framework in
// lib/clinical-obesity-v838.js. The dom keys mirror the browser renderer
// (views/group-v838.js) and META['clinical-obesity'].example.
//
// The anthropometric fields are booleans meaning "raised against a validated cutoff", not raw
// measurements: the Commission specifies validated cutoffs by age, gender and ethnicity rather
// than publishing one set. Clinical domain.

import { clinicalObesity } from '../../lib/clinical-obesity-v838.js';

export default [
  {
    id: 'clinical-obesity',
    summary: 'Applies the 2025 Lancet Commission framework. Step one confirms excess adiposity by direct body fat measurement, or one anthropometric criterion PLUS body mass index, or two anthropometric criteria REGARDLESS of it, with adiposity assumed above 40. Step two classifies confirmed obesity as clinical where organ function is reduced or activities substantially limited, preclinical otherwise. Body mass index alone is not a diagnosis.',
    compute: clinicalObesity,
    fields: [
      { dom: 'cob-bmi', arg: 'bmi', kind: 'number', required: false, label: 'Body mass index' },
      { dom: 'cob-directfat', arg: 'directBodyFatExcess', kind: 'boolean', required: false, label: 'Direct body fat measurement shows excess' },
      { dom: 'cob-waist', arg: 'waistRaised', kind: 'boolean', required: false, label: 'Waist circumference raised' },
      { dom: 'cob-waisthip', arg: 'waistHipRaised', kind: 'boolean', required: false, label: 'Waist-to-hip ratio raised' },
      { dom: 'cob-waistheight', arg: 'waistHeightRaised', kind: 'boolean', required: false, label: 'Waist-to-height ratio raised' },
      { dom: 'cob-organ', arg: 'organDysfunction', kind: 'boolean', required: false, label: 'Reduced organ or tissue function due to adiposity' },
      { dom: 'cob-activity', arg: 'activityLimitation', kind: 'boolean', required: false, label: 'Substantial limitation of day-to-day activities' },
    ],
  },
];
