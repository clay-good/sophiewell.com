// spec-v848 §2: renderer for tricuspid-regurgitation-stage — the ACC/AHA tricuspid
// regurgitation stages (Clinical Scoring & Risk, Group G).
//
// Every numeric field carries its tricuspid threshold in the label, because the thresholds
// differ from the left-sided valves and a reader arriving from the mitral or aortic tile is
// the one this tile is most likely to save.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/tricuspid-regurgitation-stage-v848.js';
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
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
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

const MECHANISM = [
  { value: '', text: '— not recorded —' },
  { value: 'secondary', text: 'Secondary: normal valve, pulled open by the ventricle, atrium or a lead' },
  { value: 'primary', text: 'Primary: the valve itself is abnormal' },
];

export const renderers = {
  'tricuspid-regurgitation-stage'(root) {
    note(root, 'These thresholds are specific to this valve. Severe here is a regurgitant volume of 45 mL, where on the mitral and aortic valves it is 60.');

    root.appendChild(el('h2', { text: 'Severity of the leak' }));
    numField(root, 'Jet area (square cm; severe at 10 or more)', 'trs-jet', { min: '0', max: '60', step: '0.1' });
    numField(root, 'Vena contracta width (cm; severe at 0.7 or more)', 'trs-vc', { min: '0', max: '3', step: '0.01' });
    numField(root, 'Effective regurgitant orifice area (square cm; severe at 0.40 or more)', 'trs-ero', { min: '0', max: '3', step: '0.01' });
    numField(root, 'Regurgitant volume (mL per beat; severe at 45 or more)', 'trs-rvol', { min: '0', max: '300', step: '1' });
    root.appendChild(checkField('Systolic flow reversal in the hepatic veins', 'trs-hv'));

    root.appendChild(el('h2', { text: 'Mechanism' }));
    root.appendChild(selectField('What is causing the leak', 'trs-mech', MECHANISM));

    root.appendChild(el('h2', { text: 'Valve and symptoms' }));
    root.appendChild(checkField('At-risk valve: a leaflet abnormality, or the substrate for a secondary leak such as annular dilation, right-sided remodeling or an intracardiac lead', 'trs-risk'));
    root.appendChild(checkField('Signs of right heart failure: ascites, peripheral edema, raised venous pressure, fatigue', 'trs-sx'));

    const ids = ['trs-jet', 'trs-vc', 'trs-ero', 'trs-rvol', 'trs-hv', 'trs-mech', 'trs-risk', 'trs-sx'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.tricuspidRegurgitationStage({
        jetArea: val('trs-jet'),
        venaContracta: val('trs-vc'),
        regurgitantOrifice: val('trs-ero'),
        regurgitantVolume: val('trs-rvol'),
        hepaticVeinReversal: checked('trs-hv'),
        mechanism: val('trs-mech'),
        atRiskValve: checked('trs-risk'),
        symptoms: checked('trs-sx'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.volumeThresholdNote) note(o, r.volumeThresholdNote);
      if (r.orificeThresholdNote) note(o, r.orificeThresholdNote);
      if (r.disagreeNote) note(o, r.disagreeNote);
      if (r.hepaticNote) note(o, r.hepaticNote);
      if (r.hepaticSupportsNote) note(o, r.hepaticSupportsNote);
      if (r.mechanismNote) note(o, r.mechanismNote);
      if (r.noSubdivisionNote) note(o, r.noSubdivisionNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This applies a published staging to measurements already taken. It does not select or adjust therapy, and the severity adjudication stays with the echocardiographer and the heart team.' }));
  },
};
