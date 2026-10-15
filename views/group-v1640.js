// spec-v1640: pharmacogenomics. What an FDA label states for a genotype or metabolizer status.
// siponimod-cyp2c9-dose, eliglustat-cyp2d6-dose, pgx-label-dose-limit, opioid-cyp2d6-pediatric-check;
// and from CPIC's tables (owner decision 12): pgx-diplotype-phenotype, cyp2d6-activity-score and
// cyp2d6-phenoconversion, cpic-gene-drug and pgx-panel-review; spec-v1635's dpyd-fluoropyrimidine-dose,
// tpmt-nudt15-thiopurine-dose and ugt1a1-irinotecan-label.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as SP from '../lib/siponimod-cyp2c9-dose-v1640.js';
import * as EG from '../lib/eliglustat-cyp2d6-dose-v1640.js';
import * as PL from '../lib/pgx-label-dose-limit-v1640.js';
import * as OC from '../lib/opioid-cyp2d6-pediatric-check-v1640.js';
import * as PD from '../lib/pgx-diplotype-phenotype-v1640.js';
import * as CA from '../lib/cyp2d6-activity-score-v1640.js';
import * as PC from '../lib/cyp2d6-phenoconversion-v1640.js';
import * as GD from '../lib/cpic-gene-drug-v1640.js';
import * as PR from '../lib/pgx-panel-review-v1640.js';
import * as DF from '../lib/dpyd-fluoropyrimidine-dose-v1635.js';
import * as TN from '../lib/tpmt-nudt15-thiopurine-dose-v1635.js';
import * as UI from '../lib/ugt1a1-irinotecan-label-v1635.js';
import { loadCpic } from '../lib/cpic-load.js';

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
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder: placeholder || '' }));
  root.appendChild(wrap);
  return wrap;
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder: placeholder || '' }));
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

// A tool that reads the CPIC tables: they load once, then every change recomputes.
function cpicTool(root, pairs, tables, compute, after) {
  const o = out(); root.appendChild(o);
  let db = null;
  const run = () => safe(o, () => {
    if (!db) { o.appendChild(el('p', { class: 'muted', text: 'Loading the CPIC tables.' })); return; }
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    const r = compute(args, db, new Date());
    show(r, o);
    if (after) after(r, o, db);
  });
  loadCpic(tables).then((d) => { db = d; }, () => { db = { manifest: null }; }).then(run);
  wire(pairs.map(([d]) => d), run);
}

