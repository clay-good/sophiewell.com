// spec-v443: the Kadish staging of esthesioneuroblastoma (olfactory neuroblastoma), by the anatomic extent of
// the tumor — stages A / B / C / D. It is the standard staging for this sinonasal tumor. "kadish" /
// "esthesioneuroblastoma stage" routed to nothing.
//
// This tile reports the MODIFIED Kadish staging (the Morita 1993 modification adds stage D for metastatic
// disease to the original Kadish A/B/C). Stage D is the modification; the original scheme is A/B/C.
//
// HIGH-STAKES: this reports the anatomic STAGE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// head-and-neck oncology / skull-base team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Kadish S, Goodman M, Wang CC. Olfactory neuroblastoma. A clinical analysis of 17 cases. Cancer.
//     1976;37(3):1571-1576 (stages A-C), modified by Morita A, et al. Neurosurgery. 1993 (adds stage D).
//   - Otolaryngology / oncology references reproducing the same nasal-cavity (A) / sinus (B) /
//     beyond-sinuses (C) / metastatic (D) staging.
//
// Stages (anatomic extent):
//   A : tumor confined to the nasal cavity.
//   B : tumor involving the nasal cavity and one or more paranasal sinuses.
//   C : tumor extending beyond the nasal cavity and paranasal sinuses (orbit, skull base, or intracranial).
//   D : tumor with metastasis to cervical lymph nodes or distant sites (Morita modification).

const STAGES = {
  A: { stage: 'A', text: 'Kadish stage A - tumor confined to the nasal cavity.' },
  B: { stage: 'B', text: 'Kadish stage B - tumor involving the nasal cavity and one or more paranasal sinuses.' },
  C: { stage: 'C', text: 'Kadish stage C - tumor extending beyond the nasal cavity and paranasal sinuses (orbit, skull base, or intracranial).' },
  D: { stage: 'D', text: 'Kadish stage D - tumor with metastasis to cervical lymph nodes or distant sites (Morita modification).' },
};

const NOTE = 'The Kadish staging (Kadish 1976; modified Kadish adds stage D, Morita 1993) stages esthesioneuroblastoma by anatomic extent. A: confined to the nasal cavity. B: nasal cavity plus paranasal sinuses. C: beyond the sinuses (orbit, skull base, intracranial). D: metastasis to cervical nodes or distant sites. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C', D: 'D',
};

// input:
//   stage: 'A' / 'B' / 'C' / 'D' (case-insensitive).
export function kadish(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Kadish stage (A, B, C, or D).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Kadish stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
