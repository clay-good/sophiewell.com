// spec-v1546: renderer for imci-ors-plan (WHO IMCI ORS Plans A, B and C for a child under 5 with diarrhea;
// Medication & Infusion, Group F; spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as P from '../lib/imci-ors-plan-v1546.js';
import { resultRow } from '../lib/result-copy.js';

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
function numField(root, label, id, placeholder, max) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step: 'any', placeholder }));
  root.appendChild(wrap);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}

export const renderers = {
  'imci-ors-plan'(root) {
    const pairs = [['ors-plan', 'plan'], ['ors-age', 'age'], ['ors-weight', 'weight'], ['ors-sam', 'sam'], ['ors-route', 'route']];
    selectField(root, 'Plan', 'ors-plan', P.PLAN_OPTIONS);
    numField(root, 'Age in months', 'ors-age', 'e.g. 9', '59.9');
    numField(root, 'Weight in kg (needed for Plan C)', 'ors-weight', 'e.g. 8', '50');
    selectField(root, 'Severe acute malnutrition', 'ors-sam', P.SAM_OPTIONS);
    selectField(root, 'Plan C: what is possible here', 'ors-route', P.ROUTE_OPTIONS);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = P.imciOrsPlan(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Fluid', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
};
