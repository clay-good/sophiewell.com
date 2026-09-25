// spec-v1423: renderer for pires-interprosthetic (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as PI from '../lib/pires-interprosthetic-v1423.js';
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
  'pires-interprosthetic'(root) {
    note(root, 'A femur fracture between a hip arthroplasty stem and a knee arthroplasty femoral component on the same side.');
    selectField(root, 'Knee femoral component', 'pif-stem', PI.PIF_KNEE_STEM, NA);
    selectField(root, 'Fracture site', 'pif-nearer', PI.PIF_NEARER, NA);
    selectField(root, 'Hip stem fixation', 'pif-hip', PI.PIF_FIXATION, NA);
    selectField(root, 'Knee component fixation', 'pif-knee', PI.PIF_FIXATION, NA);
    selectField(root, 'Bone between the implants (stemmed knee only)', 'pif-bone', PI.PIF_BONE, NA);
    const ids = ['pif-stem', 'pif-nearer', 'pif-hip', 'pif-knee', 'pif-bone'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PI.piresInterprosthetic({ kneeStem: val('pif-stem'), nearer: val('pif-nearer'), hip: val('pif-hip'), knee: val('pif-knee'), bone: val('pif-bone') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Pires type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
