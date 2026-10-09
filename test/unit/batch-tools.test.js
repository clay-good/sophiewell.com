// spec-v1501 §3: batch mode for form tools -- one case per CSV row, through the tool's own function.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BATCH_TOOLS, cellValue, isoDateTime, rowArgs, runBatch } from '../../lib/batch-tools.js';
import { fplPercent } from '../../lib/income-screens-v1506.js';
import { CSV_TOOLS } from '../../lib/upload-fields.js';

const FPL = BATCH_TOOLS['fpl-percent'];
const field = (id) => FPL.fields.find((f) => f.id === id);
const FORM = { region: 'us', program: 'current', period: 'annual', year: '2026' };

test('a choice cell matches by value, by its words, or by an alias, ignoring case; anything else passes as written', () => {
  assert.equal(cellValue(field('region'), 'Alaska'), 'ak');
  assert.equal(cellValue(field('region'), ' HI '), 'hi');
  assert.equal(cellValue(field('region'), 'the 48 contiguous states and dc'), 'us');
  assert.equal(cellValue(field('program'), 'Marketplace'), 'ptc');
  assert.equal(cellValue(field('period'), 'Monthly'), 'monthly');
  assert.equal(cellValue(field('region'), 'Guam'), 'Guam');
  assert.equal(cellValue(field('size'), ' 3 '), '3');
});

test('a context field left blank takes the form\'s answer; a row\'s own cell wins', () => {
  assert.deepEqual(rowArgs(FPL, { size: '3', income: '40000', region: '' }, FORM), { reference: '', size: '3', income: '40000', ...FORM, threshold: '' });
  assert.equal(rowArgs(FPL, { size: '3', income: '40000', region: 'Alaska' }, FORM).region, 'ak');
});

test('a fact about the row is never filled from the form, required or not', () => {
  const MSP = BATCH_TOOLS['extra-help-msp-screen'];
  const args = rowArgs(MSP, { marital: 'single', unearned: '1200', resources: '5000', earned: '' }, { region: 'us', year: '2026', earned: '900', dependents: '2', burial: 'yes' });
  assert.deepEqual([args.earned, args.dependents, args.burial, args.region, args.year], ['', '', '', 'us', '2026']);
  for (const f of MSP.fields) if (f.fromForm) assert.ok(['region', 'year'].includes(f.id), `${f.id} is a fact about the person, not context`);
});

test('each row is the form\'s own answer, and a bad row says why without stopping the rest', () => {
  const rows = [
    { reference: 'A', size: '3', income: '40000' },
    { reference: 'B', size: '4', income: '6000', period: 'monthly', region: 'Hawaii' },
    { reference: 'C', size: 'three', income: '40000' },
  ];
  const r = runBatch('fpl-percent', rows, FORM);
  assert.equal(r.valid, true);
  assert.equal(r.rows[0].detail, fplPercent({ ...FORM, size: '3', income: '40000' }).band);
  assert.equal(r.rows[1].label, fplPercent({ ...FORM, size: '4', income: '6000', period: 'monthly', region: 'hi' }).bandLabel);
  assert.equal(r.rows[2].ok, false);
  assert.equal(r.rows[2].detail, fplPercent({ ...FORM, size: 'three', income: '40000' }).message);
  assert.equal(r.band, '2 households of 3 computed. 1 row needs corrected inputs.');
  assert.equal(runBatch('extra-help-msp-screen', [{ marital: 'single', unearned: '1200', resources: '5000' }], { region: 'us', year: '2026' }).band, '1 person of 1 computed.');
  assert.equal(r.abnormal, true);
});

test('a blank required cell is the row\'s, never the form\'s', () => {
  const r = runBatch('fpl-percent', [{ size: '2', income: '' }], { ...FORM, size: '3', income: '40000' });
  assert.equal(r.rows[0].ok, false);
  assert.equal(r.rows[0].detail, fplPercent({ ...FORM, size: '2', income: '' }).message);
});

test('a file without the region or program columns needs the form to answer them', () => {
  const r = runBatch('fpl-percent', [{ size: '3', income: '40000' }], {});
  assert.equal(r.rows[0].ok, false);
  assert.match(r.rows[0].detail, /Choose where the household lives/);
});

