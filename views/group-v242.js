// spec-v242 §2: renderers for the environmental heat / cold exposure indices — the
// NWS heat index, the Canadian humidex, the 2001 wind-chill index, and the wet-bulb
// globe temperature. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/environ-v242.js';
import { resultRow } from '../lib/result-copy.js';

function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'heat-index'(root) {
    note(root, 'NWS heat index (Rothfusz): apparent temperature from air temp (F) and humidity (%). Caution 80-90, danger 103-124, extreme danger >= 125 F. Near-neighbors: humidex.');
    root.appendChild(numInput('Air temperature (F)', 'hi-temp'));
    root.appendChild(numInput('Relative humidity (%)', 'hi-rh', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['hi-temp', 'hi-rh'], () => safe(o, () => {
      render(o, M.heatIndex({ tempF: val('hi-temp'), humidity: val('hi-rh') }), 'Heat index');
    }));
    postureNote(root);
  },
  'humidex'(root) {
    note(root, 'Canadian humidex (Masterton 1979) = air temp (C) + 0.5555 x (vapor pressure - 10). 40-45 great discomfort, >= 54 heat stroke imminent. Near-neighbors: heat-index.');
    root.appendChild(numInput('Air temperature (C)', 'hx-temp'));
    root.appendChild(numInput('Dewpoint (C)', 'hx-dew'));
    const o = out(); root.appendChild(o);
    wire(['hx-temp', 'hx-dew'], () => safe(o, () => {
      render(o, M.humidex({ tempC: val('hx-temp'), dewpointC: val('hx-dew') }), 'Humidex');
    }));
    postureNote(root);
  },
  'wind-chill'(root) {
    note(root, 'Wind-chill index (2001 JAG/TI): Twc = 13.12 + 0.6215·Ta - 11.37·V^0.16 + 0.3965·Ta·V^0.16 (C, km/h). <= -27 C high frostbite risk. Near-neighbors: heat-index.');
    root.appendChild(numInput('Air temperature (C)', 'wc-temp'));
    root.appendChild(numInput('Wind speed (km/h)', 'wc-wind', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['wc-temp', 'wc-wind'], () => safe(o, () => {
      render(o, M.windChill({ tempC: val('wc-temp'), windKmh: val('wc-wind') }), 'Wind chill');
    }));
    postureNote(root);
  },
  'wbgt'(root) {
    note(root, 'Wet-bulb globe temperature (ISO 7243): outdoor = 0.7·NWB + 0.2·globe + 0.1·dry; indoor = 0.7·NWB + 0.3·dry. Maps to work-rest flags. Near-neighbors: heat-index.');
    root.appendChild(select('Setting', 'wbgt-setting', [['outdoor', 'Outdoor (in sun)'], ['indoor', 'Indoor / shade']]));
    root.appendChild(numInput('Natural wet-bulb temperature', 'wbgt-nwb'));
    root.appendChild(numInput('Globe temperature (outdoor only)', 'wbgt-globe'));
    root.appendChild(numInput('Dry-bulb (air) temperature', 'wbgt-dry'));
    const o = out(); root.appendChild(o);
    wire(['wbgt-setting', 'wbgt-nwb', 'wbgt-globe', 'wbgt-dry'], () => safe(o, () => {
      render(o, M.wbgt({ setting: val('wbgt-setting'), naturalWetBulb: val('wbgt-nwb'), globe: val('wbgt-globe'), dryBulb: val('wbgt-dry') }), 'WBGT');
    }));
    postureNote(root);
  },
};