export const renderers = {
  // spec-v1640 tools 1 to 3 (owner decision 12, October 15, 2026).
  'pgx-diplotype-phenotype'(root) {
    selectField(root, 'Gene', 'pdp-gene', PD.GENES);
    textField(root, 'First allele, as the report prints it', 'pdp-a1', 'e.g. *2');
    textField(root, 'Second allele (leave blank only for one G6PD copy or an MT-RNR1 variant)', 'pdp-a2', 'e.g. *17');
    cpicTool(root, [['pdp-gene', 'gene'], ['pdp-a1', 'allele1'], ['pdp-a2', 'allele2']], ['allele', 'rule', 'gene'], PD.pgxDiplotypePhenotype);
  },
  'cyp2d6-activity-score'(root) {
    textField(root, 'First CYP2D6 allele as reported (with its copy number or tandem, if any)', 'cas-a1', 'e.g. *1x2');
    textField(root, 'Second CYP2D6 allele as reported', 'cas-a2', 'e.g. *4');
    selectField(root, 'Duplication', 'cas-dup', CA.DUPLICATION);
    cpicTool(root, [['cas-a1', 'allele1'], ['cas-a2', 'allele2'], ['cas-dup', 'duplication']], ['allele', 'rule', 'gene'], CA.cyp2d6ActivityScore);
  },
  'cyp2d6-phenoconversion'(root) {
    const s = numField(root, 'CYP2D6 activity score from the genotype', 'cpc-score', 'e.g. 1.5').querySelector('input');
    s.setAttribute('step', '0.25');
    selectField(root, 'CYP2D6 inhibitor the patient takes', 'cpc-inhibitor', PC.STRENGTHS);
    tool(root, [['cpc-score', 'activityScore'], ['cpc-inhibitor', 'inhibitor']], PC.cyp2d6Phenoconversion);
  },
  // spec-v1640 tools 4 and 5. The drug list fills from the tables once they load.
  'cpic-gene-drug'(root) {
    const drug = textField(root, 'Drug', 'cgd-drug', 'generic, e.g. clopidogrel').querySelector('input');
    const dl = el('datalist', { id: 'cgd-drugs' }); drug.setAttribute('list', 'cgd-drugs'); root.appendChild(dl);
    textField(root, 'Population, where CPIC splits the drug (the result names the choices)', 'cgd-pop', '');
    textareaField(root, 'Results, one per line: gene, then the phenotype, activity score or HLA status as the report prints it', 'cgd-results', 'e.g. CYP2C19: Poor Metabolizer');
    let filled = false;
    cpicTool(root, [['cgd-drug', 'drug'], ['cgd-pop', 'population'], ['cgd-results', 'results']], ['rec', 'pair', 'guideline'], GD.cpicGeneDrug, (r, o, db) => {
      if (filled || !db.rec) return;
      filled = true;
      for (const d of GD.drugList(db)) dl.appendChild(el('option', { value: d }));
    });
  },
  'pgx-panel-review'(root) {
    textareaField(root, 'Results from the report, one per line: gene, then the phenotype, activity score or HLA status', 'pgr-results', 'e.g. CYP2C19: Poor Metabolizer').querySelector('textarea').setAttribute('data-private', '');
    cpicTool(root, [['pgr-results', 'results']], ['rec', 'pair', 'guideline'], PR.pgxPanelReview, (r, o) => {
      if (!r.valid || !r.found.length) return;
      const wrap = el('p');
      wrap.appendChild(el('label', { for: 'pgr-csv', text: 'The rows as CSV' }));
      wrap.appendChild(el('br'));
      const box = el('textarea', { id: 'pgr-csv', rows: '4', readonly: 'readonly' });
      box.value = r.csv;
      wrap.appendChild(box);
      o.appendChild(wrap);
    });
  },
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
  // spec-v1635 tools 16 to 18, on the same CPIC tables and label rows.
  'dpyd-fluoropyrimidine-dose'(root) {
    selectField(root, 'Drug', 'dfd-drug', DF.DRUGS);
    textareaField(root, 'DPYD variants as the report lists them, one per line ("Reference" for a copy with none found)', 'dfd-variants', 'e.g. c.1905+1G>A (*2A)');
    const sc = numField(root, 'Or the DPYD activity score the report prints (0 to 2)', 'dfd-score', '').querySelector('input');
    sc.setAttribute('step', '0.5'); sc.setAttribute('max', '2');
    cpicTool(root, [['dfd-drug', 'drug'], ['dfd-variants', 'variants'], ['dfd-score', 'activityScore']], ['allele', 'rule', 'gene', 'rec', 'pair', 'guideline'], DF.dpydFluoropyrimidineDose);
  },
  'tpmt-nudt15-thiopurine-dose'(root) {
    selectField(root, 'Drug', 'ttd-drug', TN.DRUGS);
    selectField(root, 'TPMT phenotype on the report', 'ttd-tpmt', TN.PHENOTYPES);
    selectField(root, 'NUDT15 phenotype on the report', 'ttd-nudt15', TN.PHENOTYPES);
    cpicTool(root, [['ttd-drug', 'drug'], ['ttd-tpmt', 'tpmt'], ['ttd-nudt15', 'nudt15']], ['rec', 'pair', 'guideline'], TN.tpmtNudt15ThiopurineDose);
  },
  'ugt1a1-irinotecan-label'(root) {
    selectField(root, 'UGT1A1 genotype on the report', 'uil-genotype', UI.GENOTYPES);
    tool(root, [['uil-genotype', 'genotype']], UI.ugt1a1IrinotecanLabel);
  },
  'opioid-cyp2d6-pediatric-check'(root) {
    selectField(root, 'Drug', 'ocp-drug', OC.DRUGS);
    numField(root, 'Age', 'ocp-age', 'years');
    selectField(root, 'Pain after tonsillectomy or adenoidectomy (ages 12 to 17)', 'ocp-procedure', OC.PROCEDURES);
    selectField(root, 'CYP2D6 metabolizer status (age 12 and over)', 'ocp-status', OC.STATUSES);
    numField(root, 'CYP2D6 activity score, if the report gives one (adds the CPIC row)', 'ocp-score', 'e.g. 1.0').querySelector('input').setAttribute('step', '0.25');
    cpicTool(root, [['ocp-drug', 'drug'], ['ocp-age', 'age'], ['ocp-procedure', 'procedure'], ['ocp-status', 'status'], ['ocp-score', 'activityScore']], ['rec', 'pair', 'guideline'], OC.opioidCyp2d6WithCpic);
  },
};