test('a households file is recognized by its size and income columns', () => {
  const t = CSV_TOOLS.find((x) => x.id === 'fpl-percent');
  assert.ok(t);
  assert.deepEqual(t.fields.filter((f) => f.required).map((f) => f.id), ['size', 'income']);
  assert.equal(runBatch('no-such-tool', [], {}).valid, false);
});

test('a hospital\'s policy comes from the form for every patient; charges and income only from the row', () => {
  const FORM_FAP = { region: 'us', year: '2026', tier1Limit: '200', tier1Discount: '100', tier2Limit: '400', tier2Discount: '50', gross: '999', income: '1' };
  const r = runBatch('fap-discount', [{ size: '3', income: '30000', gross: '20000' }, { size: '4', income: '50000', gross: '' }], FORM_FAP);
  assert.equal(r.rows[0].label, '$0.00');
  assert.equal(r.rows[1].detail, 'Enter the gross charges in dollars.');
  assert.equal(r.band, '1 patient of 2 computed. 1 row needs corrected inputs.');
  const fap = BATCH_TOOLS['fap-discount'];
  assert.ok(!fap.fields.some((f) => fap.formOnly.includes(f.id)), 'the policy is not a file column');
  assert.equal(rowArgs(fap, { size: '3', income: '30000', gross: '20000' }, FORM_FAP).tier2Discount, '50');
});

test('medicare-ffs-pa-required runs over a services file: a spelled-out state is read, an unknown one refused, a blank one takes the form', () => {
  const r = runBatch('medicare-ffs-pa-required', [
    { code: '64483', serviceDate: '2026-03-02', state: 'Texas' },
    { code: '64483', serviceDate: '3/2/2026', state: 'Tx.' },
    { code: 'L1833', serviceDate: '2026-11-02', state: '', setting: 'DME' },
    { code: '', serviceDate: '2026-03-02' },
  ], { setting: 'opd', state: 'KS' });
  assert.equal(r.band, '2 services of 4 computed. 2 rows need corrected inputs.');
  assert.match(r.rows[0].detail, /^WISeR prior authorization required, or prepayment review: 64483 .* in TX\.$/);
  assert.deepEqual([r.rows[1].label, r.rows[1].detail], ['Needs corrected inputs', 'State where the service is furnished: "Tx." is not one of the choices.']);
  assert.match(r.rows[2].detail, /^Required: L1833 is on the DMEPOS Required Prior Authorization List/);
  assert.equal(r.rows[3].detail, 'Enter the HCPCS or CPT code.');
});

test('a strict choice that matches by value, words or alias is accepted; only a cell matching none is refused', () => {
  const T = BATCH_TOOLS['medicare-ffs-pa-required'];
  const st = T.fields.find((f) => f.id === 'state');
  const se = T.fields.find((f) => f.id === 'setting');
  assert.deepEqual(['tx', 'TX', 'texas', 'District of Columbia', 'puerto rico'].map((c) => cellValue(st, c)), ['TX', 'TX', 'TX', 'DC', 'PR']);
  assert.deepEqual(['HOPD', 'Ambulatory surgical center', 'clinic', 'dmepos'].map((c) => cellValue(se, c)), ['opd', 'asc', 'office', 'dmepos']);
  assert.ok(Object.values(st.aliases).every((v) => st.options.some((o) => o.value === v)), 'every state alias names a listed state');
});

test('premium-tax-credit runs over a households file, a missing size refused, a blank region taken from the form', () => {
  const r = runBatch('premium-tax-credit', [
    { magi: '40000', size: '3', benchmark: '1200', region: '' },
    { magi: '95000', size: '4', benchmark: '1500', region: 'Hawaii' },
    { magi: '38000', size: '', benchmark: '800' },
  ], { region: 'us', year: '2026' });
  assert.equal(r.band, '2 households of 3 computed. 1 row needs corrected inputs.');
  assert.equal(r.rows[0].label, '$1,060.33 a month');
  assert.equal(r.rows[1].label, '$815.21 a month', 'Hawaii\'s guideline, not the form\'s 48 states');
  assert.equal(r.rows[2].detail, 'Enter the household size in people.');
});

