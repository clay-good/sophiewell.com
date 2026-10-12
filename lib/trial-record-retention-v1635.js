// spec-v1635 tool 22: the earliest federal date for destroying investigational drug records.
//
// Source: 21 CFR 312.57 and 312.62, read on eCFR as current October 8, 2026 (re-read October 11, 2026):
//   312.62(c)  an investigator retains records "for a period of 2 years following the date a
//              marketing application is approved for the drug for the indication for which it is
//              being investigated; or, if no application is to be filed or if the application is
//              not approved for such indication, until 2 years after the investigation is
//              discontinued and FDA is notified."
//   312.57(c)  a sponsor retains records "for 2 years after a marketing application is approved for
//              the drug; or, if an application is not approved for the drug, until 2 years after
//              shipment and delivery of the drug for investigational use is discontinued and FDA has
//              been so notified."
// A protocol, a sponsor contract, an institution or state law may require longer; that date is the
// reader's, and the later of the two is reported.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addMonthsUtc } from './deadline.js';

export const ROLES = [
  { value: 'investigator', text: 'Investigator (21 CFR 312.62(c))', cite: '21 CFR 312.62(c)' },
  { value: 'sponsor', text: 'Sponsor (21 CFR 312.57(c))', cite: '21 CFR 312.57(c)' },
];
export const EVENTS = [
  { value: 'approved', text: 'A marketing application was approved' },
  { value: 'discontinued', text: 'The investigation (or shipment and delivery) was discontinued and FDA notified' },
];
const NOTE = 'This is the federal minimum under the IND rule only. The protocol, the sponsor\'s contract, the institution\'s policy, other regulations and state law often require longer, and records should not be destroyed without the sponsor\'s agreement where the contract says so. The 2 years runs from the later of discontinuation and FDA being notified; enter that date.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function trialRecordRetention(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const role = ROLES.find((r) => r.value === String(o.role ?? '').trim());
  if (!role) return { valid: false, message: 'Choose the role: investigator or sponsor. Each has its own paragraph.' };
  const event = EVENTS.find((e) => e.value === String(o.event ?? '').trim());
  if (!event) return { valid: false, message: 'Choose what started the clock: approval of a marketing application, or discontinuation with FDA notified.' };
  const start = date(o.date);
  if (!start) return { valid: false, message: 'Enter the date of that event.' };
  const federal = addMonthsUtc(start, 24);
  let longer = null;
  if (!blank(o.longerUntil)) { longer = date(o.longerUntil); if (!longer) return { valid: false, message: 'Enter the longer retention date as a date, or leave it blank.' }; }
  const governs = longer && longer.getTime() > federal.getTime() ? longer : federal;
  const what = event.value === 'approved'
    ? (role.value === 'investigator' ? 'a marketing application was approved for the indication under investigation' : 'a marketing application was approved for the drug')
    : (role.value === 'investigator' ? 'the investigation was discontinued and FDA was notified' : 'shipment and delivery for investigational use were discontinued and FDA was so notified');
  const notes = [`Federal minimum: 2 years after ${what} on ${say(start)}, which is ${say(federal)} (${role.cite}).`];
  if (longer) notes.push(longer.getTime() > federal.getTime() ? `The longer requirement entered runs to ${say(longer)}, which is later, so it governs.` : `The other requirement entered (${say(longer)}) ends before the federal minimum, so the federal date governs.`);
  else notes.push('No longer requirement was entered. Check the protocol, the sponsor contract, institutional policy and state law before relying on the federal date.');
  notes.push(`${role.cite}.`);
  return { valid: true, flag: 'retention', abnormal: false, federalMinimum: fmtUtc(federal), retainUntil: fmtUtc(governs), band: `Retain until at least ${say(governs)}${governs === federal ? ' (the federal minimum)' : ' (the longer requirement entered)'}.`, bandLabel: say(governs), notes, note: NOTE };
}
