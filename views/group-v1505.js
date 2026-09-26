// spec-v1505: renderers for which-appeal-path.

import { el, clear } from '../lib/dom.js';
import * as AP from '../lib/appeal-path-v1505.js';
import * as BN from '../lib/benefits-v1505.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
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

export const renderers = {
  'which-appeal-path'(root) {
    const pairs = [['wap-cov', 'coverage'], ['wap-item', 'item']];
    selectField(root, 'Coverage type', 'wap-cov', AP.COVERAGE);
    selectField(root, 'What is being requested', 'wap-item', AP.ITEMS);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = AP.whichAppealPath(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Tool', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'bi-summary'(root) {
    const pairs = [['bi-allowed', 'allowed'], ['bi-n', 'perYear'], ['bi-n90', 'in90'], ['bi-ded', 'deductibleLeft'], ['bi-oop', 'oopLeft'], ['bi-kind', 'shareKind'], ['bi-share', 'share'], ['bi-pa', 'priorAuth'], ['bi-sp', 'specialtyPharmacy']];
    numField(root, 'Allowed amount per administration, dollars', 'bi-allowed', 'e.g. 4000', '10000000', '0.01');
    numField(root, 'Administrations in the plan year', 'bi-n', 'e.g. 13', '366', '1');
    numField(root, 'Administrations in the first 90 days (optional)', 'bi-n90', 'e.g. 4', '366', '1');
    numField(root, 'Deductible still to meet, dollars', 'bi-ded', 'e.g. 1500', '1000000', '0.01');
    numField(root, 'Out-of-pocket maximum still to meet, dollars', 'bi-oop', 'e.g. 5000', '1000000', '0.01');
    selectField(root, 'Coinsurance or copay', 'bi-kind', BN.SHARE_KINDS);
    numField(root, 'Coinsurance percent, or copay dollars', 'bi-share', 'e.g. 20', '1000000', '0.01');
    selectField(root, 'Prior authorization required? (optional)', 'bi-pa', BN.YES_NO);
    selectField(root, 'Specialty pharmacy required? (optional)', 'bi-sp', BN.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BN.biSummary(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Plan year', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'site-of-care-compare'(root) {
    const pairs = [['soc-n', 'perYear'], ['soc-ded', 'deductibleLeft'], ['soc-oop', 'oopLeft'], ['soc-name1', 'site1'], ['soc-allowed1', 'allowed1'], ['soc-kind1', 's1shareKind'], ['soc-share1', 's1share'], ['soc-name2', 'site2'], ['soc-allowed2', 'allowed2'], ['soc-kind2', 's2shareKind'], ['soc-share2', 's2share'], ['soc-name3', 'site3'], ['soc-allowed3', 'allowed3'], ['soc-kind3', 's3shareKind'], ['soc-share3', 's3share'], ['soc-name4', 'site4'], ['soc-allowed4', 'allowed4'], ['soc-kind4', 's4shareKind'], ['soc-share4', 's4share']];
    numField(root, 'Administrations in the plan year', 'soc-n', 'e.g. 6', '366', '1');
    numField(root, 'Deductible still to meet, dollars (optional)', 'soc-ded', 'e.g. 500', '1000000', '0.01');
    numField(root, 'Out-of-pocket maximum still to meet, dollars (optional)', 'soc-oop', 'e.g. 4000', '1000000', '0.01');
    textField(root, 'Site 1 name', 'soc-name1', 'e.g. Hospital outpatient');
    numField(root, 'Site 1 allowed amount per administration, dollars', 'soc-allowed1', 'e.g. 5200', '10000000', '0.01');
    selectField(root, 'Site 1: coinsurance or copay', 'soc-kind1', BN.SHARE_KINDS);
    numField(root, 'Site 1: coinsurance percent, or copay dollars', 'soc-share1', 'e.g. 20', '1000000', '0.01');
    textField(root, 'Site 2 name', 'soc-name2', 'e.g. Home infusion');
    numField(root, 'Site 2 allowed amount per administration, dollars', 'soc-allowed2', 'e.g. 5200', '10000000', '0.01');
    selectField(root, 'Site 2: coinsurance or copay', 'soc-kind2', BN.SHARE_KINDS);
    numField(root, 'Site 2: coinsurance percent, or copay dollars', 'soc-share2', 'e.g. 20', '1000000', '0.01');
    textField(root, 'Site 3 name (optional)', 'soc-name3', 'e.g. Home infusion');
    numField(root, 'Site 3 allowed amount per administration, dollars (optional)', 'soc-allowed3', 'e.g. 5200', '10000000', '0.01');
    selectField(root, 'Site 3: coinsurance or copay (optional)', 'soc-kind3', BN.SHARE_KINDS);
    numField(root, 'Site 3: coinsurance percent, or copay dollars (optional)', 'soc-share3', 'e.g. 20', '1000000', '0.01');
    textField(root, 'Site 4 name (optional)', 'soc-name4', 'e.g. Home infusion');
    numField(root, 'Site 4 allowed amount per administration, dollars (optional)', 'soc-allowed4', 'e.g. 5200', '10000000', '0.01');
    selectField(root, 'Site 4: coinsurance or copay (optional)', 'soc-kind4', BN.SHARE_KINDS);
    numField(root, 'Site 4: coinsurance percent, or copay dollars (optional)', 'soc-share4', 'e.g. 20', '1000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = BN.siteOfCareCompare(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Lowest cost', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
