// spec-v483: the Vancouver classification of periprosthetic femoral fractures after hip replacement, by the
// fracture location, the stability of the femoral stem, and the surrounding bone stock — types AG / AL / B1 /
// B2 / B3 / C. It is the standard classification guiding fixation vs revision and joins the femur fracture
// tiles. "vancouver periprosthetic" / "fracture around the stem" routed to nothing.
//
// HIGH-STAKES: this reports the fracture TYPE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic-trauma / arthroplasty team.
//
// TYPES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Duncan CP, Masri BA. Fractures of the femur after hip replacement. Instr Course Lect. 1995;44:293-304.
//   - Orthopedic references reproducing the same trochanteric (A) / around-the-stem (B, by stem fixation and
//     bone stock) / well-below-the-stem (C) grouping.
//
// Types (location x stem stability x bone stock):
//   AG : fracture of the greater trochanter.
//   AL : fracture of the lesser trochanter.
//   B1 : fracture around or just distal to the stem, with the stem well-fixed.
//   B2 : fracture around or just distal to the stem, with the stem loose but adequate proximal bone stock.
//   B3 : fracture around or just distal to the stem, with the stem loose and poor/deficient proximal bone stock.
//   C  : fracture well below the stem tip (the prosthesis is not involved).

const TYPES = {
  AG: { type: 'AG', text: 'Vancouver type AG - fracture of the greater trochanter.' },
  AL: { type: 'AL', text: 'Vancouver type AL - fracture of the lesser trochanter.' },
  B1: { type: 'B1', text: 'Vancouver type B1 - fracture around or just distal to the stem, with the stem well-fixed.' },
  B2: { type: 'B2', text: 'Vancouver type B2 - fracture around or just distal to the stem, with the stem loose but adequate proximal bone stock.' },
  B3: { type: 'B3', text: 'Vancouver type B3 - fracture around or just distal to the stem, with the stem loose and poor or deficient proximal bone stock.' },
  C: { type: 'C', text: 'Vancouver type C - fracture well below the stem tip; the prosthesis is not involved.' },
};

const NOTE = 'The Vancouver classification (Duncan & Masri 1995) groups periprosthetic femoral fractures after hip replacement by location, stem stability, and bone stock. AG/AL: trochanteric (greater/lesser). B1: around the stem, stem well-fixed. B2: around the stem, stem loose, adequate bone. B3: around the stem, stem loose, deficient bone. C: well below the stem tip. This reports the type the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  AG: 'AG', AL: 'AL', B1: 'B1', B2: 'B2', B3: 'B3', C: 'C',
  '1B': 'B1',
};

// input:
//   type: 'AG' / 'AL' / 'B1' / 'B2' / 'B3' / 'C' (case-insensitive).
export function vancouverPeriprosthetic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.type == null ? '' : o.type).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const t = TYPES[key];
  if (!t) {
    return { valid: false, message: 'Select the Vancouver type (AG, AL, B1, B2, B3, or C).' };
  }
  return {
    valid: true,
    type: t.type,
    bandLabel: `Vancouver type ${t.type}`,
    band: t.text,
    note: NOTE,
  };
}
