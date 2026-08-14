// spec-v734 MCP adapter: PHQ-15 somatic symptom severity in lib/phq15-v734.js.
// The dom keys mirror the browser renderer (views/group-v734.js) and META['phq15'].example.
// Fifteen 0-2 enums; the sum 0-30 maps to a somatic-symptom-severity band. Clinical domain.

import { phq15 } from '../../lib/phq15-v734.js';

const RATE = ['0', '1', '2'];

export default [
  {
    id: 'phq15',
    summary: "PHQ-15 (Patient Health Questionnaire-15; Kroenke 2002): 15-item self-report of somatic symptom burden over the past 4 weeks, each symptom rated 0 (not bothered), 1 (a little), 2 (a lot), summed to 0-30. Bands: 0-4 minimal, 5-9 low, 10-14 medium, 15-30 high somatic symptom severity. Higher = greater burden.",
    compute: phq15,
    fields: [
      { dom: 'phq15-q1', arg: 'q1', kind: 'enum', values: RATE, required: true, label: 'Stomach pain (0-2)' },
      { dom: 'phq15-q2', arg: 'q2', kind: 'enum', values: RATE, required: true, label: 'Back pain (0-2)' },
      { dom: 'phq15-q3', arg: 'q3', kind: 'enum', values: RATE, required: true, label: 'Pain in arms, legs, or joints (0-2)' },
      { dom: 'phq15-q4', arg: 'q4', kind: 'enum', values: RATE, required: true, label: 'Menstrual or period problems (0-2)' },
      { dom: 'phq15-q5', arg: 'q5', kind: 'enum', values: RATE, required: true, label: 'Headaches (0-2)' },
      { dom: 'phq15-q6', arg: 'q6', kind: 'enum', values: RATE, required: true, label: 'Chest pain (0-2)' },
      { dom: 'phq15-q7', arg: 'q7', kind: 'enum', values: RATE, required: true, label: 'Dizziness (0-2)' },
      { dom: 'phq15-q8', arg: 'q8', kind: 'enum', values: RATE, required: true, label: 'Fainting spells (0-2)' },
      { dom: 'phq15-q9', arg: 'q9', kind: 'enum', values: RATE, required: true, label: 'Heart pounding or racing (0-2)' },
      { dom: 'phq15-q10', arg: 'q10', kind: 'enum', values: RATE, required: true, label: 'Shortness of breath (0-2)' },
      { dom: 'phq15-q11', arg: 'q11', kind: 'enum', values: RATE, required: true, label: 'Pain or problems during intercourse (0-2)' },
      { dom: 'phq15-q12', arg: 'q12', kind: 'enum', values: RATE, required: true, label: 'Constipation, loose bowels, or diarrhea (0-2)' },
      { dom: 'phq15-q13', arg: 'q13', kind: 'enum', values: RATE, required: true, label: 'Nausea, gas, or indigestion (0-2)' },
      { dom: 'phq15-q14', arg: 'q14', kind: 'enum', values: RATE, required: true, label: 'Feeling tired or low energy (0-2)' },
      { dom: 'phq15-q15', arg: 'q15', kind: 'enum', values: RATE, required: true, label: 'Trouble sleeping (0-2)' },
    ],
  },
];
