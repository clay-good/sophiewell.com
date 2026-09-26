// spec-v1509: renderers for 340b-entity-eligibility, 340b-orphan-exclusion, 340b-patient-check, 340b-duplicate-discount, 340b-ceiling-price.

import { el, clear } from '../lib/dom.js';
import * as E3 from '../lib/entity-340b-v1509.js';
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
function dateInput(root, label, id, type) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type }));
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
  '340b-entity-eligibility'(root) {
    const pairs = [['e3-type', 'type'], ['e3-own', 'ownership'], ['e3-pct', 'dshPercent'], ['e3-pickle', 'pickle'], ['e3-gpo', 'usesGpo']];
    selectField(root, 'Hospital type', 'e3-type', E3.HOSPITAL_TYPES);
    selectField(root, 'Ownership or government contract', 'e3-own', E3.OWNERSHIP);
    numField(root, 'Disproportionate share adjustment percentage (not needed for a critical access hospital)', 'e3-pct', 'e.g. 14.2', '100', '0.01');
    selectField(root, 'Described in Social Security Act 1886(d)(5)(F)(i)(II)? (optional)', 'e3-pickle', E3.YES_NO);
    selectField(root, 'Buys covered outpatient drugs through a group purchasing organization?', 'e3-gpo', E3.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = E3.entityEligibility340b(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: '340B', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  '340b-orphan-exclusion'(root) {
    const pairs = [['oe-type', 'type'], ['oe-orphan', 'orphan']];
    selectField(root, 'Covered entity type', 'oe-type', E3.ORPHAN_ENTITY_TYPES);
    selectField(root, 'Does the drug have an FDA orphan designation?', 'oe-orphan', E3.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = E3.orphanExclusion340b(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Orphan drug', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  '340b-patient-check'(root) {
    const pairs = [['pc3-entity', 'entity'], ['pc3-records', 'records'], ['pc3-provider', 'provider'], ['pc3-scope', 'scope'], ['pc3-disp', 'dispensingOnly']];
    selectField(root, 'Covered entity kind', 'pc3-entity', E3.ENTITY_KINDS);
    selectField(root, 'Does the entity keep the person\'s health care records?', 'pc3-records', E3.YES_NO);
    selectField(root, 'Is the prescriber employed by the entity, or under a contract or referral that keeps responsibility for the care with it?', 'pc3-provider', E3.YES_NO);
    selectField(root, 'Grantees only: is the care within the scope of the grant?', 'pc3-scope', E3.YES_NO);
    selectField(root, 'Is dispensing the only service the entity provides the person?', 'pc3-disp', E3.YES_NO);
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = E3.patientCheck340b(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Patient', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  '340b-duplicate-discount'(root) {
    const pairs = [['dd-payer', 'payer'], ['dd-mef', 'mef'], ['dd-change', 'changeApproved'], ['dd-state', 'stateRule'], ['dd-dos', 'serviceDate']];
    selectField(root, 'Payer', 'dd-payer', E3.PAYERS_340B);
    selectField(root, 'Medicaid Exclusion File status (Medicaid fee-for-service only)', 'dd-mef', E3.MEF_STATUS);
    dateInput(root, 'Date a carve-in or carve-out change was approved (optional)', 'dd-change', 'date');
    textField(root, 'The state\'s 340B identifier rule for Medicaid managed care (optional)', 'dd-state', 'e.g. UD modifier');
    dateInput(root, 'Date of service (optional)', 'dd-dos', 'date');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = E3.duplicateDiscount340b(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Rule', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  '340b-ceiling-price'(root) {
    const pairs = [['cp3-cat', 'category'], ['cp3-amp', 'amp'], ['cp3-bp', 'bestPrice'], ['cp3-bamp', 'baselineAmp'], ['cp3-bcpi', 'baselineCpi'], ['cp3-ccpi', 'currentCpi'], ['cp3-year', 'year'], ['cp3-units', 'unitsPerPackage']];
    selectField(root, 'Drug category', 'cp3-cat', E3.DRUG_CATEGORIES);
    numField(root, 'Average manufacturer price per unit, prior quarter, dollars', 'cp3-amp', 'e.g. 10', '10000000', '0.000001');
    numField(root, 'Best price per unit (brand drugs; optional)', 'cp3-bp', 'e.g. 8.5', '10000000', '0.000001');
    numField(root, 'Baseline AMP per unit (optional)', 'cp3-bamp', 'e.g. 4', '10000000', '0.000001');
    numField(root, 'Baseline CPI-U (optional)', 'cp3-bcpi', 'e.g. 200', '10000', '0.001');
    numField(root, 'CPI-U for the month before the quarter (optional)', 'cp3-ccpi', 'e.g. 320', '10000', '0.001');
    numField(root, 'Year of the rebate quarter (optional)', 'cp3-year', 'e.g. 2026', '2100', '1');
    numField(root, 'Units per package (optional)', 'cp3-units', 'e.g. 30', '1000000', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = E3.ceilingPrice340b(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Ceiling', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
