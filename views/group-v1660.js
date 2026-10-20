// spec-v1660: genetic counseling risk arithmetic.
// hardy-weinberg-carrier, residual-carrier-risk, recessive-couple-risk, x-linked-bayes-risk,
// coefficient-of-relationship, bayes-risk-table.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as HW from '../lib/hardy-weinberg-carrier-v1660.js';
import * as RES from '../lib/residual-carrier-risk-v1660.js';
import * as CR from '../lib/recessive-couple-risk-v1660.js';
import * as XL from '../lib/x-linked-bayes-risk-v1660.js';
import * as COR from '../lib/coefficient-of-relationship-v1660.js';
import * as BRT from '../lib/bayes-risk-table-v1660.js';

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
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function areaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
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
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'hardy-weinberg-carrier'(root) {
    selectField(root, 'Enter', 'hw-from', [{ value: 'incidence', text: 'Incidence of the condition (affected)' }, { value: 'allele', text: 'Allele frequency q' }]);
    textField(root, 'Incidence, as 1 in N, a fraction, a percent or a decimal', 'hw-incidence', '1 in 2500');
    textField(root, 'Allele frequency q', 'hw-allele', '0.02');
    tool(root, [['hw-from', 'from'], ['hw-incidence', 'incidence'], ['hw-allele', 'alleleFrequency']], HW.hardyWeinbergCarrier);
  },
  'residual-carrier-risk'(root) {
    textField(root, 'Prior carrier frequency (from the report)', 'res-cf', '1/58');
    textField(root, 'Detection rate of the test in that population', 'res-dr', '91%');
    tool(root, [['res-cf', 'carrierFrequency'], ['res-dr', 'detectionRate']], RES.residualCarrierRisk);
  },
  'recessive-couple-risk'(root) {
    textField(root, 'Partner A\'s carrier risk', 'cr-a', '1/25');
    textField(root, 'Partner B\'s carrier risk', 'cr-b', '1 in 634');
    tool(root, [['cr-a', 'riskA'], ['cr-b', 'riskB']], CR.recessiveCoupleRisk);
  },
  'x-linked-bayes-risk'(root) {
    textField(root, 'Prior carrier probability', 'xl-prior', '1/2');
    numField(root, 'Unaffected sons', 'xl-sons', 'e.g. 3');
    textField(root, 'A negative carrier test\'s detection rate (optional)', 'xl-dr', '');
    tool(root, [['xl-prior', 'prior'], ['xl-sons', 'unaffectedSons'], ['xl-dr', 'detectionRate']], XL.xLinkedBayesRisk);
  },
  'coefficient-of-relationship'(root) {
    selectField(root, 'Relationship', 'cor-rel', COR.RELATIONSHIP_OPTIONS);
    areaField(root, 'Own paths, one per common ancestor: generations from each partner', 'cor-paths', '2, 2');
    textField(root, 'Allele frequency of a recessive condition (optional)', 'cor-q', '0.01');
    tool(root, [['cor-rel', 'relationship'], ['cor-paths', 'paths'], ['cor-q', 'alleleFrequency']], COR.coefficientOfRelationship);
  },
  'bayes-risk-table'(root) {
    areaField(root, 'One hypothesis per line: name, prior, then a conditional per piece of evidence', 'brt-hyp', 'Carrier, 1/2, 1/8');
    selectField(root, 'Normalize priors that do not sum to 1', 'brt-norm', [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }]);
    tool(root, [['brt-hyp', 'hypotheses'], ['brt-norm', 'normalize']], BRT.bayesRiskTable);
  },
};
