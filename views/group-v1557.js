// spec-v1557: renderer for who-rabies-pep (WHO 2018 rabies post-exposure prophylaxis; Group J; spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as R from '../lib/who-rabies-pep-v1557.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, required) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [{ value: '', text: required ? '— choose —' : '— not entered —' }, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
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
function dateField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'date' }));
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
  'who-rabies-pep'(root) {
    const pairs = [['rp-category', 'category'], ['rp-prior', 'prior'], ['rp-immuno', 'immuno'], ['rp-weight', 'weight'], ['rp-rig', 'rig'], ['rp-day0', 'day0']];
    selectField(root, 'WHO exposure category', 'rp-category', R.CATEGORY_OPTIONS, true);
    selectField(root, 'Rabies vaccination history', 'rp-prior', R.PRIOR_OPTIONS, true);
    selectField(root, 'Immunocompromised (for example HIV not on treatment)', 'rp-immuno', R.YES_NO, true);
    numField(root, 'Weight in kg (for the RIG ceiling)', 'rp-weight', 'e.g. 20', '250');
    selectField(root, 'RIG available', 'rp-rig', R.RIG_OPTIONS, false);
    dateField(root, 'Date of the first vaccine dose (day 0)', 'rp-day0');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = R.whoRabiesPep(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2018', value: r.bandLabel }]);
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
