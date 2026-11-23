// spec-v1772: herd-immunity-threshold. R0 is the one figure the tool needs; the vaccine's efficacy and the
// coverage reached are optional, and each adds a line to the answer rather than changing what it is about.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as H from '../lib/herd-immunity-v1772.js';

function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
const val = (id) => { const n = document.getElementById(id); return n ? n.value : ''; };

export const renderers = {
  'herd-immunity-threshold'(root) {
    numField(root, 'Basic reproduction number (R0)', 'hit-r0', 'e.g. 4');
    numField(root, 'Vaccine efficacy (%) (optional)', 'hit-eff', 'e.g. 95');
    numField(root, 'Coverage reached (% of the population) (optional)', 'hit-cov', 'e.g. 80');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const r = H.herdImmunityThreshold({ r0: val('hit-r0'), efficacy: val('hit-eff'), coverage: val('hit-cov') });
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band }, { label: 'Threshold', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) { note(o, err.message); }
    };
    for (const id of ['hit-r0', 'hit-eff', 'hit-cov']) {
      const n = document.getElementById(id);
      if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
    }
    run();
  },
};
