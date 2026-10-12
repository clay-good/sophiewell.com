// spec-v1639 tool 9: days of back-up contraception when a method is started, by CDC's 2024
// recommendations.
//
// Source, re-read October 12, 2026: CDC, U.S. Selected Practice Recommendations for Contraceptive
// Use, 2024 (MMWR Recomm Rep 2024;73(RR-3); PMC11340200), "Need for Back-Up Contraception" under
// each method, and Box 3. For example: "If CHCs are started within the first 5 days since menstrual
// bleeding started, no additional contraceptive protection is needed. If CHCs are started >5 days
// since menstrual bleeding started, the patient needs to abstain from sexual intercourse or use
// barrier methods (e.g., condoms) for the next 7 days." Drospirenone pills: "started on the first
// day of menstrual bleeding" against ">1 day since menstrual bleeding started", which fixes the
// count: the day bleeding starts is day 1.
//
// Scope: menstruating, not postpartum, not after an abortion, not switching methods. CDC's other
// branches are not computed.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';

export const METHODS = [
  { value: 'combined-pill-patch-or-ring', text: 'Combined pill, patch or ring', within: 5, backup: 7, cdc: 'CHCs', where: 'started' },
  { value: 'norethindrone-norgestrel-minipill', text: 'Progestin-only pill: norethindrone or norgestrel', within: 5, backup: 2, cdc: 'norethindrone or norgestrel POPs', where: 'started' },
  { value: 'drospirenone-minipill', text: 'Progestin-only pill: drospirenone', within: 1, backup: 7, cdc: 'DRSP POPs', where: 'started' },
  { value: 'dmpa-shot', text: 'Medroxyprogesterone injection (DMPA)', within: 7, backup: 7, cdc: 'DMPA', where: 'started' },
  { value: 'etonogestrel-implant', text: 'Implant', within: 5, backup: 7, cdc: 'the implant', where: 'placed' },
  { value: 'levonorgestrel-iud', text: 'Levonorgestrel IUD', within: 7, backup: 7, cdc: 'the LNG-IUD', where: 'placed' },
];
export const BOX3 = [
  'is 7 days or less after the start of normal menses',
  'has not had sexual intercourse since the start of last normal menses',
  'has been correctly and consistently using a reliable method of contraception',
  'is 7 days or less after spontaneous or induced abortion',
  'is within 4 weeks postpartum',
  'is fully or nearly fully breastfeeding (exclusively breastfeeding or the vast majority [85% or more] of feeds are breastfeeds), amenorrheic, and less than 6 months postpartum',
];
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function contraceptionStartBackup(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = METHODS.find((x) => x.value === String(o.method ?? '').trim());
  if (!m) return { valid: false, message: 'Choose the method being started.' };
  const bleed = date(o.bleedingStarted);
  if (!bleed) return { valid: false, message: 'Enter the date menstrual bleeding started.' };
  const start = date(o.startDate);
  if (!start) return { valid: false, message: `Enter the date the method is ${m.where}.` };
  const day = Math.round((start.getTime() - bleed.getTime()) / 86400000) + 1;
  if (day < 1) return { valid: false, message: 'Enter a start date on or after the date bleeding started.' };
  if (day > 366) return { valid: false, message: 'Enter dates no more than a year apart.' };
  const needed = day > m.within;
  const notes = [`${say(start)} is day ${day} since menstrual bleeding started, counting ${say(bleed)} as day 1.`];
  const first = m.within === 1 ? 'on the first day of menstrual bleeding' : `within the first ${m.within} days since menstrual bleeding started`;
  if (!needed) notes.push(`CDC: if ${m.cdc} ${m.cdc === 'CHCs' || m.cdc.endsWith('POPs') ? 'are' : 'is'} ${m.where} ${first}, no additional contraceptive protection is needed.`);
  else {
    const end = addCalendarDaysUtc(start, m.backup);
    notes.push(`CDC: if ${m.cdc} ${m.cdc === 'CHCs' || m.cdc.endsWith('POPs') ? 'are' : 'is'} ${m.where} more than ${m.within} day${m.within === 1 ? '' : 's'} since menstrual bleeding started, the patient needs to abstain from sexual intercourse or use barrier methods (e.g., condoms) for the next ${m.backup} days. ${m.backup} days from ${say(start)} is ${say(end)}.`);
  }
  notes.push(`CDC says the method may be started at any time if it is reasonably certain that the patient is not pregnant. Its Box 3: a health care provider can be reasonably certain if the patient has no symptoms or signs of pregnancy and meets any one of these: ${BOX3.join('; ')}. The list is shown, not scored.`);
  notes.push('Scope: a patient who is menstruating, not postpartum, not after an abortion and not switching from another method. CDC gives separate lines for amenorrhea, postpartum by breastfeeding status, after abortion and switching; see CDC for those.');
  notes.push('The source is CDC\'s 2024 U.S. Selected Practice Recommendations, not the product\'s label; the product\'s own label may differ.');
  notes.push('This is what CDC states for these inputs. It is not advice for a particular patient.');
  const out = { valid: true, dayOfCycle: day, backupNeeded: needed, backupDays: needed ? m.backup : 0 };
  if (needed) out.backupThrough = addCalendarDaysUtc(start, m.backup).toISOString().slice(0, 10);
  return { ...out, flag: needed ? 'back-up-needed' : 'no-back-up', abnormal: needed, band: needed ? `Back-up for the next ${m.backup} days (CDC).` : 'No additional contraceptive protection is needed (CDC).', bandLabel: `${m.text}, day ${day}`, notes, note: notes.join(' ') };
}
