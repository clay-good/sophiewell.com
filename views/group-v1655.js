// spec-v1655: infection prevention arithmetic and healthcare personnel clocks.
// nhsn-sir, device-utilization-ratio, device-infection-rate, outbreak-attack-rates,
// hcp-exposure-clock, hcp-illness-return-date.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as SIR from '../lib/nhsn-sir-v1655.js';
import * as DUR from '../lib/device-utilization-ratio-v1655.js';
import * as DIR from '../lib/device-infection-rate-v1655.js';
import * as OAR from '../lib/outbreak-attack-rates-v1655.js';
import * as HCE from '../lib/hcp-exposure-clock-v1655.js';
import * as HCI from '../lib/hcp-illness-return-date-v1655.js';

const NA = { value: '', text: '— choose —' };
const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function dateField(root, label, id, type = 'date') {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
  return wrap;
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
  'nhsn-sir'(root) {
    numField(root, 'Observed infections (from the NHSN report)', 'sir-observed', 'e.g. 5');
    numField(root, 'Predicted infections (numPred on the NHSN report)', 'sir-predicted', 'e.g. 2.365');
    tool(root, [['sir-observed', 'observed'], ['sir-predicted', 'predicted']], SIR.nhsnSir);
  },
  'device-utilization-ratio'(root) {
    selectField(root, 'Device', 'dur-device', DUR.DEVICES);
    numField(root, 'Device days in the period', 'dur-device-days', 'e.g. 310');
    numField(root, 'Patient days in the period', 'dur-patient-days', 'e.g. 1000');
    tool(root, [['dur-device', 'device'], ['dur-device-days', 'deviceDays'], ['dur-patient-days', 'patientDays']], DUR.deviceUtilizationRatio);
  },
  'device-infection-rate'(root) {
    selectField(root, 'Device and event', 'dir-device', DIR.DEVICES);
    numField(root, 'Events (CLABSIs, CAUTIs or VAEs) in the period', 'dir-events', 'e.g. 5');
    numField(root, 'Device days in the period', 'dir-device-days', 'e.g. 1850');
    numField(root, 'Episodes of mechanical ventilation (VAE only, optional)', 'dir-episodes', '');
    tool(root, [['dir-device', 'device'], ['dir-events', 'events'], ['dir-device-days', 'deviceDays'], ['dir-episodes', 'episodes']], DIR.deviceInfectionRate);
  },
  'outbreak-attack-rates'(root) {
    areaField(root, 'Exposures, one per line: name, ill exposed, total exposed, and optionally ill unexposed, total unexposed', 'oar-rows', 'Potato salad, 30, 99, 5, 100');
    numField(root, 'Total ill (for the overall attack rate, optional)', 'oar-total-ill', '');
    numField(root, 'Total persons at risk (optional)', 'oar-total-persons', '');
    numField(root, 'Household or contact group members (for the secondary attack rate, optional)', 'oar-members', '');
    numField(root, 'Primary cases in those households (optional)', 'oar-primary', '');
    numField(root, 'Secondary cases among the contacts (optional)', 'oar-secondary', '');
    tool(root, [['oar-rows', 'rows'], ['oar-total-ill', 'totalIll'], ['oar-total-persons', 'totalPersons'], ['oar-members', 'householdMembers'], ['oar-primary', 'primaryCases'], ['oar-secondary', 'secondaryCases']], OAR.outbreakAttackRates);
  },
  'hcp-exposure-clock'(root) {
    selectField(root, 'Exposed to', 'hce-pathogen', HCE.PATHOGENS);
    dateField(root, 'First exposure', 'hce-first');
    dateField(root, 'Last exposure (blank for a single exposure)', 'hce-last');
    selectField(root, 'Immunity (measles, mumps, rubella, varicella)', 'hce-immunity', HCE.IMMUNITY);
    selectField(root, 'Mumps, not immune: first MMR dose given before the exposure?', 'hce-mmr', YES_NO);
    selectField(root, 'Varicella, not immune: one dose before, and the second dose within 5 days after exposure?', 'hce-second-dose', YES_NO);
    selectField(root, 'Varicella, not immune: varicella-zoster immune globulin given?', 'hce-varizig', YES_NO);
    selectField(root, 'Pertussis: likely to interact with persons at increased risk of severe pertussis?', 'hce-high-risk', YES_NO);
    selectField(root, 'Pertussis: receiving postexposure prophylaxis?', 'hce-pep', YES_NO);
    tool(root, [['hce-pathogen', 'pathogen'], ['hce-first', 'firstExposure'], ['hce-last', 'lastExposure'], ['hce-immunity', 'immunity'], ['hce-mmr', 'firstMmrBeforeExposure'], ['hce-second-dose', 'secondDoseWithin5Days'], ['hce-varizig', 'immuneGlobulin'], ['hce-high-risk', 'highRiskContact'], ['hce-pep', 'prophylaxis']], HCE.hcpExposureClock);
  },
  'hcp-illness-return-date'(root) {
    selectField(root, 'Infection', 'hci-condition', HCI.CONDITIONS);
    dateField(root, 'Onset: rash, parotitis, first symptom or cough (day 0)', 'hci-onset');
    dateField(root, 'Effective antimicrobial therapy started (pertussis, group A strep, meningococcal)', 'hci-therapy', 'datetime-local');
    selectField(root, 'Varicella: have all lesions dried and crusted?', 'hci-crusted', YES_NO);
    tool(root, [['hci-condition', 'condition'], ['hci-onset', 'onsetDate'], ['hci-therapy', 'therapyStart'], ['hci-crusted', 'lesionsCrusted']], HCI.hcpIllnessReturnDate);
  },
};
