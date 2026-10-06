// spec-v1559: renderers for who-anc-schedule (Group N); td-pregnancy-schedule (Group J); newborn-size-category (Group N); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/who-anc-schedule-v1559.js';
import * as M1 from '../lib/td-pregnancy-schedule-v1559.js';
import * as M2 from '../lib/newborn-size-category-v1559.js';
import * as M3 from '../lib/newborn-temperature-who-v1559.js';
import * as M4 from '../lib/newborn-hypoglycemia-who-v1559.js';
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
  'newborn-temperature-who'(root) {
    const pairs = [['nt2-temp', 'temp'], ['nt2-unit', 'unit'], ['nt2-site', 'site']];
    numField(root, 'Temperature', 'nt2-temp', 'e.g. 35.8', '110');
    selectField(root, 'Unit', 'nt2-unit', M3.UNIT_OPTIONS, false);
    selectField(root, 'Site', 'nt2-site', M3.SITE_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.newbornTemperatureWho(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 1997', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'newborn-hypoglycemia-who'(root) {
    const pairs = [['nh-pop', 'population'], ['nh-glu', 'glucose'], ['nh-unit', 'unit'], ['nh-weight', 'weight']];
    selectField(root, 'Baby', 'nh-pop', M4.POP_OPTIONS, true);
    numField(root, 'Blood glucose (leave blank if it cannot be measured)', 'nh-glu', 'e.g. 2.4', '900');
    selectField(root, 'Unit', 'nh-unit', M4.UNIT_OPTIONS, false);
    numField(root, 'Weight in kg (sick infant)', 'nh-weight', 'e.g. 3', '10');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M4.newbornHypoglycemiaWho(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO', value: r.bandLabel }]);
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
