// spec-v1549: renderers for f75-feed-volume (Group N); f100-rutf-amount (Group N); sam-emergency-fluids (Group N); sam-weight-gain (Group N); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/f75-feed-volume-v1549.js';
import * as M1 from '../lib/f100-rutf-amount-v1549.js';
import * as M2 from '../lib/sam-emergency-fluids-v1549.js';
import * as M3 from '../lib/sam-weight-gain-v1549.js';
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
  'f75-feed-volume'(root) {
    const pairs = [['f75-weight', 'weight'], ['f75-interval', 'interval'], ['f75-edema', 'edema']];
    numField(root, 'Admission weight in kg', 'f75-weight', 'e.g. 7', '20');
    selectField(root, 'Feeding interval', 'f75-interval', M0.INTERVAL_OPTIONS, true);
    selectField(root, 'Severe (+++) edema', 'f75-edema', M0.YES_NO, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.f75FeedVolume(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'F-75', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'f100-rutf-amount'(root) {
    const pairs = [['fr-weight', 'weight'], ['fr-phase', 'phase'], ['fr-sachet', 'sachet']];
    numField(root, 'Weight in kg', 'fr-weight', 'e.g. 6', '40');
    selectField(root, 'Phase', 'fr-phase', M1.PHASE_OPTIONS, true);
    numField(root, 'RUTF sachet energy in kcal (500 if blank)', 'fr-sachet', 'e.g. 500', '1000');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.f100RutfAmount(args);
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
  'sam-emergency-fluids'(root) {
    const pairs = [['se-weight', 'weight'], ['se-scenario', 'scenario'], ['se-profuse', 'profuse'], ['se-conscious', 'conscious']];
    numField(root, 'Weight in kg', 'se-weight', 'e.g. 8', '40');
    selectField(root, 'Emergency', 'se-scenario', M2.SCENARIO_OPTIONS, true);
    selectField(root, 'Profuse watery diarrhea or suspected cholera (dehydration)', 'se-profuse', M2.YES_NO, false);
    selectField(root, 'Consciousness (low blood sugar)', 'se-conscious', M2.CONSCIOUS_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M2.samEmergencyFluids(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'WHO 2021', value: r.bandLabel }]);
        list(o, r.notes);
        note(o, r.note);
      } catch (err) {
        o.appendChild(el('p', { class: 'muted', text: err.message }));
      }
    };
    for (const [id] of pairs) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
    run();
  },
  'sam-weight-gain'(root) {
    const pairs = [['swg-prev', 'previous'], ['swg-cur', 'current'], ['swg-days', 'days'], ['swg-phase', 'phase']];
    numField(root, 'Previous weight in kg', 'swg-prev', 'e.g. 4.80', '40');
    numField(root, 'Current weight in kg', 'swg-cur', 'e.g. 4.85', '40');
    numField(root, 'Days between the weights', 'swg-days', 'e.g. 1', '60');
    selectField(root, 'Phase', 'swg-phase', M3.PHASE_OPTIONS, true);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M3.samWeightGain(args);
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
