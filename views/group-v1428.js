// spec-v1428: renderer for neer-distal-clavicle (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as ND from '../lib/neer-distal-clavicle-v1428.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const NA = '-- not entered --';

export const renderers = {
  'neer-distal-clavicle'(root) {
    note(root, 'From the shoulder radiographs: where the fracture sits against the coracoclavicular (conoid and trapezoid) ligaments.');
    selectField(root, 'Fracture pattern', 'dcl-pattern', ND.NDC_PATTERN, NA);
    selectField(root, 'Location against the coracoclavicular ligaments', 'dcl-location', ND.NDC_LOCATION, NA);
    selectField(root, 'Acromioclavicular joint', 'dcl-ac', ND.NDC_AC, NA);
    selectField(root, 'Skeletal maturity (optional)', 'dcl-skeleton', ND.NDC_SKELETON, NA);
    const ids = ['dcl-pattern', 'dcl-location', 'dcl-ac', 'dcl-skeleton'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = ND.neerDistalClavicle({ pattern: val('dcl-pattern'), location: val('dcl-location'), ac: val('dcl-ac'), skeleton: val('dcl-skeleton') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Modified Neer type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
