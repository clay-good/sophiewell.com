// spec-v1452: renderer for pc-aspects (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page. Every region is a select, not a checkbox,
// so a region nobody has read stays blank and is asked for instead of counting as normal.

import { el, clear } from '../lib/dom.js';
import * as PC from '../lib/pc-aspects-v1452.js';
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
  'pc-aspects'(root) {
    note(root, 'Read each posterior circulation region on the baseline scan for early ischemic change. Every region must be marked either way.');
    selectField(root, 'Left thalamus (1 point)', 'pcas-lth', PC.PCAS_READ, NA);
    selectField(root, 'Right thalamus (1 point)', 'pcas-rth', PC.PCAS_READ, NA);
    selectField(root, 'Left cerebellar hemisphere (1 point)', 'pcas-lcb', PC.PCAS_READ, NA);
    selectField(root, 'Right cerebellar hemisphere (1 point)', 'pcas-rcb', PC.PCAS_READ, NA);
    selectField(root, 'Left PCA territory, occipital lobe (1 point)', 'pcas-lpca', PC.PCAS_READ, NA);
    selectField(root, 'Right PCA territory, occipital lobe (1 point)', 'pcas-rpca', PC.PCAS_READ, NA);
    selectField(root, 'Midbrain (2 points)', 'pcas-mid', PC.PCAS_READ, NA);
    selectField(root, 'Pons (2 points)', 'pcas-pons', PC.PCAS_READ, NA);
    const ids = ['pcas-lth', 'pcas-rth', 'pcas-lcb', 'pcas-rcb', 'pcas-lpca', 'pcas-rpca', 'pcas-mid', 'pcas-pons'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PC.pcAspects({
        leftThalamus: val('pcas-lth'), rightThalamus: val('pcas-rth'),
        leftCerebellum: val('pcas-lcb'), rightCerebellum: val('pcas-rcb'),
        leftPca: val('pcas-lpca'), rightPca: val('pcas-rpca'),
        midbrain: val('pcas-mid'), pons: val('pcas-pons'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'pc-ASPECTS', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
