// spec-v1450: renderer for cognard-davf (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as CG from '../lib/cognard-davf-v1450.js';
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

const NA = '-- not assessed --';

export const renderers = {
  'cognard-davf'(root) {
    note(root, 'From the angiogram. Answer the questions for the drainage you choose.');
    selectField(root, 'Venous drainage', 'cog-drainage', CG.COGNARD_DRAINAGE, NA);
    selectField(root, 'If into a sinus: retrograde flow within the sinus', 'cog-sinus', CG.COGNARD_YES_NO, NA);
    selectField(root, 'If into a sinus: reflux into cortical veins', 'cog-cortical', CG.COGNARD_YES_NO, NA);
    selectField(root, 'If direct cortical: venous ectasia', 'cog-ectasia', CG.COGNARD_YES_NO, NA);
    const ids = ['cog-drainage', 'cog-sinus', 'cog-cortical', 'cog-ectasia'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = CG.cognardDavf({ drainage: val('cog-drainage'), sinusReflux: val('cog-sinus'), corticalReflux: val('cog-cortical'), ectasia: val('cog-ectasia') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Cognard type', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
