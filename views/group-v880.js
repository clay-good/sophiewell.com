// spec-v880 §2: renderer for ewgsop2 — the EWGSOP2 sarcopenia algorithm (Clinical Scoring &
// Risk, Group G).
//
// The strength-comes-first sentence prints on every result, because a reader who arrives with a
// muscle-mass measurement and no grip strength has nothing this algorithm can read.

import { el, clear } from '../lib/dom.js';
import * as E from '../lib/ewgsop2-v880.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number' }, attrs || {})));
  root.appendChild(wrap);
}
function checkField(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return Boolean(n && n.checked); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  ewgsop2(root) {
    note(root, 'Muscle strength is the entry criterion. Nothing below it is read until strength is low.');

    root.appendChild(el('h2', { text: 'Patient' }));
    // Written out rather than mapped from E.CUTOFFS: scripts/lib/option-labels.mjs reads option
    // text out of this file statically, and a mapped list is not readable.
    selectField(root, 'Sex, for the cutoffs', 'ew-sex', [
      { value: 'male', text: 'Male' },
      { value: 'female', text: 'Female' },
    ]);

    root.appendChild(el('h2', { text: 'Muscle strength' }));
    numField(root, 'Grip strength, kg', 'ew-gripstrength', { min: '0', max: '150', step: '0.1' });
    numField(root, 'Five chair rises, seconds', 'ew-chairriseseconds', { min: '0', max: '300', step: '0.1' });

    root.appendChild(el('h2', { text: 'Muscle quantity' }));
    numField(root, 'Appendicular skeletal muscle mass, kg', 'ew-asm', { min: '0', max: '100', step: '0.1' });
    numField(root, 'Muscle mass index, kg per square meter', 'ew-asmi', { min: '0', max: '30', step: '0.1' });

    root.appendChild(el('h2', { text: 'Physical performance' }));
    numField(root, 'Gait speed, meters per second', 'ew-gaitspeed', { min: '0', max: '5', step: '0.01' });
    numField(root, 'Short Physical Performance Battery, 0 to 12', 'ew-sppb', { min: '0', max: '12', step: '1' });
    numField(root, 'Timed Up and Go, seconds', 'ew-tugseconds', { min: '0', max: '300', step: '0.1' });
    checkField(root, 'A 400 meter walk was not completed, or took 6 minutes or more', 'ew-fourhundredmeterwalkfailed');

    const ids = ['ew-sex', 'ew-gripstrength', 'ew-chairriseseconds', 'ew-asm', 'ew-asmi',
      'ew-gaitspeed', 'ew-sppb', 'ew-tugseconds', 'ew-fourhundredmeterwalkfailed'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = E.ewgsop2({
        sex: val('ew-sex'),
        gripStrength: val('ew-gripstrength'),
        chairRiseSeconds: val('ew-chairriseseconds'),
        asm: val('ew-asm'),
        asmi: val('ew-asmi'),
        gaitSpeed: val('ew-gaitspeed'),
        sppb: val('ew-sppb'),
        tugSeconds: val('ew-tugseconds'),
        fourHundredMeterWalkFailed: checked('ew-fourhundredmeterwalkfailed'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      note(o, r.recordedNote);
      if (r.probableNote) note(o, r.probableNote);
      note(o, r.sexNote);
      note(o, r.strengthFirstNote);
      note(o, r.performanceNote);
      note(o, r.findNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published algorithm to measurements already taken. It does not decide treatment.' }));
  },
};
