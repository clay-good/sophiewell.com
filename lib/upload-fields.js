// spec-v1623: the CSV columns each upload-workbench tool reads, in one pure
// module. The views pass them to uploadWorkbench(); file recognition
// (lib/file-kinds.js) scores a dropped CSV's header against them, in the
// browser worker and in Node for MCP, without importing a view.
//
// Each field: { id, label, required, sensitive?, synonyms: [] }.

import { BATCH_TOOLS } from './batch-tools.js';

export const FILL_FIELDS = [
  { id: 'patient', label: 'Patient', required: true, sensitive: true, synonyms: ['patient name', 'member', 'member name'] },
  { id: 'measure', label: 'Measure', required: true, synonyms: ['star measure', 'measure id'] },
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date', 'service date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
  { id: 'ingredient', label: 'Ingredient', required: true, synonyms: ['drug ingredient', 'generic name', 'drug name'] },
];

export const MPR_FILL_FIELDS = [
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date', 'service date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
];

export const SYNC_FIELDS = [
  { id: 'medication', label: 'Medication', required: true, synonyms: ['drug name', 'medication name'] },
  { id: 'last_fill_date', label: 'Last fill date', required: true, synonyms: ['last dispense date', 'fill date'] },
  { id: 'days_supply', label: 'Days supply', required: true, synonyms: ['supply days'] },
  { id: 'units_per_day', label: 'Units a day', required: true, synonyms: ['units per day', 'daily units'] },
];

export const PATIENT_CHECK_FIELDS = [
  { id: 'patient_reference', label: 'Patient reference', required: true, sensitive: true, synonyms: ['patient', 'patient id', 'member', 'member id'] },
  { id: 'entity', label: 'Covered entity kind', required: true, synonyms: ['entity kind', 'entity type'] },
  { id: 'records', label: 'Entity keeps records', required: true, synonyms: ['keeps records', 'health records'] },
  { id: 'provider', label: 'Eligible provider arrangement', required: true, synonyms: ['provider arrangement', 'eligible prescriber'] },
  { id: 'scope', label: 'Within grant scope', synonyms: ['grant scope', 'in scope'] },
  { id: 'dispensingOnly', label: 'Dispensing only', required: true, synonyms: ['dispensing only', 'only service'] },
];

export const APPEAL_FIELDS = [
  { id: 'reference', label: 'Claim reference', required: true, sensitive: true, synonyms: ['claim reference', 'claim id', 'patient account'] },
  { id: 'payer', label: 'Payer type', required: true, synonyms: ['payer'] },
  { id: 'denial_date', label: 'Denial date', required: true, synonyms: ['remittance date', 'denial date'] },
  { id: 'amount', label: 'Amount', required: true, synonyms: ['denied amount', 'adjusted amount'] },
  { id: 'window_days', label: 'Window days', required: false, synonyms: ['appeal window', 'appeal days'] },
];

