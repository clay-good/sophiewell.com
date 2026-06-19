// spec-v109 (fourth spec of Wave 2 of the spec-v100 MDCalc Parity Completion
// program): five deterministic trauma-classification and soft-tissue-infection
// decision rules that fill confirmed gaps. None duplicates a live tile.
//
//   denverBcvi        - Expanded Denver Criteria (blunt cerebrovascular injury)
//   aastOrganInjury   - AAST 2018 solid-organ injury grade (spleen/liver/kidney)
//   mangledExtremity  - Mangled Extremity Severity Score (MESS)
//   lrinec            - Laboratory Risk Indicator for Necrotizing Fasciitis
//   alt70             - ALT-70 cellulitis score
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v34.js wire these to the home grid.
//
// COEFFICIENTS / CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97 lesson; spec-v109
// §3), each cross-verified across >= 2 independent sources (original paper +
// MDCalc / RadioGraphics / WikEM / EAST guideline):
//   - Denver BCVI (Burlew CC, et al, J Trauma Acute Care Surg 2012): CT
//     angiography indicated if ANY sign/symptom or risk factor is present. The
//     2012 expanded set is the six signs/symptoms (arterial hemorrhage, cervical
//     bruit age < 50, expanding hematoma, focal deficit, deficit incongruous with
//     head CT, stroke on secondary CT) and the six high-energy-mechanism risk
//     factors (LeFort II/III, cervical-spine fracture patterns, basilar skull
//     fracture with carotid-canal involvement, DAI with GCS < 6, near-hanging with
//     anoxia, seatbelt/clothesline with swelling/pain/AMS). Class B.
//   - AAST 2018 OIS (Kozar RA, et al, J Trauma Acute Care Surg 2018, Tables 1-3):
//     spleen/liver/kidney grades I-V by hematoma/laceration thresholds plus the
//     NEW 2018 vascular rule -- a vascular injury (pseudoaneurysm/AVF) or active
//     bleeding CONTAINED within the organ capsule/fascia bumps the grade, and
//     active bleeding EXTENDING beyond into the peritoneum/retroperitoneum bumps
//     one grade higher: spleen contained IV / beyond V; liver contained III /
//     beyond IV; kidney contained III / beyond IV. Final grade is the highest of
//     the entered anatomic finding and the vascular finding. Class B.
//   - MESS (Johansen K, et al, J Trauma 1990): skeletal/soft-tissue energy 1-4,
//     limb ischemia 1-3 DOUBLED if ischemia time > 6 h, shock 0-2 by SBP, age band
//     0-2; total ~2-14; >= 7 historically associated with amputation. Class A.
//   - LRINEC (Wong CH, et al, Crit Care Med 2004): CRP >= 150 mg/L = 4; WBC
//     15-25/>25 (x10^3) = 1/2; Hb 11-13.5/<11 g/dL = 1/2; Na < 135 = 2; creatinine
//     > 1.6 mg/dL = 2; glucose > 180 mg/dL = 1 (total 0-13). Low <= 5, intermediate
//     6-7, high >= 8; a score >= 6 should raise suspicion. Class A.
//   - ALT-70 (Raff AB, et al, J Am Acad Dermatol 2017): Asymmetry 3, Leukocytosis
//     (WBC >= 10 x10^3) 1, Tachycardia (HR >= 90) 1, age >= 70 = 2 (total 0-7).
//     <= 2 cellulitis unlikely, 3-4 indeterminate, >= 5 cellulitis likely. Class A.
//
// Robustness (spec-v109 §3): mangledExtremity applies the ischemia-time doubling
// explicitly and renders that it did; aastOrganInjury walks the per-organ grade
// rules and takes the higher of the anatomic and vascular grade; denverBcvi,
// lrinec, and alt70 band their inputs and clamp every total to its published
// range. None authors a CTA, surgical-debridement, antibiotic, or amputation
// order in Sophie's voice (spec-v11 §5.3); the decision stays with the clinician.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

