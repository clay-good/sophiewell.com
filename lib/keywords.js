// Pure deterministic keyword matcher used by the Appointment Prep generator.
// No language understanding. Tag-based scoring with simple keyword expansion.

const KEYWORD_TO_TAGS = {
  // Symptom families
  pain: ['new symptom', 'chronic'],
  cough: ['new symptom'],
  fever: ['new symptom', 'pediatric well-child'],
  headache: ['new symptom'],
  rash: ['new symptom'],
  fatigue: ['new symptom', 'chronic'],
  // Test families
  blood: ['lab'],
  labs: ['lab'],
  scan: ['imaging'],
  ct: ['imaging'],
  mri: ['imaging'],
  xray: ['imaging'],
  ultrasound: ['imaging'],
  // Concerns
  cost: ['cost'],
  price: ['cost'],
  insurance: ['cost'],
  bill: ['cost'],
  medication: ['medication review'],
  pill: ['medication review'],
  side: ['medication review'],
  // Conditions / contexts
  diabetes: ['chronic', 'medication review'],
  hypertension: ['chronic', 'medication review'],
  pregnancy: ['prenatal'],
  prenatal: ['prenatal'],
  surgery: ['pre-operative', 'post-operative'],
  preop: ['pre-operative'],
  postop: ['post-operative'],
  anxiety: ['mental health'],
  depression: ['mental health'],
  child: ['pediatric well-child'],
  baby: ['pediatric well-child'],
};

export function expandTags(visitType, freeText) {
  const tags = new Set(['all']);
  if (visitType) tags.add(String(visitType).toLowerCase());
  const text = String(freeText || '').toLowerCase();
  // Tokenize on non-letters; match each token against the keyword map.
  const tokens = text.split(/[^a-z]+/).filter(Boolean);
  for (const t of tokens) {
    const mapped = KEYWORD_TO_TAGS[t];
    if (mapped) for (const tag of mapped) tags.add(tag);
  }
  return tags;
}

export function selectQuestions(bank, { visitType, freeText, sections }) {
  const tags = expandTags(visitType, freeText);
  const wantedSections = sections && sections.length ? new Set(sections) : null;

  const chosen = bank.questions.filter((q) => {
    if (wantedSections && !wantedSections.has(q.section)) return false;
    return (q.tags || []).some((t) => tags.has(t));
  });

  // Group by section in declared order.
  const bySection = new Map();
  for (const s of bank.sections) bySection.set(s, []);
  for (const q of chosen) {
    if (!bySection.has(q.section)) bySection.set(q.section, []);
    bySection.get(q.section).push(q.text);
  }
  // Drop empty sections.
  const out = [];
  for (const [name, items] of bySection) if (items.length) out.push({ section: name, items });
  return { tags: [...tags], sections: out };
}

export function selectChecklist(bank, procedureId) {
  const proc = (bank.procedures || []).find((p) => p.id === procedureId);
  if (!proc) return null;
  return { id: proc.id, name: proc.name, items: proc.items.slice() };
}
