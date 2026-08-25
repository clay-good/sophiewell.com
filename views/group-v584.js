// spec-v584: renderer for the EBMT (Gratwohl) risk score. Group G. Sections are h2 (an h3 under the page h1
// is a heading-level skip). The first-CR question is asked before the interval, because a yes answer means
// the interval is never used (lib/ebmt-score-v584.js).
//
// Per spec-v11 section 5.3 this is a group-level pre-transplant estimate; it never decides whether to
// transplant, never selects a donor or a regimen, and a high score is never presented as a reason to
// withhold transplantation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/ebmt-score-v584.js';
import { resultRow } from '../lib/result-copy.js';

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any' }));
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
const opts = (list) => [['', '--'], ...list.map((i) => [i.value, `${i.text} — ${i.points}`])];

export const renderers = {
  'ebmt-score'(root) {
    note(root, 'Five pre-transplant factors, 0 to 7. This scores the disease and the transplant; the HCT-CI on this site scores organ comorbidity, and the two are complementary axes routinely reported together.');

    heading(root, 'Patient and disease');
    root.appendChild(select('Patient age', 'ebmt-age', opts(M.AGE_BANDS)));
    root.appendChild(select('Disease stage', 'ebmt-stage', opts(M.STAGE_BANDS)));
    for (const s of M.STAGE_BANDS) note(root, `${s.text}: ${s.detail}`);

    heading(root, 'Timing — an item that disappears in first complete remission');
    root.appendChild(select('Transplanted in first complete remission?', 'ebmt-first-cr', [['', '--'], ['yes', 'Yes'], ['no', 'No']]));
    note(root, M.FIRST_CR_RULE);
    root.appendChild(number(`Months from diagnosis to transplant — needed only outside first CR; more than ${M.TIME_THRESHOLD_MONTHS} scores 1`, 'ebmt-months'));
    note(root, M.TIMING_OPERATOR_NOTE);

    heading(root, 'Donor');
    root.appendChild(select('Donor type', 'ebmt-donor', opts(M.DONOR_TYPES)));
    note(root, M.DONOR_HOLE);
    root.appendChild(select('Female donor into a male recipient?', 'ebmt-sex', [['', '--'], ['yes', `Yes — ${M.SEX_MATCH_POINT}`], ['no', 'No — 0']]));
    note(root, M.SEX_RULE);

    const ids = ['ebmt-age', 'ebmt-stage', 'ebmt-first-cr', 'ebmt-months', 'ebmt-donor', 'ebmt-sex'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.ebmtScore({
        ageBand: val('ebmt-age'), diseaseStage: val('ebmt-stage'),
        firstCompleteRemission: val('ebmt-first-cr'), monthsFromDiagnosis: val('ebmt-months'),
        donorType: val('ebmt-donor'), femaleDonorMaleRecipient: val('ebmt-sex'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Risk group', value: r.riskGroup },
        { label: 'Maximum reachable here', value: `${r.maxReachable}` },
      ]);
      note(o, r.bandText);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
