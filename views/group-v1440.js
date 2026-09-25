// spec-v1440: renderer for strongkids (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as SK from '../lib/strongkids-v1440.js';
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

const NA = '-- not answered --';

export const renderers = {
  strongkids(root) {
    note(root, 'For a child admitted to hospital. Answer every item.');
    selectField(root, 'Poor nutritional status on clinical assessment (less fat or muscle, hollow face)', 'sk-clinical', SK.STRONGKIDS_YES_NO, NA);
    selectField(root, 'High risk disease or expected major surgery', 'sk-disease', SK.STRONGKIDS_YES_NO, NA);
    selectField(root, 'Reduced intake or losses (diarrhea, vomiting, pain, prior nutrition support)', 'sk-intake', SK.STRONGKIDS_YES_NO, NA);
    selectField(root, 'Weight loss, or no weight gain in an infant', 'sk-weight', SK.STRONGKIDS_YES_NO, NA);
    const ids = ['sk-clinical', 'sk-disease', 'sk-intake', 'sk-weight'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SK.strongkids({ clinical: val('sk-clinical'), disease: val('sk-disease'), intake: val('sk-intake'), weight: val('sk-weight') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'STRONGkids', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
