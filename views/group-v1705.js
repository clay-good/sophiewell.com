// spec-v1705: biosignal-analysis tools 3 and 4. hrv-frequency-domain, eeg-band-power (on lib/dsp.js).

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import { plot } from '../lib/components.js';
import * as HFD from '../lib/hrv-frequency-domain-v1705.js';
import * as EBP from '../lib/eeg-band-power-v1705.js';

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

const DELTA = [{ value: '0.5', text: '0.5 Hz (for practical purposes)' }, { value: '0.1', text: '0.1 Hz (the glossary\'s edge)' }];

export const renderers = {
  'hrv-frequency-domain'(root) {
    selectField(root, 'Recording', 'hfd-type', HFD.TYPE_OPTIONS);
    areaField(root, 'RR (NN) intervals in milliseconds, one per line or separated by commas (at least 96 seconds)', 'hfd-rr', '');
    tool(root, [['hfd-type', 'recording'], ['hfd-rr', 'intervals']], HFD.hrvFrequencyDomain, (r) => plot({
      title: 'RR interval power spectrum', xLabel: 'frequency (Hz)', yLabel: 'power (ms² per Hz)',
      series: [{ label: 'Spectrum', points: r.curve.map((c) => [c.f, c.p]) }],
      table: { headers: ['Frequency (Hz)', 'Power (ms² per Hz)'], rows: r.curve.filter((_, i) => i % 4 === 0).map((c) => [c.f, c.p]) },
    }));
  },
  'eeg-band-power'(root) {
    numField(root, 'Sampling rate (samples per second)', 'ebp-fs', '256');
    areaField(root, 'Samples of one channel, one per line or separated by commas', 'ebp-x', '');
    numField(root, 'Analysis window (seconds; blank: 2)', 'ebp-seg', '');
    selectField(root, 'Lower edge of delta', 'ebp-delta', DELTA);
    tool(root, [['ebp-fs', 'samplingRate'], ['ebp-x', 'samples'], ['ebp-seg', 'segmentSeconds'], ['ebp-delta', 'deltaFrom']], EBP.eegBandPower, (r) => plot({
      title: 'EEG power spectrum', xLabel: 'frequency (Hz)', yLabel: 'power per Hz',
      series: [{ label: 'Spectrum', points: r.curve.map((c) => [c.f, c.p]) }],
      table: { headers: ['Frequency (Hz)', 'Power per Hz'], rows: r.curve.filter((_, i) => i % 10 === 0).map((c) => [c.f, c.p]) },
    }));
  },
};
