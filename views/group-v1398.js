// spec-v1398: renderers for heat, smoke, air, and Valley fever (Clinical Scoring & Risk, Group G):
// aqi-pm25, calosha-outdoor-heat, calosha-indoor-heat, calosha-wildfire-smoke,
// ca-valley-fever-test-prompt.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as AQ from '../lib/aqi-pm25-v1398.js';
import * as OH from '../lib/calosha-outdoor-heat-v1398.js';
import * as IH from '../lib/calosha-indoor-heat-v1398.js';
import * as WS from '../lib/calosha-wildfire-smoke-v1398.js';
import * as VF from '../lib/ca-valley-fever-test-prompt-v1398.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function inputField(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
}
function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal' }));
  root.appendChild(wrap);
}
function textField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off' }));
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
function answer(o, r, warn) {
  resultRow(o, [
    { text: r.band, cls: warn ? 'warn' : null },
    { label: 'Answer', value: r.bandLabel },
  ]);
}

const NA = '-- not entered --';

export const renderers = {
  'aqi-pm25'(root) {
    note(root, 'Enter a 24-hour PM2.5 concentration or an AQI; the other is computed.');
    numField(root, 'PM2.5, 24-hour (ug/m3)', 'aqi-conc');
    numField(root, 'Or an AQI value', 'aqi-aqi');
    selectField(root, 'Patient is in a sensitive group', 'aqi-sensitive', AQ.SENSITIVE, NA);

    const ids = ['aqi-conc', 'aqi-aqi', 'aqi-sensitive'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = AQ.aqiPm25({ conc: val('aqi-conc'), aqi: val('aqi-aqi'), sensitive: val('aqi-sensitive') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.advice);
      note(o, r.breakpointNote);
    }));
  },

  'calosha-outdoor-heat'(root) {
    note(root, 'California outdoor work. Enter the temperature (or the predicted high) and the industry.');
    numField(root, 'Temperature or predicted high (F)', 'oh-temp');
    selectField(root, 'Industry', 'oh-industry', OH.INDUSTRIES, '-- choose --');
    textField(root, 'Highs of the preceding five days (F, comma-separated)', 'oh-prior');

    const ids = ['oh-temp', 'oh-industry', 'oh-prior'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = OH.caloshaOutdoorHeat({ tempF: val('oh-temp'), industry: val('oh-industry'), priorHighs: val('oh-prior') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.requirements);
      note(o, r.heatWaveNote);
      note(o, r.newNote);
    }));
  },

  'calosha-indoor-heat'(root) {
    note(root, 'California indoor work, such as a hospital laundry, kitchen, or central sterile.');
    numField(root, 'Indoor temperature (F)', 'ih-temp');
    numField(root, 'Heat index (F)', 'ih-hi');
    selectField(root, 'Clothing that restricts heat removal', 'ih-clothing', IH.YES_NO, NA);
    selectField(root, 'High radiant heat area', 'ih-radiant', IH.YES_NO, NA);
    numField(root, 'Minutes of exposure in any 60', 'ih-minutes');
    selectField(root, 'In a vehicle without working air conditioning, or a container being loaded', 'ih-vehicle', IH.YES_NO, NA);

    const ids = ['ih-temp', 'ih-hi', 'ih-clothing', 'ih-radiant', 'ih-minutes', 'ih-vehicle'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = IH.caloshaIndoorHeat({ tempF: val('ih-temp'), heatIndexF: val('ih-hi'), clothing: val('ih-clothing'), radiant: val('ih-radiant'), minutesPerHour: val('ih-minutes'), vehicleOrContainer: val('ih-vehicle') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.minutesNote);
    }));
  },

  'calosha-wildfire-smoke'(root) {
    note(root, 'California. Enter the current AQI for PM2.5 (or a concentration) and the hours outdoors this shift.');
    numField(root, 'Current AQI for PM2.5', 'ws-aqi');
    numField(root, 'Or PM2.5 concentration (ug/m3)', 'ws-conc');
    numField(root, 'Hours of exposure this shift', 'ws-hours');

    const ids = ['ws-aqi', 'ws-conc', 'ws-hours'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = WS.caloshaWildfireSmoke({ aqi: val('ws-aqi'), conc: val('ws-conc'), hours: val('ws-hours') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.concNote);
    }));
  },

  'ca-valley-fever-test-prompt'(root) {
    note(root, 'California advisory, January 2024. A blank answer is not assessed, never no.');
    selectField(root, 'Community-acquired pneumonia or a respiratory illness', 'vf-resp', VF.YES_NO, NA);
    selectField(root, 'Lives, works, or travels in an area with coccidioidomycosis', 'vf-endemic', VF.YES_NO, NA);
    selectField(root, 'Exposed to outdoor dust or dirt', 'vf-dust', VF.YES_NO, NA);
    selectField(root, 'Symptomatic for a week or longer', 'vf-week', VF.YES_NO, NA);
    selectField(root, 'Not responding to standard CAP treatment', 'vf-noresp', VF.YES_NO, NA);
    selectField(root, 'Hospitalized with suspected severe disease', 'vf-severe', VF.YES_NO, NA);

    const ids = ['vf-resp', 'vf-endemic', 'vf-dust', 'vf-week', 'vf-noresp', 'vf-severe'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = VF.caValleyFeverTestPrompt({ respiratory: val('vf-resp'), endemic: val('vf-endemic'), dust: val('vf-dust'), week: val('vf-week'), noResponse: val('vf-noresp'), severe: val('vf-severe') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.tests);
      note(o, r.reportNote);
    }));
  },
};
