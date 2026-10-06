// spec-v1560b: renderers for diphtheria-antitoxin-dose (Group J); enteric-fever-regimen (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/diphtheria-antitoxin-dose-v1560.js';
import * as M1 from '../lib/enteric-fever-regimen-v1560.js';
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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}

export const renderers = {
  'diphtheria-antitoxin-dose'(root) {
    const pairs = [['dat-site', 'site'], ['dat-duration', 'duration'], ['dat-neck', 'neck'], ['dat-severe', 'severe'], ['dat-weight', 'weight']];
    selectField(root, 'Site of disease', 'dat-site', M0.SITE_OPTIONS, true);
    selectField(root, 'Time since symptoms began', 'dat-duration', M0.DURATION_OPTIONS, true);
    selectField(root, 'Diffuse swelling of the neck', 'dat-neck', M0.YES_NO, true);
    selectField(root, 'Severe disease (breathing difficulty or shock)', 'dat-severe', M0.YES_NO, true);
    numField(root, 'Weight in kg (for the antibiotic)', 'dat-weight', 'e.g. 20', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.diphtheriaAntitoxinDose(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2024', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'enteric-fever-regimen'(root) {
    const pairs = [['ef-severity', 'severity'], ['ef-resistance', 'resistance'], ['ef-age', 'ageGroup'], ['ef-weight', 'weight']];
    selectField(root, 'Severity', 'ef-severity', M1.SEVERITY_OPTIONS, true);
    selectField(root, 'Local fluoroquinolone resistance risk', 'ef-resistance', M1.RESISTANCE_OPTIONS, true);
    selectField(root, 'Adult or child', 'ef-age', M1.AGE_OPTIONS, true);
    numField(root, 'Weight in kg (child)', 'ef-weight', 'e.g. 15', '120');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.entericFeverRegimen(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'AWaRe', value: r.bandLabel }]);
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
