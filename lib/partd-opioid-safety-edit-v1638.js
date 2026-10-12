// spec-v1638 tool 7: which Part D opioid point-of-sale safety edit applies?
//
// Sources, re-read October 12, 2026:
//   CMS memo, "Contract Year (CY) 2027 Medicare Part D Opioid Safety Edits - Submission
//     Instructions, Recommendations, and Reminders", July 2, 2026: "a care coordination edit based
//     on a cumulative morphine milligram equivalent (MME) threshold of 90 MME per day, a hard
//     safety edit to limit initial opioid prescription fills for the treatment of acute pain to no
//     more than a 7 day supply (opioid naive), and an optional hard MME edit at 200 MME per day or
//     more." Exempt: "residents of a long-term care facility, are in hospice care or receiving
//     palliative or end-of-life care, have sickle cell disease, or are being treated for
//     cancer-related pain." "The care coordination and hard MME edits may also include prescriber
//     counts, pharmacy counts, or both." "The opioid safety edits should not be implemented as
//     prescribing limits or as a substitute for clinical judgment." When the care coordination
//     edit fires, "the pharmacist is expected to consult with the beneficiary's prescriber to
//     confirm intent", and pharmacists "should be provided the appropriate override codes".
//   CMS, FAQs about Formulary-Level Opioid Point-of-Sale Safety Edits (as of July 5, 2024): the
//     naive lookback window is "designated by the Part D sponsor" (Q13); the opioid and
//     benzodiazepine soft edit is "bidirectional" (Q16); buprenorphine for opioid use disorder
//     is not to be included (Q4); the daily cost-sharing rate applies to a 7-day naive fill (Q15).
//   The spec read CMS's pharmacist sheet for "reaches or exceeds 90"; that sheet was not re-read
//     at build, and the memo's "threshold of 90 MME per day" is read the same way here.
//
// The plan's lookback, and any prescriber or pharmacy counts it attaches to an MME edit, are the
// reader's entries and are never defaulted. The MME is as entered. CMS reissues the memo each
// summer; this is the contract year 2027 edition.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const YES_NO = [opt('yes', 'Yes'), opt('no', 'No')];
export const EXEMPT = [
  opt('no-exemption', 'None of these'),
  opt('ltc-facility-resident', 'Resident of a long-term care facility'),
  opt('hospice-or-eol-status', 'Hospice, palliative or end-of-life care'),
  opt('scd-diagnosis', 'Sickle cell disease'),
  opt('cancer-related-pain', 'Being treated for cancer-related pain'),
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const yn = (v) => (String(v ?? '').trim() === 'yes' ? true : String(v ?? '').trim() === 'no' ? false : null);

export function partdOpioidSafetyEdit(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ex = EXEMPT.find((e) => e.value === String(o.exemption ?? '').trim());
  if (!ex) return { valid: false, message: 'Choose whether an exemption applies: an exempt member should not be stopped by these edits.' };
  if (ex.value !== 'no-exemption') {
    const notes = [`Exempt: ${ex.text.charAt(0).toLowerCase()}${ex.text.slice(1)}. CMS expects plans to exempt these members from the opioid safety edits, and to let a pharmacist override an edit, hard edits included, on information from the prescriber or otherwise known to the pharmacist that the member is exempt.`];
    return { valid: true, flag: 'exempt', edits: [], abnormal: false, band: 'Exempt: no opioid safety edit should apply.', bandLabel: 'Exempt', notes, note: notes.join(' ') };
  }
  const f = inputFault([['the cumulative daily MME across the member\'s active opioid prescriptions', o.cumulativeMme, 0, 100000, 'MME'], ['the days supply of the new opioid prescription', o.daysSupply, 1, 366, 'days']]);
  if (f) return { valid: false, message: f };
  const q = {};
  for (const [k, ask] of [['recentOpioidFill', 'has the member filled an opioid within the plan\'s lookback window'], ['hardEdit200', 'does the plan use the optional hard edit at 200 MME'], ['benzodiazepine', 'is the member also on a benzodiazepine'], ['duplicateLongActing', 'is there more than one long-acting opioid']]) {
    q[k] = yn(o[k]);
    if (q[k] === null) return { valid: false, message: `Choose yes or no: ${ask}?` };
  }
  const counts = {};
  for (const [k, label] of [['planPrescriberCount', 'the prescriber count the plan attaches to its MME edits'], ['planPharmacyCount', 'the pharmacy count the plan attaches to its MME edits'], ['prescribers', 'the member\'s number of opioid prescribers'], ['pharmacies', 'the member\'s number of opioid pharmacies']]) {
    if (blank(o[k])) { counts[k] = null; continue; }
    const g = inputFault([[label, o[k], 0, 100, '']]);
    if (g) return { valid: false, message: g };
    counts[k] = Number(o[k]);
  }
  for (const [plan, member, word] of [['planPrescriberCount', 'prescribers', 'opioid prescribers'], ['planPharmacyCount', 'pharmacies', 'opioid pharmacies']]) {
    if (counts[plan] !== null && counts[member] === null) return { valid: false, message: `Enter the member's number of ${word}: the plan's edit carries a count of ${counts[plan]}.` };
  }
  const mme = Number(o.cumulativeMme); const days = Number(o.daysSupply);
  const countOk = (counts.planPrescriberCount === null || counts.prescribers >= counts.planPrescriberCount) && (counts.planPharmacyCount === null || counts.pharmacies >= counts.planPharmacyCount);
  const countText = counts.planPrescriberCount === null && counts.planPharmacyCount === null ? 'the plan attaches no prescriber or pharmacy count' : `the plan's count (${[counts.planPrescriberCount !== null && `${counts.planPrescriberCount} prescribers, member has ${counts.prescribers}`, counts.planPharmacyCount !== null && `${counts.planPharmacyCount} pharmacies, member has ${counts.pharmacies}`].filter(Boolean).join('; ')}) is ${countOk ? 'met' : 'not met'}`;
  const edits = []; const notes = [];
  const care = mme >= 90 && countOk;
  notes.push(`Care coordination edit: cumulative MME ${mme} against the 90 MME a day threshold (${mme >= 90 ? 'reached' : 'not reached'}); ${countText}: ${care ? 'fires' : 'does not fire'}.${care ? ' The pharmacist consults the prescriber to confirm intent and, with that, overrides the edit with the plan\'s override code.' : ''}`);
  if (care) edits.push('care-coordination-edit');
  if (q.hardEdit200) {
    const hard = mme >= 200 && countOk;
    notes.push(`Hard MME edit, which this plan uses: cumulative MME ${mme} against 200 MME a day or more; ${countText}: ${hard ? 'fires' : 'does not fire'}.${hard ? ' A hard edit is resolved through a coverage determination, unless the pharmacy knows of an exemption.' : ''}`);
    if (hard) edits.push('hard-mme-edit-200');
  } else notes.push('Hard MME edit at 200 MME: this plan does not use it. It is optional.');
  const naive = !q.recentOpioidFill && days > 7;
  notes.push(q.recentOpioidFill ? 'Opioid-naive edit: the member filled an opioid within the plan\'s lookback window, so the 7-day edit does not apply.' : `Opioid-naive edit: no opioid fill in the plan's lookback window and a ${days}-day supply: ${naive ? 'fires. Up to a 7-day supply may be dispensed; the rest needs a new prescription after reassessment, or a coverage determination for the full amount. A pharmacist who knows the member is not opioid naive may submit an override code' : 'does not fire, because the supply is 7 days or less'}.`);
  if (naive) { edits.push('opioid-naive-7-day-edit'); notes.push('For a 7-day fill of a solid oral opioid cut down by this edit, the plan charges the daily cost-sharing rate, not the full month\'s copayment.'); }
  if (q.benzodiazepine) { edits.push('opioid-benzodiazepine-soft-edit'); notes.push('Concurrent opioid and benzodiazepine: a soft edit. It runs both ways, on the opioid claim and on a benzodiazepine claim, and the pharmacist can override it.'); }
  if (q.duplicateLongActing) { edits.push('duplicative-long-acting-soft-edit'); notes.push('More than one long-acting opioid: a soft edit for duplicative therapy, which the pharmacist can override.'); }
  notes.push('The lookback window that defines opioid naive is set by the plan, and so are any prescriber or pharmacy counts on the MME edits; CMS recommends, and does not require, a count of 2 or more prescribers. Buprenorphine for opioid use disorder is not to be included in these edits. The MME is as entered.');
  notes.push('CMS: the opioid safety edits should not be implemented as prescribing limits or as a substitute for clinical judgment. Contract year 2027 memo, July 2, 2026; it is reissued each summer.');
  return { valid: true, edits, flag: edits.length ? 'edits-fire' : 'no-edit-fires', abnormal: false, band: edits.length ? `${edits.length} edit${edits.length === 1 ? '' : 's'} would fire.` : 'No opioid safety edit would fire on these facts.', bandLabel: edits.length ? edits.map((e) => e.replace(/-/g, ' ')).join('; ') : 'None', notes, note: notes.join(' ') };
}
