// A free-text field that asks for a person's name, ID, birth date or contact is kept out of the page's
// shareable link (app.js trackHashState): a link someone forwards must not carry it. A field is private when
// it is marked data-private, or when its label names one of these. Only free text and dates are matched by
// label; a select's choices (a cognitive test's "address recall") are not personal.
export const PERSONAL_LABEL = /\b(patient name|enrollee name|claimant name|name of the enrollee|beneficiary name|your name|full name|member id|medicaid id|subscriber id|date of birth|birth date|dob|emergency contact|account number|address|phone|e-?mail|social security|ssn|mbi|medicare number|prescriber name)\b/i;

// isPrivateField(node) -> true for an input whose value must stay out of the URL.
export function isPrivateField(node) {
  if (node.hasAttribute && node.hasAttribute('data-private')) return true;
  if (node.tagName !== 'INPUT' || !['text', 'search', 'email', 'tel', 'date', ''].includes(node.type || '')) return false;
  const label = node.labels && node.labels[0] ? node.labels[0].textContent : '';
  return PERSONAL_LABEL.test(label);
}
