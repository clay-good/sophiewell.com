// spec-v1414: renderer for blood-4h-window (Medication & Infusion, Group F).

import { el, clear } from '../lib/dom.js';
import * as BW from '../lib/blood-4h-window-v1414.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal', placeholder }));
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

export const renderers = {
  'blood-4h-window'(root) {
    note(root, 'Any blood component. Leave the minutes blank for a bag not yet spiked, and the rate blank for the slowest rate that finishes in time.');
    numField(root, 'Volume left in the bag (mL)', 'b4-vol', 'e.g. 300');
    numField(root, 'Minutes since the bag was spiked (optional)', 'b4-elapsed', 'e.g. 30');
    numField(root, 'Pump rate (mL/h, optional)', 'b4-rate', 'e.g. 100');
    const ids = ['b4-vol', 'b4-elapsed', 'b4-rate'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = BW.blood4hWindow({ volumeMl: val('b4-vol'), elapsedMin: val('b4-elapsed'), rateMlHr: val('b4-rate') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Rate', value: r.bandLabel },
      ]);
      list(o, r.steps);
      note(o, r.note);
    }));
  },
};
