// spec-v831 §2: renderer for quintero-ttts — Quintero staging of twin-twin transfusion
// syndrome (Clinical Scoring & Risk, Group G).
//
// The two amniotic fluid pockets are NUMBERS rather than a single "oligo-polyhydramnios
// sequence present" checkbox, because the two halves are separate thresholds and one without
// the other is a different diagnosis. A single tick would let a reader assert the sequence
// the tile is meant to check.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/quintero-ttts-v831.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'decimal' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'quintero-ttts'(root) {
    note(root, 'The entry condition is the fluid sequence, not a size difference. Discordant growth without it is selective fetal growth restriction, a different condition.');

    root.appendChild(el('h2', { text: 'The pregnancy' }));
    root.appendChild(checkField('Monochorionic diamniotic, confirmed', 'ttts-mcda'));

    root.appendChild(el('h2', { text: 'Amniotic fluid: both halves are required' }));
    numField(root, 'Donor maximum vertical pocket, cm (under 2 is oligohydramnios)', 'ttts-donor', { min: '0', max: '40', step: '0.1' });
    numField(root, 'Recipient maximum vertical pocket, cm (over 8 is polyhydramnios)', 'ttts-recipient', { min: '0', max: '40', step: '0.1' });

    root.appendChild(el('h2', { text: 'Staging findings' }));
    root.appendChild(checkField('Donor bladder is visible', 'ttts-bladder'));
    root.appendChild(checkField('Critically abnormal Doppler in either twin: absent or reversed umbilical artery end-diastolic flow, a reversed ductus venosus a-wave, or pulsatile umbilical venous flow', 'ttts-doppler'));
    root.appendChild(checkField('Hydrops', 'ttts-hydrops'));
    root.appendChild(checkField('Demise of one or both twins', 'ttts-demise'));

    const ids = ['ttts-mcda', 'ttts-donor', 'ttts-recipient', 'ttts-bladder', 'ttts-doppler', 'ttts-hydrops', 'ttts-demise'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.quinteroTtts({
        monochorionicDiamniotic: checked('ttts-mcda'),
        donorMvp: val('ttts-donor'),
        recipientMvp: val('ttts-recipient'),
        donorBladderVisible: checked('ttts-bladder'),
        criticallyAbnormalDoppler: checked('ttts-doppler'),
        hydrops: checked('ttts-hydrops'),
        demise: checked('ttts-demise'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Fluid sequence', value: r.sequencePresent ? 'present' : 'not present' },
      ]);
      if (r.discordanceNote) note(o, r.discordanceNote);
      if (r.chorionicityNote) note(o, r.chorionicityNote);
      if (r.ladderNote) note(o, r.ladderNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This describes findings already made on ultrasound. It does not decide about laser therapy, amnioreduction or delivery.' }));
  },
};
