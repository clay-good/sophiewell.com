// spec-v1502 §6 with the spec-v1603 WISeR backfill: does Original Medicare require prior authorization
// for this code, in this setting and state, on this date of service?
//
// Five CMS programs, each read in its own source on September 30, 2026:
//   OPD     hospital outpatient department list (lib/pa/cms-opd-pa-list.js; the final list PDF). A
//           condition of payment: the claim needs the Unique Tracking Number.
//   DMEPOS  the Required Prior Authorization List under 42 CFR 414.234(c)(1), updated July 29, 2026,
//           with its phased start dates by state (for initial rental series, the date of delivery).
//   RSNAT   repetitive, scheduled non-emergent ambulance transport (A0426, A0428), nationwide since the
//           2021-2022 expansion; voluntary, but a supplier that skips it gets prepayment review, and the
//           first three round trips are exempt.
//   ASC     the five-year ambulatory surgical center demonstration, in ten states from January 19 or
//           February 16, 2026 (services list PDF); voluntary in the same way.
//   WISeR   the Innovation Center model, January 1, 2026 to December 31, 2031, in NJ, OH, OK, TX, AZ and
//           WA (Provider and Supplier Operational Guide, Appendix A as of July 24, 2026); prior
//           authorization or prepayment review, never for inpatient-only or emergency services.
// Original Medicare only: a Medicare Advantage plan keeps its own list, and the result says so.
//
// Pure: no DOM, no clock. Codes only; no descriptors.

import { opdPaOn, CMS_OPD_PA_LAST_VERIFIED } from './pa/cms-opd-pa-list.js';
import { parseDate } from './pa/date.js';
import { usDateLong } from './num.js';

export const SETTINGS = [
  { value: 'opd', text: 'Hospital outpatient department' },
  { value: 'asc', text: 'Ambulatory surgical center' },
  { value: 'office', text: 'Physician office or other non-facility setting' },
  { value: 'dmepos', text: 'Supplier of equipment, prosthetics, orthotics or supplies' },
  { value: 'ambulance', text: 'Ambulance supplier (scheduled, non-emergent transport)' },
  { value: 'inpatient', text: 'Hospital inpatient' },
];

export const STATES = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY',
].map((s) => ({ value: s, text: s }));

// ---- DMEPOS: [codes, phases]; a phase is [start, states or null for nationwide].
const P_LLP = [['2020-09-01', ['CA', 'MI', 'PA', 'TX']], ['2020-12-01', null]];
const P_ORTH22 = [['2022-04-13', ['NY', 'IL', 'FL', 'CA']], ['2022-07-12', ['MD', 'PA', 'NJ', 'MI', 'OH', 'KY', 'TX', 'NC', 'GA', 'MO', 'AZ', 'WA']], ['2022-10-10', null]];
const P_ORTH27 = [['2026-10-28', ['NY', 'MI', 'FL', 'CA']], ['2027-01-26', ['PA', 'MA', 'OH', 'IL', 'TX', 'GA', 'AZ', 'OR']], ['2027-04-26', null]];
const P_PMD17 = [['2017-03-20', ['IL', 'MO', 'NY', 'WV']], ['2017-07-17', null]];
const P_PRSS = [['2019-07-22', ['CA', 'IN', 'NJ', 'NC']], ['2019-10-21', null]];
const nat = (d) => [[d, null]];
const DMEPOS = [
  [['L5856', 'L5857', 'L5858', 'L5973', 'L5980', 'L5987'], P_LLP],
  [['L0456', 'L0457', 'L0486', 'L1833', 'E0194', 'K0005'], nat('2026-10-28')],
  [['L0631', 'L0637', 'L0639', 'L1843', 'L1845', 'L1951'], nat('2024-08-12')],
  [['L0648', 'L0650', 'L1832', 'L1851'], P_ORTH22],
  [['L0651', 'L1844', 'L1846', 'L1852', 'L1932', 'E0651', 'E0652'], nat('2026-04-13')],
  [['L3761', 'L3916'], P_ORTH27],
  [['K0800', 'K0801', 'K0802', 'K0806', 'K0807', 'K0808'], nat('2022-04-13')],
  [['K0813', 'K0814', 'K0815', 'K0816', 'K0820', 'K0821', 'K0822', 'K0823', 'K0824', 'K0825', 'K0826', 'K0827', 'K0828', 'K0829', 'K0835', 'K0836', 'K0837', 'K0838', 'K0839', 'K0840', 'K0841', 'K0842', 'K0843', 'K0848', 'K0849', 'K0850', 'K0851', 'K0852', 'K0853', 'K0854', 'K0855'], nat('2018-09-01')],
  [['K0856', 'K0861'], P_PMD17],
  [['K0857', 'K0858', 'K0859', 'K0860', 'K0862', 'K0863', 'K0864'], nat('2019-07-22')],
  [['E0193', 'E0277', 'E0371', 'E0372', 'E0373'], P_PRSS],
];
const DMEPOS_BY = new Map();
for (const [codes, phases] of DMEPOS) for (const c of codes) DMEPOS_BY.set(c, phases);
export const DMEPOS_LIST_UPDATED = '2026-07-29';