// --- 2.1 denver-bcvi - Expanded Denver Criteria for BCVI ---------------------
const DENVER_NOTE = 'Expanded Denver Criteria (Burlew CC, Biffl WL, Moore EE, et al, J Trauma Acute Care Surg 2012): identify blunt-trauma patients who warrant CT angiography to screen for blunt cerebrovascular injury (BCVI). CTA is indicated if ANY sign/symptom of BCVI (arterial hemorrhage from neck/nose/mouth, cervical bruit in a patient < 50, expanding cervical hematoma, focal neurologic deficit, a neurologic exam incongruous with head CT, or stroke on secondary CT) OR ANY high-energy-mechanism risk factor (LeFort II/III fracture, a cervical-spine fracture pattern, basilar skull fracture with carotid-canal involvement, diffuse axonal injury with GCS < 6, near-hanging with anoxia, or a seatbelt/clothesline injury with cervical swelling/pain/altered mental status) is present. A screening aid, not an imaging order; the decision stays with the clinician and local protocol.';
const DENVER_SIGNS = [
  { key: 'arterialHemorrhage', text: 'Arterial hemorrhage from neck, nose, or mouth' },
  { key: 'cervicalBruit', text: 'Cervical bruit in a patient < 50 years' },
  { key: 'expandingHematoma', text: 'Expanding cervical hematoma' },
  { key: 'focalDeficit', text: 'Focal neurologic deficit (TIA, hemiparesis, vertebrobasilar, Horner)' },
  { key: 'deficitIncongruous', text: 'Neurologic exam incongruous with head CT findings' },
  { key: 'strokeOnCt', text: 'Stroke on secondary CT scan' },
];
const DENVER_RISKS = [
  { key: 'lefort', text: 'High-energy mechanism with LeFort II or III fracture' },
  { key: 'cspineFracture', text: 'Cervical-spine fracture (subluxation, transverse-foramen, or C1-C3)' },
  { key: 'basilarCarotid', text: 'Basilar skull fracture with carotid-canal involvement' },
  { key: 'daiLowGcs', text: 'Diffuse axonal injury with GCS < 6' },
  { key: 'nearHanging', text: 'Near-hanging with anoxic brain injury' },
  { key: 'seatbeltSign', text: 'Seatbelt/clothesline injury with cervical swelling, pain, or AMS' },
];

export function denverBcvi(input = {}) {
  const signs = DENVER_SIGNS.filter((it) => onFlag(input[it.key]));
  const risks = DENVER_RISKS.filter((it) => onFlag(input[it.key]));
  const flagged = signs.concat(risks);
  const screen = flagged.length > 0;
  return {
    valid: true,
    positive: flagged.length,
    screen,
    flagged: flagged.map((f) => f.text),
    band: screen
      ? `${flagged.length} criteri${flagged.length > 1 ? 'a' : 'on'} positive (${flagged.map((f) => f.text).join('; ')}): CT angiography screening for BCVI is indicated.`
      : 'No Denver screening criterion met: BCVI screening is not indicated by the rule.',
    abnormal: screen,
    note: DENVER_NOTE,
  };
}

