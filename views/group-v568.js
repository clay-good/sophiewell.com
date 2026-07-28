// spec-v568: renderer for the Cleveland Clinic (Thakar) score. Group G. Inputs under h2 section headings
// (never h3 - an h3 under the page h1 is a heading-level skip).
//
// The surgery-type select is ordered as published rather than by apparent invasiveness, and its labels show
// the points, because "other cardiac surgery" scoring the same as CABG plus valve is the part an
// implementer or reader will try to rationalize away (lib/thakar-aki-v568.js).
//
// Same input/render contract as the rest of the codebase: every control has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile estimates one
// preoperative risk; it never indicates cancelling an operation.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/thakar-aki-v568.js';
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
function number(label, id, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step }));
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

const YESNO = [['no', 'No'], ['yes', 'Yes']];

export const renderers = {
  'thakar-aki'(root) {
    note(root, 'The Cleveland Clinic score estimates the preoperative risk of acute renal failure REQUIRING DIALYSIS after cardiac surgery — not KDIGO acute kidney injury, which is far commoner and much less severe. That distinction is where most confusion about this score comes from. Score 0-17, but the published risk categories stop at 13.');

    heading(root, 'Preoperative risk factors');
    for (const f of M.THAKAR_FACTORS) {
      root.appendChild(select(`${f.text} — ${f.points} point${f.points === 1 ? '' : 's'}`, `thakar-${f.key}`, YESNO));
    }

    heading(root, 'Surgery type');
    note(root, 'Ordered as published, not by invasiveness: isolated CABG scores 0, while “other cardiac surgery” scores 2 — the same as CABG plus valve.');
    root.appendChild(select('Type of cardiac surgery', 'thakar-surgery',
      M.SURGERY_TYPES.map((s) => [s.value, `${s.text} — ${s.points} point${s.points === 1 ? '' : 's'}`])));

    heading(root, 'Preoperative creatinine');
    note(root, 'A stepped term, never interpolated: under 1.2 mg/dL scores 0, 1.2 to under 2.1 scores 2, and 2.1 or above scores 5. That step of 3 is larger than any other item, so a small change near 2.1 can move a patient two bands.');
    root.appendChild(number('Serum creatinine (mg/dL)', 'thakar-creatinine', '0.1'));

    const ids = [...M.THAKAR_FACTORS.map((f) => `thakar-${f.key}`), 'thakar-surgery', 'thakar-creatinine'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = { surgeryType: val('thakar-surgery'), creatinine: val('thakar-creatinine') };
      for (const f of M.THAKAR_FACTORS) input[f.key] = val(`thakar-${f.key}`);
      const r = M.thakarAki(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandText },
        { label: 'Score', value: `${r.total} of ${r.max}` },
        { label: 'Risk category', value: r.bandAssigned ? r.band : 'above the published categories — none assigned' },
        { label: 'Creatinine band', value: `${r.creatinineBand} (${r.creatininePoints} points)` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
