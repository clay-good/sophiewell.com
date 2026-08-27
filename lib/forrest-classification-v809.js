// spec-v809: Forrest classification of a bleeding peptic ulcer at endoscopy.
//
// Sources:
//   Forrest JA, Finlayson ND, Shearman DJ. Endoscopy in gastrointestinal bleeding.
//     Lancet. 1974;2(7877):394-397. (The original stigmata classification.)
//   Laine L, Barkun AN, Saltzman JR, Martel M, Leontiadis GI. ACG Clinical Guideline:
//     Upper Gastrointestinal and Ulcer Bleeding. Am J Gastroenterol. 2021;116(5):899-917.
//     (PMID 33929377. Which stigmata get endoscopic therapy, and the adherent-clot
//     equivocation.)
//
// This is a LOOKUP, not a sum. One observed stigma maps to one class, one risk tier and
// one management posture. The point of the tile is that the six classes do not form a
// simple ordered ladder: IIa (a non-bleeding visible vessel) carries a HIGHER rebleeding
// risk than Ib (oozing), so a reader who ranks by roman numeral gets it backwards.
//
// The rebleeding figures are ranges, deliberately. Published untreated-rebleeding rates
// for the same class differ substantially between series, and this tile reports the span
// rather than picking one study's number and presenting it as the rate.
//
// Pure: no DOM, no clock, no network.

export const FORREST_NOTE = 'The Forrest classification (Forrest JA, Finlayson ND, Shearman DJ, Lancet 1974;2(7877):394-397) sorts what the endoscopist sees at the base of a peptic ulcer into six classes, and those classes decide whether the ulcer is treated endoscopically. Class one is bleeding now: Ia spurting, Ib oozing. Class two is a stigma of recent bleeding: IIa a non-bleeding visible vessel, IIb an adherent clot, IIc a flat pigmented spot. Class three is a clean base. Active bleeding and a visible vessel are high risk and get endoscopic hemostasis; a flat spot and a clean base are low risk and are managed with acid suppression; the adherent clot sits between them and guidelines are equivocal, because trials of treating it disagree. Ranking the classes by roman numeral misleads: a non-bleeding visible vessel rebleeds more often than an oozing ulcer does. The rebleeding figures here are ranges because published rates for the same class differ between series. This describes a finding already made at endoscopy; it does not perform or withhold hemostasis.';

const CLASSES = {
  ia: {
    code: 'Ia',
    finding: 'spurting arterial bleeding',
    group: 'active bleeding',
    tier: 'high',
    rebleed: 'about 55 to 60 percent untreated',
    management: 'Endoscopic hemostasis is indicated. The ACG guideline recommends treating active spurting or oozing bleeding; epinephrine injection should not be used alone.',
  },
  ib: {
    code: 'Ib',
    finding: 'oozing bleeding without a visible vessel',
    group: 'active bleeding',
    tier: 'high',
    rebleed: 'about 10 to 27 percent untreated',
    management: 'Endoscopic hemostasis is indicated. The ACG guideline recommends treating active spurting or oozing bleeding; epinephrine injection should not be used alone.',
  },
  iia: {
    code: 'IIa',
    finding: 'non-bleeding visible vessel',
    group: 'stigma of recent bleeding',
    tier: 'high',
    rebleed: 'about 43 to 50 percent untreated',
    management: 'Endoscopic hemostasis is indicated. The ACG guideline recommends treating a non-bleeding visible vessel; epinephrine injection should not be used alone.',
  },
  iib: {
    code: 'IIb',
    finding: 'adherent clot resistant to washing',
    group: 'stigma of recent bleeding',
    tier: 'intermediate',
    rebleed: 'about 22 to 33 percent untreated',
    management: 'Guidelines are equivocal here, and that is the finding, not a gap in this tool. Trials of endoscopic therapy for an adherent clot reach conflicting conclusions, so the ACG guideline does not recommend for or against it.',
  },
  iic: {
    code: 'IIc',
    finding: 'flat pigmented spot',
    group: 'stigma of recent bleeding',
    tier: 'low',
    rebleed: 'about 7 to 10 percent untreated',
    management: 'Endoscopic hemostasis is not indicated. Acid suppression alone is the usual approach.',
  },
  iii: {
    code: 'III',
    finding: 'clean ulcer base',
    group: 'no stigma',
    tier: 'low',
    rebleed: 'under about 5 percent untreated',
    management: 'Endoscopic hemostasis is not indicated. Acid suppression alone is the usual approach.',
  },
};

export const FORREST_STIGMATA = Object.keys(CLASSES);

export function forrestClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.stigma == null ? '' : o.stigma).trim().toLowerCase().replace(/[^a-z]/g, '');

  if (!key) return { valid: false, message: 'Choose what the ulcer base looks like at endoscopy.' };
  const c = CLASSES[key];
  if (!c) return { valid: false, message: 'Unrecognized endoscopic finding.' };

  const highRisk = c.tier === 'high';

  return {
    valid: true,
    code: `Forrest ${c.code}`,
    grade: c.code,
    finding: c.finding,
    group: c.group,
    tier: c.tier,
    rebleedRisk: c.rebleed,
    management: c.management,
    endoscopicTherapy: highRisk ? 'indicated' : (c.tier === 'intermediate' ? 'equivocal' : 'not indicated'),
    abnormal: highRisk,
    bandLabel: `Forrest ${c.code}`,
    band: `Forrest ${c.code} — ${c.finding}. ${c.tier === 'high' ? 'High' : c.tier === 'intermediate' ? 'Intermediate' : 'Low'} risk; rebleeding ${c.rebleed}.`,
    detail: `${c.management} Note that the classes are not an ordered ladder: a non-bleeding visible vessel (IIa) rebleeds more often than an oozing ulcer (Ib), so ranking by roman numeral gets the risk backwards.`,
    note: FORREST_NOTE,
  };
}
