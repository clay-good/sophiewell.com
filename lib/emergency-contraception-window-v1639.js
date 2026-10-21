// spec-v1639 tool 8: emergency contraception, the hours left on each label and CDC's line.
//
// Sources, re-read October 12, 2026:
//   Plan B One-Step Drug Facts (Foundation Consumer Healthcare; DailyMed set id
//     6ce6b40e-14ac-47bd-a648-ddf9e452e559, version 5), Directions: "take as soon as possible
//     within 72 hours (3 days) after unprotected sex. The sooner you take it the better it will
//     work." "if you vomit within 2 hours after taking the medication, call a healthcare
//     professional to find out if you should repeat the dose".
//   ella (ulipristal acetate; PMI Branded Pharmaceuticals; set id
//     2bf93d23-cddd-4613-9066-5b5fa090404b, version 7), section 2: "Take one tablet of ella orally
//     as soon as possible within 120 hours (5 days) after unprotected intercourse or a known or
//     suspected contraceptive failure." 2.2: "initiate or resume hormonal contraception no sooner
//     than 5 days after the intake of ella and use a reliable barrier method until the next
//     menstrual period." 2.3: "If vomiting occurs within 3 hours of taking ella, consider repeating
//     the dose."
//   CDC, U.S. Selected Practice Recommendations for Contraceptive Use, 2024 (MMWR Recomm Rep
//     2024;73(RR-3); PMC11340200), "Emergency Contraception": "ECPs should be taken as soon as
//     possible within 5 days of unprotected sexual intercourse." "The Cu-IUD may be placed within 5
//     days of the first act of unprotected sexual intercourse as emergency contraception."
//
// CDC's 5 days for levonorgestrel is longer than the Plan B label's 72 hours. Both are shown,
// labeled; neither is preferred (spec-v1628 section 5, rule 6). No weight or BMI line is computed:
// CDC states no threshold.
//
// Pure: no DOM, no network. Both times are entered. `now` is read only to check that each label
// edition still stands (lib/label-row.js).

import { dpSafe } from './cut-display.js';
import { labelRow } from './label-row.js';

export const PLAN_B = '6ce6b40e-14ac-47bd-a648-ddf9e452e559';
export const ELLA = '2bf93d23-cddd-4613-9066-5b5fa090404b';
const POSTURE = 'This is what the labels and CDC state for these inputs. It is not advice for a particular patient.';
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (y < 2000 || y > 2100 || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const H = 3600000;
const stamp = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
// Hours shown at the digits that keep them on the right side of the 72 and 120 hour lines (and of 0 left).
const hr = (n, cuts = [72, 120]) => dpSafe(n, cuts, 1);

export function emergencyContraceptionWindow(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = parseWhen(o.intercourseAt);
  if (sex === null) return { valid: false, message: 'Enter the date and time of unprotected intercourse.' };
  const at = parseWhen(o.nowAt);
  if (at === null) return { valid: false, message: 'Enter the date and time now.' };
  const hours = (at - sex) / H;
  if (hours < 0) return { valid: false, message: 'Enter a time now that is after the time of intercourse.' };
  if (hours > 24 * 60) return { valid: false, message: 'Enter times no more than 60 days apart.' };
  const left = (limit) => (hours <= limit ? `inside, with ${hr(limit - hours, [0])} hours left; it closes ${stamp(sex + limit * H)}` : `outside: it closed ${stamp(sex + limit * H)}, ${hr(hours - limit, [0])} hours ago`);
  const notes = [`${hr(hours)} hours since intercourse (${stamp(sex)} to ${stamp(at)}).`];
  const pb = labelRow(PLAN_B, now, table); const el = labelRow(ELLA, now, table);
  const labelLinks = [{ text: 'Plan B One-Step label on DailyMed', url: pb.url }, { text: 'ella label on DailyMed', url: el.url }];
  if (pb.answers) notes.push(`Levonorgestrel 1.5 mg, Plan B One-Step label: "take as soon as possible within 72 hours (3 days) after unprotected sex. The sooner you take it the better it will work." At the time entered: ${left(72)}.`);
  else notes.push(`The Plan B One-Step label line is withheld: ${pb.why}. Read the Directions on the package in hand.`);
  if (el.answers) notes.push(`Ulipristal 30 mg, ella label: "as soon as possible within 120 hours (5 days) after unprotected intercourse or a known or suspected contraceptive failure." At the time entered: ${left(120)}.`);
  else notes.push(`The ella label line is withheld: ${el.why}. Read the label in hand.`);
  notes.push(`CDC 2024: emergency contraceptive pills "should be taken as soon as possible within 5 days of unprotected sexual intercourse", and a copper IUD may be placed within 5 days of the first act of unprotected intercourse. CDC counts in days; 5 days from the time entered is ${stamp(sex + 120 * H)} (${hours <= 120 ? 'not yet passed' : 'passed'}).`);
  notes.push('CDC\'s 5 days for levonorgestrel is longer than the Plan B label\'s 72 hours. Both are shown; neither is preferred here. CDC adds that levonorgestrel and ulipristal have similar effectiveness within 3 days, that ulipristal has been observed to be more effective at 3 to 5 days, and that levonorgestrel "might be less effective than UPA among women with obesity"; it gives no weight threshold and none is computed.');
  notes.push(`If ulipristal is taken at the time entered: the ella label and CDC both say to start or resume hormonal contraception no sooner than 5 days after it (${stamp(at + 120 * H)}). The label says to use a reliable barrier method until the next menstrual period. CDC says to abstain or use barrier methods for the next 7 days after starting or resuming regular contraception or until the next menses, whichever comes first.`);
  notes.push(`If levonorgestrel is taken at the time entered (CDC): any regular contraceptive method may be started or resumed immediately, with abstinence or barrier methods for 7 days (to ${stamp(at + 168 * H)}).`);
  notes.push(`Either pill (CDC): a pregnancy test if there is no withdrawal bleed within 3 weeks (${stamp(at + 504 * H).slice(0, 10)}).`);
  notes.push(`Vomiting: ${pb.answers ? 'within 2 hours of Plan B One-Step, the label says to call a healthcare professional to find out whether to repeat the dose; ' : ''}${el.answers ? 'within 3 hours of ella, the label says "consider repeating the dose"; ' : ''}CDC says another dose should be taken as soon as possible after vomiting within 3 hours of taking emergency contraceptive pills.`);
  const editions = [pb, el].filter((l) => l.answers).map((l) => l.edition);
  if (editions.length) notes.push(`Labels: ${editions.join('; ')}.`);
  notes.push(POSTURE);
  const flag = hours <= 72 ? 'inside-72-hours' : hours <= 120 ? 'past-72-hours-inside-5-days' : 'past-5-days';
  const band = hours <= 72 ? `${hr(hours)} hours: inside the Plan B label's 72 hours, the ella label's 120 hours and CDC's 5 days.`
    : hours <= 120 ? `${hr(hours)} hours: past the Plan B label's 72 hours; inside the ella label's 120 hours and CDC's 5 days.`
      : `${hr(hours)} hours: past the 72 and 120 hours on the labels and CDC's 5 days.`;
  return { valid: true, hoursSinceIntercourse: hr(hours), planBLabelCloses: stamp(sex + 72 * H), ellaLabelCloses: stamp(sex + 120 * H), labelLinks, withheld: !pb.answers || !el.answers, flag, abnormal: hours > 72, band, bandLabel: hours <= 120 ? `${hr(120 - hours, [0])} hours to the 5-day line` : 'Past 5 days', notes, note: notes.join(' ') };
}
