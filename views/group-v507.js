// spec-v507: renderer for the degree-of-hearing-loss classification from a pure-tone average (dB HL). Group G.
// Unlike the sibling tympanogram tile this one takes a NUMBER: the clinician enters the PTA already averaged
// from the audiogram, and the tile reports the degree band it falls in.
//
// Same input/render contract as the rest of the codebase: the input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per
// spec-v11 section 5.3 the tile bands the number entered; it never interprets the audiogram, asserts a
// diagnosis, or recommends amplification (lib/hearing-loss-degree-v507.js).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hearing-loss-degree-v507.js';
import { resultRow } from '../lib/result-copy.js';

function numField(label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off', step: 'any', inputmode: 'decimal' });
  if (placeholder) inp.setAttribute('placeholder', placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The management decision stays with the audiology and ENT team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'hearing-loss-degree'(root) {
    note(root, 'The degree-of-hearing-loss classification bands a pure-tone average (PTA) in dB HL. Enter the PTA already averaged from the audiogram. -10 to 15: normal; 16 to 25: slight; 26 to 40: mild; 41 to 55: moderate; 56 to 70: moderately severe; 71 to 90: severe; above 90: profound. This bands the number you enter and nothing more: it does not interpret the audiogram (nothing about conductive versus sensorineural loss, asymmetry, or configuration) and is not a recommendation for amplification or a cochlear implant. Near-neighbor: jerger-tympanogram.');
    root.appendChild(numField('Pure-tone average (dB HL)', 'hl-pta', 'e.g. 45'));

    const o = out(); root.appendChild(o);
    wire(['hl-pta'], () => safe(o, () => {
      const r = M.hearingLossDegree({ pta: val('hl-pta') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band },
        { label: 'Degree', value: r.bandLabel },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
