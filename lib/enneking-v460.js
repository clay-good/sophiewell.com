// spec-v460: the Enneking surgical staging system for malignant musculoskeletal tumors (sarcomas), combining
// histologic grade (G), local extent / compartment (T), and metastasis (M) into stages IA / IB / IIA / IIB /
// III. It is the standard surgical staging of bone and soft-tissue sarcoma (the MSTS system) and companions
// the Mirels pathologic-fracture tile. "enneking" / "musculoskeletal sarcoma staging" routed to nothing.
//
// HIGH-STAKES: this reports the surgical STAGE the clinician has determined from grade / compartment /
// metastasis, NOT a diagnosis, a treatment decision, or a prognosis for an individual patient (spec-v11
// §5.3). The management decision stays with the orthopedic-oncology team.
//
// STAGES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Enneking WF, Spanier SS, Goodman MA. A system for the surgical staging of musculoskeletal sarcoma.
//     Clin Orthop Relat Res. 1980;(153):106-120.
//   - Orthopedic-oncology references reproducing the same G/T/M combinations: low-grade (I) vs high-grade (II),
//     intracompartmental (A) vs extracompartmental (B), and any metastasis (III).
//
// Stages (grade G, compartment T, metastasis M):
//   IA  : low-grade (G1), intracompartmental (T1), no metastasis (M0).
//   IB  : low-grade (G1), extracompartmental (T2), no metastasis (M0).
//   IIA : high-grade (G2), intracompartmental (T1), no metastasis (M0).
//   IIB : high-grade (G2), extracompartmental (T2), no metastasis (M0).
//   III : any regional or distant metastasis (M1), regardless of grade or compartment.

const STAGES = {
  IA: { stage: 'IA', text: 'Enneking stage IA - low-grade (G1), intracompartmental (T1), no metastasis (M0).' },
  IB: { stage: 'IB', text: 'Enneking stage IB - low-grade (G1), extracompartmental (T2), no metastasis (M0).' },
  IIA: { stage: 'IIA', text: 'Enneking stage IIA - high-grade (G2), intracompartmental (T1), no metastasis (M0).' },
  IIB: { stage: 'IIB', text: 'Enneking stage IIB - high-grade (G2), extracompartmental (T2), no metastasis (M0).' },
  III: { stage: 'III', text: 'Enneking stage III - any regional or distant metastasis (M1), regardless of grade or compartment.' },
};

const NOTE = 'The Enneking (MSTS) surgical staging of malignant musculoskeletal tumors (Enneking 1980) combines histologic grade (G1 low, G2 high), compartment (T1 intracompartmental, T2 extracompartmental), and metastasis (M). IA: G1 T1 M0. IB: G1 T2 M0. IIA: G2 T1 M0. IIB: G2 T2 M0. III: any M1. This reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  IA: 'IA', IB: 'IB', IIA: 'IIA', IIB: 'IIB', III: 'III',
  '1A': 'IA', '1B': 'IB', '2A': 'IIA', '2B': 'IIB', '3': 'III',
};

// input:
//   stage: 'IA' / 'IB' / 'IIA' / 'IIB' / 'III' (case-insensitive; also accepts 1A/1B/2A/2B/3).
export function enneking(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.stage == null ? '' : o.stage).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const s = STAGES[key];
  if (!s) {
    return { valid: false, message: 'Select the Enneking stage (IA, IB, IIA, IIB, or III).' };
  }
  return {
    valid: true,
    stage: s.stage,
    bandLabel: `Enneking stage ${s.stage}`,
    band: s.text,
    note: NOTE,
  };
}
