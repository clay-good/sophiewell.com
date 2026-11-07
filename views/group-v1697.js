// spec-v1697: variant interpretation arithmetic.
// acmg-variant-classify, max-credible-allele-frequency.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as ACMG from '../lib/acmg-variant-classify-v1697.js';
import * as MAF from '../lib/max-credible-allele-frequency-v1697.js';

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
  wrap.appendChild(el('textarea', { id, rows: '5', placeholder }));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) {
  const n = document.getElementById(id);
  if (!n) return '';
  return n.type === 'checkbox' ? n.checked : n.value;
}
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
  'acmg-variant-classify'(root) {
    areaField(root, 'Evidence codes applied, one per line; add _Supporting, _Moderate, _Strong or _VeryStrong to change a strength', 'acmg-codes', 'PVS1\nPM2_Supporting');
    const ref = el('details');
    ref.appendChild(el('summary', { text: 'The 28 codes and their default strengths' }));
    const ul = el('ul');
    for (const c of ACMG.CODES) ul.appendChild(el('li', { text: `${c.code} (${c.weight === 'standAlone' ? 'stand-alone' : c.weight === 'veryStrong' ? 'very strong' : c.weight}): ${c.gist}` }));
    ref.appendChild(ul);
    root.appendChild(ref);
    textField(root, 'Prior probability of pathogenicity (blank uses 0.10)', 'acmg-prior', '0.10');
    checkField(root, 'A gene-specific specification allows a moderate benign weight', 'acmg-other');
    tool(root, [['acmg-codes', 'codes'], ['acmg-prior', 'prior'], ['acmg-other', 'otherBenignWeights']], ACMG.acmgVariantClassify);
  },
  'max-credible-allele-frequency'(root) {
    selectField(root, 'Inheritance', 'maf-mode', MAF.INHERITANCE_OPTIONS);
    textField(root, 'Disease prevalence, as 1 in N or a fraction', 'maf-prev', '1 in 500');
    textField(root, 'Maximum allelic contribution (the largest share of cases from one variant)', 'maf-allelic', '0.02');
    textField(root, 'Maximum genetic contribution (the share of cases from this gene; blank uses 1)', 'maf-genetic', '1');
    textField(root, 'Penetrance', 'maf-pen', '0.5');
    textField(root, 'Allele number (AN) in your population database (optional)', 'maf-an', '121412');
    textField(root, 'Allele count (AC) of the variant (optional)', 'maf-ac', '3');
    textField(root, 'Filtering allele frequency (FAF) of the variant (optional)', 'maf-faf', '5e-5');
    tool(root, [['maf-mode', 'inheritance'], ['maf-prev', 'prevalence'], ['maf-allelic', 'allelicContribution'], ['maf-genetic', 'geneticContribution'], ['maf-pen', 'penetrance'], ['maf-an', 'alleleNumber'], ['maf-ac', 'alleleCount'], ['maf-faf', 'filteringAf']], MAF.maxCredibleAlleleFrequency);
  },
};
