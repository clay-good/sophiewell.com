// spec-v4 §5 utility 114: ACA Special Enrollment Period eligibility.
//
// Static catalog of qualifying life events with window length and required
// documentation. Pure data + helpers.

export const ACA_SEP_EVENTS = {
  'loss-of-coverage': {
    label: 'Lost minimum essential coverage',
    windowDays: 60,
    windowAlsoBefore: 60,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Termination notice from prior plan with end date', 'Letter from employer with end date'],
  },
  'marriage': {
    label: 'Marriage',
    windowDays: 60,
    windowAlsoBefore: 0,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Marriage certificate', 'Proof at least one spouse had qualifying coverage in 60 days prior'],
  },
  'birth-adoption': {
    label: 'Birth, adoption, or placement for adoption / foster',
    windowDays: 60,
    windowAlsoBefore: 0,
    coverageStarts: 'Date of event (retroactive)',
    documentation: ['Birth certificate', 'Adoption decree', 'Foster placement order'],
  },
  'permanent-move': {
    label: 'Permanent move to a new ZIP or county',
    windowDays: 60,
    windowAlsoBefore: 60,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Lease or mortgage documents', 'Driver license with new address', 'Proof of qualifying coverage in 60 days prior'],
  },
  'medicaid-chip-denial': {
    label: 'Denied Medicaid or CHIP eligibility',
    windowDays: 60,
    windowAlsoBefore: 0,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Eligibility denial notice from state Medicaid or CHIP'],
  },
  'income-fpl-change': {
    label: 'Household income change crossing 150% FPL (existing Marketplace enrollees only)',
    windowDays: 60,
    windowAlsoBefore: 0,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Income documentation'],
  },
  'cobra-exhaustion': {
    label: 'COBRA coverage exhausted (max benefit period reached)',
    windowDays: 60,
    windowAlsoBefore: 60,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Notice of COBRA exhaustion'],
    note: 'Voluntarily ending COBRA early does not trigger an SEP.',
  },
  'gain-citizenship': {
    label: 'Gained US citizenship or lawful presence',
    windowDays: 60,
    windowAlsoBefore: 0,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Naturalization certificate', 'Permanent resident card'],
  },
  'release-from-incarceration': {
    label: 'Released from incarceration',
    windowDays: 60,
    windowAlsoBefore: 0,
    coverageStarts: 'First of the month after plan selection',
    documentation: ['Release papers'],
  },
};

export function sepFor(eventId) {
  if (!Object.hasOwn(ACA_SEP_EVENTS, eventId)) return null;
  return ACA_SEP_EVENTS[eventId];
}

export function sepEventIds() {
  return Object.keys(ACA_SEP_EVENTS);
}
