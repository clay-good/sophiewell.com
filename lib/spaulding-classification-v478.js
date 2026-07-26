// spec-v478: the Spaulding classification of medical devices for reprocessing, by the infection risk of the
// body site the device contacts — critical / semicritical / noncritical. It is the standard framework for the
// required level of disinfection or sterilization and joins the infection-prevention tiles. "spaulding" /
// "device reprocessing category" routed to nothing.
//
// HIGH-STAKES: this reports the reprocessing CATEGORY the clinician / infection-preventionist has determined,
// NOT a diagnosis, a treatment decision, or a prognosis (spec-v11 §5.3). The reprocessing decision stays with
// the sterile-processing / infection-prevention team and the device instructions for use.
//
// CATEGORIES RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Spaulding EH. Chemical disinfection of medical and surgical materials. In: Lawrence C, Block SS, eds.
//     Disinfection, Sterilization, and Preservation. Philadelphia: Lea & Febiger; 1968:517-531.
//   - Infection-prevention references reproducing the same critical (sterilization) / semicritical (high-level
//     disinfection) / noncritical (low-level disinfection) grouping.
//
// Categories (by the site contacted and the required reprocessing):
//   critical    : enters sterile tissue or the vascular system (surgical instruments, implants, cardiac
//                 catheters); requires sterilization.
//   semicritical: contacts mucous membranes or non-intact skin (flexible endoscopes, laryngoscope blades,
//                 respiratory equipment); requires at least high-level disinfection.
//   noncritical : contacts intact skin but not mucous membranes (blood pressure cuffs, stethoscopes, bedpans);
//                 requires low-level disinfection or cleaning.

const CATEGORIES = {
  CRITICAL: { category: 'Critical', text: 'Spaulding critical - the item enters sterile tissue or the vascular system (surgical instruments, implants, cardiac catheters); it requires sterilization.' },
  SEMICRITICAL: { category: 'Semicritical', text: 'Spaulding semicritical - the item contacts mucous membranes or non-intact skin (flexible endoscopes, laryngoscope blades, respiratory equipment); it requires at least high-level disinfection.' },
  NONCRITICAL: { category: 'Noncritical', text: 'Spaulding noncritical - the item contacts intact skin but not mucous membranes (blood pressure cuffs, stethoscopes, bedpans); it requires low-level disinfection or cleaning.' },
};

const NOTE = 'The Spaulding classification (Spaulding 1968) groups medical devices by the infection risk of the site they contact, setting the required reprocessing. Critical: enters sterile tissue or the bloodstream, requires sterilization. Semicritical: contacts mucous membranes or non-intact skin, requires at least high-level disinfection. Noncritical: contacts intact skin only, requires low-level disinfection. This reports the category the clinician has determined; always follow the device instructions for use.';

const ALIAS = {
  CRITICAL: 'CRITICAL', SEMICRITICAL: 'SEMICRITICAL', NONCRITICAL: 'NONCRITICAL',
  'SEMI-CRITICAL': 'SEMICRITICAL', 'NON-CRITICAL': 'NONCRITICAL',
  1: 'CRITICAL', 2: 'SEMICRITICAL', 3: 'NONCRITICAL',
};

// input:
//   category: 'critical' / 'semicritical' / 'noncritical' (case-insensitive; also accepts 1-3).
export function spauldingClassification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.category == null ? '' : o.category).trim().toUpperCase();
  const key = Object.prototype.hasOwnProperty.call(ALIAS, raw) ? ALIAS[raw] : raw;
  const c = CATEGORIES[key];
  if (!c) {
    return { valid: false, message: 'Select the Spaulding category (critical, semicritical, or noncritical).' };
  }
  return {
    valid: true,
    category: c.category,
    bandLabel: `Spaulding: ${c.category}`,
    band: c.text,
    note: NOTE,
  };
}
