// spec-v1416: renderer for hvpg (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as HV from '../lib/hvpg-v1416.js';
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
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', placeholder }));
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
  hvpg(root) {
    numField(root, 'Wedged hepatic vein pressure (mmHg)', 'hv-whvp', 'e.g. 22');
    numField(root, 'Free hepatic vein pressure (mmHg)', 'hv-fhvp', 'e.g. 8');
    numField(root, 'IVC pressure at the hepatic vein ostium (mmHg, optional)', 'hv-ivc', 'e.g. 7');
    selectField(root, 'Cause of liver disease', 'hv-etiology', HV.HVPG_ETIOLOGIES, NA);
    selectField(root, 'Measured during acute variceal bleeding', 'hv-bleeding', HV.HVPG_YES_NO, NA);
    selectField(root, 'Signs of portal hypertension (varices, ascites, collaterals)', 'hv-signs', HV.HVPG_YES_NO, NA);
    const ids = ['hv-whvp', 'hv-fhvp', 'hv-ivc', 'hv-etiology', 'hv-bleeding', 'hv-signs'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HV.hvpg({ whvp: val('hv-whvp'), fhvp: val('hv-fhvp'), ivc: val('hv-ivc'), etiology: val('hv-etiology'), bleeding: val('hv-bleeding'), signs: val('hv-signs') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'HVPG', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
