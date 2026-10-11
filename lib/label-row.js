// spec-v1628 section 1, route D, fail closed: a figure read from an FDA label answers only while the
// label still stands.
//
// The weekly watch (scripts/data/watch-dailymed.mjs) compares the watched sections of each label with
// the text they had when a person last read them. A new version with the same text renews the row; a
// changed section, or a set id that has left DailyMed, sets `supersededOn`. A row is also good for 12
// months from its last renewal and no longer, so it lapses if the watch itself stops.
//
// labelRow(setId, now) says whether the row answers. When it does not, the tool shows no figure from
// that label: it names the version the figure was read from, says why it is withheld, and links the
// current label. Other labels in the same tool keep answering.
//
// Pure: `now` is passed in (or taken from the SOPHIEWELL_NOW pin) so tests are deterministic.

import { LABEL_EDITIONS } from './label-editions.js';
import { todayUtc, parseDate, diffDays } from './pa/date.js';

export const labelUrl = (setId) => `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`;

// -> { answers: true, label, version, publishedOn, url, edition }
//  | { answers: false, reason: 'superseded' | 'expired', label, version, publishedOn, url, edition,
//      why (a clause for the tool's own sentence), message (a full sentence) }
export function labelRow(setId, now, table = LABEL_EDITIONS) {
  const row = table[setId];
  if (!row) throw new RangeError(`no label edition recorded for set id "${setId}"`);
  const through = parseDate(row.validThrough);
  if (!through) throw new RangeError(`label edition "${setId}" has no valid validThrough date`);
  const base = {
    label: row.label, version: row.splVersion, publishedOn: row.publishedOn, url: labelUrl(setId),
    edition: `version ${row.splVersion} of the ${row.label} label (published ${row.publishedOn})`,
  };
  if (row.supersededOn) {
    return { ...base, answers: false, reason: 'superseded', why: `the label's text has changed since ${base.edition} was read`, message: `This figure was read from ${base.edition}. The label's text has changed since, so the figure is withheld until it is read again. See the current label on DailyMed.` };
  }
  if (diffDays(todayUtc(now), through) > 0) {
    return { ...base, answers: false, reason: 'expired', why: `${base.edition} was last confirmed more than 12 months ago`, message: `This figure was read from ${base.edition}, last confirmed against DailyMed more than 12 months ago, so it is withheld. See the current label on DailyMed.` };
  }
  return { ...base, answers: true };
}
