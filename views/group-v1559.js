// spec-v1559: renderers for who-anc-schedule (Group N); td-pregnancy-schedule (Group J); newborn-size-category (Group N); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/who-anc-schedule-v1559.js';
import * as M1 from '../lib/td-pregnancy-schedule-v1559.js';
import * as M2 from '../lib/newborn-size-category-v1559.js';
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
  'who-anc-schedule'(root) {
    const pairs = [['anc-weeks', 'weeks'], ['anc-days', 'days']];
    numField(root, 'Gestational age, completed weeks', 'anc-weeks', 'e.g. 22', '44');
    numField(root, 'Plus days (0-6)', 'anc-days', 'e.g. 3', '6');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.whoAncSchedule(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2016', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'td-pregnancy-schedule'(root) {
    const pairs = [['tdp-history', 'history'], ['tdp-adult', 'adultDoses'], ['tdp-weeks', 'weeks']];
    selectField(root, 'Documented tetanus vaccination', 'tdp-history', M1.HISTORY_OPTIONS, true);
    numField(root, 'Adolescent or adult Td doses (if that history)', 'tdp-adult', 'e.g. 2', '5');
    numField(root, 'Gestational age in weeks', 'tdp-weeks', 'e.g. 20', '44');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.tdPregnancySchedule(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2017', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'newborn-size-category'(root) {
    const pairs = [['nsc-weight', 'weight'], ['nsc-weeks', 'weeks'], ['nsc-days', 'days']];
    numField(root, 'Birth weight in grams', 'nsc-weight', 'e.g. 2200', '6000');
    numField(root, 'Gestational age at birth, completed weeks', 'nsc-weeks', 'e.g. 35', '45');
    numField(root, 'Plus days (0-6)', 'nsc-days', 'e.g. 4', '6');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.newbornSizeCategory(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2022', value: r.bandLabel }]);
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
