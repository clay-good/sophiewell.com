// spec-v484: the Barrack classification of the cement mantle around a cemented femoral stem, by the quality of
// cementing on the immediate postoperative radiograph — grades A / B / C / D. It companions the arthroplasty /
// periprosthetic tiles. "barrack" / "cement mantle grade" routed to nothing.
//
// HIGH-STAKES: this reports the radiographic GRADE the clinician has determined, NOT a diagnosis, a treatment
// decision, or a prognosis for an individual patient (spec-v11 §5.3). The management decision stays with the
// orthopedic team.
//
// GRADES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Barrack RL, Mulroy RD Jr, Harris WH. Improved cementing techniques and femoral component loosening in
//     young patients with hip arthroplasty. A 12-year radiographic review. J Bone Joint Surg Br.
//     1992;74(3):385-389.
//   - Arthroplasty references reproducing the same complete-white-out (A) / slight-radiolucency (B) /
//     50-99%-radiolucency-or-defect (C) / 100%-radiolucency-or-unfilled (D) grading.
//
// Grades (cement-mantle quality):
//   A : complete filling of the medullary cavity by cement, with a "white-out" at the cement-bone interface.
//   B : a slight radiolucency at the cement-bone interface, but nearly complete filling.
//   C : a radiolucency involving 50% to 99% of the cement-bone interface, or a cement-mantle defect.
//   D : a radiolucency at 100% of the cement-bone interface, or a failure to fill the canal (no cement distal
//       to the stem tip, a gross defect).

const GRADES = {
  A: { grade: 'A', text: 'Barrack grade A - complete filling of the medullary cavity by cement, with a "white-out" at the cement-bone interface.' },
  B: { grade: 'B', text: 'Barrack grade B - a slight radiolucency at the cement-bone interface, but nearly complete filling.' },
  C: { grade: 'C', text: 'Barrack grade C - a radiolucency involving 50% to 99% of the cement-bone interface, or a cement-mantle defect.' },
  D: { grade: 'D', text: 'Barrack grade D - a radiolucency at 100% of the cement-bone interface, or a failure to fill the canal (no cement distal to the stem tip).' },
};

const NOTE = 'The Barrack classification (Barrack 1992) grades the cement mantle around a cemented femoral stem on the immediate postoperative radiograph. A: complete filling ("white-out" at the cement-bone interface). B: slight radiolucency, nearly complete filling. C: radiolucency over 50-99% of the interface, or a mantle defect. D: radiolucency over 100% of the interface, or an unfilled canal. This reports the grade the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.';

const ALIAS = {
  A: 'A', B: 'B', C: 'C', D: 'D',
  1: 'A', 2: 'B', 3: 'C', 4: 'D',
};

// input:
//   grade: 'A' / 'B' / 'C' / 'D' (case-insensitive; also accepts 1-4).
export function barrackCement(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const g = GRADES[key];
  if (!g) {
    return { valid: false, message: 'Select the Barrack grade (A, B, C, or D).' };
  }
  return {
    valid: true,
    grade: g.grade,
    bandLabel: `Barrack grade ${g.grade}`,
    band: g.text,
    note: NOTE,
  };
}