// ---- RSNAT: the state each began, transports on or after.
const RSNAT_START = {};
const rs = (date, states) => { for (const s of states) RSNAT_START[s] = date; };
rs('2014-12-15', ['NJ', 'PA', 'SC']);
rs('2016-01-01', ['DE', 'DC', 'MD', 'NC', 'VA', 'WV']);
rs('2021-12-01', ['AR', 'CO', 'LA', 'MS', 'NM', 'OK', 'TX']);
rs('2022-02-01', ['AL', 'AS', 'CA', 'GA', 'GU', 'HI', 'NV', 'MP', 'TN']);
rs('2022-04-01', ['FL', 'IL', 'IA', 'KS', 'MN', 'MO', 'NE', 'PR', 'WI', 'VI']);
rs('2022-06-01', ['CT', 'IN', 'ME', 'MA', 'MI', 'NH', 'NY', 'RI', 'VT']);
rs('2022-08-01', ['AK', 'AZ', 'ID', 'KY', 'MT', 'ND', 'OH', 'OR', 'SD', 'UT', 'WA', 'WY']);
const RSNAT_CODES = ['A0426', 'A0428'];

// ---- ASC demonstration.
const ASC_CODES = new Set(['15820', '15821', '15822', '15823', '67900', '67901', '67902', '67903', '67904', '67906', '67908',
  '64612', '64615', 'J0585', 'J0586', 'J0587', 'J0588', 'J0589', '15830', '15877',
  '20912', '21210', '30400', '30410', '30420', '30430', '30435', '30450', '30460', '30462', '30465', '30520',
  '36473', '36475', '36478', '36482']);
const ASC_REMOVED = { 15847: 'January 1, 2026', 36474: 'January 1, 2026', 36476: 'January 1, 2026', 36479: 'January 1, 2026', 36483: 'January 1, 2026' };
const ASC_START = {};
for (const s of ['CA', 'FL', 'TN', 'PA', 'MD', 'GA', 'NY']) ASC_START[s] = '2026-01-19';
for (const s of ['TX', 'AZ', 'OH']) ASC_START[s] = '2026-02-16';

// ---- WISeR (Appendix A as of July 24, 2026).
const WISER_STATES = new Set(['NJ', 'OH', 'OK', 'TX', 'AZ', 'WA']);
const WISER = {};
const w = (codes, service, cond = null, from = '2026-01-01') => { for (const c of codes) WISER[c] = { service, cond, from }; };
w(['29877'], 'arthroscopic lavage and debridement for the osteoarthritic knee (NCD 150.9)');
w(['64605', '64610'], 'induced lesions of nerve tracts (NCD 160.1)');
w(['64568'], 'vagus nerve stimulation (NCD 160.18)', 'only for the indications in the guide\'s Appendix B; not when billed with G47.33 (obstructive sleep apnea)');
w(['33276', '33277'], 'phrenic nerve stimulators (NCD 160.19)');
w(['63655'], 'electrical nerve stimulators (NCD 160.7)');
w(['53440', '53445', '53451', '53452', '57288'], 'incontinence control devices (NCD 230.10)');
w(['64561'], 'sacral nerve stimulation for urinary incontinence (NCD 230.18)', 'only when billed with 64590 (a permanent implant), and only for the indications in Appendix B');
w(['64581'], 'sacral nerve stimulation for urinary incontinence (NCD 230.18)', 'only for the indications in Appendix B');
w(['54400', '54401', '54405'], 'diagnosis and treatment of impotence (NCD 230.4)');
w(['22510', '22511', '22512', '22513', '22514', '22515'], 'percutaneous vertebral augmentation (LCDs L34228, L38201, L35130)');
w(['62321', '64479', '64480', '64483', '64484'], 'epidural steroid injections for pain (LCDs L39015, L39240, L36920)');
w(['62323'], 'epidural steroid injections for pain (LCDs L39015, L39240, L36920)', 'only for the indications in those LCDs, not, for example, an intrathecal pump');
w(['22554'], 'cervical fusion (LCDs L39741, L39758, L39793)');
w(['64582'], 'hypoglossal nerve stimulation for obstructive sleep apnea (LCDs L38307, L38310, L38385)');
w(['C8007', 'C8011'], 'hypoglossal nerve stimulation for obstructive sleep apnea (LCDs L38307, L38310, L38385)', null, '2026-04-06');
w(['15271', '15272', '15273', '15274', '15275', '15276', '15277', '15278'], 'skin substitutes for lower extremity chronic non-healing wounds (LCDs L35041, L36690)', 'only for lower extremity chronic non-healing wounds');
const WISER_POSTPONED = { 61867: 'deep brain stimulation', 61868: 'deep brain stimulation' };

