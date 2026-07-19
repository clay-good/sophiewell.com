// spec-v429: the Sarnat staging of neonatal hypoxic-ischemic encephalopathy (HIE), the clinical grading of a
// term newborn's encephalopathy after a hypoxic-ischemic insult — stages 1 (mild) / 2 (moderate) /
// 3 (severe). It is the standard bedside staging in neonatal HIE. "sarnat staging" / "neonatal HIE stage"
// routed to nothing.
//
// HIGH-STAKES: this reports the clinical STAGE the clinician has assigned from the newborn's examination, NOT
// a diagnosis, a treatment decision (e.g., therapeutic hypothermia eligibility), or a prognosis for an
// individual infant (spec-v11 §5.3). The management decision stays with the neonatology team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Sarnat HB, Sarnat MS. Neonatal encephalopathy following fetal distress. A clinical and
//     electroencephalographic study. Arch Neurol. 1976;33(10):696-705.
//   - Neonatology references reproducing the same mild (1) / moderate (2) / severe (3) grading by level of
//     consciousness, tone, reflexes, autonomic function, and seizures.
//
// Stages (term newborn, clinical exam):
//   1 (mild)     : hyperalert, normal or slightly increased tone, weak suck, exaggerated Moro, sympathetic
//                  overdrive (mydriasis, tachycardia), no seizures; usually resolves within 24 hours.
//   2 (moderate) : lethargic/obtunded, hypotonia, weak or absent suck, seizures common, parasympathetic
//                  predominance (miosis, bradycardia).
//   3 (severe)   : stupor or coma, flaccid tone, absent primitive reflexes, suppressed or isoelectric EEG,
//                  seizures may be present.

const STAGES = {
  1: { stage: '1', label: 'mild', text: 'Sarnat stage 1 (mild) - hyperalert, normal or slightly increased tone, weak suck, exaggerated Moro, sympathetic overdrive; no seizures, usually resolves within 24 hours.' },
  2: { stage: '2', label: 'moderate', text: 'Sarnat stage 2 (moderate) - lethargic or obtunded, hypotonia, weak or absent suck, parasympathetic predominance; seizures common.' },
  3: { stage: '3', label: 'severe', text: 'Sarnat stage 3 (severe) - stupor or coma, flaccid tone, absent primitive reflexes, suppressed or isoelectric EEG; seizures may be present.' },
};

const NOTE = 'The Sarnat staging (Sarnat & Sarnat 1976) grades neonatal hypoxic-ischemic encephalopathy in a term newborn by level of consciousness, tone, reflexes, autonomic function, and seizures. 1 (mild): hyperalert, no seizures, resolves within 24 hours. 2 (moderate): lethargic, hypotonic, seizures common. 3 (severe): stupor or coma, flaccid, suppressed EEG. This reports the stage the clinician has assigned, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  1: 1, 2: 2, 3: 3,
  I: 1, II: 2, III: 3,
  MILD: 1, MODERATE: 2, SEVERE: 3,
};

// input:
//   stage: '1' / '2' / '3' (also accepts I/II/III and mild/moderate/severe).
export function sarnatHie(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Sarnat stage (1, 2, or 3).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Sarnat stage ${s.stage} (${s.label})`,
    band: s.text,
    note: NOTE,
  };
}
