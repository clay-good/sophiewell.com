// spec-v1555: renderer for wbct20 (the 20-minute whole blood clotting test after a snakebite; Group I, EMS & Field Medicine; spec-v1540).

import { el, clear } from '../lib/dom.js';
import * as W from '../lib/wbct20-v1555.js';
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
  'wbct20'(root) {
    const pairs = [['wb-vessel', 'vessel'], ['wb-result', 'result'], ['wb-timing', 'timing'], ['wb-hours', 'hours'], ['wb-region', 'region']];
    selectField(root, 'Vessel the blood was tested in', 'wb-vessel', W.VESSEL_OPTIONS, true);
    selectField(root, 'Result after 20 minutes, tipped once', 'wb-result', W.RESULT_OPTIONS, true);
    selectField(root, 'When the test was done', 'wb-timing', W.TIMING_OPTIONS, true);
    numField(root, 'Hours since the antivenom loading dose (after antivenom)', 'wb-hours', 'e.g. 4', '72');
    selectField(root, 'Region', 'wb-region', W.REGION_OPTIONS, false);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    const run = () => {
      clear(o);
      try {
        const args = {};
        for (const [dom, arg] of pairs) args[arg] = val(dom);
        const r = W.wbct20(args);
        if (!r.valid) { note(o, r.message); return; }
        resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: '20WBCT', value: r.bandLabel }]);
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