test('irmaa runs over a people file; a bare "MFS" is refused, since the separate brackets need the person to have lived with the spouse', () => {
  const r = runBatch('irmaa', [
    { filing: 'Single', magi: '90000' },
    { filing: 'MFJ', magi: '260000' },
    { filing: 'MFS', magi: '120000' },
    { filing: 'MFS lived with spouse', magi: '120000' },
  ], { year: '2026' });
  assert.equal(r.band, '3 people of 4 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['No IRMAA', '+$81.20 B, +$14.50 D', 'Needs corrected inputs', '+$446.30 B, +$83.30 D']);
  assert.equal(r.rows[2].detail, 'Tax filing status: "MFS" is not one of the choices. For married filing separately, write "MFS lived with spouse", or "single" if the person lived apart from the spouse all year.');
});

test('refill-eligible-date runs over a fills file, each row with its own plan threshold; a blank threshold is refused unless the row is eye drops', () => {
  const r = runBatch('refill-eligible-date', [
    { fillDate: '2026-09-01', daysSupply: '30', threshold: '75' },
    { fillDate: '2026-09-10', daysSupply: '90', threshold: '80' },
    { fillDate: '2026-09-15', daysSupply: '30', threshold: '' },
    { fillDate: '2026-09-15', daysSupply: '30', threshold: '', eyeDrops: 'Y' },
  ], {});
  assert.equal(r.band, '3 fills of 4 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Refill from 2026-09-24', 'Refill from 2026-11-21', 'Needs corrected inputs', 'Refill from 2026-10-06']);
});

test('timely-filing runs over a claims list: Original Medicare is one year, any other payer needs its limit, the row\'s or the form\'s', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  const r = runBatch('timely-filing', [
    { serviceDate: '03/02/2026', payer: 'Medicare', limitDays: '90' },
    { serviceDate: '2026-03-02', payer: 'Aetna', limitDays: '90' },
    { serviceDate: '2026-09-01', payer: 'Humana Medicare Advantage' },
    { serviceDate: '2026-02-30', payer: 'Medicare' },
    { serviceDate: '2026-09-01', payer: '' },
  ], { limitDays: '180' }, now);
  assert.equal(r.band, '3 claims of 5 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['File by 2027-03-02', 'Past the limit (2026-05-31)', 'File by 2027-02-28', 'Needs corrected inputs', 'Needs corrected inputs']);
  assert.equal(r.rows[0].detail, 'Medicare: 365 days from the date of service (42 CFR 424.44), so the claim is due by 2027-03-02; 146 days left.', 'a limit cell is not used for Original Medicare');
  assert.equal(r.rows[2].detail, 'Humana Medicare Advantage: 180 days from the date of service, so the claim is due by 2027-02-28; 144 days left.', 'a Medicare Advantage plan is not Original Medicare');
  assert.match(r.rows[3].detail, /^Date of service: "2026-02-30" is not a date\.$/);
  assert.match(r.rows[4].detail, /^Payer: blank/);
  const none = runBatch('timely-filing', [{ serviceDate: '2026-09-01', payer: 'Cigna' }], {}, now);
  assert.match(none.rows[0].detail, /^Filing limit: blank\. Cigna is not Original Medicare/);
});

test('appeal-deadline runs over a list of Medicare decisions: receipt presumed 5 days after the notice, an unknown level refused by name', () => {
  const r = runBatch('appeal-deadline', [
    { level: 'Redetermination', decisionDate: '09/01/2026' },
    { level: 'QIC', decisionDate: '2026-09-01', receivedDate: '2026-09-20' },
    { level: 'council', decisionDate: '2026-03-01' },
    { level: 'level 2', decisionDate: '2026-09-01' },
    { level: 'initial', decisionDate: '2026-09-01', receivedDate: '2026-08-01' },
  ], {}, new Date('2026-10-07T12:00:00Z'));
  assert.equal(r.band, '3 decisions of 5 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Reconsideration (QIC) by 2027-03-05', 'ALJ / OMHA hearing by 2026-11-19', 'Past the deadline (2026-05-05)', 'Needs corrected inputs', 'Needs corrected inputs']);
  assert.equal(r.rows[0].detail, 'Reconsideration (QIC): 180 days from receipt of the Redetermination (MAC) notice (presumed 2026-09-06, 5 days after its date; 42 CFR 405.962), so due by 2027-03-05; 149 days left.');
  assert.match(r.rows[1].detail, /received 2026-09-20; 42 CFR 405\.1014\), so due by 2026-11-19; 43 days left\. At least \$200 must remain in controversy/);
  assert.equal(r.rows[3].detail, 'Level just completed: "level 2" is not one of the choices. Write initial, redetermination, reconsideration, ALJ or council.');
  assert.match(r.rows[4].detail, /receipt date cannot come before the notice date/);
  assert.deepEqual(r.notes, ['Every value is the row\'s own; the form above is not used for file rows.', 'Rows that need corrected inputs say why in the result table and download.']);
});

