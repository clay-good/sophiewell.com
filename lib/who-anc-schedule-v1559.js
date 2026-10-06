// spec-v1559 tool 1: the WHO eight-contact antenatal schedule: which contact is due, and when the next one is.
//
// Source: WHO recommendations on antenatal care for a positive pregnancy experience, 2016 (IRIS 10665/250796;
// all rights reserved, facts restated, nothing reproduced), recommendation E.7 and Box 5, read October 6, 2026:
// a minimum of eight contacts, the first up to 12 weeks, then 20, 26, 30, 34, 36, 38 and 40 weeks; return for
// delivery at 41 weeks if not yet given birth. Recommendations A.2.1 (daily iron 30-60 mg elemental plus 400
// micrograms folic acid) and A.3 (in low-calcium populations, 1.5-2.0 g elemental calcium a day in three doses at
// mealtimes, several hours apart from iron) print as lines.
//
// Stated rather than hidden: a gestational age on a contact week is read as that contact being due today.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const CONTACTS = [[1, 12], [2, 20], [3, 26], [4, 30], [5, 34], [6, 36], [7, 38], [8, 40]];
const NOTE = 'This follows WHO\'s 2016 antenatal care recommendations. Your national schedule may differ; follow it.';
const wk = (x) => {
  const w = Math.floor(x + 1e-9);
  const d = Math.round((x - w) * 7);
  return d ? `${w}+${d}` : `${w}`;
};

export function whoAncSchedule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the gestational age', o.weeks, 4, 44, 'weeks']]);
  if (f) return { valid: false, message: f };
  const days = o.days === undefined || o.days === null || String(o.days).trim() === '' ? 0 : Number(o.days);
  if (!Number.isInteger(days) || days < 0 || days > 6) return { valid: false, message: 'Enter the extra days as a whole number from 0 to 6.' };
  const ga = Number(o.weeks) + days / 7;
  const notes = [
    'Every contact: daily iron (30-60 mg elemental) with 400 micrograms of folic acid. Where dietary calcium is low, also calcium 1.5-2.0 g a day in three doses at mealtimes, several hours apart from the iron.',
    'Check tetanus vaccination at the first contact, and give IPTp-SP from week 13 where malaria is endemic.',
  ];
  if (ga >= 41) {
    return { valid: true, band: `At ${wk(ga)} weeks she is past the 41-week return for delivery in WHO's schedule: assess for delivery now.`, bandLabel: 'Past 41 weeks', abnormal: true, notes, note: NOTE };
  }
  if (ga > 40) {
    const wait = Math.round((41 - ga) * 7);
    return { valid: true, band: `All eight contacts are past. Return for delivery at 41 weeks (in ${wait} day${wait === 1 ? '' : 's'}) if she has not given birth.`, bandLabel: 'Return at 41 weeks', abnormal: false, notes, note: NOTE };
  }
  if (ga <= 12) {
    return { valid: true, band: `At ${wk(ga)} weeks, contact 1 (up to 12 weeks) is due now. The next is contact 2 at 20 weeks.`, bandLabel: 'Contact 1 due', abnormal: false, notes, note: NOTE };
  }
  const today = CONTACTS.find(([, w]) => Math.abs(w - ga) < 1e-9);
  const next = CONTACTS.find(([, w]) => w > ga + 1e-9);
  const missed = CONTACTS.filter(([, w]) => w < ga - 1e-9 && w > 12).map(([n, w]) => `contact ${n} (${w} weeks)`);
  const lines = [];
  if (today) lines.push(`At ${wk(ga)} weeks, contact ${today[0]} is due today.`);
  else lines.push(`At ${wk(ga)} weeks, the next WHO contact is contact ${next[0]} at ${next[1]} weeks, in ${Math.round((next[1] - ga) * 7)} days.`);
  if (today && next) lines.push(`The next is contact ${next[0]} at ${next[1]} weeks.`);
  if (missed.length) notes.unshift(`Scheduled before today: ${missed.join(', ')}. If any was missed, see her now rather than waiting.`);
  return { valid: true, band: lines.join(' '), bandLabel: today ? `Contact ${today[0]} due` : `Next: contact ${next[0]} at ${next[1]} weeks`, abnormal: false, notes, note: NOTE };
}
