// spec-v586: renderer for the up-to-seven (Metroticket) criteria. Group G. Sections are h2 (an h3 under the
// page h1 is a heading-level skip). Only the largest tumor's size is asked for, because only the largest
// enters the sum -- asking for every diameter would imply a burden calculation this criterion does not make
// (lib/up-to-seven-v586.js).
//
// Per spec-v11 section 5.3 this reports a criterion, never a listing decision, and never chooses between
// transplantation and the other treatments for hepatocellular carcinoma.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/up-to-seven-v586.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
  return wrap;
}
function select(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of [['', '--'], ['no', 'No'], ['yes', 'Yes']]) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'up-to-seven'(root) {
    note(root, `Within the criteria when the largest tumor’s size in centimeters PLUS the number of tumors is ${M.UP_TO_SEVEN_LIMIT} or less. The Milan criteria are reported alongside, because Milan is fully contained within Up-to-Seven.`);

    heading(root, 'Tumor burden');
    root.appendChild(number('Number of tumors', 'u7-count', '1'));
    root.appendChild(number('Diameter of the LARGEST tumor (cm)', 'u7-largest', 'any'));
    note(root, M.LARGEST_ONLY_NOTE);
    note(root, M.SUM_NOTE);

    heading(root, 'What can actually be assessed before transplant');
    root.appendChild(select('Gross (macro) vascular invasion', 'u7-gvi'));
    root.appendChild(select('Extrahepatic spread', 'u7-extra'));
    note(root, M.MVI_NOTE);

    const o = out(); root.appendChild(o);
    wire(['u7-count', 'u7-largest', 'u7-gvi', 'u7-extra'], () => safe(o, () => {
      const r = M.upToSeven({
        tumorCount: val('u7-count'), largestTumorCm: val('u7-largest'),
        grossVascularInvasion: val('u7-gvi'), extrahepaticSpread: val('u7-extra'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Sum', value: `${r.sum} of ${r.limit}` },
        { label: 'Up-to-seven', value: r.withinUpToSeven ? 'within' : 'beyond' },
        { label: 'Milan', value: r.withinMilan ? 'within' : 'outside' },
        { label: '5-year survival', value: r.fiveYearSurvivalPercent === null ? 'not reported for this group' : `${r.fiveYearSurvivalPercent}%` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));

    heading(root, 'What this does not cover');
    note(root, M.UCSF_NOTE);
    postureNote(root);
  },
};
