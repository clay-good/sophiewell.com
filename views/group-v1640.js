// spec-v1640: pharmacogenomics. What an FDA label states for a genotype or metabolizer status.
// siponimod-cyp2c9-dose, eliglustat-cyp2d6-dose, pgx-label-dose-limit, opioid-cyp2d6-pediatric-check.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as SP from '../lib/siponimod-cyp2c9-dose-v1640.js';
import * as EG from '../lib/eliglustat-cyp2d6-dose-v1640.js';
import * as PL from '../lib/pgx-label-dose-limit-v1640.js';
import * as OC from '../lib/opioid-cyp2d6-pediatric-check-v1640.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
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
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
// The result, its notes, then a link to each label read.
function show(r, o) {
  if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.message })); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  for (const l of r.labelLinks || []) { const p = el('p'); p.appendChild(el('a', { href: l.url, target: '_blank', rel: 'noreferrer', text: l.text })); o.appendChild(p); }
}
function tool(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args, new Date()), o);
  }));
}

export const renderers = {
  'siponimod-cyp2c9-dose'(root) {
    selectField(root, 'CYP2C9 genotype on the report', 'sip-genotype', SP.GENOTYPES);
    tool(root, [['sip-genotype', 'genotype']], SP.siponimodCyp2c9Dose);
  },
  'eliglustat-cyp2d6-dose'(root) {
    selectField(root, 'CYP2D6 metabolizer status', 'elg-status', EG.STATUSES);
    selectField(root, 'Hepatic impairment', 'elg-hepatic', EG.HEPATIC);
    selectField(root, 'Renal function', 'elg-renal', EG.RENAL);
    selectField(root, 'Concomitant CYP2D6 inhibitor', 'elg-2d6', EG.STRENGTHS);
    selectField(root, 'Concomitant CYP3A inhibitor', 'elg-3a', EG.STRENGTHS);
    tool(root, [['elg-status', 'status'], ['elg-hepatic', 'hepatic'], ['elg-renal', 'renal'], ['elg-2d6', 'cyp2d6Inhibitor'], ['elg-3a', 'cyp3aInhibitor']], EG.eliglustatCyp2d6Dose);
  },
  'pgx-label-dose-limit'(root) {
    selectField(root, 'Drug', 'pld-drug', PL.DRUGS);
    selectField(root, 'Metabolizer status on the report', 'pld-status', PL.STATUSES);
    numField(root, 'Planned daily dose (ceiling rows)', 'pld-daily', 'mg');
    numField(root, 'Single dose (tetrabenazine; iloperidone twice daily)', 'pld-single', 'mg');
    numField(root, 'Usual dose (aripiprazole, brexpiprazole, celecoxib)', 'pld-usual', 'mg');
    selectField(root, 'Adult or child (pimozide, pitolisant)', 'pld-population', PL.POPULATIONS);
    numField(root, 'Weight of a child (pimozide, pitolisant)', 'pld-weight', 'kg');
    selectField(root, 'Use (aripiprazole, iloperidone, celecoxib)', 'pld-indication', PL.INDICATIONS);
    selectField(root, 'CYP3A4 inhibitor (aripiprazole, brexpiprazole)', 'pld-3a4', PL.CYP3A4);
    numField(root, 'Days since the last dose increase (pimozide)', 'pld-days', 'days');
    tool(root, [['pld-drug', 'drug'], ['pld-status', 'status'], ['pld-daily', 'dailyDose'], ['pld-single', 'singleDose'], ['pld-usual', 'usualDose'], ['pld-population', 'population'], ['pld-weight', 'weight'], ['pld-indication', 'indication'], ['pld-3a4', 'cyp3a4Inhibitor'], ['pld-days', 'daysSinceIncrease']], PL.pgxLabelDoseLimit);
  },
  'opioid-cyp2d6-pediatric-check'(root) {
    selectField(root, 'Drug', 'ocp-drug', OC.DRUGS);
    numField(root, 'Age', 'ocp-age', 'years');
    selectField(root, 'Pain after tonsillectomy or adenoidectomy (ages 12 to 17)', 'ocp-procedure', OC.PROCEDURES);
    selectField(root, 'CYP2D6 metabolizer status (age 12 and over)', 'ocp-status', OC.STATUSES);
    tool(root, [['ocp-drug', 'drug'], ['ocp-age', 'age'], ['ocp-procedure', 'procedure'], ['ocp-status', 'status']], OC.opioidCyp2d6PediatricCheck);
  },
};
