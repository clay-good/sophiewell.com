// spec-v1630: sterile compounding, IV admixture and drug storage. Group Q.
// reconstitution-concentration, admixture-concentration, cleanroom-class-check and room-air-changes.

import { el, clear } from '../lib/dom.js';
import * as RC from '../lib/reconstitution-concentration-v1630.js';
import * as AC from '../lib/admixture-concentration-v1630.js';
import * as CR from '../lib/cleanroom-class-check-v1630.js';
import * as RA from '../lib/room-air-changes-v1630.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
  return wrap;
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', placeholder }));
  root.appendChild(wrap);
  return wrap;
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function show(r, o) {
  if (!r.valid) { note(o, r.message); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Result', value: r.bandLabel }]);
  list(o, r.notes);
  note(o, r.note);
}
// One renderer shape for every tool here: read each field, hand the lot to the library, show the result.
function run(root, pairs, compute) {
  const o = out(); root.appendChild(o);
  wire(pairs.map(([d]) => d), () => safe(o, () => {
    const args = {};
    for (const [dom, arg] of pairs) args[arg] = val(dom);
    show(compute(args), o);
  }));
}

export const renderers = {
  'reconstitution-concentration'(root) {
    selectField(root, 'Unit of the drug amount (used for the strengths and the dose too)', 'rc-unit', RC.UNITS);
    numField(root, 'Drug amount in the container', 'rc-amount', '');
    numField(root, 'Diluent volume the label states, mL', 'rc-diluent', '');
    numField(root, 'From the label, one of three: resulting concentration, per mL', 'rc-conc', '');
    numField(root, 'or final volume, mL', 'rc-final', '');
    numField(root, 'or powder displacement volume, mL', 'rc-disp', '');
    numField(root, 'Diluent volume you intend to use, mL (optional)', 'rc-new', '');
    numField(root, 'or concentration wanted, per mL (optional)', 'rc-want', '');
    numField(root, 'Ordered dose (optional)', 'rc-dose', '');
    run(root, [['rc-unit', 'unit'], ['rc-amount', 'amount'], ['rc-diluent', 'labelDiluent'], ['rc-conc', 'labelConcentration'], ['rc-final', 'labelFinalVolume'], ['rc-disp', 'displacement'], ['rc-new', 'newDiluent'], ['rc-want', 'wantedConcentration'], ['rc-dose', 'dose']], RC.reconstitutionConcentration);
  },

  'admixture-concentration'(root) {
    selectField(root, 'Unit of the additive amount', 'ac-unit', AC.UNITS);
    selectField(root, 'State the strength', 'ac-per', AC.PER);
    numField(root, 'Nominal bag volume, mL', 'ac-nominal', '');
    numField(root, 'Overfill, mL, from the manufacturer (leave blank if not known)', 'ac-overfill', '');
    numField(root, 'Volume withdrawn before adding, mL (optional)', 'ac-withdrawn', '');
    textareaField(root, 'Additions of the drug, one per line: amount, then its volume in mL', 'ac-adds', '');
    numField(root, 'Other volume added that holds none of the drug, mL (optional)', 'ac-other', '');
    numField(root, 'Strength already in the bag fluid (optional)', 'ac-base', '');
    numField(root, 'Target strength (optional)', 'ac-target', '');
    run(root, [['ac-unit', 'unit'], ['ac-per', 'per'], ['ac-nominal', 'nominalVolume'], ['ac-overfill', 'overfill'], ['ac-withdrawn', 'withdrawn'], ['ac-adds', 'additives'], ['ac-other', 'otherVolume'], ['ac-base', 'baseline'], ['ac-target', 'target']], AC.admixtureConcentration);
  },

  'cleanroom-class-check'(root) {
    selectField(root, 'Particle count unit', 'cr-unit', CR.COUNT_UNITS);
    numField(root, 'Particle count at 0.5 µm and larger', 'cr-count', '');
    selectField(root, 'Intended class of the area (needed for a microbial sample)', 'cr-class', CR.INTENDED);
    numField(root, 'Active air sample, cfu/m³ (optional)', 'cr-air', '');
    numField(root, '90 mm settling plate, cfu per 4 hours (optional)', 'cr-plate', '');
    run(root, [['cr-unit', 'countUnit'], ['cr-count', 'count'], ['cr-class', 'intendedClass'], ['cr-air', 'activeAir'], ['cr-plate', 'settlingPlate']], CR.cleanroomClassCheck);
  },

  'room-air-changes'(root) {
    selectField(root, 'Airflow unit', 'ra-aunit', RA.AIRFLOW_UNITS);
    numField(root, 'Supply or exhaust airflow', 'ra-air', '');
    selectField(root, 'Room measured in', 'ra-runit', RA.ROOM_UNITS);
    numField(root, 'Room volume (or enter the three dimensions below)', 'ra-vol', '');
    numField(root, 'Room length', 'ra-len', '');
    numField(root, 'Room width', 'ra-wid', '');
    numField(root, 'Room height', 'ra-hgt', '');
    numField(root, 'Required air changes per hour, from your own standard (optional)', 'ra-req', '');
    run(root, [['ra-aunit', 'airflowUnit'], ['ra-air', 'airflow'], ['ra-runit', 'roomUnit'], ['ra-vol', 'volume'], ['ra-len', 'length'], ['ra-wid', 'width'], ['ra-hgt', 'height'], ['ra-req', 'requiredAch']], RA.roomAirChanges);
  },
};
