// spec-v1394: Texas maternal level of care -- the lowest designated level whose scope covers the
// patient, and what that level must have at the bedside, 25 TAC 133.206-133.209.
//
// Source: Cornell LII copy of 25 Tex. Admin. Code 133.206-133.209 (amended December 30, 2022,
// effective January 8, 2023), read 2026-09-18:
//   Level I (133.206): patients "who are generally healthy" without conditions presenting "a
//     significant risk of maternal morbidity or mortality"; physician or CNM, backup physician, and
//     anesthesia personnel each at the bedside within 30 minutes of an urgent request.
//   Level II (133.207): conditions presenting "a low to moderate risk"; obstetric physician, backup
//     physician, and anesthesia within 30 minutes; blood bank 24 hours a day.
//   Level III (133.208): up to "significant complex" conditions presenting "a high risk"; an OB/GYN
//     on site at all times; MFM and an obstetric anesthesiologist at the bedside within 30 minutes;
//     critical care including fetal monitoring in the ICU and ventilator support.
//   Level IV (133.209): up to "the most complex" conditions; the MFM team, the primary provider, an
//     anesthesiologist, and a placenta accreta team at the bedside within 30 minutes; an adult ICU on
//     site and a comprehensive range of subspecialists.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const MLC_VERIFIED = '2026-09-18';
export const RISK = [
  { value: 'healthy', text: 'Generally healthy, no significant risk condition' },
  { value: 'low-moderate', text: 'A condition with low to moderate risk of maternal morbidity or mortality' },
  { value: 'high', text: 'A significant complex condition with high risk' },
  { value: 'most-complex', text: 'The most complex medical, surgical, or obstetric conditions' },
];

const LEVELS = {
  healthy: ['I', '133.206', ['a physician or certified nurse-midwife, a backup physician, and anesthesia personnel, each able to reach the bedside within 30 minutes of an urgent request']],
  'low-moderate': ['II', '133.207', ['an obstetric physician, a backup physician, and anesthesia personnel, each at the bedside within 30 minutes of an urgent request', 'blood bank services around the clock', 'emergency cesarean capability within current standards']],
  high: ['III', '133.208', ['an OB/GYN on site at all times', 'a maternal-fetal medicine physician and an obstetric anesthesiologist at the bedside within 30 minutes', 'critical care for obstetric patients, including fetal monitoring in the ICU and ventilator support']],
  'most-complex': ['IV', '133.209', ['a maternal-fetal medicine team member, the primary provider, an anesthesiologist, and a placenta accreta team, each at the bedside within 30 minutes', 'an adult ICU on site', 'a comprehensive range of medical and surgical subspecialists']],
};

export function txMaternalLevelReference(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const r = RISK.find((x) => x.value === o.risk);
  if (!r) return { valid: false, message: "Choose the patient's maternal risk. The four levels are defined by it." };
  const [level, sec, needs] = LEVELS[r.value];
  return {
    valid: true,
    level,
    abnormal: level !== 'I',
    bandLabel: `Level ${level} (${sec})`,
    band: `The lowest designated maternal level whose scope covers this patient is Level ${level} (25 TAC ${sec}). It must have:`,
    needs,
    postureNote: scopeSentence(MLC_VERIFIED),
  };
}