test('pa-turnaround runs over a list of open requests: the CMS-0057-F window by type, a plan window only for a plan-specified row', () => {
  const r = runBatch('pa-turnaround', [
    { type: 'Standard', requestDate: '10/01/2026' },
    { type: 'urgent', requestDate: '2026-10-06', requestTime: '14:30' },
    { type: 'plan-specified', requestDate: '2026-09-01', windowDays: '15' },
    { type: 'custom', requestDate: '2026-09-01' },
    { type: 'priority 1', requestDate: '2026-09-01' },
    { type: 'standard', requestDate: '2026-10-01', windowDays: '14' },
  ], {}, new Date('2026-10-07T12:00:00Z'));
  assert.equal(r.band, '4 requests of 6 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Decide by 2026-10-08', 'Decide by 2026-10-09 14:30', 'Past due (2026-09-16)', 'Needs corrected inputs', 'Needs corrected inputs', 'Decide by 2026-10-08']);
  assert.equal(r.rows[3].detail, 'Plan window: blank. A plan-specified request needs its window in days.');
  assert.equal(r.rows[4].detail, 'Request type: "priority 1" is not one of the choices. Write standard, expedited or plan-specified.');
  assert.match(r.rows[5].detail, /The plan window of 14 days was not used: the standard window is the one CMS-0057-F sets\.$/);
});

test('overpayment-60day runs over a list of overpayments: 60 days from identification, suspended by a recorded investigation', () => {
  const r = runBatch('overpayment-60day', [
    { identificationDate: '09/01/2026' },
    { identificationDate: '2026-05-01', investigationStart: '2026-05-21' },
    { identificationDate: '2026-05-01', investigationStart: '2026-05-21', investigationEnd: '2026-06-30' },
    { identificationDate: '2026-05-01', investigationStart: '2026-04-01' },
    { identificationDate: 'May 2026' },
  ], {}, new Date('2026-10-07T12:00:00Z'));
  assert.equal(r.band, '3 overpayments of 5 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Report and return by 2026-10-31', 'Report and return by 2026-12-07', 'Past due (2026-08-09)', 'Needs corrected inputs', 'Needs corrected inputs']);
  assert.equal(r.rows[1].detail, 'Identified 2026-05-01; the investigation from 2026-05-21 suspends the clock until 2026-10-28, day 180 (no conclusion date entered); then 40 of the 60 days remain: due by 2026-12-07; 61 days left.');
  assert.match(r.rows[3].detail, /^The investigation began before the overpayment was identified/);
  assert.equal(r.rows[4].detail, 'Identification date: "May 2026" is not a date.');
});

test('gfe-deadline runs over a schedule: the deadline by business days ahead, a request date where the row has one', () => {
  const r = runBatch('gfe-deadline', [
    { scheduled: '10/01/2026', serviceDate: '10/20/2026' },
    { scheduled: '2026-10-01', serviceDate: '2026-10-07' },
    { scheduled: '2026-10-01', serviceDate: '2026-10-02' },
    { scheduled: '2026-10-01', serviceDate: 'next week' },
    { scheduled: '2026-10-05', serviceDate: '2026-10-01' },
  ], {});
  assert.equal(r.band, '3 services of 5 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Due 2026-10-06', 'Due 2026-10-02', 'No deadline', 'Needs corrected inputs', 'Needs corrected inputs']);
  assert.equal(r.rows[3].detail, 'Service date: "next week" is not a date.');
  assert.match(r.rows[4].detail, /the service comes after scheduling/);
});

