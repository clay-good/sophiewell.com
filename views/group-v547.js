// spec-v547: renderer for the AAP BRUE lower-risk criteria. Group G. A qualifying gate plus seven yes/no
// criteria under two h2 section headings (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The gate comes first and HIDES the seven criteria when the event is not a BRUE, because BRUE is a
// diagnosis of exclusion: an event with an identified explanation is that diagnosis, and stratifying it
// against the lower-risk criteria would be applying the tool to a patient it does not describe
// (lib/brue-v547.js).
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a risk
// classification; it never diagnoses a cause, never orders an investigation, and never discharges anyone.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/brue-v547.js';
import { resultRow } from '../lib/result-copy.js';

const YES_NO = [['no', 'No'], ['yes', 'Yes']];

function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { const h = el('h2', { text }); root.appendChild(h); return h; }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'brue'(root) {
    note(root, `A Brief Resolved Unexplained Event is a sudden, brief, now resolved episode in an infant under 1 year of one or more of: ${M.BRUE_EVENT_FEATURES.join('; ')} — with no explanation found after an appropriate history and examination. It is a diagnosis of exclusion. Seven criteria define a lower-risk infant and ALL SEVEN must be met; failing any one is higher-risk by definition, so there is no score. Lower-risk is not no risk and is not a discharge order.`);

    const ids = ['brue-qualifiesAsBrue'];
    heading(root, 'Does the event meet the BRUE definition?');
    root.appendChild(select('Sudden, brief, now resolved, with one or more of the qualifying features, and NO explanation identified after an appropriate history and physical examination?', 'brue-qualifiesAsBrue', YES_NO));

    const criteriaHeading = heading(root, 'Lower-risk criteria — all seven must be met');
    const nodes = [];
    for (const c of M.BRUE_LOWER_RISK_CRITERIA) {
      const id = `brue-${c.key}`;
      ids.push(id);
      const node = select(c.detail ? `${c.text}. ${c.detail}` : c.text, id, YES_NO);
      nodes.push(node);
      root.appendChild(node);
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const qualifies = val('brue-qualifiesAsBrue') === 'yes';
      // The criteria only apply to an event that is a BRUE.
      criteriaHeading.hidden = !qualifies;
      for (const n of nodes) n.hidden = !qualifies;

      const args = { qualifiesAsBrue: val('brue-qualifiesAsBrue') };
      for (const c of M.BRUE_LOWER_RISK_CRITERIA) args[c.key] = val(`brue-${c.key}`);
      const r = M.brue(args);
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band }];
      if (r.isBrue) {
        rows.push({ label: 'Classification', value: r.lowerRisk ? 'lower-risk' : 'higher-risk' });
        if (r.failedText && r.failedText.length) {
          rows.push({ label: 'Criteria not met', value: r.failedText.join('; ') });
        }
      } else {
        rows.push({ label: 'Classification', value: 'not a BRUE — not stratified' });
      }
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