// --- 2.2 aast-organ-injury - AAST 2018 solid-organ injury scale --------------
const AAST_NOTE = 'AAST 2018 Organ Injury Scale (Kozar RA, Crandall M, Shanmuganathan K, et al; AAST Patient Assessment Committee, J Trauma Acute Care Surg 2018): grades spleen, liver, and kidney trauma I-V. The 2018 revision added the vascular-injury rule: a vascular injury (pseudoaneurysm or AV fistula) or active bleeding CONTAINED within the organ capsule/fascia raises the grade (spleen IV, liver III, kidney III), and active bleeding EXTENDING beyond the organ into the peritoneum/retroperitoneum raises it one grade higher (spleen V, liver IV, kidney IV). The final grade is the highest of the anatomic finding and the vascular finding. A classification, not an operative decision; the management (observation, angioembolization, or operation) stays with the trauma team and local protocol.';
// Per-organ anatomic findings keyed by base grade, plus the contained / beyond
// vascular grades. Imaging-column thresholds from Kozar 2018 Tables 1-3.
const AAST_ORGANS = {
  spleen: {
    label: 'Spleen',
    contained: 4, beyond: 5,
    findings: {
      1: 'Subcapsular hematoma < 10% surface area; laceration < 1 cm depth; capsular tear',
      2: 'Subcapsular hematoma 10-50%; intraparenchymal hematoma < 5 cm; laceration 1-3 cm depth',
      3: 'Subcapsular hematoma > 50%; ruptured or intraparenchymal hematoma >= 5 cm; laceration > 3 cm depth',
      4: 'Segmental or hilar vessel laceration producing > 25% devascularization',
      5: 'Shattered spleen',
    },
  },
  liver: {
    label: 'Liver',
    contained: 3, beyond: 4,
    findings: {
      1: 'Subcapsular hematoma < 10% surface area; laceration < 1 cm depth; capsular tear',
      2: 'Subcapsular hematoma 10-50%; intraparenchymal hematoma < 10 cm; laceration 1-3 cm depth, <= 10 cm length',
      3: 'Subcapsular hematoma > 50% or ruptured; intraparenchymal hematoma > 10 cm; laceration > 3 cm depth',
      4: 'Parenchymal disruption involving 25-75% of a hepatic lobe',
      5: 'Parenchymal disruption > 75% of a hepatic lobe; juxtahepatic venous injury',
    },
  },
  kidney: {
    label: 'Kidney',
    contained: 3, beyond: 4,
    findings: {
      1: 'Subcapsular hematoma and/or contusion without laceration',
      2: 'Perirenal hematoma confined to Gerota fascia; laceration <= 1 cm depth without urinary extravasation',
      3: 'Laceration > 1 cm depth without collecting-system rupture or urinary extravasation',
      4: 'Collecting-system laceration with urinary extravasation; renal pelvis or UPJ disruption; segmental vessel injury; segmental/complete infarction',
      5: 'Main renal artery/vein laceration or hilar avulsion; shattered kidney; devascularized kidney with active bleeding',
    },
  },
};

export function aastOrganInjury(input = {}) {
  const organKey = typeof input.organ === 'string' ? input.organ : '';
  const org = AAST_ORGANS[organKey];
  if (!org) {
    return { valid: false, band: 'Select an organ (spleen, liver, or kidney) and the worst anatomic finding.', note: AAST_NOTE };
  }
  const anatV = fin(input.finding);
  const anat = anatV != null ? clamp(Math.round(anatV), 0, 5) : 0;
  const vascular = input.vascular === 'contained' ? org.contained
    : input.vascular === 'beyond' ? org.beyond : 0;
  if (anat < 1 && vascular < 1) {
    return { valid: false, band: `Select the worst ${org.label.toLowerCase()} anatomic finding (or a vascular finding) to compute the AAST grade.`, note: AAST_NOTE };
  }
  const grade = Math.max(anat, vascular);
  const reasons = [];
  if (anat >= 1) reasons.push(`anatomic finding (grade ${ROMAN[anat]}): ${org.findings[anat]}`);
  if (vascular >= 1) {
    reasons.push(input.vascular === 'beyond'
      ? `active bleeding extending beyond the ${org.label.toLowerCase()} (grade ${ROMAN[org.beyond]})`
      : `vascular injury / active bleeding contained within the ${org.label.toLowerCase()} (grade ${ROMAN[org.contained]})`);
  }
  const vascularSet = vascular > anat;
  return {
    valid: true,
    organ: org.label,
    grade,
    gradeRoman: ROMAN[grade],
    anat, vascular,
    vascularSet,
    band: `AAST ${org.label} injury grade ${ROMAN[grade]} (I-V), set by the ${vascularSet ? '2018 vascular-injury rule' : 'anatomic finding'}: ${reasons.join('; ')}.`,
    abnormal: grade >= 4,
    note: AAST_NOTE,
  };
}

