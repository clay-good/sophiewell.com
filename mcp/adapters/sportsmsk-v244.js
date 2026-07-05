// spec-v183 MCP wave: adapters for the sports-medicine / MSK measures in
// lib/sportsmsk-v244.js — the Lysholm knee score, the Marx activity rating scale,
// the Foot Posture Index (FPI-6), and the Balance Error Scoring System (BESS). dom
// keys mirror views/group-v244.js; all items are numeric selects or numeric inputs.

import * as F from '../../lib/sportsmsk-v244.js';

export default [
  {
    id: 'lysholm-knee-score',
    summary: 'Lysholm knee score (Lysholm & Gillquist 1982): 8 functional items totaling 0-100; >= 95 excellent, < 65 poor.',
    compute: F.lysholm,
    fields: [
      { dom: 'lys-limp', arg: 'limp', kind: 'number', required: true, label: 'Limp' },
      { dom: 'lys-support', arg: 'support', kind: 'number', required: true, label: 'Support' },
      { dom: 'lys-lock', arg: 'locking', kind: 'number', required: true, label: 'Locking' },
      { dom: 'lys-instab', arg: 'instability', kind: 'number', required: true, label: 'Instability (giving way)' },
      { dom: 'lys-pain', arg: 'pain', kind: 'number', required: true, label: 'Pain' },
      { dom: 'lys-swell', arg: 'swelling', kind: 'number', required: true, label: 'Swelling' },
      { dom: 'lys-stair', arg: 'stair', kind: 'number', required: true, label: 'Stair climbing' },
      { dom: 'lys-squat', arg: 'squat', kind: 'number', required: true, label: 'Squatting' },
    ],
  },
  {
    id: 'marx-activity-rating',
    summary: 'Marx activity rating scale (Marx 2001): running, cutting, deceleration, and pivoting each 0-4 for a 0-16 knee-demand rating.',
    compute: F.marxActivity,
    fields: [
      { dom: 'marx-run', arg: 'running', kind: 'number', required: true, label: 'Running' },
      { dom: 'marx-cut', arg: 'cutting', kind: 'number', required: true, label: 'Cutting' },
      { dom: 'marx-dec', arg: 'deceleration', kind: 'number', required: true, label: 'Deceleration' },
      { dom: 'marx-piv', arg: 'pivoting', kind: 'number', required: true, label: 'Pivoting' },
    ],
  },
  {
    id: 'foot-posture-index',
    summary: 'Foot Posture Index (Redmond 2006): 6 observations each -2 to +2 totaling -12 to +12; +6 to +9 pronated, -1 to -4 supinated.',
    compute: F.footPostureIndex,
    fields: [
      { dom: 'fpi-talar', arg: 'talar', kind: 'number', required: true, label: 'Talar-head palpation' },
      { dom: 'fpi-supra', arg: 'supra', kind: 'number', required: true, label: 'Supra/infra-lateral malleolar curvature' },
      { dom: 'fpi-calc', arg: 'calcaneal', kind: 'number', required: true, label: 'Calcaneal inversion/eversion' },
      { dom: 'fpi-tn', arg: 'talonavicular', kind: 'number', required: true, label: 'Talonavicular bulge' },
      { dom: 'fpi-arch', arg: 'arch', kind: 'number', required: true, label: 'Medial-arch congruence' },
      { dom: 'fpi-fore', arg: 'forefoot', kind: 'number', required: true, label: 'Forefoot abduction/adduction' },
    ],
  },
  {
    id: 'bess-balance-error',
    summary: 'Balance Error Scoring System (Riemann & Guskiewicz 1999): error counts (max 10 each) across 6 stances totaling 0-60.',
    compute: F.bess,
    fields: [
      { dom: 'bess-df', arg: 'dlFirm', kind: 'number', required: true, label: 'Double-leg, firm (errors)' },
      { dom: 'bess-sf', arg: 'slFirm', kind: 'number', required: true, label: 'Single-leg, firm (errors)' },
      { dom: 'bess-tf', arg: 'tandemFirm', kind: 'number', required: true, label: 'Tandem, firm (errors)' },
      { dom: 'bess-dm', arg: 'dlFoam', kind: 'number', required: true, label: 'Double-leg, foam (errors)' },
      { dom: 'bess-sm', arg: 'slFoam', kind: 'number', required: true, label: 'Single-leg, foam (errors)' },
      { dom: 'bess-tm', arg: 'tandemFoam', kind: 'number', required: true, label: 'Tandem, foam (errors)' },
    ],
  },
];
