// spec-v521: renderer for the Primary Care PTSD Screen for DSM-5 (PC-PTSD-5). Group G. A trauma-exposure
// gate plus five yes/no selects, under two h2 section headings (never h3 - an h3 under the page h1 is a
// heading-level skip).
//
// The gate is part of the instrument: when no traumatic event is reported the screen is complete with a
// score of 0 and the five symptom items are never asked, so this renderer HIDES them rather than leaving
// five unanswerable questions on screen (every one of them refers to "the event(s)").
//
// Same input/render contract as the rest of the codebase: every select has a real <label for> (a11y-check
// passes), no innerHTML, no network, no storage. Per spec-v11 section 5.3 the tile reports a screen result;
// it never asserts a PTSD diagnosis and never indicates a treatment (lib/pc-ptsd5-v521.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/pc-ptsd5-v521.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The clinical assessment stays with the clinician.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'pc-ptsd5'(root) {
    note(root, 'The Primary Care PTSD Screen for DSM-5: a five-item yes-or-no screen, total 0 to 5. It opens with a trauma-exposure question — if no traumatic event is reported the screen is complete with a score of 0 and the five items are not asked. The source gives two cut points for different purposes: 3 or more is optimally sensitive, 4 or more is optimally efficient. It is a screen, not a diagnosis, and it is not the PCL-5, which measures severity.');

    const ids = ['pcp-trauma'];
    heading(root, 'Trauma exposure');
    root.appendChild(select('Have you ever experienced a traumatic event — for example a serious accident, an assault, a natural disaster, war, witnessing someone be injured or killed, or losing someone to homicide or suicide?', 'pcp-trauma', YES_NO));

    const itemsHeading = heading(root, 'In the past month, have you…');
    const itemNodes = [];
    for (const item of M.PC_PTSD5_ITEMS) {
      const id = `pcp-${item.key}`;
      ids.push(id);
      const node = select(item.text, id, YES_NO);
      itemNodes.push(node);
      root.appendChild(node);
    }

    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const exposed = val('pcp-trauma') === 'yes';
      // The five items presuppose an event, so they are shown only once one is reported.
      itemsHeading.hidden = !exposed;
      for (const node of itemNodes) node.hidden = !exposed;

      const args = { trauma: val('pcp-trauma') };
      for (const item of M.PC_PTSD5_ITEMS) args[item.key] = val(`pcp-${item.key}`);
      const r = M.pcPtsd5(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Total', value: `${r.total} of 5` },
        { label: 'Cut of 3 (sensitive)', value: r.meetsSensitive ? 'met' : 'not met' },
        { label: 'Cut of 4 (efficient)', value: r.meetsEfficient ? 'met' : 'not met' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
