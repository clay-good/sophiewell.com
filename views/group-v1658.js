// spec-v1658: laboratory quality control and proficiency-testing arithmetic.
// levey-jennings-limits, clia-pt-acceptance, pt-event-score, calibration-verification,
// turnaround-time-percentile.

import { el, clear } from '../lib/dom.js';
import { resultRow } from '../lib/result-copy.js';
import * as LJ from '../lib/levey-jennings-limits-v1658.js';
import * as CLIA from '../lib/clia-pt-acceptance-v1658.js';
import * as PTE from '../lib/pt-event-score-v1658.js';
import * as CAL from '../lib/calibration-verification-v1658.js';
import * as TAT from '../lib/turnaround-time-percentile-v1658.js';

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
  'levey-jennings-limits'(root) {
    areaField(root, 'Control results, one per line (a date or run label and a comma first is allowed)', 'lj-results', '98\n100\n102');
    numField(root, 'The laboratory\'s minimum count for setting limits (optional)', 'lj-min', 'e.g. 20');
    tool(root, [['lj-results', 'results'], ['lj-min', 'minimumCount']], LJ.leveyJenningsLimits);
  },
  'clia-pt-acceptance'(root) {
    selectField(root, 'Analyte', 'clia-analyte', CLIA.ANALYTES.map((a) => ({ value: a[0], text: a[1] })));
    numField(root, 'Program\'s target value', 'clia-target', 'e.g. 1.0');
    numField(root, 'Laboratory\'s response', 'clia-response', 'e.g. 1.15');
    numField(root, 'Program\'s SD (white cell differential only)', 'clia-sd', '');
    numField(root, 'Decision level, for the limit as a percent (optional)', 'clia-decision', '');
    tool(root, [['clia-analyte', 'analyte'], ['clia-target', 'target'], ['clia-response', 'response'], ['clia-sd', 'sd'], ['clia-decision', 'decisionLevel']], CLIA.cliaPtAcceptance);
  },
  'pt-event-score'(root) {
    areaField(root, 'One analyte per line: name, acceptable responses, challenges', 'pte-analytes', 'Glucose, 4, 5');
    selectField(root, 'Previous event, overall', 'pte-prev', PTE.HISTORY);
    selectField(root, 'The event before that, overall', 'pte-prev2', PTE.HISTORY);
    tool(root, [['pte-analytes', 'analytes'], ['pte-prev', 'previousEvent'], ['pte-prev2', 'eventBeforeThat']], PTE.ptEventScore);
  },
  'calibration-verification'(root) {
    areaField(root, 'One level per line: assigned value, measured value', 'cal-levels', '10, 10.2');
    numField(root, 'Laboratory\'s acceptable recovery limit (± %)', 'cal-limit', 'e.g. 3');
    numField(root, 'Reportable range, low end (optional)', 'cal-low', '');
    numField(root, 'Reportable range, high end (optional)', 'cal-high', '');
    tool(root, [['cal-levels', 'levels'], ['cal-limit', 'limitPct'], ['cal-low', 'rangeLow'], ['cal-high', 'rangeHigh']], CAL.calibrationVerification);
  },
  'turnaround-time-percentile'(root) {
    areaField(root, 'Turnaround times in minutes, one per line', 'tat-minutes', '42');
    numField(root, 'Percentile (default 90)', 'tat-pct', '90');
    numField(root, 'The laboratory\'s target in minutes (optional)', 'tat-target', '');
    tool(root, [['tat-minutes', 'minutes'], ['tat-pct', 'percentile'], ['tat-target', 'target']], TAT.turnaroundTimePercentile);
  },
};
