// spec-v1394: Texas neonatal level of care -- the lowest designated level whose rule covers the
// infant, 25 TAC 133.186-133.189 (amended effective June 22, 2023).
//
// Source: Cornell LII copy of 25 Tex. Admin. Code 133.186-133.189, read 2026-09-18 (the Secretary of
// State's register had moved and did not load; the LII copy shows the June 22, 2023 amendment):
//   Level I (133.186): mothers and infants "of generally more than or equal to 35 weeks gestational
//     age who have routine, transient perinatal problems"; staff stabilize smaller or sicker
//     neonates until transfer.
//   Level II (133.187): "generally more than or equal to 32 weeks gestational age and birth weight
//     more than or equal to 1500 grams"; assisted endotracheal ventilation "for less than 24 hours"
//     or NCPAP until the infant improves, or transfer. A facility "more than 75 miles from the nearest
//     Level III or IV" that keeps a neonate under 32 weeks or under 1,500 g must give the same care a
//     higher level would, and review each such case in depth.
//   Level III (133.188): "all gestational ages with mild to critical illnesses or requiring sustained
//     life support"; major pediatric surgery on site or at another designated facility; a full range
//     of pediatric medical subspecialists and surgical specialists.
//   Level IV (133.189): "the most complex and critical medical and surgical conditions";
//     surgical repair of complex conditions on site.
//
// Pure: no DOM, no clock, no network.

import { scopeSentence } from './state-calendar.js';

export const NLC_VERIFIED = '2026-09-18';
export const RESP = [
  { value: 'none', text: 'No respiratory support' },
  { value: 'cpap', text: 'Nasal CPAP' },
  { value: 'vent-short', text: 'Ventilation expected under 24 hours' },
  { value: 'vent-long', text: 'Sustained ventilation or other life support' },
];
export const ILLNESS = [
  { value: 'routine', text: 'Routine, transient problems' },
  { value: 'moderate', text: 'Illness beyond routine, not critical' },
  { value: 'critical', text: 'Mild to critical illness needing subspecialists or major surgery' },
  { value: 'complex', text: 'Most complex conditions, including complex surgical repair' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function txNeonatalLevelMatch(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.ga)) return { valid: false, message: 'Enter the gestational age in weeks. Level I is generally 35 weeks or more, Level II 32 or more.' };
  const ga = Number(String(o.ga).trim());
  if (!Number.isFinite(ga) || ga < 20 || ga > 45) return { valid: false, message: 'Enter a gestational age between 20 and 45 weeks.' };
  if (isBlank(o.weightG)) return { valid: false, message: 'Enter the birth weight in grams. Level II is generally 1,500 g or more.' };
  const g = Number(String(o.weightG).trim());
  if (!Number.isFinite(g) || g < 200 || g > 7000) return { valid: false, message: 'Enter a birth weight between 200 and 7,000 g.' };
  const resp = RESP.find((r) => r.value === o.resp);
  if (!resp) return { valid: false, message: 'Choose the expected respiratory support. Level II covers CPAP or ventilation under 24 hours.' };
  const ill = ILLNESS.find((x) => x.value === o.illness);
  if (!ill) return { valid: false, message: 'Choose how complex the illness is. It separates Levels III and IV.' };

  let level;
  const why = [];
  if (ill.value === 'complex') { level = 'IV'; why.push('the most complex conditions, with complex surgical repair on site (133.189)'); }
  else if (ill.value === 'critical' || resp.value === 'vent-long') {
    level = 'III';
    why.push(resp.value === 'vent-long' ? 'sustained ventilation or life support (133.188)' : 'mild to critical illness with subspecialist or major surgical needs (133.188)');
  } else if (ga < 32 || g < 1500) {
    level = 'III';
    why.push(`${ga < 32 ? `${ga} weeks is under Level II's generally 32 weeks` : ''}${ga < 32 && g < 1500 ? ' and ' : ''}${g < 1500 ? `${g.toLocaleString('en-US')} g is under Level II's generally 1,500 g` : ''} (133.187), and Level III covers all gestational ages (133.188)`);
  } else if (ga < 35 || resp.value !== 'none' || ill.value === 'moderate') {
    level = 'II';
    if (ga < 35) why.push(`${ga} weeks is under Level I's generally 35 weeks (133.186)`);
    if (resp.value === 'cpap' || resp.value === 'vent-short') why.push(`${resp.value === 'cpap' ? 'nasal CPAP' : 'ventilation under 24 hours'} is within Level II (133.187)`);
    if (ill.value === 'moderate') why.push('illness beyond routine, transient problems (133.186, 133.187)');
  } else {
    level = 'I';
    why.push(`${ga} weeks, routine and transient problems, no respiratory support (133.186)`);
  }

  let exception = null;
  if (level === 'III' && (ga < 32 || g < 1500) && ill.value !== 'critical' && resp.value !== 'vent-long') {
    exception = o.far === 'yes'
      ? 'This facility is more than 75 miles from a Level III or IV: a Level II may keep this infant only if it gives the same care a higher level would, and it must review the case in depth through its neonatal quality plan (133.187).'
      : 'A Level II more than 75 miles from a Level III or IV may keep an infant under 32 weeks or 1,500 g only if it gives the same care a higher level would (133.187).';
  }
  return {
    valid: true,
    level,
    abnormal: level !== 'I',
    bandLabel: `Level ${level}`,
    band: `Lowest appropriate designated level: Level ${level}, because ${why.join('; ')}.`,
    exception,
    generallyNote: 'The rules say "generally" for the week and weight lines; the neonatal medical director decides edge cases. Any level stabilizes a distressed neonate until transfer.',
    postureNote: scopeSentence(NLC_VERIFIED),
  };
}