export const normalizeCode = (raw) => {
  const s = String(raw ?? '').trim().toUpperCase();
  return /^[A-Z0-9]\d{3}[A-Z0-9]$/.test(s) ? s : null;
};

function inPhase(phases, state, iso) {
  // The first phase whose states include this one (or nationwide) gives its start date.
  for (const [start, states] of phases) if (!states || (state && states.includes(state))) return { start, live: iso >= start, nationwide: !states };
  return null;
}

export function medicareFfsPaRequired(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.code ?? '').trim()) return { valid: false, message: 'Enter the HCPCS or CPT code.' };
  const code = normalizeCode(o.code);
  if (!code) return { valid: false, message: 'A HCPCS or CPT code is five characters, such as 64483 or L1833. Check the value entered.' };
  const setting = SETTINGS.find((s) => s.value === o.setting);
  if (!setting) return { valid: false, message: 'Choose the setting the service is furnished in.' };
  const dos = parseDate(o.serviceDate);
  if (!dos) return { valid: false, message: 'Enter the date of service: each list started on its own date.' };
  const iso = dos.toISOString().slice(0, 10);
  const day = usDateLong(iso);
  const state = STATES.some((s) => s.value === o.state) ? o.state : null;
  const needsState = ['asc', 'office', 'opd', 'dmepos', 'ambulance'].includes(setting.value);

  const found = [];   // { program, status: 'required' | 'review' | 'not' | 'postponed', text }
  const notes = [];

  if (setting.value === 'opd') {
    const r = opdPaOn(code, iso);
    if (r.listed) found.push({ program: 'OPD', status: 'required', text: `Required: ${code} is on the CMS hospital outpatient department prior authorization list (${r.category}, from ${usDateLong(r.since)}${r.removedLater ? `; taken off ${usDateLong(r.removedLater)}` : ''}). The claim needs the Unique Tracking Number from the approval.` });
    else if (r.notYet) found.push({ program: 'OPD', status: 'not', text: `${code} joined the hospital outpatient list on ${usDateLong(r.since)}, after ${day}.` });
    else if (r.removed) found.push({ program: 'OPD', status: 'not', text: `${code} is no longer on the hospital outpatient list: ${r.removed}.` });
  }
  if (setting.value === 'dmepos') {
    const phases = DMEPOS_BY.get(code);
    if (phases) {
      const p = inPhase(phases, state, iso);
      if (!state && !phases.every(([, s]) => !s)) {
        notes.push('No state was entered: this item\'s list began in some states before the rest, so the earliest date shown applies only there.');
      }
      if (p && p.live) found.push({ program: 'DMEPOS', status: 'required', text: `Required: ${code} is on the DMEPOS Required Prior Authorization List (42 CFR 414.234(c)(1)), from ${usDateLong(p.start)}${p.nationwide ? ' nationwide' : ` in ${state}`}. Without an approval the claim is denied.` });
      else {
        const next = p ? p.start : phases.at(-1)[0];
        found.push({ program: 'DMEPOS', status: 'not', text: `${code} is on the DMEPOS Required Prior Authorization List, but not until ${usDateLong(next)}${state ? ` in ${state}` : ''}, after ${day}.` });
      }
      notes.push('For an initial rental series, the date that counts is the date of delivery.');
    }
  }
  if (setting.value === 'ambulance' && RSNAT_CODES.includes(code)) {
    const start = state ? RSNAT_START[state] : null;
    if (!state) found.push({ program: 'RSNAT', status: 'review', text: `${code} is in the repetitive, scheduled non-emergent ambulance program, nationwide since August 1, 2022; choose the state to see when it began there.` });
    else if (iso >= start) found.push({ program: 'RSNAT', status: 'review', text: `Prior authorization requested: ${code} for repetitive, scheduled non-emergent transport is in the ambulance program in ${state} from ${usDateLong(start)}. It is voluntary, but a supplier that skips it gets prepayment review; the first three round trips are exempt.` });
    else found.push({ program: 'RSNAT', status: 'not', text: `The ambulance program began in ${state} on ${usDateLong(start)}, after ${day}.` });
    notes.push('Repetitive means three or more round trips in a 10-day period, or at least one round trip a week for at least three weeks. Mileage (A0425) needs no prior authorization.');
  }
  if (setting.value === 'asc') {
    if (ASC_CODES.has(code)) {
      const start = state && ASC_START[state];
      if (!state) found.push({ program: 'ASC', status: 'review', text: `${code} is on the ambulatory surgical center demonstration list, which applies only in CA, FL, TN, PA, MD, GA and NY (from January 19, 2026) and TX, AZ and OH (from February 16, 2026). Choose the state.` });
      else if (!start) found.push({ program: 'ASC', status: 'not', text: `The ambulatory surgical center demonstration does not include ${state}.` });
      else if (iso >= start) found.push({ program: 'ASC', status: 'review', text: `Prior authorization requested: ${code} is on the ambulatory surgical center demonstration list in ${state} from ${usDateLong(start)}. It is voluntary, but a center that skips it gets prepayment review.` });
      else found.push({ program: 'ASC', status: 'not', text: `The ambulatory surgical center demonstration began in ${state} on ${usDateLong(start)}, after ${day}.` });
    } else if (ASC_REMOVED[code]) found.push({ program: 'ASC', status: 'not', text: `${code} was taken off the ambulatory surgical center demonstration list on ${ASC_REMOVED[code]}.` });
  }
  if (setting.value !== 'inpatient' && setting.value !== 'ambulance') {
    const wi = WISER[code];
    if (WISER_POSTPONED[code]) found.push({ program: 'WISeR', status: 'postponed', text: `Postponed: WISeR delayed ${WISER_POSTPONED[code]}, so ${code} is not under prior authorization or prepayment review in the model for now; CMS will reconsider it in a later year.` });
    else if (wi) {
      const inYears = iso >= '2026-01-01' && iso <= '2031-12-31';
      if (!state) found.push({ program: 'WISeR', status: 'review', text: `${code} (${wi.service}) is on the WISeR list, which applies only in NJ, OH, OK, TX, AZ and WA from 2026 through 2031. Choose the state.` });
      else if (!WISER_STATES.has(state)) found.push({ program: 'WISeR', status: 'not', text: `WISeR does not include ${state}: it runs in NJ, OH, OK, TX, AZ and WA.` });
      else if (!inYears) found.push({ program: 'WISeR', status: 'not', text: `WISeR runs from January 1, 2026 through December 31, 2031, which does not include ${day}.` });
      else if (iso < wi.from) found.push({ program: 'WISeR', status: 'not', text: `${code} is under WISeR only for dates of service on or after ${usDateLong(wi.from)}.` });
      else found.push({ program: 'WISeR', status: 'review', text: `WISeR prior authorization required, or prepayment review: ${code} (${wi.service}) in ${state}${wi.cond ? `, ${wi.cond}` : ''}.` });
    }
  }

  const live = found.filter((f) => f.status === 'required' || f.status === 'review');
  const required = found.some((f) => f.status === 'required');
  let band;
  if (live.length) band = live.map((f) => f.text).join(' ');
  else if (found.length) band = `Not required on ${day}: ${found.map((f) => f.text).join(' ')}`;
  else band = `Not on a CMS prior authorization list for this setting: ${code} in a ${setting.text.toLowerCase()} on ${day}.`;
  if (needsState && !state && !found.some((f) => /Choose the state/.test(f.text))) notes.push('No state was entered; the ambulance, surgical center and WISeR programs depend on it.');
  if (setting.value === 'inpatient') notes.push('These programs do not reach inpatient-only or emergency services.');
  notes.push(`Lists as read: hospital outpatient (verified ${usDateLong(CMS_OPD_PA_LAST_VERIFIED)}), DMEPOS (updated ${usDateLong(DMEPOS_LIST_UPDATED)}), WISeR Appendix A (July 24, 2026). Original Medicare only: a Medicare Advantage plan keeps its own list.`);
  return {
    valid: true, code, programs: found, band,
    bandLabel: required ? 'Prior authorization required' : live.length ? 'Prior authorization or prepayment review' : 'Not required',
    abnormal: live.length > 0, notes,
    note: 'Prior authorization confirms coverage rules are met before the service; it does not change what Medicare covers.',
  };
}
