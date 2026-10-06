// spec-v1556: renderers for op-atropine-titration (Group J); scorpion-grade-india (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/op-atropine-titration-v1556.js';
import * as M1 from '../lib/scorpion-grade-india-v1556.js';
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
  'op-atropine-titration'(root) {
    const pairs = [['opa-adult', 'adult'], ['opa-last', 'last'], ['opa-total', 'total'], ['opa-hr', 'hr'], ['opa-sbp', 'sbp'], ['opa-chest', 'chest'], ['opa-improving', 'improving'], ['opa-pupils', 'pupils']];
    selectField(root, 'Adult', 'opa-adult', M0.YES_NO, true);
    numField(root, 'Last atropine bolus, mg', 'opa-last', 'e.g. 2', '100');
    numField(root, 'Total atropine given so far, mg', 'opa-total', 'e.g. 2', '2000');
    numField(root, 'Heart rate now, beats/min', 'opa-hr', 'e.g. 60', '250');
    numField(root, 'Systolic blood pressure now, mm Hg', 'opa-sbp', 'e.g. 78', '250');
    selectField(root, 'Chest', 'opa-chest', M0.CHEST_OPTIONS, true);
    selectField(root, 'Begun to improve since the last bolus', 'opa-improving', M0.YES_NO, false);
    selectField(root, 'Pupils', 'opa-pupils', M0.PUPIL_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.opAtropineTitration(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Eddleston', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'scorpion-grade-india'(root) {
    const pairs = [['sg-local', 'local'], ['sg-auto', 'autonomic'], ['sg-pulm', 'pulmonary'], ['sg-warm', 'warmShock']];
    selectField(root, 'Severe local pain, mild local swelling and sweating', 'sg-local', M1.YES_NO, false);
    selectField(root, 'Autonomic storm (vomiting, generalized sweating, drooling, slow or fast pulse, high or low BP, priapism)', 'sg-auto', M1.YES_NO, false);
    selectField(root, 'Pulmonary edema (breathing over 24, crackles) with cold extremities', 'sg-pulm', M1.YES_NO, false);
    selectField(root, 'Fast heart rate and low blood pressure with warm extremities', 'sg-warm', M1.YES_NO, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.scorpionGradeIndia(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Grade', value: r.bandLabel }]);
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
