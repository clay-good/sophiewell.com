// spec-v853 MCP adapter: the echocardiographic criteria for constrictive pericarditis in
// lib/constrictive-pericarditis-echo-v853.js. The dom keys mirror the browser renderer
// (views/group-v853.js) and META['constrictive-pericarditis-echo'].example.
//
// septalShift is the anchor: without it neither of the other two arguments satisfies the
// criteria, whatever their values. Clinical domain.

import { constrictivePericarditisEcho } from '../../lib/constrictive-pericarditis-echo-v853.js';

export default [
  {
    id: 'constrictive-pericarditis-echo',
    summary: 'Applies the echocardiographic criteria for constrictive pericarditis. The three findings are a respiration-related ventricular septal shift, a medial or septal mitral annular early diastolic velocity of 9 cm/s or more, and a hepatic vein expiratory diastolic reversal ratio of 0.79 or more. THE SEPTAL SHIFT IS REQUIRED and neither of the others counts without it: the shift with either one was 87 percent sensitive and 91 percent specific, and all three together were 64 percent sensitive and 97 percent specific. A MEDIAL VELOCITY THAT LOOKS NORMAL IS THE CRITERION, not a reassuring number, and where the criteria are met the ratio of early filling velocity to annular velocity does not estimate filling pressure. Derived against restrictive cardiomyopathy; it does not stage or select an operation.',
    compute: constrictivePericarditisEcho,
    fields: [
      { dom: 'cpe-shift', arg: 'septalShift', kind: 'boolean', required: false, label: 'Ventricular septal shift that moves with respiration, required for either combination' },
      { dom: 'cpe-medial', arg: 'medialE', kind: 'number', required: false, label: 'Medial or septal annular early diastolic velocity, criterion at 9 or more', unit: 'cm/s' },
      { dom: 'cpe-lateral', arg: 'lateralE', kind: 'number', required: false, label: 'Lateral annular early diastolic velocity, not a criterion but shows the reversed relationship', unit: 'cm/s' },
      { dom: 'cpe-hvr', arg: 'hepaticVeinRatio', kind: 'number', required: false, label: 'Hepatic vein expiratory diastolic reversal ratio, criterion at 0.79 or more' },
      { dom: 'cpe-hvrev', arg: 'hepaticVeinReversalVelocity', kind: 'number', required: false, label: 'Hepatic vein expiratory diastolic reversal velocity, used with the forward velocity to make the ratio', unit: 'cm/s' },
      { dom: 'cpe-hvfwd', arg: 'hepaticVeinForwardVelocity', kind: 'number', required: false, label: 'Hepatic vein diastolic forward velocity, used with the reversal velocity to make the ratio', unit: 'cm/s' },
    ],
  },
];
