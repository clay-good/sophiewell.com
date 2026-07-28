// spec-v548 MCP wave: adapter for patient-prosthesis mismatch in lib/ppm-eoai-v548.js. The dom keys mirror
// the browser renderer (views/group-v548.js) and META['ppm-eoai'].example: ppm-position, ppm-eoa, ppm-bsa
// map to the lib args position, eoa, bsa.
//
// **`ppm-position` IS REQUIRED AND HAS NO DEFAULT, BECAUSE THE SAME NUMBER GRADES DIFFERENTLY.** An indexed
// effective orifice area of 1.0 is entirely NORMAL in the aortic position and MODERATE mismatch in the
// mitral position. An agent that assumed aortic - the commoner case, and the one nearly all the literature
// is about - would report a mitral patient with moderate mismatch as having a normal valve. There is no safe
// default here, so the tool refuses to guess.
//
// **EACH POSITION CARRIES ITS OWN CITATION, AND THAT IS A CORRECTION, NOT A FLOURISH.** The paper almost
// universally cited for patient-prosthesis mismatch, Pibarot and Dumesnil Heart 2006, contains the AORTIC
// grading and NO mitral moderate/severe grading at all - it says only that mitral indexed area should
// ideally not fall below about 1.2 to 1.3. The three-tier mitral grading is Magne and colleagues,
// Circulation 2007. An agent asked "what does Pibarot say about mitral mismatch?" should know the answer is
// "not this", so the result returns the per-position source in a `citation` field.
//
// THE AORTIC SEVERE BOUNDARY IS DISCLOSED AT THE BOUNDARY. The cited source puts severe BELOW 0.65, so
// exactly 0.65 is moderate; later guideline-aligned tables put severe at 0.65 OR BELOW. The band text says
// so when the value lands on 0.65 and stays quiet otherwise, so the disclosure appears where it changes the
// answer rather than on every call.
//
// OBESITY-SPECIFIC AORTIC THRESHOLDS (for BMI 30 or above) are NOT implemented and the summary says why:
// single-sourced. Applying a lower threshold on one source's authority would DOWNGRADE real mismatch in
// exactly the patients where indexing is most contested, which is the wrong direction to be wrong in.
//
// The summary also states that the EOA must be the prosthesis's measured or reference effective orifice
// area, NOT its labelled size - the labelled size is a manufacturing dimension and systematically overstates
// the opening, so an agent handed "23 mm valve" cannot compute this without looking up the reference EOA.

import * as P from '../../lib/ppm-eoai-v548.js';

export default [
  {
    id: 'ppm-eoai',
    summary: 'Patient-prosthesis mismatch, graded by the INDEXED effective orifice area: EOAi = prosthesis effective orifice area (cm2) divided by patient body surface area (m2). The indexing is the whole concept - a valve that is adequate in a small person can be severely mismatched in a large one, and a prosthesis can be functioning exactly as designed and still be too small for the patient, so mismatch is NOT prosthesis failure. THE THRESHOLDS DIFFER BY POSITION AND ARE NOT INTERCHANGEABLE, so the position is required and must never be assumed. AORTIC: above 0.85 is not clinically significant, 0.65 to 0.85 is moderate, below 0.65 is severe. MITRAL: above 1.2 is not clinically significant, above 0.9 up to and including 1.2 is moderate, 0.9 or below is severe. An EOAi of 1.0 is entirely NORMAL in the aortic position and MODERATE mismatch in the mitral position - assuming aortic, the commoner case, would report a mitral patient with moderate mismatch as having a normal valve. CITATION CORRECTION: the aortic grading is Pibarot and Dumesnil, Heart 2006; the mitral grading is Magne and colleagues, Circulation 2007. The Heart 2006 paper almost universally cited for patient-prosthesis mismatch contains NO mitral moderate or severe grading, saying only that mitral indexed area should ideally not fall below about 1.2 to 1.3, so do not attribute the mitral cut points to it. The result returns the per-position source. The aortic severe boundary is disclosed rather than silently chosen: the cited source defines severe as BELOW 0.65, so exactly 0.65 is moderate, while later guideline-aligned tables define severe as 0.65 or below. Obesity-specific aortic thresholds proposed for a body mass index of 30 or above are deliberately NOT implemented, because they are single-sourced and applying a lower threshold on one source authority would downgrade real mismatch in exactly the patients where indexing is most contested. IMPORTANT INPUT NOTE: the effective orifice area must be the prosthesis MEASURED OR REFERENCE effective orifice area, not its LABELLED SIZE - the labelled size is a manufacturing dimension and systematically overstates the opening, so a valve described only as "23 mm" cannot be scored without looking up its reference EOA. This grades a hemodynamic relationship, not a clinical outcome. Mismatch is associated with worse outcomes at a population level, and moderate mismatch in particular is common and often well tolerated, so a grade is not a prediction for the patient and severe mismatch is not by itself an indication for reoperation. It does not diagnose prosthetic dysfunction: a stenotic, thrombosed or degenerated valve is a different problem that also produces high gradients, and distinguishing the two is the point of the measurement rather than something this tool does.',
    compute: P.ppmEoai,
    fields: [
      {
        dom: 'ppm-position', arg: 'position', kind: 'enum',
        values: P.PPM_POSITIONS.map((p) => p.value), required: true,
        label: `Valve position. REQUIRED and never assumed - the thresholds are not interchangeable, and an EOAi of 1.0 is normal aortic but moderate mitral [${P.PPM_POSITIONS.map((p) => `${p.value} = ${p.label}, per ${p.citation}`).join('; ')}]`,
      },
      {
        dom: 'ppm-eoa', arg: 'eoa', kind: 'number', unit: 'cm^2', required: true,
        label: 'Prosthesis effective orifice area. Use the MEASURED or REFERENCE effective orifice area, not the labelled valve size, which is a manufacturing dimension and overstates the opening.',
      },
      {
        dom: 'ppm-bsa', arg: 'bsa', kind: 'number', unit: 'm^2', required: true,
        label: 'Patient body surface area.',
      },
    ],
  },
];
