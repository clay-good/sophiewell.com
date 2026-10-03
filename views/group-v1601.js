// spec-v1601: renderers for preventive-cost-share-check and hsa-predeductible-check.

import { el, clear } from '../lib/dom.js';
import * as PC from '../lib/preventive-cost-share-check.js';
import * as HP from '../lib/hsa-predeductible-check.js';
import * as PO from '../lib/preventive-owed.js';
import { loadUspstf } from '../lib/uspstf-load.js';
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
function checkboxField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ` ${label}` }));
  return wrap;
}
function checked(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'preventive-cost-share-check'(root) {
    const pairs = [['pcs-plan', 'plan'], ['pcs-service', 'service'], ['pcs-network', 'network'], ['pcs-visit', 'visitSeparate'], ['pcs-purpose', 'primaryPurpose'], ['pcs-charged', 'charged']];
    selectField(root, 'Kind of plan', 'pcs-plan', PC.PLANS);
    selectField(root, 'What you were charged for', 'pcs-service', PC.SERVICES);
    selectField(root, 'Was the provider in network?', 'pcs-network', PC.NETWORK);
    selectField(root, 'Was an office visit billed separately? (optional)', 'pcs-visit', PC.YES_NO);
    selectField(root, 'Was the visit mainly for the preventive service? (optional)', 'pcs-purpose', PC.YES_NO);
    numField(root, 'Amount charged, dollars (optional)', 'pcs-charged', 'e.g. 350', '10000000', '0.01');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PC.preventiveCostShareCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Cost sharing', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  'hsa-predeductible-check'(root) {
    const pairs = [['hpd-item', 'item'], ['hpd-purpose', 'purpose'], ['hpd-year', 'planYear']];
    const boxes = [['hpd-chf', 'chf'], ['hpd-cad', 'cad'], ['hpd-heart', 'heart'], ['hpd-diabetes', 'diabetes'], ['hpd-hypertension', 'hypertension'], ['hpd-asthma', 'asthma'], ['hpd-osteoporosis', 'osteoporosis'], ['hpd-osteopenia', 'osteopenia'], ['hpd-liver', 'liver'], ['hpd-bleeding', 'bleeding'], ['hpd-depression', 'depression']];
    selectField(root, 'What the plan would cover before the deductible', 'hpd-item', HP.ITEMS);
    root.appendChild(el('p', { class: 'muted', text: 'Diagnosed conditions (for the chronic-condition list):' }));
    root.appendChild(checkboxField('Congestive heart failure', 'hpd-chf'));
    root.appendChild(checkboxField('Coronary artery disease', 'hpd-cad'));
    root.appendChild(checkboxField('Heart disease', 'hpd-heart'));
    root.appendChild(checkboxField('Diabetes', 'hpd-diabetes'));
    root.appendChild(checkboxField('Hypertension', 'hpd-hypertension'));
    root.appendChild(checkboxField('Asthma', 'hpd-asthma'));
    root.appendChild(checkboxField('Osteoporosis', 'hpd-osteoporosis'));
    root.appendChild(checkboxField('Osteopenia', 'hpd-osteopenia'));
    root.appendChild(checkboxField('Liver disease', 'hpd-liver'));
    root.appendChild(checkboxField('A bleeding disorder', 'hpd-bleeding'));
    root.appendChild(checkboxField('Depression', 'hpd-depression'));
    selectField(root, 'Prescribed to keep the condition from worsening or causing another? (optional)', 'hpd-purpose', HP.YES_NO);
    numField(root, 'Year the plan year begins (optional)', 'hpd-year', 'e.g. 2026', '2100', '1');
    const ids = [...pairs, ...boxes].map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      for (const [dom, arg] of boxes) args[arg] = checked(dom);
      const r = HP.hsaPredeductibleCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Before the deductible', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
  // spec-v1601 tool 1: the USPSTF A and B recommendations a plan must cover at $0, filtered to the person. The
  // descriptions are the USPSTF's own words, verbatim, each linked to its page.
  'preventive-owed'(root) {
    numField(root, 'Age in years', 'pow-age', 'e.g. 52', '120', '0.5');
    selectField(root, 'Sex at birth', 'pow-sex', PO.SEXES);
    selectField(root, 'Pregnant or postpartum?', 'pow-preg', PO.PREGNANCY);
    selectField(root, 'Coverage', 'pow-plan', PO.PLANS);
    const startWrap = el('p');
    startWrap.appendChild(el('label', { for: 'pow-start', text: 'The date your plan year starts (the recommendations in force then are the ones it must cover)' }));
    startWrap.appendChild(el('br'));
    startWrap.appendChild(el('input', { id: 'pow-start', type: 'date' }));
    root.appendChild(startWrap);
    const more = el('details', { class: 'note-more' });
    more.appendChild(el('summary', { text: 'Questions some recommendations turn on (answer what you know; a blank is never read as no)' }));
    for (const [id, q] of Object.entries(PO.RISKS)) selectField(more, q, `pow-risk-${id}`, PO.YES_NO);
    root.appendChild(more);
    const o = out();
    root.appendChild(o);
    let data = null;
    const section = (title, items, withQuestions) => {
      if (!items.length) return;
      o.appendChild(el('h3', { text: title }));
      const ul = el('ul');
      for (const r of items) {
        const li = el('li');
        li.appendChild(el('strong', { text: `${r.topic} (grade ${r.grade}, ${r.releasedLabel})` }));
        li.appendChild(el('br'));
        li.appendChild(document.createTextNode(r.description));
        li.appendChild(el('br'));
        li.appendChild(el('a', { href: r.url, target: '_blank', rel: 'noreferrer', text: 'The recommendation at uspreventiveservicestaskforce.org' }));
        if (withQuestions && r.questions.length) { const q = el('ul'); for (const t of r.questions) q.appendChild(el('li', { text: t })); li.appendChild(q); }
        ul.appendChild(li);
      }
      o.appendChild(ul);
    };
    const run = () => safe(o, () => {
      if (!data) { note(o, 'Loading the USPSTF list...'); return; }
      if (!data.records) { note(o, data.expired ? 'The bundled USPSTF list has passed its review date.' : 'The USPSTF list could not be loaded.'); return; }
      const risks = Object.fromEntries(Object.keys(PO.RISKS).map((id) => [id, val(`pow-risk-${id}`)]));
      const r = PO.preventiveOwed({ records: data.records, age: val('pow-age'), sex: val('pow-sex'), pregnancy: val('pow-preg'), plan: val('pow-plan'), planYearStart: val('pow-start'), risks });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: null }, { label: 'Owed at $0', value: r.owed.length.toLocaleString('en-US') }]);
      list(o, r.notes);
      section('Covered at $0 in network', r.owed, false);
      section('Depends on an answer', r.depends, true);
      section('Not yet required for this plan year', r.notYet, false);
      note(o, `${data.stamp} The descriptions are the USPSTF's own words, reproduced as its terms require.`);
    });
    loadUspstf().then((d) => { data = d; run(); });
    wire(['pow-age', 'pow-sex', 'pow-preg', 'pow-plan', 'pow-start', ...Object.keys(PO.RISKS).map((id) => `pow-risk-${id}`)], run);
  },
};
