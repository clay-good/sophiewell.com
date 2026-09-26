// spec-v1504: renderers for partd-redetermination-request, erisa-appeal-letter, ma-reconsideration-request,
// external-review-request, medicaid-hearing-request, partd-exception-request, medical-necessity-letter.

import { el, clear } from '../lib/dom.js';
import * as RL from '../lib/request-letters-v1504.js';
import { resultRow } from '../lib/result-copy.js';
import { renderPrintable } from '../lib/print.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function textField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'text', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function dateInput(root, label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'date' }));
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder, max, step) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max, step, inputmode: 'decimal', placeholder }));
  root.appendChild(wrap);
}
function textareaField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('textarea', { id, rows: '4', autocomplete: 'off', placeholder }));
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function builder(root, pairs, fn, short) {
  const ids = pairs.map(([d]) => d);
  const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
  const letter = el('div', { class: 'letter-region' });
  root.appendChild(o);
  root.appendChild(letter);
  wire(ids, () => {
    clear(o); clear(letter);
    try {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = fn(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: short, value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
      renderPrintable(letter, { title: r.title, sections: r.sections, warnings: r.warnings });
    } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
  });
}

export const renderers = {
  'partd-redetermination-request'(root) {
    note(root, 'Fills in the rules and dates; the reason the drug is needed stays a blank for the prescriber or enrollee to write.');
    dateInput(root, 'Date on the coverage determination notice', 'prr-notice');
    dateInput(root, 'Date the notice was received, if later than presumed (optional)', 'prr-received');
    textField(root, 'Enrollee name', 'prr-enrollee', 'e.g. Pat Doe');
    textField(root, 'Member ID', 'prr-member', 'from the plan card');
    textField(root, 'Plan name', 'prr-plan', 'from the plan card');
    textField(root, 'Drug, strength and quantity', 'prr-drug', 'e.g. drug 10 mg, 30 tablets');
    textField(root, 'Name of the enrollee or prescriber signing', 'prr-requester', 'e.g. Pat Doe');
    selectField(root, 'Ask for an expedited redetermination?', 'prr-exp', RL.YES_NO);
    selectField(root, 'Does the prescriber make the expedited statement?', 'prr-prescriber', RL.YES_NO);
    selectField(root, 'Asking for a good-cause extension (filed late)?', 'prr-good', RL.YES_NO);
    dateInput(root, 'Request date (blank for today)', 'prr-date');
    builder(root, [['prr-notice', 'noticeDate'], ['prr-received', 'receivedDate'], ['prr-enrollee', 'enrollee'], ['prr-member', 'memberId'], ['prr-plan', 'plan'], ['prr-drug', 'drug'], ['prr-requester', 'requester'], ['prr-exp', 'expedited'], ['prr-prescriber', 'prescriberStatement'], ['prr-good', 'goodCause'], ['prr-date', 'requestDate']], RL.partdRedeterminationRequest, 'Letter');
  },
  'erisa-appeal-letter'(root) {
    note(root, 'Fills in the ERISA review rights and dates; the argument for reversal stays a blank for the claimant or provider to write.');
    dateInput(root, 'Date the denial was received', 'eal-denial');
    selectField(root, 'Kind of claim', 'eal-kind', RL.CLAIM_KINDS);
    textField(root, 'Claimant name', 'eal-claimant', 'e.g. Pat Doe');
    textField(root, 'Member ID', 'eal-member', 'from the plan card');
    textField(root, 'Claim or reference number', 'eal-claim', 'from the denial');
    textField(root, 'Plan name', 'eal-plan', 'from the plan card');
    textField(root, 'Service, drug or item denied', 'eal-service', 'as the denial names it');
    dateInput(root, 'Letter date (blank for today)', 'eal-date');
    builder(root, [['eal-denial', 'denialReceived'], ['eal-kind', 'claimKind'], ['eal-claimant', 'claimant'], ['eal-member', 'memberId'], ['eal-claim', 'claimId'], ['eal-plan', 'plan'], ['eal-service', 'service'], ['eal-date', 'requestDate']], RL.erisaAppealLetter, 'Letter');
  },
  'ma-reconsideration-request'(root) {
    note(root, 'Fills in the rules and dates; the reason for reversal stays a blank for the physician or enrollee to write.');
    dateInput(root, 'Date on the organization determination notice', 'mar-notice');
    selectField(root, 'What was denied', 'mar-item', RL.MA_ITEMS);
    dateInput(root, 'Date the notice was received, if later than presumed (optional)', 'mar-received');
    textField(root, 'Enrollee name', 'mar-enrollee', 'e.g. Pat Doe');
    textField(root, 'Member ID', 'mar-member', 'from the plan card');
    textField(root, 'Plan name', 'mar-plan', 'from the plan card');
    textField(root, 'Service, item or drug denied', 'mar-service', 'as the notice names it');
    textField(root, 'Name of the enrollee or physician signing', 'mar-requester', 'e.g. Pat Doe');
    selectField(root, 'Ask for an expedited reconsideration?', 'mar-exp', RL.YES_NO);
    selectField(root, 'Does the physician make the expedited statement?', 'mar-phys', RL.YES_NO);
    selectField(root, 'Asking for a good-cause extension (filed late)?', 'mar-good', RL.YES_NO);
    dateInput(root, 'Request date (blank for today)', 'mar-date');
    builder(root, [['mar-notice', 'noticeDate'], ['mar-item', 'item'], ['mar-received', 'receivedDate'], ['mar-enrollee', 'enrollee'], ['mar-member', 'memberId'], ['mar-plan', 'plan'], ['mar-service', 'service'], ['mar-requester', 'requester'], ['mar-exp', 'expedited'], ['mar-phys', 'physicianStatement'], ['mar-good', 'goodCause'], ['mar-date', 'requestDate']], RL.maReconsiderationRequest, 'Letter');
  },
  'external-review-request'(root) {
    note(root, 'Fills in the rule and the deadline; the argument for reversal stays a blank for the claimant or provider to write.');
    dateInput(root, 'Date the final internal denial was received', 'err-denial');
    textField(root, 'Claimant name', 'err-claimant', 'e.g. Pat Doe');
    textField(root, 'Member ID', 'err-member', 'from the plan card');
    textField(root, 'Plan or issuer name', 'err-plan', 'from the plan card');
    textField(root, 'Service, drug or item denied', 'err-service', 'as the denial names it');
    selectField(root, 'Ask for an expedited external review?', 'err-exp', RL.YES_NO);
    selectField(root, 'Did the plan fail to follow the internal-appeal rules (deemed exhaustion)?', 'err-deemed', RL.YES_NO);
    dateInput(root, 'Request date (blank for today)', 'err-date');
    builder(root, [['err-denial', 'denialReceived'], ['err-claimant', 'claimant'], ['err-member', 'memberId'], ['err-plan', 'plan'], ['err-service', 'service'], ['err-exp', 'expedited'], ['err-deemed', 'deemedExhaustion'], ['err-date', 'requestDate']], RL.externalReviewRequest, 'Letter');
  },
  'medicaid-hearing-request'(root) {
    note(root, 'Fills in the rule and the deadline; the reason stays a blank for the enrollee or provider to write.');
    selectField(root, 'Plan appeal or fair hearing', 'mhr-kind', RL.MEDICAID_KINDS);
    dateInput(root, 'Date on the notice', 'mhr-notice');
    numField(root, 'State fair hearing window in days (fee-for-service; at most 90)', 'mhr-days', 'e.g. 90', '90', '1');
    textField(root, 'Enrollee name', 'mhr-enrollee', 'e.g. Pat Doe');
    textField(root, 'Medicaid ID', 'mhr-member', 'from the Medicaid card');
    textField(root, 'Plan or state agency name', 'mhr-plan', 'from the notice');
    textField(root, 'Service or benefit', 'mhr-service', 'as the notice names it');
    selectField(root, 'Ask to keep benefits during the appeal?', 'mhr-keep', RL.YES_NO);
    selectField(root, 'Ask for an expedited plan appeal?', 'mhr-exp', RL.YES_NO);
    dateInput(root, 'Request date (blank for today)', 'mhr-date');
    builder(root, [['mhr-kind', 'kind'], ['mhr-notice', 'noticeDate'], ['mhr-days', 'stateDays'], ['mhr-enrollee', 'enrollee'], ['mhr-member', 'memberId'], ['mhr-plan', 'plan'], ['mhr-service', 'service'], ['mhr-keep', 'keepBenefits'], ['mhr-exp', 'expedited'], ['mhr-date', 'requestDate']], RL.medicaidHearingRequest, 'Letter');
  },
  'partd-exception-request'(root) {
    note(root, 'States the standard the prescriber must meet; the clinical basis stays a blank for the prescriber to write.');
    selectField(root, 'Kind of exception', 'per-type', RL.EXCEPTION_TYPES);
    selectField(root, 'Basis the prescriber states (not needed for a dose restriction)', 'per-basis', RL.BASES);
    selectField(root, 'Is the prescriber providing the supporting statement?', 'per-statement', RL.YES_NO);
    textField(root, 'Drug, strength and quantity', 'per-drug', 'e.g. drug 10 mg, 30 tablets');
    textField(root, 'Enrollee name', 'per-enrollee', 'e.g. Pat Doe');
    textField(root, 'Member ID', 'per-member', 'from the plan card');
    textField(root, 'Plan name', 'per-plan', 'from the plan card');
    textField(root, 'Prescriber name and NPI', 'per-prescriber', 'e.g. Dr. Lee, NPI');
    textField(root, 'Name of the enrollee or prescriber signing', 'per-requester', 'e.g. Dr. Lee');
    selectField(root, 'Ask for an expedited decision?', 'per-exp', RL.YES_NO);
    dateInput(root, 'Request date (blank for today)', 'per-date');
    builder(root, [['per-type', 'type'], ['per-basis', 'basis'], ['per-statement', 'statement'], ['per-drug', 'drug'], ['per-enrollee', 'enrollee'], ['per-member', 'memberId'], ['per-plan', 'plan'], ['per-prescriber', 'prescriber'], ['per-requester', 'requester'], ['per-exp', 'expedited'], ['per-date', 'requestDate']], RL.partdExceptionRequest, 'Letter');
  },
  'medical-necessity-letter'(root) {
    note(root, 'Lays out what the payer reviews; the clinical rationale stays a blank for the prescriber to write.');
    textField(root, 'Drug, dose and schedule', 'mnl-drug', 'e.g. drug 40 mg every 2 weeks');
    textField(root, 'Diagnosis with ICD-10-CM code', 'mnl-dx', 'e.g. rheumatoid arthritis, M06.9');
    textField(root, 'Date of diagnosis (optional)', 'mnl-dxdate', 'e.g. 2024-03');
    selectField(root, 'Is the use an FDA-approved indication?', 'mnl-label', RL.YES_NO);
    textField(root, 'Patient name', 'mnl-patient', 'e.g. Pat Doe');
    textField(root, 'Member ID', 'mnl-member', 'from the plan card');
    textField(root, 'Plan name', 'mnl-plan', 'from the plan card');
    textareaField(root, 'Prior therapies, one per line', 'mnl-prior', 'methotrexate, 2025-01 to 2025-06, inadequate response');
    textareaField(root, 'Payer criteria and where the evidence is, one per line', 'mnl-criteria', '1. Diagnosis: met (progress note 2026-08-14)');
    textField(root, 'Prescriber name, credentials and NPI', 'mnl-prescriber', 'e.g. Dr. Lee, MD, NPI');
    dateInput(root, 'Letter date (blank for today)', 'mnl-date');
    builder(root, [['mnl-drug', 'drug'], ['mnl-dx', 'diagnosis'], ['mnl-dxdate', 'diagnosisDate'], ['mnl-label', 'labeled'], ['mnl-patient', 'patient'], ['mnl-member', 'memberId'], ['mnl-plan', 'plan'], ['mnl-prior', 'priorTherapies'], ['mnl-criteria', 'criteria'], ['mnl-prescriber', 'prescriber'], ['mnl-date', 'letterDate']], RL.medicalNecessityLetter, 'Letter');
  },
};
