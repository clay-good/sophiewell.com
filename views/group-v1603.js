// spec-v1603: renderers for ma-criteria-check.

import { el, clear } from '../lib/dom.js';
import * as MA from '../lib/ma-criteria-check.js';
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
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const STATUS = { met: 'Met', 'not-met': 'Not met', unknown: 'Not assessed' };

export const renderers = {
  'ma-criteria-check'(root) {
    const pairs = [['mac-benefit', 'benefit'], ['mac-denial', 'denial'], ['mac-source', 'source'], ['mac-medicare', 'medicareCriteria'], ['mac-posted', 'posted'], ['mac-evidence', 'evidence'], ['mac-reviewer', 'reviewer'], ['mac-course', 'course'], ['mac-days', 'days']];
    selectField(root, 'What was denied?', 'mac-benefit', MA.BENEFITS);
    selectField(root, 'The reason the denial gave', 'mac-denial', MA.DENIALS);
    selectField(root, 'Whose criteria does the denial cite?', 'mac-source', MA.SOURCES);
    selectField(root, 'Does an NCD, LCD or Medicare rule set the criteria for this service? (optional)', 'mac-medicare', MA.MEDICARE_CRITERIA);
    selectField(root, 'If the plan used its own criteria: are they posted publicly? (optional)', 'mac-posted', MA.YES_NO);
    selectField(root, 'If the plan used its own criteria: is a summary of their evidence posted? (optional)', 'mac-evidence', MA.YES_NO);
    selectField(root, 'Who reviewed the denial? (optional)', 'mac-reviewer', MA.REVIEWERS);
    selectField(root, 'Was this an ongoing treatment? (optional)', 'mac-course', MA.COURSES);
    numField(root, 'If you joined the plan during the treatment: days from joining to the denial (optional)', 'mac-days', 'e.g. 45', '3650', '1');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = MA.maCriteriaCheck(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Process', value: r.bandLabel }]);
      list(o, r.rows.map((x) => `${STATUS[x.status]}: ${x.text} (${x.rule})`));
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