test('nomnc-deadline runs over a census: 2 days before each last covered day, the setting from the form when the row has none', () => {
  const r = runBatch('nomnc-deadline', [
    { lastCovered: '10/10/2026' },
    { lastCovered: '2026-10-10', setting: 'Home Health' },
    { lastCovered: '2026-10-10', setting: 'acute' },
    { lastCovered: 'Friday' },
  ], { setting: 'snf' });
  assert.equal(r.band, '2 patients of 4 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Deliver by 2026-10-08', 'Deliver by 2026-10-08', 'Needs corrected inputs', 'Needs corrected inputs']);
  assert.equal(r.rows[2].detail, 'Setting: "acute" is not one of the choices. Write SNF, home health, hospice or CORF.');
  assert.equal(r.rows[3].detail, 'Last covered day: "Friday" is not a date.');
});

test('cobra-clock runs over an HR list: the employer\'s next deadline first, the administrator answer from the form', () => {
  const r = runBatch('cobra-clock', [
    { event: 'Termination', eventDate: '09/15/2026' },
    { event: 'divorce', eventDate: '2026-09-15', employerAdministers: 'no' },
    { event: 'Termination', eventDate: '2026-09-15', noticeDate: '2026-09-30' },
    { event: 'open enrollment', eventDate: '2026-09-15' },
  ], { employerAdministers: 'yes' });
  assert.equal(r.band, '3 events of 4 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Notice by 2026-10-29', 'Notice by 2026-10-15', 'Elect by 2026-11-29', 'Needs corrected inputs']);
  assert.equal(r.rows[0].detail, 'Send the election notice by 2026-10-29 (44 days after the event). COBRA can last 18 months after the event, to March 15, 2028 (26 CFR 54.4980B-7).');
  assert.match(r.rows[1].detail, /^Tell the plan administrator by 2026-10-15 \(30 days after the event\)\. COBRA can last 36 months/);
  assert.match(r.rows[3].detail, /"open enrollment" is not one of the choices\. Write termination, reduced hours/);
});

test('partb-late-penalty runs over a people file: 10% per full 12 months late, the year from the form', () => {
  const r = runBatch('partb-late-penalty', [{ monthsLate: '26' }, { monthsLate: '11' }, { monthsLate: '' }], { year: '2026' });
  assert.equal(r.band, '2 people of 3 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['20% penalty', 'No penalty', 'Needs corrected inputs']);
});

test('partd-late-penalty runs over a people file: each row\'s gaps, a gap under 63 days no penalty', () => {
  const r = runBatch('partd-late-penalty', [
    { gap1Start: '01/01/2024', gap1End: '06/30/2025' },
    { gap1Start: '2024-01-01', gap1End: '2024-02-15' },
    { gap1Start: '2024-01-01', gap1End: 'June' },
  ], { year: '2026' });
  assert.equal(r.band, '2 people of 3 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['$7.00 a month', 'No penalty', 'Needs corrected inputs']);
  assert.equal(r.rows[2].detail, 'Gap 1 last day: "June" is not a date.');
});

test('moon-deadline runs over an observation list: 36 hours from the start, a date with no time refused', () => {
  const r = runBatch('moon-deadline', [
    { observationStart: '10/01/2026 2:30 PM' },
    { observationStart: '2026-10-01 14:30', endTime: '2026-10-02 09:00' },
    { observationStart: '2026-10-01' },
  ], {});
  assert.equal(r.band, '2 patients of 3 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Due by 2026-10-03 02:30', 'Not required', 'Needs corrected inputs']);
  assert.equal(r.rows[2].detail, 'Observation began: "2026-10-01" is not a date and time.');
});

test('isoDateTime reads the common spreadsheet forms and refuses a bare date or an impossible hour', () => {
  assert.equal(isoDateTime('10/01/2026 12:05 AM'), '2026-10-01T00:05');
  assert.equal(isoDateTime('10/01/2026 12:05 pm'), '2026-10-01T12:05');
  assert.equal(isoDateTime('2026-10-01T07:09:30'), '2026-10-01T07:09');
  for (const bad of ['2026-10-01', '10/01/2026 13:00 PM', '2026-10-01 24:00', '']) assert.equal(isoDateTime(bad), null, bad);
});

test('medicare-enrollment-window and aca-sep-window run over lists, each row\'s own dates', () => {
  const m = runBatch('medicare-enrollment-window', [
    { birthDate: '07/01/1961', enrollDate: '05/10/2026' },
    { enrollDate: 'soon', birthDate: '1961-07-01' },
  ], {});
  assert.equal(m.band, '1 person of 2 computed. 1 row needs corrected inputs.');
  assert.equal(m.rows[0].label, 'Initial enrollment period');
  assert.equal(m.rows[1].detail, 'Sign-up date: "soon" is not a date.');
  const s = runBatch('aca-sep-window', [
    { event: 'Lost coverage', eventDate: '09/15/2026' },
    { event: 'divorce', eventDate: '2026-09-15' },
  ], {});
  assert.equal(s.band, '1 household of 2 computed. 1 row needs corrected inputs.');
  assert.equal(s.rows[0].label, 'Choose a plan by 2026-11-14');
  assert.match(s.rows[1].detail, /"divorce" is not one of the choices\. Write loss of coverage/);
});

test('hospice-period-clock runs over a census: each election date, the date to check from the row or the form', () => {
  const r = runBatch('hospice-period-clock', [
    { electionDate: '01/01/2024', asOf: '10/09/2026' },
    { electionDate: '2026-08-01' },
    { electionDate: 'August' },
  ], { asOf: '2026-10-09' });
  assert.equal(r.band, '2 patients of 3 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Period 16', 'Period 1', 'Needs corrected inputs']);
  assert.equal(r.rows[2].detail, 'Election date: "August" is not a date.');
});

