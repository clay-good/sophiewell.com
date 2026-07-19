// spec-v431: the modified Bell staging of necrotizing enterocolitis (NEC), the staging of a newborn's NEC by
// systemic, intestinal, and radiographic findings — stages IA / IB / IIA / IIB / IIIA / IIIB. It completes
// the neonatology cluster with the Sarnat HIE staging (sarnat-hie) and the Papile IVH grade (papile-ivh).
// "bell staging" / "necrotizing enterocolitis stage" routed to nothing.
//
// HIGH-STAKES: this reports the STAGE the clinician has assigned from the newborn's findings, NOT a
// diagnosis, a treatment decision (e.g., medical management vs surgery), or a prognosis for an individual
// infant (spec-v11 §5.3). The management decision stays with the neonatology / pediatric-surgery team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Walsh MC, Kliegman RM. Necrotizing enterocolitis: treatment based on staging criteria. Pediatr Clin
//     North Am. 1986;33(1):179-201 (the modified Bell staging), refining Bell MJ, et al. Ann Surg. 1978.
//   - Neonatology / pediatric-surgery references reproducing the same suspected (I) / proven (II) /
//     advanced (III) staging with the A/B substages.
//
// Stages (systemic / intestinal / radiographic hallmarks):
//   IA   : suspected - temperature instability, apnea, bradycardia; gastric residuals, mild distension;
//          normal or nonspecific radiographs.
//   IB   : suspected - as IA plus grossly bloody stool.
//   IIA  : proven, mildly ill - as I plus absent bowel sounds and abdominal tenderness; pneumatosis
//          intestinalis on radiographs.
//   IIB  : proven, moderately ill - as IIA plus mild metabolic acidosis and thrombocytopenia; portal venous
//          gas +/- ascites on radiographs.
//   IIIA : advanced, severely ill, bowel intact - hypotension, combined acidosis, DIC, neutropenia;
//          peritonitis and marked distension; definite ascites on radiographs.
//   IIIB : advanced, severely ill, bowel perforated - as IIIA plus pneumoperitoneum on radiographs.

const STAGES = {
  IA: { stage: 'IA', text: 'Modified Bell stage IA (suspected) - temperature instability, apnea, bradycardia; gastric residuals, mild abdominal distension; normal or nonspecific radiographs.' },
  IB: { stage: 'IB', text: 'Modified Bell stage IB (suspected) - as IA plus grossly bloody stool.' },
  IIA: { stage: 'IIA', text: 'Modified Bell stage IIA (proven, mildly ill) - as stage I plus absent bowel sounds and abdominal tenderness; pneumatosis intestinalis on radiographs.' },
  IIB: { stage: 'IIB', text: 'Modified Bell stage IIB (proven, moderately ill) - as IIA plus mild metabolic acidosis and thrombocytopenia; portal venous gas, with or without ascites, on radiographs.' },
  IIIA: { stage: 'IIIA', text: 'Modified Bell stage IIIA (advanced, severely ill, bowel intact) - hypotension, combined acidosis, DIC, neutropenia; peritonitis and marked distension; definite ascites on radiographs.' },
  IIIB: { stage: 'IIIB', text: 'Modified Bell stage IIIB (advanced, severely ill, bowel perforated) - as IIIA plus pneumoperitoneum on radiographs.' },
};

const NOTE = 'The modified Bell staging (Walsh & Kliegman 1986) stages necrotizing enterocolitis by systemic, intestinal, and radiographic findings. I (IA/IB): suspected. II (IIA/IIB): proven (pneumatosis intestinalis; IIB adds portal venous gas, acidosis, thrombocytopenia). III (IIIA/IIIB): advanced and severely ill (IIIA bowel intact with peritonitis/ascites; IIIB perforated with pneumoperitoneum). This reports the stage the clinician has assigned, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  IA: 'IA', '1A': 'IA',
  IB: 'IB', '1B': 'IB',
  IIA: 'IIA', '2A': 'IIA',
  IIB: 'IIB', '2B': 'IIB',
  IIIA: 'IIIA', '3A': 'IIIA',
  IIIB: 'IIIB', '3B': 'IIIB',
};

// input:
//   stage: 'IA' / 'IB' / 'IIA' / 'IIB' / 'IIIA' / 'IIIB' (case-insensitive; also accepts 1a/1b/2a/2b/3a/3b).
export function bellNec(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the modified Bell stage (IA, IB, IIA, IIB, IIIA, or IIIB).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Modified Bell stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
