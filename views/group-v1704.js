// spec-v1704: biosignal-analysis tools 2, 5, 6 and 7.
// hrv-time-domain, ectopy-burden, spo2-arms-accuracy, pwv-carotid-femoral.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as HTD from '../lib/hrv-time-domain-v1704.js';
import * as ECB from '../lib/ectopy-burden-v1704.js';
import * as SAA from '../lib/spo2-arms-accuracy-v1704.js';
import * as PWV from '../lib/pwv-carotid-femoral-v1704.js';

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
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '5', placeholder }));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) {
  const n = document.getElementById(id);
  if (!n) return '';
  return n.type === 'checkbox' ? n.checked : n.value;
}
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
// chart(result) -> a plot figure or null. It renders beside the answer region, not in it, so the live region
// announces the answer and not a table of plotted values (docs/design.md 7).
function tool(root, pairs, compute, chart) {
  const o = out(); root.appendChild(o);
  const area = el('div', { class: 'plot-area' });
  root.appendChild(area);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    clear(area);
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    const r = compute(args);
    show(r, o);
    if (chart && r.valid) { const fig = chart(r); if (fig) area.appendChild(fig); }
  }));
}

export const renderers = {
  'hrv-time-domain'(root) {
    areaField(root, 'RR (NN) intervals in milliseconds, one per line or separated by commas', 'htd-rr', '800, 860, 800, 860, 800');
    numField(root, 'Flag an interval that differs from the one before by more than this percent (optional)', 'htd-flag', '20');
    tool(root, [['htd-rr', 'intervals'], ['htd-flag', 'flagPercent']], HTD.hrvTimeDomain);
  },
  'ectopy-burden'(root) {
    numField(root, 'Total beats', 'ecb-total', '100000');
    numField(root, 'Ventricular ectopic beats', 'ecb-v', '12000');
    numField(root, 'Supraventricular ectopic beats', 'ecb-sv', '');
    numField(root, 'Monitored time (hours)', 'ecb-hours', '24');
    numField(root, 'Time in the arrhythmia (hours, optional)', 'ecb-arr', '');
    numField(root, 'A reference value to compare against, percent (optional)', 'ecb-ref', '');
    tool(root, [['ecb-total', 'totalBeats'], ['ecb-v', 'ventricular'], ['ecb-sv', 'supraventricular'], ['ecb-hours', 'monitoredHours'], ['ecb-arr', 'arrhythmiaHours'], ['ecb-ref', 'referencePercent']], ECB.ectopyBurden);
  },
  'spo2-arms-accuracy'(root) {
    selectField(root, 'Sensor type', 'saa-sensor', SAA.SENSOR_OPTIONS);
    areaField(root, 'Paired readings, one per line: subject, SpO2, SaO2', 'saa-pairs', 'S01, 91, 90');
    areaField(root, 'Subjects (optional), one per line: subject, darkly pigmented (yes or no), Monk Skin Tone 1 to 10, ITA in degrees, sex F or M', 'saa-subjects', 'S01, no, 3, 41, F');
    const o = out(); root.appendChild(o);
    wire(['saa-sensor', 'saa-pairs', 'saa-subjects'], () => safe(o, () => {
      show(SAA.spo2ArmsAccuracy({ sensor: val('saa-sensor'), pairs: val('saa-pairs'), subjects: val('saa-subjects') }, new Date()), o);
    }));
  },
  'pwv-carotid-femoral'(root) {
    selectField(root, 'Path length method', 'pwv-method', PWV.METHOD_OPTIONS);
    numField(root, '80% method: direct carotid-femoral distance (mm)', 'pwv-direct', '600');
    numField(root, 'Subtraction: sternal notch to femoral (mm)', 'pwv-nf', '');
    numField(root, 'Subtraction: sternal notch to carotid (mm)', 'pwv-nc', '');
    numField(root, 'Carotid-to-femoral transit time (ms)', 'pwv-tt', '60');
    tool(root, [['pwv-method', 'method'], ['pwv-direct', 'directMm'], ['pwv-nf', 'notchFemoralMm'], ['pwv-nc', 'notchCarotidMm'], ['pwv-tt', 'transitMs']], PWV.pwvCarotidFemoral);
  },
};
