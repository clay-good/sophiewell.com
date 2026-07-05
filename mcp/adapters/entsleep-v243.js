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
      { dom: 'nose-cong', arg: 'congestion', kind: 'number', required: true, label: 'Nasal congestion / stuffiness' },
      { dom: 'nose-block', arg: 'blockage', kind: 'number', required: true, label: 'Nasal blockage / obstruction' },
      { dom: 'nose-breath', arg: 'breathing', kind: 'number', required: true, label: 'Trouble breathing through nose' },
      { dom: 'nose-sleep', arg: 'sleep', kind: 'number', required: true, label: 'Trouble sleeping' },
      { dom: 'nose-exert', arg: 'exertion', kind: 'number', required: true, label: 'Cannot get enough air on exertion' },
    ],
  },
  {
    id: 'rfs-reflux-finding',
    summary: 'Reflux Finding Score (Belafsky 2001): 8 laryngoscopic findings totaling 0-26; > 7 indicates laryngopharyngeal reflux.',
    compute: F.rfsRefluxFinding,
    fields: [
      { dom: 'rfs-sub', arg: 'subglottic', kind: 'number', required: false, label: 'Subglottic edema' },
      { dom: 'rfs-vent', arg: 'ventricular', kind: 'number', required: true, label: 'Ventricular obliteration' },
      { dom: 'rfs-eryth', arg: 'erythema', kind: 'number', required: true, label: 'Erythema / hyperemia' },
      { dom: 'rfs-vfe', arg: 'vocalFoldEdema', kind: 'number', required: true, label: 'Vocal-fold edema' },
      { dom: 'rfs-dle', arg: 'diffuseEdema', kind: 'number', required: true, label: 'Diffuse laryngeal edema' },
      { dom: 'rfs-pch', arg: 'posteriorHypertrophy', kind: 'number', required: false, label: 'Posterior commissure hypertrophy' },
      { dom: 'rfs-gran', arg: 'granuloma', kind: 'number', required: false, label: 'Granuloma / granulation' },
      { dom: 'rfs-muc', arg: 'mucus', kind: 'number', required: false, label: 'Thick endolaryngeal mucus' },
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
