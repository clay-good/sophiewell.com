// spec-v1552: renderers for primaquine-single-low-dose (Group F); iptp-sp-schedule (Group F); smc-spaq-dose (Group F); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/primaquine-single-low-dose-v1552.js';
import * as M1 from '../lib/iptp-sp-schedule-v1552.js';
import * as M2 from '../lib/smc-spaq-dose-v1552.js';
import * as M3 from '../lib/vivax-radical-cure-v1552.js';
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
  'primaquine-single-low-dose'(root) {
    const pairs = [['pq-weight', 'weight'], ['pq-low', 'lowTransmission'], ['pq-preg', 'pregnant'], ['pq-infant', 'infant'], ['pq-bf', 'breastfeeding']];
    numField(root, 'Weight in kg', 'pq-weight', 'e.g. 30', '250');
    selectField(root, 'Low-transmission area', 'pq-low', M0.YES_NO, true);
    selectField(root, 'Pregnant', 'pq-preg', M0.YES_NO, true);
    selectField(root, 'Infant under 1 month', 'pq-infant', M0.YES_NO, true);
    selectField(root, 'Breastfeeding an infant under 1 month', 'pq-bf', M0.YES_NO, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.primaquineSingleLowDose(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2026', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'iptp-sp-schedule'(root) {
    const pairs = [['ip-weeks', 'weeks'], ['ip-days', 'days'], ['ip-contra', 'contra'], ['ip-prev', 'previous'], ['ip-since', 'since'], ['ip-folic', 'folic']];
    numField(root, 'Gestational age, completed weeks', 'ip-weeks', 'e.g. 24', '44');
    numField(root, 'Plus days (0-6)', 'ip-days', 'e.g. 3', '6');
    selectField(root, 'Contraindication', 'ip-contra', M1.CONTRA_OPTIONS, true);
    selectField(root, 'Previous IPTp dose', 'ip-prev', M1.PREVIOUS_OPTIONS, true);
    numField(root, 'Weeks since the last dose', 'ip-since', 'e.g. 5', '40');
    selectField(root, 'Folic acid', 'ip-folic', M1.FOLIC_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.iptpSpSchedule(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'IPTp', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'smc-spaq-dose'(root) {
    const pairs = [['smc-age', 'age'], ['smc-contra', 'contra'], ['smc-weight', 'weight']];
    numField(root, 'Age in months', 'smc-age', 'e.g. 24', '180');
    selectField(root, 'Contraindication', 'smc-contra', M2.CONTRA_OPTIONS, true);
    numField(root, 'Weight in kg (needed from 60 months)', 'smc-weight', 'e.g. 12', '80');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.smcSpaqDose(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'SMC', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'vivax-radical-cure'(root) {
    const pairs = [['vx-weight', 'weight'], ['vx-age', 'age'], ['vx-sex', 'sex'], ['vx-preg', 'pregnant'], ['vx-bf', 'bfInfant'], ['vx-test', 'test'], ['vx-result', 'result'], ['vx-blood', 'blood'], ['vx-sa', 'southAmerica']];
    numField(root, 'Weight in kg', 'vx-weight', 'e.g. 60', '250');
    numField(root, 'Age in years', 'vx-age', 'e.g. 30', '120');
    selectField(root, 'Sex', 'vx-sex', M3.SEX_OPTIONS, true);
    selectField(root, 'Pregnant', 'vx-preg', M3.YES_NO, false);
    selectField(root, 'Breastfeeding an infant under 1 month', 'vx-bf', M3.YES_NO, false);
    selectField(root, 'G6PD test', 'vx-test', M3.TEST_OPTIONS, true);
    selectField(root, 'G6PD result', 'vx-result', M3.RESULT_OPTIONS, false);
    selectField(root, 'Blood-stage treatment', 'vx-blood', M3.BLOOD_OPTIONS, true);
    selectField(root, 'In South America', 'vx-sa', M3.YES_NO, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.vivaxRadicalCure(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2026', value: r.bandLabel }]);
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
