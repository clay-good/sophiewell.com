// spec-v1561: renderers for leprosy-classify-mdt (Group J); leprosy-pep-rifampicin (Group J); field-health program, spec-v1540.

import { el, clear } from '../lib/dom.js';
import * as M0 from '../lib/leprosy-classify-mdt-v1561.js';
import * as M1 from '../lib/leprosy-pep-rifampicin-v1561.js';
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
  'leprosy-classify-mdt'(root) {
    const pairs = [['lep-lesions', 'lesions'], ['lep-nerve', 'nerve'], ['lep-smear', 'smear'], ['lep-age', 'age'], ['lep-weight', 'weight']];
    numField(root, 'Number of skin lesions', 'lep-lesions', 'e.g. 3', '100');
    selectField(root, 'Nerve involvement', 'lep-nerve', M0.NERVE_OPTIONS, false);
    selectField(root, 'Skin smear', 'lep-smear', M0.SMEAR_OPTIONS, false);
    numField(root, 'Age in years', 'lep-age', 'e.g. 30', '120');
    numField(root, 'Weight in kg (needed under 10 years or under 40 kg)', 'lep-weight', 'e.g. 30', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M0.leprosyClassifyMdt(args);
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
  'leprosy-pep-rifampicin'(root) {
    const pairs = [['sdr-age', 'age'], ['sdr-weight', 'weight']];
    numField(root, 'Age in years', 'sdr-age', 'e.g. 7', '120');
    numField(root, 'Weight in kg', 'sdr-weight', 'e.g. 22', '250');
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = M1.leprosyPepRifampicin(args);
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
