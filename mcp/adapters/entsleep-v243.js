// spec-v183 MCP wave: adapters for the ENT / sleep screening tools in
// lib/entsleep-v243.js — the NOSE scale, the Reflux Finding Score, the No-Apnea
// OSA screen, and the sleep-efficiency index. dom keys mirror views/group-v243.js;
// the NOSE and RFS items are numeric-valued selects, the rest are numeric inputs.

import * as F from '../../lib/entsleep-v243.js';

export default [
  {
    id: 'nose-scale',
    summary: 'NOSE scale (Stewart 2004): 5 nasal-obstruction items each 0-4, summed and x 5 for a 0-100 symptom score.',
    compute: F.noseScale,
    fields: [
      { dom: 'nose-cong', arg: 'congestion', kind: 'number', required: true, label: 'Nasal congestion / stuffiness', values: ['0', '1', '2', '3', '4'] },
      { dom: 'nose-block', arg: 'blockage', kind: 'number', required: true, label: 'Nasal blockage / obstruction', values: ['0', '1', '2', '3', '4'] },
      { dom: 'nose-breath', arg: 'breathing', kind: 'number', required: true, label: 'Trouble breathing through nose', values: ['0', '1', '2', '3', '4'] },
      { dom: 'nose-sleep', arg: 'sleep', kind: 'number', required: true, label: 'Trouble sleeping', values: ['0', '1', '2', '3', '4'] },
      { dom: 'nose-exert', arg: 'exertion', kind: 'number', required: true, label: 'Cannot get enough air on exertion', values: ['0', '1', '2', '3', '4'] },
    ],
  },
  {
    id: 'rfs-reflux-finding',
    summary: 'Reflux Finding Score (Belafsky 2001): 8 laryngoscopic findings totaling 0-26; > 7 indicates laryngopharyngeal reflux.',
    compute: F.rfsRefluxFinding,
    fields: [
      { dom: 'rfs-sub', arg: 'subglottic', kind: 'number', required: false, label: 'Subglottic edema', values: ['0', '2'] },
      { dom: 'rfs-vent', arg: 'ventricular', kind: 'number', required: true, label: 'Ventricular obliteration', values: ['0', '2', '4'] },
      { dom: 'rfs-eryth', arg: 'erythema', kind: 'number', required: true, label: 'Erythema / hyperemia', values: ['0', '2', '4'] },
      { dom: 'rfs-vfe', arg: 'vocalFoldEdema', kind: 'number', required: true, label: 'Vocal-fold edema', values: ['0', '1', '2', '3', '4'] },
      { dom: 'rfs-dle', arg: 'diffuseEdema', kind: 'number', required: true, label: 'Diffuse laryngeal edema', values: ['0', '1', '2', '3', '4'] },
      { dom: 'rfs-pch', arg: 'posteriorHypertrophy', kind: 'number', required: false, label: 'Posterior commissure hypertrophy', values: ['0', '1', '2', '3', '4'] },
      { dom: 'rfs-gran', arg: 'granuloma', kind: 'number', required: false, label: 'Granuloma / granulation', values: ['0', '2'] },
      { dom: 'rfs-muc', arg: 'mucus', kind: 'number', required: false, label: 'Thick endolaryngeal mucus', values: ['0', '2'] },
    ],
  },
  {
    id: 'no-apnea-score',
    summary: 'No-Apnea OSA screen (Duarte 2018): neck circumference plus age scored 0-9; > 3 indicates high obstructive-sleep-apnea risk.',
    compute: F.noApnea,
    fields: [
      { dom: 'na-neck', arg: 'neck', kind: 'number', required: true, label: 'Neck circumference', unit: 'cm' },
      { dom: 'na-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
    ],
  },
  {
    id: 'sleep-efficiency',
    summary: 'Sleep-efficiency index: total sleep time / time in bed x 100; >= 85% normal, < 75% poor.',
    compute: F.sleepEfficiency,
    fields: [
      { dom: 'se-tst', arg: 'tst', kind: 'number', required: true, label: 'Total sleep time', unit: 'minutes' },
      { dom: 'se-tib', arg: 'tib', kind: 'number', required: true, label: 'Time in bed', unit: 'minutes' },
    ],
  },
];
