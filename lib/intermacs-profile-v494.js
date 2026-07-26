// spec-v494: the INTERMACS profiles of advanced heart failure (profiles 1-7), the clinical-severity descriptor
// used when mechanical circulatory support is being considered. It joins the heart-failure tiles. "intermacs" /
// "advanced heart failure profile" routed to nothing.
//
// HIGH-STAKES: this reports the PROFILE the clinician has determined, NOT a diagnosis, a decision to implant a
// device, a transplant-listing decision, or a survival prediction for an individual patient (spec-v11 section
// 5.3). The management decision stays with the advanced-heart-failure team.
//
// PROFILES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Stevenson LW, Pagani FD, Young JB, et al. INTERMACS profiles of advanced heart failure: the current
//     picture. J Heart Lung Transplant. 2009;28(6):535-541.
//   - Advanced-heart-failure references reproducing the same critical-shock (1) through advanced-class-III (7)
//     ordering with the same shorthand labels.
//
// Profiles (decreasing acuity, 1 the sickest):
//   1 : critical cardiogenic shock - hypotension despite escalating inotropes, critical organ hypoperfusion.
//   2 : progressive decline on inotropic support - declining function despite intravenous inotropes.
//   3 : stable but inotrope dependent - stable on inotropes, repeatedly failing to wean.
//   4 : resting symptoms - congestion at rest or on activities of daily living.
//   5 : exertion intolerant - comfortable at rest, but housebound.
//   6 : exertion limited - some mild activity, fatigue within minutes of meaningful exertion.
//   7 : advanced NYHA class III - clinically stable with a reasonable level of comfortable activity.

const PROFILES = {
  '1': { profile: '1', text: 'INTERMACS profile 1 - critical cardiogenic shock (crash and burn): persistent hypotension despite rapidly escalating inotropic support, with critical organ hypoperfusion.' },
  '2': { profile: '2', text: 'INTERMACS profile 2 - progressive decline (sliding on inotropes): declining function despite intravenous inotropic support, such as worsening renal function or an inability to restore volume balance.' },
  '3': { profile: '3', text: 'INTERMACS profile 3 - stable but inotrope dependent (dependent stability): stable on continuous inotropic support or temporary circulatory support, but repeatedly failing to wean.' },
  '4': { profile: '4', text: 'INTERMACS profile 4 - resting symptoms (frequent flyer): can be stabilized near normal volume status, but has daily symptoms of congestion at rest or on activities of daily living.' },
  '5': { profile: '5', text: 'INTERMACS profile 5 - exertion intolerant (housebound): comfortable at rest and on activities of daily living, but unable to do any other activity, living predominantly within the house.' },
  '6': { profile: '6', text: 'INTERMACS profile 6 - exertion limited (walking wounded): comfortable at rest without fluid overload and able to do some mild activity, but fatigued within minutes of any meaningful exertion.' },
  '7': { profile: '7', text: 'INTERMACS profile 7 - advanced NYHA class III (placeholder): clinically stable with a reasonable level of comfortable activity, despite a history of previous decompensation that is not recent.' },
};

const NOTE = 'The INTERMACS profiles (Stevenson and colleagues 2009) describe the clinical severity of advanced heart failure when mechanical circulatory support is being considered, from profile 1 (the sickest) to profile 7. 1: critical cardiogenic shock. 2: progressive decline on inotropes. 3: stable but inotrope dependent. 4: resting symptoms. 5: exertion intolerant. 6: exertion limited. 7: advanced NYHA class III. This reports the profile the clinician has determined, not a diagnosis, a device or transplant decision, or a survival prediction.';

// input:
//   profile: '1'-'7' (also accepts the numbers 1-7).
export function intermacsProfile(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.profile == null ? '' : o.profile).trim();
  const p = PROFILES[key];
  if (!p) {
    return { valid: false, message: 'Select the INTERMACS profile (1 through 7).' };
  }
  return {
    valid: true,
    profile: p.profile,
    bandLabel: `INTERMACS profile ${p.profile}`,
    band: p.text,
    note: NOTE,
  };
}
