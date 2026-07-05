// spec-v183 MCP wave: adapters for the four geriatric assessment tools in
// lib/geri-v241.js — the Groningen Frailty Indicator (GFI), the Short Physical
// Performance Battery (SPPB), the Osteoporosis Self-assessment Tool (OST), and the
// five-times sit-to-stand test. dom keys mirror views/group-v241.js; all inputs
// are numeric (the SPPB sub-scores are numeric-valued selects).

import * as F from '../../lib/geri-v241.js';

export default [
  {
    id: 'groningen-frailty-indicator',
    summary: 'Groningen Frailty Indicator (Steverink N, Slaets JP, et al. 2001): a count of positive items across physical, cognitive, social, and psychological domains for a 0-15 total, where >= 4 indicates frailty.',
    compute: F.groningen,
    fields: [
      { dom: 'gfi-count', arg: 'count', kind: 'number', required: true, label: 'Total items positive (0-15)' },
    ],
  },
  {
    id: 'short-physical-performance-battery',
    summary: 'Short Physical Performance Battery (Guralnik JM, et al. J Gerontol 1994): standing balance, 4-meter gait speed, and five chair stands each scored 0-4 for a 0-12 total, where < 10 indicates mobility limitation.',
    compute: F.sppb,
    fields: [
      { dom: 'sppb-balance', arg: 'balance', kind: 'number', required: true, label: 'Balance sub-score (0-4)' },
      { dom: 'sppb-gait', arg: 'gait', kind: 'number', required: true, label: '4-meter gait-speed sub-score (0-4)' },
      { dom: 'sppb-chair', arg: 'chair', kind: 'number', required: true, label: 'Chair-stand sub-score (0-4)' },
    ],
  },
  {
    id: 'osteoporosis-self-assessment-tool',
    summary: 'Osteoporosis Self-assessment Tool (Koh LK, et al. Osteoporos Int 2001) = (weight kg - age years) x 0.2 truncated to an integer; > -1 low, -1 to -4 moderate, < -4 high risk of low bone mineral density.',
    compute: F.ost,
    fields: [
      { dom: 'ost-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ost-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
    ],
  },
  {
    id: 'five-times-sit-to-stand',
    summary: 'Five-times sit-to-stand test (Csuka M, McCarty DJ. Am J Med 1985): the time in seconds to complete five sit-to-stand cycles with arms folded; >= 12 s indicates increased fall risk and >= 15 s recurrent-faller risk.',
    compute: F.fiveTimesSitToStand,
    fields: [
      { dom: 'ftsts-time', arg: 'time', kind: 'number', required: true, label: 'Time for five sit-to-stand cycles', unit: 'seconds' },
    ],
  },
];
