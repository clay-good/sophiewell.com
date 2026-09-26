// spec-v1514: MCP adapters for the post-acute notice and benefit clocks. The dom keys mirror views/group-v1514.js.

import * as PA from '../../lib/post-acute-clocks-v1514.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'moon-deadline',
    summary: 'When the Medicare observation notice is due. It is required past 24 hours in observation, by 36 hours or at release (42 CFR 489.20(y)).',
    compute: PA.moonDeadline,
    fields: [
      { dom: 'moon-start', arg: 'observationStart', kind: 'string', required: true, label: 'Observation began (YYYY-MM-DDTHH:MM)' },
      { dom: 'moon-end', arg: 'endTime', kind: 'string', required: false, label: 'Released, transferred or admitted (YYYY-MM-DDTHH:MM)' },
    ],
  },
  {
    id: 'nomnc-deadline',
    summary: 'Notice of Medicare Non-Coverage deadline, 2 days before services end. A late notice extends coverage (42 CFR 405.1200).',
    compute: PA.nomncDeadline,
    fields: [
      { dom: 'nomnc-setting', arg: 'setting', kind: 'enum', required: true, values: vals(PA.NOMNC_SETTINGS), label: 'Setting' },
      { dom: 'nomnc-last', arg: 'lastCovered', kind: 'string', required: true, label: 'Last covered day (YYYY-MM-DD)' },
      { dom: 'nomnc-delivered', arg: 'delivered', kind: 'string', required: false, label: 'Date delivered (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'snf-qualifying-stay',
    summary: 'Skilled nursing qualifying stay: 3 inpatient days not counting discharge, SNF care within 30 days, and benefit days left (42 CFR 409.30).',
    compute: PA.snfQualifyingStay,
    fields: [
      { dom: 'snf-admit', arg: 'inpatientAdmit', kind: 'string', required: true, label: 'Inpatient admission date (YYYY-MM-DD)' },
      { dom: 'snf-discharge', arg: 'inpatientDischarge', kind: 'string', required: true, label: 'Hospital discharge date (YYYY-MM-DD)' },
      { dom: 'snf-snfadmit', arg: 'snfAdmit', kind: 'string', required: false, label: 'SNF admission date (YYYY-MM-DD)' },
      { dom: 'snf-used', arg: 'daysUsed', kind: 'number', required: false, label: 'SNF days already used this benefit period' },
    ],
  },
  {
    id: 'hospice-period-clock',
    summary: 'Hospice benefit periods of 90, 90, then 60 days, with certification and face-to-face windows (42 CFR 418.21, 418.22).',
    compute: PA.hospicePeriodClock,
    fields: [
      { dom: 'hosp-elect', arg: 'electionDate', kind: 'string', required: true, label: 'Election date (YYYY-MM-DD)' },
      { dom: 'hosp-asof', arg: 'asOf', kind: 'string', required: false, label: 'Date to check (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'im-notice-timing',
    summary: 'When the Important Message from Medicare is due. The first copy within 2 days of admission, a follow-up up to 2 days before discharge (42 CFR 405.1205).',
    compute: PA.imNoticeTiming,
    fields: [
      { dom: 'im-admit', arg: 'admission', kind: 'string', required: true, label: 'Inpatient admission (YYYY-MM-DDTHH:MM)' },
      { dom: 'im-first', arg: 'firstDelivered', kind: 'string', required: false, label: 'First IM delivered (YYYY-MM-DD)' },
      { dom: 'im-discharge', arg: 'discharge', kind: 'string', required: false, label: 'Planned discharge (YYYY-MM-DDTHH:MM)' },
    ],
  },
  {
    id: 'home-health-cert-clock',
    summary: 'Home health certification and assessment dates. The face-to-face window, 60-day certification and 30-day payment periods, and OASIS due dates (42 CFR 424.22, 484.55).',
    compute: PA.homeHealthCertClock,
    fields: [
      { dom: 'hh-soc', arg: 'startOfCare', kind: 'string', required: true, label: 'Start of care (YYYY-MM-DD)' },
      { dom: 'hh-f2f', arg: 'faceToFace', kind: 'string', required: false, label: 'Face-to-face encounter (YYYY-MM-DD)' },
      { dom: 'hh-ref', arg: 'referral', kind: 'string', required: false, label: 'Referral date (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'dme-rental-clock',
    summary: 'When a Medicare DME rental ends. Capped rental title passes after 13 paid months; oxygen rental ends at 36; breaks are tested against 42 CFR 414.230.',
    compute: PA.dmeRentalClock,
    fields: [
      { dom: 'dme-item', arg: 'item', kind: 'enum', required: true, values: vals(PA.DME_ITEMS), label: 'Item type' },
      { dom: 'dme-delivered', arg: 'delivered', kind: 'string', required: true, label: 'Delivery date (YYYY-MM-DD)' },
      { dom: 'dme-stop', arg: 'lastUse', kind: 'string', required: false, label: 'Last day of use before a break (YYYY-MM-DD)' },
      { dom: 'dme-resume', arg: 'resumed', kind: 'string', required: false, label: 'Day use resumed (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'irf-compliance-clock',
    summary: 'Whether an IRF stay meets its timing rules. The 48-hour preadmission screening, therapy within 36 hours, and IRF-PAI due dates (42 CFR 412.622, 412.610).',
    compute: PA.irfComplianceClock,
    fields: [
      { dom: 'irf-admit', arg: 'admission', kind: 'string', required: true, label: 'IRF admission (YYYY-MM-DDTHH:MM)' },
      { dom: 'irf-screen', arg: 'screening', kind: 'string', required: false, label: 'Preadmission screening (YYYY-MM-DDTHH:MM)' },
      { dom: 'irf-update', arg: 'screeningUpdate', kind: 'string', required: false, label: 'Screening update (YYYY-MM-DDTHH:MM)' },
      { dom: 'irf-therapy', arg: 'firstTherapy', kind: 'string', required: false, label: 'First therapy session (YYYY-MM-DDTHH:MM)' },
      { dom: 'irf-discharge', arg: 'discharge', kind: 'string', required: false, label: 'Discharge date (YYYY-MM-DD)' },
    ],
  },
  {
    id: 'mcsn-appeal-rights',
    summary: 'Whether a patient changed from inpatient to observation can appeal. Tests 42 CFR 405.1210 and gives the notice, request and decision deadlines.',
    compute: PA.mcsnAppealRights,
    fields: [
      { dom: 'mcsn-start', arg: 'hospitalStart', kind: 'string', required: true, label: 'First day of the hospital stay (YYYY-MM-DD)' },
      { dom: 'mcsn-admit', arg: 'admitted', kind: 'string', required: true, label: 'Inpatient admission date (YYYY-MM-DD)' },
      { dom: 'mcsn-reclass', arg: 'reclassified', kind: 'string', required: true, label: 'Reclassified to observation (YYYY-MM-DD)' },
      { dom: 'mcsn-partb', arg: 'partB', kind: 'enum', required: true, values: vals(PA.PART_B_OPTIONS), label: 'Part B during the stay' },
      { dom: 'mcsn-release', arg: 'release', kind: 'string', required: false, label: 'Expected release (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