test('erisa-claim-clock runs over a claims list: urgent claims need a time, kinds are refused by name', () => {
  const r = runBatch('erisa-claim-clock', [
    { claimType: 'post service', stage: 'claim', received: '03/02/2026' },
    { claimType: 'urgent', stage: 'claim', received: '03/02/2026 2:30 PM' },
    { claimType: 'urgent', stage: 'claim', received: '03/02/2026' },
    { claimType: 'dental', stage: 'claim', received: '2026-03-02' },
  ], { levels: 'one' });
  assert.equal(r.band, '2 claims of 4 computed. 2 rows need corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Due 2026-04-01, or 2026-04-16 if extended', 'Due 2026-03-05 14:30', 'Needs corrected inputs', 'Needs corrected inputs']);
  assert.match(r.rows[2].detail, /urgent and concurrent claims run in hours/);
  assert.match(r.rows[3].detail, /"dental" is not one of the choices/);
});

test('dme-rental-clock runs over a rental roster: title date for capped rentals, a break in use checked', () => {
  const r = runBatch('dme-rental-clock', [
    { item: 'capped rental', delivered: '01/15/2026' },
    { item: 'oxygen', delivered: '2025-06-01', lastUse: '2026-02-10', resumed: '2026-03-01' },
    { item: 'wheelchair', delivered: '2026-01-15' },
  ], {});
  assert.equal(r.band, '2 rentals of 3 computed. 1 row needs corrected inputs.');
  assert.equal(r.rows[0].label, 'Title 2027-02-15');
  assert.ok(r.rows[1].ok);
  assert.match(r.rows[2].detail, /"wheelchair" is not one of the choices\. Write capped rental or oxygen\./);
});

test('ma-org-determination-clock runs over a request worklist: each from the hour received', () => {
  const r = runBatch('ma-org-determination-clock', [
    { requestType: 'standard prior authorization', received: '03/02/2026 9:00 AM' },
    { requestType: 'expedited', received: '2026-03-02 14:30' },
    { requestType: 'expedited', received: '2026-03-02' },
  ], {});
  assert.equal(r.band, '2 requests of 3 computed. 1 row needs corrected inputs.');
  assert.deepEqual(r.rows.map((x) => x.label), ['Due 2026-03-09, or 2026-03-23 if extended', 'Due 2026-03-05 14:30, or 2026-03-19 14:30 if extended', 'Needs corrected inputs']);
});

test('partd-coverage-clock runs over a request list: hours from receipt, an exception from its statement', () => {
  const r = runBatch('partd-coverage-clock', [
    { requestType: 'expedited', received: '10/01/2026 9:00 AM' },
    { requestType: 'formulary exception', received: '2026-10-01 08:00', statement: '2026-10-02 10:00' },
    { requestType: 'step therapy', received: '2026-10-01 08:00' },
  ], {});
  assert.equal(r.band, '2 requests of 3 computed. 1 row needs corrected inputs.');
  assert.ok(r.rows[0].ok && r.rows[1].ok);
  assert.match(r.rows[0].label, /2026-10-02 09:00/);
  assert.match(r.rows[2].detail, /"step therapy" is not one of the choices/);
});
