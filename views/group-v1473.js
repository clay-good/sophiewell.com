// spec-v1473: renderer for glycemia-risk-index (Clinical Scoring & Risk, Group G).
//
// Every input is bounded 0 to 100 so the percentages the labels name are enforced on the page too.

import { el, clear } from '../lib/dom.js';
import * as GR from '../lib/glycemia-risk-index-v1473.js';
import { resultRow } from '../lib/result-copy.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', max: '100', inputmode: 'decimal', placeholder }));
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
  'glycemia-risk-index'(root) {
    numField(root, 'Time below 54 mg/dL (%)', 'gri-vlow', 'e.g. 1');
    numField(root, 'Time from 54 to 69 mg/dL (%)', 'gri-low', 'e.g. 3');
    numField(root, 'Time from 181 to 250 mg/dL (%)', 'gri-high', 'e.g. 22');
    numField(root, 'Time above 250 mg/dL (%)', 'gri-vhigh', 'e.g. 9');
    numField(root, 'Time from 70 to 180 mg/dL (%) (optional, checks the total)', 'gri-tir', 'e.g. 65');
    const ids = ['gri-vlow', 'gri-low', 'gri-high', 'gri-vhigh', 'gri-tir'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = GR.glycemiaRiskIndex({
        vlow: val('gri-vlow'), low: val('gri-low'), high: val('gri-high'), vhigh: val('gri-vhigh'), tir: val('gri-tir'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Glycemia Risk Index', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