// The 340B matcher's four files; a dropped prescriptions file opens it.
export const RX_MATCH_FILES = [
  { name: 'prescriptions', label: 'Prescriptions', fields: [
    { id: 'patient_reference', label: 'Patient reference', required: true, sensitive: true, synonyms: ['patient', 'patient id', 'member id'] },
    { id: 'prescriber_npi', label: 'Prescriber NPI', required: true, synonyms: ['npi', 'rx prescriber npi'] },
    { id: 'ndc', label: 'NDC', required: true, synonyms: ['drug ndc'] },
    { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date'] },
    { id: 'pharmacy', label: 'Pharmacy', required: true, synonyms: ['pharmacy name', 'pharmacy id'] },
    { id: 'orphan_designated', label: 'Orphan designated', required: true, synonyms: ['orphan designation', 'orphan drug'] },
  ] },
  { name: 'encounters', label: 'Encounters', fields: [
    { id: 'patient_reference', label: 'Patient reference', required: true, sensitive: true, synonyms: ['patient', 'patient id', 'member id'] },
    { id: 'encounter_date', label: 'Encounter date', required: true, synonyms: ['visit date', 'date of service'] },
    { id: 'location', label: 'Location', required: true, synonyms: ['site', 'clinic'] },
    { id: 'provider_npi', label: 'Provider NPI', required: true, synonyms: ['npi', 'encounter provider npi'] },
  ] },
  { name: 'prescribers', label: 'Eligible prescribers', fields: [
    { id: 'npi', label: 'NPI', required: true, synonyms: ['prescriber npi', 'provider npi'] },
    { id: 'relationship', label: 'Relationship', required: true, synonyms: ['arrangement', 'provider relationship'] },
  ] },
  { name: 'sites', label: 'Registered sites', fields: [
    { id: 'location', label: 'Location', required: true, synonyms: ['site', 'site name', 'clinic'] },
  ] },
];

// spec-v1604 tool 4: a plan's pharmacy claims file. No patient column is read.
// spec-v1510 tool 7: dispensing claims for mfp-refund-reconcile.
export const MFP_CLAIM_FIELDS = [
  { id: 'rx', label: 'Prescription number', required: true, synonyms: ['rx', 'rx number', 'rx #', 'prescription', 'prescription reference number', 'prescription number', 'rx no'] },
  { id: 'fill', label: 'Fill number', synonyms: ['fill', 'fill no', 'fill #', 'refill', 'refill number', 'fill number'] },
  { id: 'service_date', label: 'Date of service', required: true, synonyms: ['date of service', 'dos', 'fill date', 'date filled', 'dispense date', 'service date'] },
  { id: 'ndc', label: 'NDC', synonyms: ['ndc', 'ndc11', 'ndc code', 'product id'] },
  { id: 'quantity', label: 'Quantity', synonyms: ['quantity', 'qty', 'quantity dispensed', 'units'] },
  { id: 'wac', label: 'WAC per unit', synonyms: ['wac', 'wac per unit', 'wac unit price'] },
  { id: 'mfp', label: 'MFP per unit', synonyms: ['mfp', 'mfp per unit', 'maximum fair price'] },
];

// spec-v1604 tool 3: claim lines for claims-pct-medicare.
export const CLAIM_LINE_FIELDS = [
  { id: 'service_date', label: 'Service date', synonyms: ['date of service', 'dos', 'from date', 'service from date', 'line service date'] },
  { id: 'provider', label: 'Provider', synonyms: ['provider name', 'billing provider', 'rendering provider', 'facility', 'provider npi', 'npi', 'tin'] },
  { id: 'code', label: 'Procedure code (CPT, HCPCS or DRG)', required: true, synonyms: ['cpt', 'hcpcs', 'procedure code', 'cpt code', 'hcpcs code', 'cpt/hcpcs', 'drg', 'ms-drg'] },
  { id: 'pos', label: 'Place of service', synonyms: ['place of service', 'pos code', 'place of service code'] },
  { id: 'allowed', label: 'Allowed amount', required: true, synonyms: ['allowed', 'allowed amount', 'allowed amt', 'plan allowed', 'eligible amount', 'allowed charges'] },
  { id: 'units', label: 'Units', synonyms: ['service units', 'quantity', 'qty', 'units of service'] },
  { id: 'modifiers', label: 'Modifiers', synonyms: ['modifier', 'modifier 1', 'mod', 'modifiers'] },
  { id: 'claim_type', label: 'Claim type (professional or institutional)', synonyms: ['claim type', 'form type', 'bill type', 'claim form'] },
];

export const CLAIM_FIELDS = [
  { id: 'ndc', label: 'NDC', required: true, synonyms: ['ndc11', 'ndc code', 'national drug code', 'product id'] },
  { id: 'quantity', label: 'Quantity', required: true, synonyms: ['quantity dispensed', 'qty', 'metric quantity', 'units dispensed'] },
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date', 'date of service', 'service date'] },
  { id: 'plan_paid', label: 'Plan paid', required: true, synonyms: ['plan paid amount', 'paid by plan', 'plan amount', 'plan cost'] },
  { id: 'member_paid', label: 'Member paid', required: true, synonyms: ['member paid amount', 'patient pay', 'patient paid', 'member cost share', 'copay'] },
  { id: 'pharmacy_paid', label: 'Pharmacy paid (if disclosed)', synonyms: ['pharmacy paid amount', 'paid to pharmacy', 'pharmacy reimbursement'] },
];

// spec-v1502 tool 3: a list of authorizations for the renewal worklist.
export const AUTH_FIELDS = [
  { id: 'reference', label: 'Authorization or patient reference', required: true, sensitive: true, synonyms: ['authorization number', 'auth number', 'patient', 'member', 'reference'] },
  { id: 'start_date', label: 'Approval start date', required: true, synonyms: ['start date', 'effective date', 'auth start'] },
  { id: 'end_date', label: 'Approval end date', required: true, synonyms: ['end date', 'expiration date', 'auth end', 'expires'] },
  { id: 'approved', label: 'Units or visits approved', required: true, synonyms: ['units approved', 'visits approved', 'approved units'] },
  { id: 'used', label: 'Units or visits used', required: true, synonyms: ['units used', 'visits used', 'used units'] },
  { id: 'per_dose', label: 'Units per administration', required: true, synonyms: ['units per dose', 'per dose', 'units per visit'] },
  { id: 'interval_days', label: 'Days between administrations', required: true, synonyms: ['interval days', 'frequency days', 'days between doses'] },
  { id: 'next_dose', label: 'Next scheduled administration', required: true, synonyms: ['next dose', 'next visit', 'next appointment'] },
  { id: 'lead_days', label: 'Renewal lead time in days', synonyms: ['lead days', 'lead time'] },
];

// spec-v1510 tool 2, batch: a pharmacy's own claims, for margin by drug and payer.
export const MARGIN_FIELDS = [
  { id: 'ndc', label: 'NDC', required: true, synonyms: ['ndc11', 'ndc code', 'national drug code', 'product id'] },
  { id: 'quantity', label: 'Quantity dispensed', required: true, synonyms: ['quantity', 'qty', 'metric quantity', 'quantity dispensed'] },
  { id: 'fill_date', label: 'Fill date', required: true, synonyms: ['date filled', 'dispense date', 'date of service', 'service date'] },
  { id: 'reimbursed', label: 'Total reimbursement', required: true, synonyms: ['total paid', 'amount paid', 'reimbursement', 'total reimbursement', 'paid amount'] },
  { id: 'payer', label: 'Payer or plan', synonyms: ['payer', 'plan', 'bin pcn', 'third party', 'insurance'] },
  { id: 'cost', label: 'Invoice cost per unit', synonyms: ['acquisition cost', 'unit cost', 'invoice cost'] },
];

// spec-v1512 tool 4: a day's infusion appointments for the chair planner.
export const APPT_FIELDS = [
  { id: 'reference', label: 'Patient or appointment reference', required: true, sensitive: true, synonyms: ['patient', 'appointment', 'mrn', 'reference'] },
  { id: 'chair_minutes', label: 'Chair minutes', required: true, synonyms: ['chair time', 'infusion minutes', 'duration', 'minutes'] },
  { id: 'premed_minutes', label: 'Premedication minutes', required: true, synonyms: ['premed', 'premed minutes', 'premedication'] },
  { id: 'observation_minutes', label: 'Observation minutes', required: true, synonyms: ['observation', 'post observation', 'observation time'] },
  { id: 'preferred_start', label: 'Preferred start (HH:MM)', synonyms: ['start time', 'preferred time', 'appointment time'] },
];

// [{ id, label, fields }] -- the tools a CSV can open, for recognize().
// The form tools that run over a file (lib/batch-tools.js) are listed with their own fields.
export const CSV_TOOLS = [
  { id: 'mpr-gap-days', label: 'Adherence: PDC, MPR and Gap Days', fields: MPR_FILL_FIELDS },
  { id: 'med-sync-plan', label: 'Medication Synchronization Short Fills', fields: SYNC_FIELDS },
  { id: 'pdc-star', label: 'Part D Adherence (PDC, Star Method)', fields: FILL_FIELDS },
  { id: 'adherence-outreach-list', label: 'Adherence Outreach List', fields: FILL_FIELDS },
  { id: '340b-patient-check', label: '340B Patient Definition Check', fields: PATIENT_CHECK_FIELDS },
  { id: 'appeal-worklist', label: 'Appeal Worklist by Deadline', fields: APPEAL_FIELDS },
  { id: 'auth-runout', label: 'Authorization Renewal Worklist', fields: AUTH_FIELDS },
  { id: 'chair-day-planner', label: 'Infusion Chair Day Planner', fields: APPT_FIELDS },
  { id: 'nadac-margin', label: 'Pharmacy Margin Against NADAC (claims file)', fields: MARGIN_FIELDS },
  { id: 'pharmacy-spread-check', label: 'Pharmacy Spread Check: Claims Against NADAC', fields: CLAIM_FIELDS },
  { id: 'claims-pct-medicare', label: 'Claims Paid as a Percent of Medicare', fields: CLAIM_LINE_FIELDS },
  { id: 'mfp-refund-reconcile', label: 'Negotiated-Price Refund Reconciliation (claims file)', fields: MFP_CLAIM_FIELDS },
  { id: '340b-rx-match', label: '340B Prescription-to-Encounter Match (prescriptions file)', fields: RX_MATCH_FILES[0].fields },
  { id: 'fpl-percent', label: 'Federal Poverty Level Percent (households file)', fields: BATCH_TOOLS['fpl-percent'].fields },
  { id: 'fap-discount', label: 'Hospital Financial Assistance Discount (patients file)', fields: BATCH_TOOLS['fap-discount'].fields },
  { id: 'extra-help-msp-screen', label: 'Extra Help and Medicare Savings Program Screen (people file)', fields: BATCH_TOOLS['extra-help-msp-screen'].fields },
  { id: 'irmaa', label: 'Medicare IRMAA (people file)', fields: BATCH_TOOLS['irmaa'].fields },
  { id: 'premium-tax-credit', label: 'Premium Tax Credit Estimate (households file)', fields: BATCH_TOOLS['premium-tax-credit'].fields },
  { id: 'refill-eligible-date', label: 'Earliest Refill Date (fills file)', fields: BATCH_TOOLS['refill-eligible-date'].fields },
  { id: 'appeal-deadline', label: 'Medicare Appeal-Level Deadline (decisions file)', fields: BATCH_TOOLS['appeal-deadline'].fields },
  { id: 'gfe-deadline', label: 'Good Faith Estimate Deadline (schedule file)', fields: BATCH_TOOLS['gfe-deadline'].fields },
  { id: 'moon-deadline', label: 'Observation Notice (MOON) Deadline (patients file)', fields: BATCH_TOOLS['moon-deadline'].fields },
  { id: 'hospice-period-clock', label: 'Hospice Benefit Period Clock (census file)', fields: BATCH_TOOLS['hospice-period-clock'].fields },
  { id: 'dme-rental-clock', label: 'DME Capped Rental and Oxygen Clock (rentals file)', fields: BATCH_TOOLS['dme-rental-clock'].fields },
  { id: 'ma-org-determination-clock', label: 'Medicare Advantage Coverage Decision Clock (requests file)', fields: BATCH_TOOLS['ma-org-determination-clock'].fields },
  { id: 'erisa-claim-clock', label: 'Employer Plan Claim and Appeal Clock (ERISA) (claims file)', fields: BATCH_TOOLS['erisa-claim-clock'].fields },
  { id: 'nomnc-deadline', label: 'NOMNC Delivery Deadline (patients file)', fields: BATCH_TOOLS['nomnc-deadline'].fields },
  { id: 'cobra-clock', label: 'COBRA Deadlines and End Date (events file)', fields: BATCH_TOOLS['cobra-clock'].fields },
  { id: 'partb-late-penalty', label: 'Part B Late Enrollment Penalty (people file)', fields: BATCH_TOOLS['partb-late-penalty'].fields },
  { id: 'partd-late-penalty', label: 'Part D Late Enrollment Penalty (people file)', fields: BATCH_TOOLS['partd-late-penalty'].fields },
  { id: 'medicare-enrollment-window', label: 'Medicare Enrollment Window and Start Date (people file)', fields: BATCH_TOOLS['medicare-enrollment-window'].fields },
  { id: 'aca-sep-window', label: 'Marketplace Special Enrollment Window (households file)', fields: BATCH_TOOLS['aca-sep-window'].fields },
  { id: 'overpayment-60day', label: '60-Day Overpayment Report-and-Return Clock (overpayments file)', fields: BATCH_TOOLS['overpayment-60day'].fields },
  { id: 'pa-turnaround', label: 'Prior-Authorization Decision-Deadline Clock (requests file)', fields: BATCH_TOOLS['pa-turnaround'].fields },
  { id: 'timely-filing', label: 'Claim Timely-Filing Deadline (claims file)', fields: BATCH_TOOLS['timely-filing'].fields },
  { id: 'medicare-ffs-pa-required', label: 'Does Original Medicare Require Prior Authorization? (services file)', fields: BATCH_TOOLS['medicare-ffs-pa-required'].fields },
];
