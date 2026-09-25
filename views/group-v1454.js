// spec-v1454: renderer for powers-ratio (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as PW from '../lib/powers-ratio-v1454.js';
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
function numField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', min: '0', inputmode: 'decimal' }));
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
  'powers-ratio'(root) {
    note(root, 'Measured in the midsagittal plane of a lateral cervical spine radiograph or CT.');
    numField(root, 'Basion to the spinolaminar line of C1, BC (mm)', 'pwr-bc');
    numField(root, 'Opisthion to the posterior aspect of the anterior arch of C1, OA (mm)', 'pwr-oa');
    selectField(root, 'Measured on', 'pwr-modality', PW.POWERS_MODALITY, NA);
    numField(root, 'Basion-dens interval (mm, optional)', 'pwr-bdi');
    const ids = ['pwr-bc', 'pwr-oa', 'pwr-modality', 'pwr-bdi'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = PW.powersRatio({ bc: val('pwr-bc'), oa: val('pwr-oa'), modality: val('pwr-modality'), bdi: val('pwr-bdi') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Powers ratio (BC / OA)', value: r.ratio.toFixed(2) },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
