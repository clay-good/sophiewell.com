// spec-v1399: renderers for ED throughput and discharge (Workflow & Documentation, Group H):
// ca-apot-calculator, ca-homeless-discharge-1262-5.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as APOT from '../lib/ca-apot-calculator-v1399.js';
import * as HD from '../lib/ca-homeless-discharge-1262-5-v1399.js';
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
function inputField(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
  root.appendChild(wrap);
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '6', autocomplete: 'off', placeholder }));
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
function answer(o, r, warn) {
  resultRow(o, [
    { text: r.band, cls: warn ? 'warn' : null },
    { label: 'Answer', value: r.bandLabel },
  ]);
}

const NA = '-- not documented --';

export const renderers = {
  'ca-apot-calculator'(root) {
    note(root, 'California. One offload per line: ambulance arrival, then transfer of care. Paste from a spreadsheet or type.');
    textareaField(root, 'Offloads (arrival, transfer of care)', 'apot-rows', '14:05, 14:32');

    const ids = ['apot-rows'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = APOT.caApotCalculator({ rows: val('apot-rows') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.methodNote);
      note(o, r.wrapNote);
      if (r.excluded.length) { note(o, `Excluded (${r.excluded.length}):`); list(o, r.excluded); }
    }));
  },

  'ca-homeless-discharge-1262-5'(root) {
    note(root, 'California. Mark each item; one left blank is not documented, never done.');
    selectField(root, '(n)(4) A postdischarge destination identified (or a transfer to a licensed facility)', 'hd-destination', HD.STATUS, NA);
    selectField(root, '(o)(1) The physician\'s clinical-stability determination, and postdischarge needs explained', 'hd-stability', HD.STATUS, NA);
    selectField(root, '(o)(2) A meal offered', 'hd-meal', HD.STATUS, NA);
    selectField(root, '(o)(3) Weather-appropriate clothing offered', 'hd-clothing', HD.STATUS, NA);
    selectField(root, '(o)(4) Referral to follow-up care', 'hd-follow-up', HD.STATUS, NA);
    selectField(root, '(o)(5) A prescription, and medication from an onsite outpatient pharmacy', 'hd-medication', HD.STATUS, NA);
    selectField(root, '(o)(6) Infectious disease screening offered or referred', 'hd-infection', HD.STATUS, NA);
    selectField(root, '(o)(7) Vaccinations offered', 'hd-vaccines', HD.STATUS, NA);
    selectField(root, '(o)(8) Medical screening exam, and behavioral health follow-up if indicated', 'hd-screening', HD.STATUS, NA);
    selectField(root, '(o)(9) Coverage screening and enrollment help', 'hd-coverage', HD.STATUS, NA);
    selectField(root, '(o)(10) Transportation offered to a destination within 30 minutes or 30 miles', 'hd-transport', HD.STATUS, NA);

    const ids = ['hd-destination', 'hd-stability', 'hd-meal', 'hd-clothing', 'hd-follow-up', 'hd-medication', 'hd-infection', 'hd-vaccines', 'hd-screening', 'hd-coverage', 'hd-transport'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = HD.caHomelessDischarge12625({ destination: val('hd-destination'), stability: val('hd-stability'), meal: val('hd-meal'), clothing: val('hd-clothing'), followUp: val('hd-follow-up'), medication: val('hd-medication'), infection: val('hd-infection'), vaccines: val('hd-vaccines'), screening: val('hd-screening'), coverage: val('hd-coverage'), transport: val('hd-transport') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      list(o, r.lines);
      note(o, r.policyNote);
      note(o, r.postureNote);
    }));
  },
};
