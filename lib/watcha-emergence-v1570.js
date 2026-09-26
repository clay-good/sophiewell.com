// spec-v1570: the Watcha scale for emergence agitation, beside the PAED scale.
//
// Sources, read 2026-09-25:
//   Watcha MF, Ramirez-Ruiz M, White PF, et al. Perioperative effects of oral ketorolac and
//     acetaminophen in children undergoing bilateral myringotomy. Can J Anaesth. 1992;39(7):649-654
//     (the original).
//   Levels as stated in J Anaesthesiol Clin Pharmacol 2025 (PMC11867362): "0: asleep; 1: calm;
//     2: crying but can be consoled; 3: crying but cannot be consoled; 4: agitated and thrashing.
//     Patient with a score of >2 was considered to have ED." BMJ Paediatr Open 2025 (PMC11911689)
//     numbers four levels ("1: calm or asleep; 2: crying and consolable; 3: crying and inconsolable
//     and 4: severely agitated") and also diagnoses delirium at 3 or more.
//   Braz J Anesthesiol 2024 (PMC11334726): scales built on crying and inconsolability alone, the
//     Watcha scale among them, have a lower sensitivity (0.34) than PAED (0.93).
//
// The two numberings agree from 2 up; the answer names the behavior and the level. Pure.

export const BEHAVIORS = [
  { value: 'asleep', text: 'Asleep' },
  { value: 'calm', text: 'Calm' },
  { value: 'consolable', text: 'Crying, but can be consoled' },
  { value: 'inconsolable', text: 'Crying, cannot be consoled' },
  { value: 'thrashing', text: 'Agitated and thrashing' },
];
const LEVEL = { asleep: 0, calm: 1, consolable: 2, inconsolable: 3, thrashing: 4 };

export function watchaEmergence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!(o.behavior in LEVEL)) return { valid: false, message: 'Choose the most agitated behavior seen since emergence.' };
  const lvl = LEVEL[o.behavior];
  const text = BEHAVIORS.find((b) => b.value === o.behavior).text.toLowerCase();
  const levelText = lvl === 0 ? 'level 0 (level 1, calm or asleep, where the scale is numbered 1 to 4)' : `level ${lvl}`;
  const ed = lvl >= 3;
  return {
    valid: true,
    level: lvl,
    abnormal: ed,
    band: ed
      ? `Watcha ${levelText}: ${text}. Emergence agitation (3 or more).`
      : `Watcha ${levelText}: ${text}. Below the threshold of 3. That does not rule delirium out: the scale\'s sensitivity was 0.34, against 0.93 for PAED.`,
    bandLabel: ed ? `Watcha ${lvl}, emergence agitation` : `Watcha ${lvl}, below 3`,
    notes: [
      'Record the most agitated behavior in the first 30 minutes after emergence, not only the behavior now.',
      'The scale rates crying and consolability alone; PAED also rates eye contact, purposeful action and awareness.',
    ],
    note: 'Watcha scale (Watcha MF et al, Can J Anaesth 1992); levels as stated in J Anaesthesiol Clin Pharmacol 2025 and BMJ Paediatr Open 2025; sensitivity from Braz J Anesthesiol 2024.',
  };
}