// --- 2.3 mangled-extremity - Mangled Extremity Severity Score (MESS) ----------
const MESS_NOTE = 'Mangled Extremity Severity Score (Johansen K, Daines M, Howey T, Helfet D, Hansen ST, J Trauma 1990): an objective limb-salvage-vs-amputation aid after lower-extremity trauma. Four components: skeletal/soft-tissue injury energy (low 1, medium 2, high 3, very high/massive crush 4); limb ischemia (reduced pulse/normal perfusion 1, pulseless/paresthesias/diminished cap refill 2, cool/insensate/numb 3) -- DOUBLED if the ischemia time exceeds 6 hours; shock (SBP always > 90 = 0, transient hypotension 1, persistent hypotension 2); and age (< 30 = 0, 30-50 = 1, > 50 = 2). A total >= 7 was historically associated with amputation in the original validation. The score informs, never dictates, the salvage-vs-amputation decision; the call stays with the surgical team.';

export function mangledExtremity(input = {}) {
  const skeletal = fin(input.skeletal);
  const ischemia = fin(input.ischemia);
  if (skeletal == null || skeletal < 1 || skeletal > 4) {
    return { valid: false, band: 'Select the skeletal/soft-tissue injury energy (1-4).', note: MESS_NOTE };
  }
  if (ischemia == null || ischemia < 1 || ischemia > 3) {
    return { valid: false, band: 'Select the limb-ischemia grade (1-3).', note: MESS_NOTE };
  }
  const sk = clamp(Math.round(skeletal), 1, 4);
  const isc = clamp(Math.round(ischemia), 1, 3);
  const doubled = onFlag(input.ischemiaOver6h);
  const ischemiaPts = doubled ? isc * 2 : isc;
  const shock = input.shock == null ? 0 : clamp(Math.round(fin(input.shock) ?? 0), 0, 2);
  const age = input.age == null ? 0 : clamp(Math.round(fin(input.age) ?? 0), 0, 2);
  const total = clamp(sk + ischemiaPts + shock + age, 0, 14);
  const amp = total >= 7;
  return {
    valid: true,
    total, doubled, amp,
    terms: [
      { label: 'Skeletal / soft-tissue energy', value: sk },
      { label: doubled ? `Limb ischemia (x2, ischemia time > 6 h)` : 'Limb ischemia', value: ischemiaPts },
      { label: 'Shock (systolic BP)', value: shock },
      { label: 'Age band', value: age },
    ],
    band: `MESS ${total}${doubled ? ' (ischemia subscore doubled for ischemia time > 6 h)' : ''}: ${amp ? 'at or above the threshold of 7 historically associated with amputation.' : 'below the threshold of 7 associated with amputation in the original validation.'}`,
    abnormal: amp,
    note: MESS_NOTE,
  };
}

// --- 2.4 lrinec - Laboratory Risk Indicator for Necrotizing Fasciitis ---------
const LRINEC_NOTE = 'LRINEC score (Wong CH, Khin LW, Heng KS, Tan KC, Low CO, Crit Care Med 2004): a 6-lab tool to distinguish necrotizing fasciitis from other soft-tissue infections. Points: CRP >= 150 mg/L = 4; WBC 15-25 = 1, > 25 = 2 (x10^3/uL); hemoglobin 11-13.5 = 1, < 11 = 2 (g/dL); sodium < 135 mmol/L = 2; creatinine > 1.6 mg/dL = 2; glucose > 180 mg/dL = 1 (total 0-13). Low risk <= 5 (probability of necrotizing fasciitis < 50%), intermediate 6-7 (50-75%), high >= 8 (> 75%); a score >= 6 should raise suspicion. A low score does NOT rule out necrotizing fasciitis -- surgical exploration remains the diagnostic standard. A suspicion aid, not a diagnosis.';

