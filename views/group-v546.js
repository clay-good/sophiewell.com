// spec-v546: renderer for the revised ASRM endometriosis stage. Group G. One number input under an h2
// section heading (never h3 - an h3 under the page h1 is a heading-level skip).
//
// One input, because this tile interprets a total rather than computing one: the ASRM point grid could not
// be double-confirmed, so the clinician brings the total from the completed form. The confirmed anchor
// values are shown as sanity checks on a keyed total, explicitly not as a scoring engine
// (lib/rasrm-stage-v546.js).
//
// Same input/render contract as the rest of the codebase: the input has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a surgical stage;
// it never diagnoses endometriosis, never measures pain, and never predicts fertility.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/rasrm-stage-v546.js';
import { resultRow } from '../lib/result-copy.js';

function number(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: String(M.RASRM_MAX), step: '1' }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function heading(root, text) { root.appendChild(el('h2', { text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical decision stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'rasrm-stage'(root) {
    note(root, 'The revised ASRM stage of endometriosis, from the point total on a completed scoring form: stage I minimal 1–5, II mild 6–15, III moderate 16–40, IV severe above 40, maximum 150. This tool interprets a total rather than computing one — the per-site point grid could not be verified against two independent sources, so building a calculator on a single transcription would produce numbers that look authoritative and cannot be checked. The stage correlates poorly with pain and with fertility outcome.');

    heading(root, 'Total from the completed ASRM form');
    root.appendChild(number(`Revised ASRM point total (0 to ${M.RASRM_MAX})`, 'rasrm-total'));

    note(root, `Sanity checks on a keyed total, from values that are confirmed: ${M.RASRM_ANCHORS.map((a) => `${a.text} = ${a.points}`).join('; ')}.`);

    const o = out(); root.appendChild(o);
    wire(['rasrm-total'], () => safe(o, () => {
      const r = M.rasrmStage({ total: val('rasrm-total') });
      if (!r.valid) { note(o, r.message); return; }
      const rows = [{ text: r.band }];
      if (r.stage) {
        rows.push({ label: 'Stage', value: `${r.stage} (${r.stageName})` });
      } else {
        rows.push({ label: 'Stage', value: 'none — below stage I' });
      }
      rows.push({ label: 'Total', value: `${r.total} of ${M.RASRM_MAX}` });
      resultRow(o, rows);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
