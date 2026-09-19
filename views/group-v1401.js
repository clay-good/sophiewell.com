// spec-v1401: renderers for prevention after exposure and arrival screening (Infectious Disease,
// Group J): npep-2025, doxy-pep, strongyloides-presumptive.
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as NP from '../lib/npep-2025-v1401.js';
import * as DX from '../lib/doxy-pep-v1401.js';
import * as SG from '../lib/strongyloides-presumptive-v1401.js';
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
function answer(o, r, warn) {
  resultRow(o, [
    { text: r.band, cls: warn ? 'warn' : null },
    { label: 'Answer', value: r.bandLabel },
  ]);
}

const NA = '-- not entered --';

export const renderers = {
  'npep-2025'(root) {
    note(root, 'Answer each item; a blank is not assessed. The decision follows CDC 2025.');
    numField(root, 'Hours since the exposure', 'np-hours');
    selectField(root, 'How the exposure happened', 'np-route', NP.ROUTES, '-- choose --');
    selectField(root, 'Substantial risk: which fluid, onto or through what', 'np-risk', NP.RISK, NA);
    selectField(root, 'The source\'s HIV status', 'np-source', NP.SOURCES, '-- choose --');
    selectField(root, 'PrEP', 'np-prep', NP.PREP, '-- choose --');

    const ids = ['np-hours', 'np-route', 'np-risk', 'np-source', 'np-prep'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = NP.npep2025({ hours: val('np-hours'), route: val('np-route'), risk: val('np-risk'), source: val('np-source'), prep: val('np-prep') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.regimen);
      list(o, r.steps);
      note(o, r.whatsNew);
    }));
  },

  'doxy-pep'(root) {
    note(root, 'CDC 2024 recommendation for doxycycline after sex to prevent syphilis, chlamydia, and gonorrhea.');
    selectField(root, 'Population', 'dx-pop', DX.POPULATIONS, '-- choose --');
    selectField(root, 'Syphilis, chlamydia, or gonorrhea in the past 12 months', 'dx-sti', DX.YES_NO, NA);

    const ids = ['dx-pop', 'dx-sti'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = DX.doxyPep({ population: val('dx-pop'), recentSti: val('dx-sti') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.dose);
      list(o, r.monitoring);
    }));
  },

  'strongyloides-presumptive'(root) {
    note(root, 'For a newly arrived refugee or migrant, especially before corticosteroids. Follows CDC refugee health guidance (January 2025).');
    selectField(root, 'Where the person lived', 'sg-region', SG.REGIONS, '-- choose --');
    selectField(root, 'Overseas presumptive ivermectin documented', 'sg-overseas', SG.YES_NO, NA);
    selectField(root, 'Pregnant, or breastfeeding an infant under 1 week old', 'sg-pregnant', SG.YES_NO, NA);
    selectField(root, 'Corticosteroids or other immunosuppression planned', 'sg-steroids', SG.YES_NO, NA);
    numField(root, 'Weight (kg)', 'sg-weight');

    const ids = ['sg-region', 'sg-overseas', 'sg-pregnant', 'sg-steroids', 'sg-weight'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = SG.strongyloidesPresumptive({ region: val('sg-region'), overseas: val('sg-overseas'), pregnant: val('sg-pregnant'), steroids: val('sg-steroids'), weightKg: val('sg-weight') });
      if (!r.valid) { note(o, r.message); return; }
      answer(o, r, r.abnormal);
      note(o, r.steroidNote);
      note(o, r.drugNote);
    }));
  },
};