export function lrinec(input = {}) {
  const terms = [];
  let total = 0;
  const crp = fin(input.crp);
  if (crp != null) { const p = crp >= 150 ? 4 : 0; total += p; terms.push({ label: `CRP ${crp} mg/L`, value: p }); }
  const wbc = fin(input.wbc);
  if (wbc != null) { const p = wbc > 25 ? 2 : wbc >= 15 ? 1 : 0; total += p; terms.push({ label: `WBC ${wbc} x10^3/uL`, value: p }); }
  const hb = fin(input.hemoglobin);
  if (hb != null) { const p = hb < 11 ? 2 : hb <= 13.5 ? 1 : 0; total += p; terms.push({ label: `Hemoglobin ${hb} g/dL`, value: p }); }
  const na = fin(input.sodium);
  if (na != null) { const p = na < 135 ? 2 : 0; total += p; terms.push({ label: `Sodium ${na} mmol/L`, value: p }); }
  const cr = fin(input.creatinine);
  if (cr != null) { const p = cr > 1.6 ? 2 : 0; total += p; terms.push({ label: `Creatinine ${cr} mg/dL`, value: p }); }
  const glu = fin(input.glucose);
  if (glu != null) { const p = glu > 180 ? 1 : 0; total += p; terms.push({ label: `Glucose ${glu} mg/dL`, value: p }); }
  total = clamp(total, 0, 13);
  const band = total >= 8 ? 'high' : total >= 6 ? 'intermediate' : 'low';
  const prob = total >= 8 ? '> 75%' : total >= 6 ? '50-75%' : '< 50%';
  return {
    valid: true, total, riskBand: band, terms,
    band: `LRINEC ${total}: ${band} risk of necrotizing fasciitis (${prob}).${total >= 6 ? ' A score >= 6 should raise suspicion.' : ''}`,
    abnormal: total >= 6,
    note: LRINEC_NOTE,
  };
}

// --- 2.5 alt-70 - ALT-70 cellulitis score ------------------------------------
const ALT70_NOTE = 'ALT-70 cellulitis score (Raff AB, Weng QY, Cohen JM, et al, J Am Acad Dermatol 2017): a 4-item score to distinguish lower-extremity cellulitis from its mimics (pseudocellulitis). Asymmetry (unilateral) = 3, Leukocytosis (WBC >= 10 x10^3/uL) = 1, Tachycardia (HR >= 90) = 1, and age >= 70 = 2 (total 0-7). A score <= 2 means cellulitis is unlikely (>= 83% likelihood of pseudocellulitis -- reassess the differential); 3-4 is indeterminate; >= 5 means cellulitis is likely (>= 82% likelihood). A diagnostic aid, not an antibiotic order; the treatment decision stays with the clinician.';

export function alt70(input = {}) {
  const terms = [];
  let total = 0;
  const asym = onFlag(input.asymmetry);
  if (asym) { total += 3; terms.push({ label: 'Asymmetry (unilateral)', value: 3 }); }
  else terms.push({ label: 'Asymmetry (unilateral)', value: 0 });
  const wbc = fin(input.wbc);
  if (wbc != null) { const p = wbc >= 10 ? 1 : 0; total += p; terms.push({ label: `Leukocytosis (WBC ${wbc} x10^3/uL >= 10)`, value: p }); }
  const hr = fin(input.hr);
  if (hr != null) { const p = hr >= 90 ? 1 : 0; total += p; terms.push({ label: `Tachycardia (HR ${hr} >= 90)`, value: p }); }
  const age = fin(input.age);
  if (age != null) { const p = age >= 70 ? 2 : 0; total += p; terms.push({ label: `Age ${age} >= 70`, value: p }); }
  total = clamp(total, 0, 7);
  const band = total >= 5 ? 'cellulitis likely' : total >= 3 ? 'indeterminate' : 'cellulitis unlikely';
  const detail = total >= 5 ? ' (>= 82% likelihood of cellulitis)'
    : total >= 3 ? ' -- consider dermatology or infectious-disease input'
    : ' (>= 83% likelihood of pseudocellulitis -- reassess the differential)';
  return {
    valid: true, total, riskBand: band, terms,
    band: `ALT-70 ${total}: ${band}${detail}.`,
    abnormal: total <= 2,
    note: ALT70_NOTE,
  };
}
