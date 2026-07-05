// spec-v183 MCP wave: adapters for the four IBD / GI activity indices in
// lib/ibd-v246.js — the Simple Clinical Colitis Activity Index (SCCAI), the
// Pediatric Ulcerative Colitis Activity Index (PUCAI), the Boston Bowel
// Preparation Scale (BBPS), and the simplified autoimmune-hepatitis criteria.
// dom keys mirror views/group-v246.js.

import * as F from '../../lib/ibd-v246.js';

export default [
  {
    id: 'sccai',
    summary: 'Simple Clinical Colitis Activity Index (Walmsley 1998): six domains, 0-19; a score >= 5 indicates active ulcerative colitis.',
    compute: F.sccai,
    fields: [
      { dom: 'sc-day', arg: 'freqDay', kind: 'number', required: true, label: 'Bowel frequency, daytime' },
      { dom: 'sc-night', arg: 'freqNight', kind: 'number', required: true, label: 'Bowel frequency, night' },
      { dom: 'sc-urg', arg: 'urgency', kind: 'number', required: true, label: 'Urgency of defecation' },
      { dom: 'sc-blood', arg: 'blood', kind: 'number', required: true, label: 'Blood in stool' },
      { dom: 'sc-well', arg: 'wellbeing', kind: 'number', required: true, label: 'General wellbeing' },
      { dom: 'sc-extra', arg: 'extracolonic', kind: 'number', required: true, label: 'Extracolonic manifestations' },
    ],
  },
  {
    id: 'pucai',
    summary: 'Pediatric Ulcerative Colitis Activity Index (Turner 2007): six items, 0-85; < 10 remission, 10-34 mild, 35-64 moderate, 65-85 severe.',
    compute: F.pucai,
    fields: [
      { dom: 'pu-pain', arg: 'pain', kind: 'number', required: true, label: 'Abdominal pain' },
      { dom: 'pu-bleed', arg: 'bleeding', kind: 'number', required: true, label: 'Rectal bleeding' },
      { dom: 'pu-cons', arg: 'consistency', kind: 'number', required: true, label: 'Stool consistency' },
      { dom: 'pu-num', arg: 'number', kind: 'number', required: true, label: 'Number of stools / 24 h' },
      { dom: 'pu-noct', arg: 'nocturnal', kind: 'number', required: true, label: 'Nocturnal stools' },
      { dom: 'pu-act', arg: 'activity', kind: 'number', required: true, label: 'Activity level' },
    ],
  },
  {
    id: 'bbps-boston',
    summary: 'Boston Bowel Preparation Scale (Lai 2009): right, transverse, and left colon segments each 0-3; a total >= 6 (each segment >= 2) is adequate.',
    compute: F.bbpsBoston,
    fields: [
      { dom: 'bb-right', arg: 'right', kind: 'number', required: true, label: 'Right colon segment (0-3)' },
      { dom: 'bb-trans', arg: 'transverse', kind: 'number', required: true, label: 'Transverse colon segment (0-3)' },
      { dom: 'bb-left', arg: 'left', kind: 'number', required: true, label: 'Left colon segment (0-3)' },
    ],
  },
  {
    id: 'simplified-aih',
    summary: 'Simplified autoimmune-hepatitis criteria (IAIHG 2008): autoantibodies + IgG + histology + absence of viral hepatitis, 0-8; >= 6 probable, >= 7 definite.',
    compute: F.simplifiedAih,
    fields: [
      { dom: 'aih-auto', arg: 'autoantibody', kind: 'number', required: true, label: 'Autoantibodies (ANA/SMA/anti-LKM1/SLA)' },
      { dom: 'aih-igg', arg: 'igg', kind: 'number', required: true, label: 'IgG' },
      { dom: 'aih-hist', arg: 'histology', kind: 'number', required: true, label: 'Liver histology' },
      { dom: 'aih-viral', arg: 'viralAbsent', kind: 'bool', required: true, label: 'Absence of viral hepatitis' },
    ],
  },
];
