// spec-v1503 tool 7: Medicaid managed care appeal clock, with the state fair hearing.
//
// Read in the eCFR on 2026-09-25 (42 CFR):
//   438.402(c)(2)(ii) "60 calendar days from the date on the adverse benefit determination notice".
//   438.408(b) standard resolution "no longer than 30 calendar days from the day the MCO, PIHP, or PAHP
//     receives the appeal"; expedited "no longer than 72 hours"; (c) extendable "by up to 14 calendar
//     days", with written notice "within 2 calendar days"; (c)(3) a plan that misses its timing leaves
//     the enrollee "deemed to have exhausted" its appeals; (f)(2) a State fair hearing window of "no
//     less than 90 calendar days and no more than 120 calendar days from the date of the ... notice of
//     resolution".
//   438.420(a) continued benefits are timely if filed "on or before the later of" 10 calendar days of
//     the plan "sending the notice", or "the intended effective date" of the action.
//   438.210(d) authorization decisions: 7 calendar days for rating periods starting on or after
//     January 1, 2026 (14 before), 72 hours expedited, each extendable by up to 14 days.
//   431.221(d) fee-for-service: a hearing request window "not to exceed 90 days from the date that
//     notice of action is mailed"; 431.244(f) final action "ordinarily, within 90 days".
// A state sets its own numbers inside those limits; the tool takes them as input and never ships a
// state table.
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { addHours, parseDateTime, formatDeadline } from './state-calendar.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The state\'s rules and the plan\'s notice control.';
export const APPEAL_TYPES = [{ value: 'standard', text: 'Standard appeal' }, { value: 'expedited', text: 'Expedited appeal' }];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

function optDate(s, what) {
  if (!String(s ?? '').trim()) return { none: true };
  try { return { d: parseIsoStrict(String(s).trim()) }; } catch { return { error: `Enter ${what} as YYYY-MM-DD, or leave it blank.` }; }
}

export function medicaidAppealClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let notice;
  try { notice = parseIsoStrict(String(o.noticeDate ?? '').trim()); } catch { return { valid: false, message: 'Enter the date on the plan\'s adverse benefit determination notice (YYYY-MM-DD).' }; }
  const eff = optDate(o.effectiveDate, 'the intended effective date');
  if (eff.error) return { valid: false, message: eff.error };
  const appealDue = addCalendarDaysUtc(notice, 60);
  const ten = addCalendarDaysUtc(notice, 10);
  const keep = eff.d && eff.d > ten ? eff.d : ten;
  const notes = [
    `To keep benefits during the appeal, ask by ${longDate(keep)}: the later of 10 calendar days after the notice was sent${eff.d ? ` and the intended effective date (${longDate(eff.d)})` : ' (enter the intended effective date if it is later)'} (42 CFR 438.420).`,
  ];
  // The plan's decision on an appeal already filed.
  if (String(o.appealReceived ?? '').trim()) {
    const type = o.appealType === 'standard' || o.appealType === 'expedited' ? o.appealType : null;
    if (!type) return { valid: false, message: 'Choose whether the appeal is standard or expedited.' };
    const ext = o.extended === 'yes' ? 14 : 0;
    if (type === 'expedited') {
      const w = parseDateTime(o.appealReceived);
      if (w === null) return { valid: false, message: 'Enter the date and time the plan received the expedited appeal (YYYY-MM-DDTHH:MM).' };
      const end = addHours(w, 72 + ext * 24).endWall;
      notes.push(`The plan must resolve the expedited appeal by ${formatDeadline(w, end, 'receipt')}${ext ? ', with the 14-day extension' : ''} (42 CFR 438.408(b)(2)); a state may set a shorter time.`);
    } else {
      let r;
      try { r = parseIsoStrict(String(o.appealReceived).trim().slice(0, 10)); } catch { return { valid: false, message: 'Enter the date the plan received the appeal as YYYY-MM-DD.' }; }
      notes.push(`The plan must resolve the appeal by ${longDate(addCalendarDaysUtc(r, 30 + ext))} (${30 + ext} calendar days${ext ? ', with the 14-day extension' : ''}; 42 CFR 438.408(b)(1)); a state may set a shorter time.`);
    }
    if (ext) notes.push('An extension needs written notice to the enrollee within 2 calendar days of the decision to extend.');
    notes.push('If the plan misses its deadline, the enrollee is deemed to have exhausted the plan\'s appeal and may go straight to a State fair hearing (42 CFR 438.408(c)(3)).');
  }
  // The State fair hearing after the plan's resolution.
  const res = optDate(o.resolutionDate, 'the date of the plan\'s notice of resolution');
  if (res.error) return { valid: false, message: res.error };
  if (res.d) {
    const raw = String(o.stateWindow ?? '').trim();
    if (!raw) return { valid: false, message: 'Enter the state\'s fair hearing window in days (from 90 to 120): the state sets it within that range.' };
    const w = Number(raw);
    if (!Number.isInteger(w) || w < 90 || w > 120) return { valid: false, message: 'Enter the state\'s fair hearing window again: federal rules require from 90 to 120 calendar days.' };
    notes.push(`Request a State fair hearing by ${longDate(addCalendarDaysUtc(res.d, w))} (${w} calendar days from the plan's notice of resolution; 42 CFR 438.408(f)(2)).`);
  } else {
    notes.push('After the plan decides, the state allows 90 to 120 calendar days (its own number) to request a fair hearing; enter the resolution date and the state\'s window to count it.');
  }
  notes.push('In fee-for-service Medicaid there is no plan appeal: the state allows up to 90 days from the mailing of its notice to ask for a hearing (42 CFR 431.221(d)).');
  return {
    valid: true,
    deadline: fmtUtc(appealDue),
    band: `42 CFR 438.402(c)(2)(ii): appeal to the plan within 60 calendar days of the date on the notice, so by ${longDate(appealDue)}.`,
    bandLabel: `Appeal by ${fmtUtc(appealDue)}`,
    notes,
    note: POSTURE,
  };
}
