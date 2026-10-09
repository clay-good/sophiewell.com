// spec-v1564 §3: renderer for foodborne-trematode-treatment -- the WHO praziquantel or triclabendazole dose for a
// liver or lung fluke, by weight, for one person or for preventive chemotherapy (Group F); field-health program.

import { el, clear } from '../lib/dom.js';
import * as T from '../lib/foodborne-trematode-treatment-v1564.js';
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
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', inputmode: 'decimal', min: '0', max, step, placeholder }));
  root.appendChild(wrap);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'foodborne-trematode-treatment'(root) {
    const pairs = [['fbt-infection', 'infection'], ['fbt-use', 'use'], ['fbt-weight', 'weight'], ['fbt-age', 'age'], ['fbt-preg', 'pregnancy']];
    selectField(root, 'Infection', 'fbt-infection', T.INFECTIONS);
    selectField(root, 'Use', 'fbt-use', T.USES);
    numField(root, 'Weight, kg', 'fbt-weight', 'e.g. 25', '200', 'any');
    numField(root, 'Age in years', 'fbt-age', 'e.g. 9', '120', 'any');
    selectField(root, 'Pregnant or breastfeeding?', 'fbt-preg', T.PREGNANCY);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' }); root.appendChild(o);
    wire(pairs.map(([d]) => d), () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = T.foodborneTrematodeTreatment(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'WHO dose', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
