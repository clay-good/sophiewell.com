// spec-v1657: unit and facility operations arithmetic.
// nursing-hppd, pbj-hours-per-resident-day, pbj-case-mix-adjusted-hours, nursing-home-staffing-star,
// staff-turnover-rate, fte-from-hours, bed-occupancy-alos, overtime-agency-share, unit-budget-variance,
// case-mix-index, staffing-grid.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as HPPD from '../lib/nursing-hppd-v1657.js';
import * as PBJ from '../lib/pbj-hours-per-resident-day-v1657.js';
import * as ADJ from '../lib/pbj-case-mix-adjusted-hours-v1657.js';
import * as STAR from '../lib/nursing-home-staffing-star-v1657.js';
import * as TURN from '../lib/staff-turnover-rate-v1657.js';
import * as FTE from '../lib/fte-from-hours-v1657.js';
import * as BED from '../lib/bed-occupancy-alos-v1657.js';
import * as OT from '../lib/overtime-agency-share-v1657.js';
import * as BUD from '../lib/unit-budget-variance-v1657.js';
import * as CMI from '../lib/case-mix-index-v1657.js';
import * as GRID from '../lib/staffing-grid-v1657.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'nursing-hppd'(root) {
    numField(root, 'Patient days in the period', 'hppd-days', 'e.g. 600');
    numField(root, 'RN hours', 'hppd-rn', 'e.g. 3000');
    numField(root, 'LPN/LVN hours', 'hppd-lpn', 'e.g. 600');
    numField(root, 'Nurse aide hours', 'hppd-aide', 'e.g. 1800');
    selectField(root, 'Hours counted', 'hppd-hours-basis', [{ value: 'worked', text: 'Worked (productive)' }, { value: 'paid', text: 'Paid' }]);
    selectField(root, 'Patient days counted', 'hppd-days-basis', [{ value: 'midnight', text: 'Midnight census' }, { value: 'adjusted', text: 'Adjusted patient days' }]);
    numField(root, 'Target HPPD the unit uses (optional)', 'hppd-target', '');
    tool(root, [['hppd-days', 'patientDays'], ['hppd-rn', 'rnHours'], ['hppd-lpn', 'lpnHours'], ['hppd-aide', 'aideHours'], ['hppd-hours-basis', 'hoursBasis'], ['hppd-days-basis', 'daysBasis'], ['hppd-target', 'targetHppd']], HPPD.nursingHppd);
  },
  'pbj-hours-per-resident-day'(root) {
    note(root, 'Totals for the quarter, from the PBJ submission and the MDS census, over the days with at least one resident.');
    numField(root, 'RN hours (job codes 5 to 7)', 'pbj-rn', 'e.g. 7000');
    numField(root, 'LPN hours (job codes 8 and 9)', 'pbj-lpn', 'e.g. 8000');
    numField(root, 'Nurse aide hours (job codes 10 to 12)', 'pbj-aide', 'e.g. 20000');
    numField(root, 'Resident census, summed over the days', 'pbj-census', 'e.g. 9000');
    numField(root, 'Weekend nurse hours (job codes 5 to 12, optional)', 'pbj-wk-nurse', '');
    numField(root, 'Weekend nurse aide hours (job codes 10 to 12, optional)', 'pbj-wk-aide', '');
    numField(root, 'Weekend resident census, summed (optional)', 'pbj-wk-census', '');
    numField(root, 'Days with residents and no RN hours (optional)', 'pbj-no-rn', '');
    tool(root, [['pbj-rn', 'rnHours'], ['pbj-lpn', 'lpnHours'], ['pbj-aide', 'aideHours'], ['pbj-census', 'census'], ['pbj-wk-nurse', 'weekendNurseHours'], ['pbj-wk-aide', 'weekendAideHours'], ['pbj-wk-census', 'weekendCensus'], ['pbj-no-rn', 'daysWithoutRn']], PBJ.pbjHoursPerResidentDay);
  },
  'pbj-case-mix-adjusted-hours'(root) {
    selectField(root, 'Staff type', 'cma-staff', ADJ.STAFF);
    numField(root, 'Reported hours per resident day', 'cma-reported', 'e.g. 4.0');
    numField(root, 'Case-mix hours per resident day (CMS staffing file)', 'cma-casemix', 'e.g. 3.6');
    numField(root, 'National average case-mix hours (State US Averages)', 'cma-national', 'e.g. 3.8');
    tool(root, [['cma-staff', 'staffType'], ['cma-reported', 'reported'], ['cma-casemix', 'caseMix'], ['cma-national', 'national']], ADJ.pbjCaseMixAdjustedHours);
  },
  'nursing-home-staffing-star'(root) {
    numField(root, 'Adjusted RN hours per resident day', 'nss-rn', 'e.g. 0.786');
    numField(root, 'Adjusted total nurse hours per resident day', 'nss-total', 'e.g. 4.151');
    numField(root, 'Adjusted weekend total nurse hours per resident day', 'nss-weekend', 'e.g. 3.668');
    numField(root, 'RN turnover (%)', 'nss-rn-to', '');
    selectField(root, 'If RN turnover is missing, why', 'nss-rn-to-status', STAR.STATUS);
    numField(root, 'Total nurse turnover (%)', 'nss-total-to', 'e.g. 45');
    selectField(root, 'If total nurse turnover is missing, why', 'nss-total-to-status', STAR.STATUS);
    numField(root, 'Administrator departures in the period', 'nss-admin', 'e.g. 1');
    selectField(root, 'If administrator departures are missing, why', 'nss-admin-status', STAR.STATUS);
    selectField(root, 'Scoring exception', 'nss-exception', STAR.EXCEPTIONS);
    tool(root, [['nss-rn', 'rnHours'], ['nss-total', 'totalHours'], ['nss-weekend', 'weekendHours'], ['nss-rn-to', 'rnTurnover'], ['nss-rn-to-status', 'rnTurnoverStatus'], ['nss-total-to', 'totalTurnover'], ['nss-total-to-status', 'totalTurnoverStatus'], ['nss-admin', 'adminDepartures'], ['nss-admin-status', 'adminStatus'], ['nss-exception', 'exception']], STAR.nursingHomeStaffingStar);
  },
  'staff-turnover-rate'(root) {
    numField(root, 'Separations in the period', 'str-separations', 'e.g. 12');
    numField(root, 'Headcount at the start', 'str-start', 'e.g. 38');
    numField(root, 'Headcount at the end', 'str-end', 'e.g. 42');
    numField(root, 'Budgeted positions (optional)', 'str-budgeted', '');
    numField(root, 'Filled positions (optional)', 'str-filled', '');
    numField(root, 'CMS method: employment spells ended in a 90-day gap (optional)', 'str-spells-ended', '');
    numField(root, 'CMS method: eligible employment spells (optional)', 'str-spells', '');
    tool(root, [['str-separations', 'separations'], ['str-start', 'startHeadcount'], ['str-end', 'endHeadcount'], ['str-budgeted', 'budgeted'], ['str-filled', 'filled'], ['str-spells-ended', 'spellsEnded'], ['str-spells', 'eligibleSpells']], TURN.staffTurnoverRate);
  },
  'fte-from-hours'(root) {
    selectField(root, 'Method', 'fte-method', FTE.METHODS);
    numField(root, 'Hours in the period (worked or paid)', 'fte-hours', 'e.g. 800');
    numField(root, 'Weeks in the period', 'fte-weeks', 'e.g. 2');
    numField(root, 'Hours per FTE per week (your full-time standard)', 'fte-per-week', 'e.g. 40');
    numField(root, 'Cost report: hours in the sample weeks, summed', 'fte-sample', '');
    tool(root, [['fte-method', 'method'], ['fte-hours', 'hours'], ['fte-weeks', 'weeks'], ['fte-per-week', 'hoursPerWeek'], ['fte-sample', 'sampleHours']], FTE.fteFromHours);
  },
  'bed-occupancy-alos'(root) {
    numField(root, 'Beds', 'boa-beds', 'e.g. 100');
    numField(root, 'Days in the period', 'boa-days', 'e.g. 30');
    areaField(root, 'Or, when the bed count changed, one line per part: beds, then days', 'boa-periods', '40, 10\n50, 20');
    numField(root, 'Inpatient days', 'boa-ip-days', 'e.g. 2400');
    numField(root, 'Discharges, including deaths, excluding newborns and DOAs', 'boa-discharges', 'e.g. 500');
    tool(root, [['boa-beds', 'beds'], ['boa-days', 'days'], ['boa-periods', 'bedPeriods'], ['boa-ip-days', 'inpatientDays'], ['boa-discharges', 'discharges']], BED.bedOccupancyAlos);
  },
  'overtime-agency-share'(root) {
    numField(root, 'Regular hours', 'oas-regular', 'e.g. 900');
    numField(root, 'Overtime hours', 'oas-overtime', 'e.g. 100');
    numField(root, 'Agency hours', 'oas-agency', 'e.g. 250');
    numField(root, 'Regular hourly rate ($, optional)', 'oas-regular-rate', '');
    numField(root, 'Overtime hourly rate ($, optional)', 'oas-overtime-rate', '');
    numField(root, 'Agency hourly rate ($, optional)', 'oas-agency-rate', '');
    tool(root, [['oas-regular', 'regular'], ['oas-overtime', 'overtime'], ['oas-agency', 'agency'], ['oas-regular-rate', 'regularRate'], ['oas-overtime-rate', 'overtimeRate'], ['oas-agency-rate', 'agencyRate']], OT.overtimeAgencyShare);
  },
  'unit-budget-variance'(root) {
    numField(root, 'Budgeted volume (patient days or visits)', 'ubv-budget-volume', 'e.g. 1000');
    numField(root, 'Actual volume', 'ubv-actual-volume', 'e.g. 1100');
    numField(root, 'Budgeted hours or dollars', 'ubv-budget', 'e.g. 9000');
    numField(root, 'Actual hours or dollars', 'ubv-actual', 'e.g. 10200');
    numField(root, 'Fixed portion of the budget (0 if it all varies)', 'ubv-fixed', 'e.g. 1000');
    tool(root, [['ubv-budget-volume', 'budgetVolume'], ['ubv-actual-volume', 'actualVolume'], ['ubv-budget', 'budgetAmount'], ['ubv-actual', 'actualAmount'], ['ubv-fixed', 'fixedAmount']], BUD.unitBudgetVariance);
  },
  'case-mix-index'(root) {
    areaField(root, 'MS-DRG relative weights, one discharge per line, or a weight and a count', 'cmi-weights', '1.2345\n0.8765, 3');
    numField(root, 'Payment rate per weight of 1.0 ($, optional)', 'cmi-rate', '');
    tool(root, [['cmi-weights', 'weights'], ['cmi-rate', 'rate']], CMI.caseMixIndex);
  },
  'staffing-grid'(root) {
    numField(root, 'Target HPPD', 'sg-hppd', 'e.g. 8');
    numField(root, 'Shift length (hours)', 'sg-shift', 'e.g. 12');
    numField(root, 'Lowest census', 'sg-from', 'e.g. 20');
    numField(root, 'Highest census', 'sg-to', 'e.g. 30');
    numField(root, 'Census step (optional, default 1)', 'sg-step', 'e.g. 2');
    numField(root, 'RN share of staff (%, optional)', 'sg-rn-share', '');
    tool(root, [['sg-hppd', 'targetHppd'], ['sg-shift', 'shiftHours'], ['sg-from', 'censusFrom'], ['sg-to', 'censusTo'], ['sg-step', 'step'], ['sg-rn-share', 'rnShare']], GRID.staffingGrid);
  },
};
