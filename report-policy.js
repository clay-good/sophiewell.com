// Tools whose working state can contain direct identifiers or patient-authored
// documents. Reports for these tools carry only the tool id and an optional
// clinician-written note; the browser and Worker both enforce this boundary.

export const SENSITIVE_CONTEXT_TOOLS = new Set([
  'appeal-letter',
  'discharge-instr',
  'hipaa-auth',
  'hipaa-roa',
  'mbi-validate',
  'pa-lint',
  'prior-auth',
  'prep',
  'roi',
  'sbar-template',
  'specialty-visit',
  'wallet-card',
]);
