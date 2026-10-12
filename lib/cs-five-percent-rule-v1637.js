// spec-v1637 tool 7: the five percent rule for distribution by a dispenser.
//
// Source: 21 CFR 1307.11, read on eCFR as current October 8, 2026 (re-read October 12, 2026).
//   (a)(1)(iv)  "The total number of dosage units of all controlled substances distributed by the
//     practitioner pursuant to this section and § 1301.25 of this chapter during each calendar year
//     ... does not exceed 5 percent of the total number of dosage units of all controlled
//     substances distributed and dispensed by the practitioner during the same calendar year."
//   (b)  a practitioner with "reason to believe" the share "will exceed 5 percent ... shall obtain
//     a registration to distribute".
//   (c)  distributions a registered retail pharmacy makes "to automated dispensing systems at long
//     term care facilities for which the retail pharmacy also holds registrations do not count
//     toward the 5 percent limit".
//   (a)(1)(iii)  Schedule I or II: "an order form is used as required in part 1305".
//
// The denominator is distributed PLUS dispensed. Paragraph (c) takes the long-term-care automated
// dispensing system units out of the count toward the limit; the rule does not say whether they
// stay in the total, so the share is shown both ways when they are entered.
// "Dosage unit" is not defined in 21 CFR part 1300.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const pct = (num, den) => Math.round((num / den) * 10000) / 100;
// Exact, so 5,001 of 100,001 is over although it prints as 5%.
const exceeds = (num, den) => num * 20 > den;
const shown = (num, den) => (exceeds(num, den) && pct(num, den) <= 5 ? 'just over 5' : String(pct(num, den)));
// The largest further distribution d that keeps (D + d) / (T + d) at or under 5%, where T is the
// total distributed and dispensed: d = (0.05 T - D) / 0.95, rounded down.
const headroom = (counted, total) => Math.max(0, Math.floor((0.05 * total - counted) / 0.95 + 1e-9));

export function csFivePercentRule(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the dosage units dispensed this calendar year', o.dispensed, 0, 1e10, ''], ['the dosage units distributed to other registrants this calendar year', o.distributed, 0, 1e10, '']]);
  if (f) return { valid: false, message: f };
  for (const [label, v] of [['the units sent to its own long-term care automated dispensing systems', o.ltcAds], ['the planned transfer', o.planned]]) {
    if (!blank(v)) { const g = inputFault([[label, v, 0, 1e10, '']]); if (g) return { valid: false, message: g }; }
  }
  const dispensed = Number(o.dispensed); const distributed = Number(o.distributed);
  const ads = blank(o.ltcAds) ? 0 : Number(o.ltcAds);
  const planned = blank(o.planned) ? null : Number(o.planned);
  if (ads > distributed) return { valid: false, message: 'Enter long-term care automated dispensing system units that are no more than the total distributed: they are part of it.' };
  const total = distributed + dispensed;
  if (total <= 0) return { valid: false, message: 'Enter the dosage units dispensed or distributed this calendar year: with none of either there is no share to compute.' };
  const counted = distributed - ads;
  const share = pct(counted, total);
  const notes = [`${fmt(counted)} dosage units distributed, out of ${fmt(total)} distributed and dispensed, is ${shown(counted, total)}% (21 CFR 1307.11(a)(1)(iv)). The limit is 5% for the calendar year.`];
  const out = { valid: true, sharePercent: share, countedDistributed: counted, total, headroomUnits: headroom(counted, total) };
  let overNow = exceeds(counted, total);
  let overPlanned = false;
  if (ads > 0) {
    const narrow = total - ads;
    const shareNarrow = narrow > 0 ? pct(counted, narrow) : null;
    out.sharePercentWithoutAdsInTotal = shareNarrow;
    if (shareNarrow !== null) {
      overNow = overNow || exceeds(counted, narrow);
      out.headroomUnits = Math.min(out.headroomUnits, headroom(counted, narrow));
      notes.push(`${fmt(ads)} units went to the pharmacy's own long-term care automated dispensing systems and do not count toward the limit (1307.11(c)). The rule does not say whether they stay in the total; with them left out of it as well, the share is ${shown(counted, narrow)}%. The headroom below uses the smaller figure.`);
    }
  }
  notes.push(`Headroom: ${fmt(out.headroomUnits)} more dosage units could be distributed this year before the share passes 5%, if nothing more is dispensed.`);
  if (planned !== null) {
    const after = pct(counted + planned, total + planned);
    out.shareAfterPlanned = after; out.plannedFits = planned <= out.headroomUnits;
    overPlanned = !out.plannedFits;
    notes.push(`A planned transfer of ${fmt(planned)} units would make the share ${shown(counted + planned, total + planned)}%: ${out.plannedFits ? 'inside' : 'over'} the 5% limit on these figures.`);
  }
  notes.push('A practitioner with reason to believe the share will exceed 5% in the calendar year must obtain a registration to distribute (1307.11(b)).');
  notes.push('A Schedule I or II distribution also needs an order form (1307.11(a)(1)(iii)). "Dosage unit" is not defined in the regulations; the share is only as good as the units the records count. State law can be stricter.');
  return {
    ...out, flag: overNow ? 'over-five-percent' : overPlanned ? 'planned-transfer-goes-over' : 'within-five-percent', abnormal: overNow || overPlanned,
    band: `${shown(counted, total)}% of dosage units distributed this calendar year; the limit is 5%.`,
    bandLabel: overNow ? 'Over 5%' : overPlanned ? 'The planned transfer goes over 5%' : 'Within 5%', notes, note: notes.join(' '),
  };
}
