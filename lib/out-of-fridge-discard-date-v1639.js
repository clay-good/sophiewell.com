// spec-v1639 tool 14: the discard date for a product out of the refrigerator or in use, by its label.
//
// Sources: section 16 (How Supplied/Storage and Handling) of each label on DailyMed, re-read
// October 12, 2026. Each row below carries the label's own words. Two limits can apply: days
// unopened at room temperature, and days after first use. Where both dates are entered the earlier
// discard date is shown and named. Only the Humalog label says its room-temperature time is a total
// across unopened and in-use storage; the others list the two limits separately.
//
// A product kept above the label's temperature range is refused: the limit assumes that range and
// the label gives no figure above it (see storage-excursion-summary for excursions).
//
// Pure: no DOM, no network; dates are entered. `now` is read only to check the label edition.

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

// room: days unopened at room temperature; inUse: days after first use.
export const PRESETS = [
  { value: 'lantus', text: 'Insulin glargine (Lantus) vial or SoloStar pen', brand: 'Lantus', setId: 'd5e07a0c-7e14-4756-9152-9fea485d654a', room: 28, inUse: 28, range: 'up to 86°F (30°C)', quote: 'The label\'s table: not in use (unopened) at room temperature (up to 86°F), 28 days; in use (opened), 28 days: the vial refrigerated or at room temperature, the SoloStar pen at room temperature only (do not refrigerate).' },
  { value: 'humalog', text: 'Insulin lispro (Humalog U-100, U-200)', brand: 'Humalog', setId: 'c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f', room: 28, inUse: 28, total: true, range: 'up to 86°F (30°C)', quote: 'The label\'s table: not in use (unopened) at room temperature (up to 86°F), 28 days; in use (opened), 28 days. "When stored at room temperature, HUMALOG U-100 and U-200 can only be used for a total of 28 days, including both not in-use (unopened) and in-use (opened) storage time."' },
  { value: 'aspart-vial-or-pen', text: 'Insulin aspart (NovoLog) vial, PenFill, FlexPen, FlexTouch', brand: 'NovoLog', setId: '3a1e73a2-3009-40d0-876c-b4cb2be56fc5', room: 28, inUse: 28, range: 'up to 86°F (30°C)', quote: 'The label\'s table: not in use (unopened) at room temperature (up to 86°F), 28 days; in use (opened), 28 days (cartridges and pens: do not refrigerate). For insulin pump use from a vial, the label gives a total in-use time of 19 days, including 7 days in the pump; that figure is not computed here.' },
  { value: 'basaglar', text: 'Insulin glargine (Basaglar KwikPen, Tempo Pen)', brand: 'Basaglar', setId: '0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae', room: 28, inUse: 28, range: 'up to 86°F (30°C)', quote: 'The label\'s table: not in use (unopened) at room temperature (up to 86°F), 28 days; in use (opened) at room temperature, 28 days, do not refrigerate. "In-use BASAGLAR prefilled pens must be used within 28 days or be discarded, even if they still contain BASAGLAR."' },
  { value: 'toujeo', text: 'Insulin glargine U-300 (Toujeo SoloStar, Max SoloStar)', brand: 'Toujeo', setId: 'c9561d96-124d-48ca-982f-0aa1575bff36', room: null, inUse: 56, range: 'up to 86°F (30°C)', quote: 'The label\'s table: in use (opened), room temperature only (do not refrigerate) up to 86°F, 56 days. Unopened pens are listed refrigerated until the expiration date; the label gives no unopened room-temperature period.' },
  { value: 'tresiba', text: 'Insulin degludec (Tresiba)', brand: 'Tresiba', setId: '456c5e87-3dfd-46fa-8ac0-c6128d4c97c6', room: 56, inUse: 56, range: 'up to 86°F (30°C)', quote: 'The label\'s Table 18: not in use (unopened) at room temperature (up to 86°F), 56 days (8 weeks); in use (opened), at room temperature or refrigerated, 56 days (8 weeks).' },
  { value: 'ozempic-pen', text: 'Semaglutide (Ozempic pen)', brand: 'Ozempic', setId: 'adec4fd2-6858-4c99-91d4-531f5f2a2d79', room: null, inUse: 56, range: '59°F to 86°F (15°C to 30°C), or refrigerated', quote: '"After first use of the OZEMPIC pen, the pen can be stored for 56 days at controlled room temperature 15°C to 30°C (59°F to 86°F) or in a refrigerator 2°C to 8°C (36°F to 46°F)." Before first use the label says to store the pen in a refrigerator. The single-dose prefilled syringe has its own line (up to 28 days at 46°F to 86°F) and is not this row.' },
  { value: 'wegovy-single-dose', text: 'Semaglutide (Wegovy single-dose pen or syringe)', brand: 'Wegovy', setId: 'ee06186f-2aa3-4990-a760-757579d8f77b', room: 28, inUse: null, range: '46°F to 86°F (8°C to 30°C)', quote: '"If needed, prior to the pen or syringe cap removal, the pen can be kept from 8°C to 30°C (46°F to 86°F) up to 28 days." The Wegovy FlexTouch pen has its own line (56 days after first use) and is not this row.' },
  { value: 'tirzepatide-single-dose', text: 'Tirzepatide (Mounjaro, Zepbound) single-dose pen or vial', brand: 'Mounjaro', setId: 'd2d7da5d-ad07-4228-955f-cf7e355c8cc0', also: { brand: 'Zepbound', setId: '487cd7e7-434c-4925-99fa-aa80b1cc776b' }, room: 21, inUse: null, range: 'not above 86°F (30°C)', quote: '"If needed, each single-dose pen or single-dose vial can be stored unrefrigerated at temperatures not to exceed 30°C (86°F) for up to a total of 21 days."' },
  { value: 'tirzepatide-multi-dose', text: 'Tirzepatide (Mounjaro, Zepbound) KwikPen or multi-dose vial', brand: 'Mounjaro', setId: 'd2d7da5d-ad07-4228-955f-cf7e355c8cc0', also: { brand: 'Zepbound', setId: '487cd7e7-434c-4925-99fa-aa80b1cc776b' }, room: 30, inUse: 30, total: true, range: 'up to 86°F (30°C)', quote: 'Unopened: "If stored at room temperature [up to 30°C (86°F)], throw away unopened multi-dose vial or single-patient-use KwikPen after 30 days." Opened: "Throw away opened multi-dose vial or single-patient-use KwikPen after a total of 30 days at room temperature, 30 days after first use, or after taking 4 weekly doses, even if there is medicine left in it." The four weekly doses are not counted here.' },
  { value: 'trulicity', text: 'Dulaglutide (Trulicity)', brand: 'Trulicity', setId: '463050bd-2b1c-40f5-b3c3-0a04bb433309', room: 14, inUse: null, range: 'not above 86°F (30°C)', quote: '"If needed, each single-dose pen can be kept at room temperature, not to exceed 86°F (30°C) for a total of 14 days."' },
  { value: 'victoza', text: 'Liraglutide (Victoza)', brand: 'Victoza', setId: '5a9ef4ea-c76a-4d34-a604-27c5b505f5a4', room: null, inUse: 30, range: '59°F to 86°F (15°C to 30°C), or refrigerated', quote: '"After first use of the VICTOZA pen, the pen can be stored for 30 days at controlled room temperature 59°F to 86°F (15°C to 30°C) or in a refrigerator 36°F to 46°F (2°C to 8°C)."' },
  { value: 'saxenda', text: 'Liraglutide (Saxenda)', brand: 'Saxenda', setId: '3946d389-0926-4f77-a708-0acb8153b143', room: null, inUse: 30, range: '59°F to 86°F (15°C to 30°C), or refrigerated', quote: '"After initial use of the SAXENDA pen, the pen can be stored for 30 days at controlled room temperature 59°F to 86°F (15°C to 30°C) or in a refrigerator 36°F to 46°F (2°C to 8°C)."' },
  { value: 'forteo', text: 'Teriparatide (Forteo)', brand: 'Forteo', setId: 'aae667c5-381f-4f92-93df-2ed6158d07b0', room: null, inUse: 28, range: 'refrigerated at 36°F to 46°F at all times except when administering', quote: '"Throw away the device 28 days after first use." The label says to store Forteo under refrigeration at all times except when administering it; it gives no room-temperature period.' },
  { value: 'humira', text: 'Adalimumab (Humira)', brand: 'Humira', setId: '608d4f0d-b19f-46d3-749a-7159aa5f933d', room: 14, inUse: null, range: 'up to 77°F (25°C)', quote: '"If needed, for example when traveling, HUMIRA may be stored at room temperature up to a maximum of 77°F (25°C) for a period of up to 14 days, with protection from light. HUMIRA should be discarded if not used within the 14-day period."' },
  { value: 'etanercept-single-dose', text: 'Etanercept (Enbrel) syringe, SureClick, single-dose vial, Mini cartridge', brand: 'Enbrel', setId: 'a002b40c-097d-47a5-957f-7a7b1807af7f', room: 30, inUse: null, range: '68°F to 77°F (20°C to 25°C)', quote: 'Storage "at room temperature at 68°F to 77°F (20°C to 25°C) for a maximum single period of 30 days is permissible". Once stored at room temperature, "it should not be placed back into the refrigerator."' },
  { value: 'etanercept-dose-tray', text: 'Etanercept (Enbrel) multiple-dose vial dose tray', brand: 'Enbrel', setId: 'a002b40c-097d-47a5-957f-7a7b1807af7f', room: 14, inUse: null, range: '68°F to 77°F (20°C to 25°C)', quote: 'Storage of a dose tray "at room temperature at 68°F to 77°F (20°C to 25°C) for a maximum single period of 14 days is permissible". Once stored at room temperature, "it should not be placed back into the refrigerator." A reconstituted vial has its own line and is not this row.' },
  { value: 'dupixent', text: 'Dupilumab (Dupixent)', brand: 'Dupixent', setId: '595f437d-2729-40bb-9c62-c8ece1f82780', room: 14, inUse: null, range: 'up to 77°F (25°C)', quote: '"If necessary, DUPIXENT may be kept at room temperature up to 25°C (77°F) for a maximum of 14 days. Do not store above 25°C (77°F). After removal from the refrigerator, DUPIXENT must be used within 14 days or discarded."' },
  { value: 'repatha', text: 'Evolocumab (Repatha)', brand: 'Repatha', setId: 'cd61e902-166d-4aa6-9f3c-a18c1008d07e', room: 30, inUse: null, range: '68°F to 77°F (20°C to 25°C), in the original carton', quote: 'Repatha "may also be kept at room temperature at 68°F to 77°F (20°C to 25°C) in the original carton for 30 days. If not used within the 30 days, discard REPATHA."' },
  { value: 'buprenorphine-er-unopened', text: 'Buprenorphine extended-release (Sublocade), before administration', brand: 'Sublocade', setId: '6189fb21-9432-45f8-8481-0bfaf3ccde95', room: 84, inUse: null, range: '59°F to 86°F (15°C to 30°C), in its original packaging', quote: '"Once outside the refrigerator this product may be stored in its original packaging at room temperature, 15°C to 30°C (59°F to 86°F), for up to 12 weeks prior to administration. Discard SUBLOCADE if left at room temperature for longer than 12 weeks."' },
  { value: 'other-product', text: 'Another product: enter the limit from its label' },
];
export const KEPT = [
  { value: 'inside-stated-range', text: 'Kept within the temperature range on the label' },
  { value: 'beyond-stated-range', text: 'Went above the label\'s range' },
];
const POSTURE = 'This is what the label states for these inputs. It is not advice for a particular patient.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
const iso = (d) => d.toISOString().slice(0, 10);
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
function optDate(v, what) { if (blank(v)) return { d: null }; const d = date(v); return d ? { d } : { message: `Enter ${what} as a date, or leave it blank.` }; }

export function outOfFridgeDiscardDate(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRESETS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product, or "another product" to enter the limit from its label.' };
  const out = optDate(o.outOfFridge, 'the date it left the refrigerator'); if (out.message) return { valid: false, message: out.message };
  const first = optDate(o.firstUse, 'the date of first use'); if (first.message) return { valid: false, message: first.message };
  const exp = optDate(o.expirationDate, 'the expiration date'); if (exp.message) return { valid: false, message: exp.message };
  const asOf = optDate(o.asOf, 'today\'s date'); if (asOf.message) return { valid: false, message: asOf.message };
  const own = p.value === 'other-product';
  let room = p.room ?? null; let inUse = p.inUse ?? null;
  const notes = []; const res = { valid: true, product: p.value };
  let lr = null; let lr2 = null;
  if (own) {
    if (blank(o.ownRoomDays) && blank(o.ownInUseDays)) return { valid: false, message: 'Enter the label\'s limit: days at room temperature, days after first use, or both.' };
    room = null; inUse = null;
    if (!blank(o.ownRoomDays)) { const f = inputFault([['the label\'s room-temperature limit', o.ownRoomDays, null, 730, 'days']]); if (f) return { valid: false, message: f }; room = Number(o.ownRoomDays); }
    if (!blank(o.ownInUseDays)) { const f = inputFault([['the label\'s in-use limit', o.ownInUseDays, null, 730, 'days']]); if (f) return { valid: false, message: f }; inUse = Number(o.ownInUseDays); }
    if ((room !== null && !Number.isInteger(room)) || (inUse !== null && !Number.isInteger(inUse))) return { valid: false, message: 'Enter the label\'s limit as a whole number of days.' };
    notes.push('The limits are the ones entered from the product\'s own label; none is supplied here.');
  } else {
    const kept = KEPT.find((k) => k.value === String(o.kept ?? '').trim());
    if (!kept) return { valid: false, message: `Choose whether it was kept within the label's temperature range (${p.range}).` };
    lr = labelRow(p.setId, now, table); res.labelUrl = lr.url;
    if (!lr.answers) {
      const w = [`The ${p.brand} label's storage limit is withheld: ${lr.why}.`, 'Read the limit from the label or carton in hand, or choose "another product" and enter it.', POSTURE];
      return { ...res, withheld: true, flag: 'withheld', abnormal: false, band: `The ${p.brand} label's limit is withheld, so no discard date is shown.`, bandLabel: 'Withheld', notes: w, note: w.join(' ') };
    }
    if (kept.value === 'beyond-stated-range') {
      const w = [`The ${p.brand} label's limit assumes storage at ${p.range}. The label gives no figure for a product kept above that range, so no discard date is shown.`, p.quote, `Label: ${lr.edition}.`, POSTURE];
      return { ...res, flag: 'outside-the-label-range', abnormal: true, band: 'The label gives no figure above its temperature range.', bandLabel: 'No discard date', notes: w, note: w.join(' ') };
    }
    notes.push(`${p.brand} label: ${p.quote}`);
    if (p.also) { lr2 = labelRow(p.also.setId, now, table); if (lr2.answers) notes.push(`The ${p.also.brand} label gives the same limits.`); }
  }
  const candidates = [];
  if (room !== null && out.d) candidates.push({ why: `${room} days at room temperature from ${say(out.d)}`, d: addCalendarDaysUtc(out.d, room), kind: 'room-temperature limit' });
  if (inUse !== null && first.d) candidates.push({ why: `${inUse} days after first use on ${say(first.d)}`, d: addCalendarDaysUtc(first.d, inUse), kind: 'in-use limit' });
  if (!candidates.length) {
    const need = room !== null && inUse !== null ? 'the date it left the refrigerator, the date of first use, or both' : room !== null ? 'the date it left the refrigerator' : 'the date of first use';
    return { valid: false, message: `Enter ${need}${!own && room === null && out.d ? `: the ${p.brand} label gives no unopened room-temperature period` : !own && inUse === null && first.d ? `: the ${p.brand} label's limit runs from leaving the refrigerator, not from first use` : ''}.` };
  }
  if (room === null && out.d) notes.push(own ? 'No room-temperature limit was entered, so the date it left the refrigerator is not used.' : `The ${p.brand} label gives no unopened room-temperature period, so the date it left the refrigerator is not used.`);
  if (inUse === null && first.d) notes.push(own ? 'No in-use limit was entered, so the date of first use is not used.' : `The ${p.brand} label's limit does not run from first use, so that date is not used.`);
  for (const c of candidates) notes.push(`${c.why}: ${say(c.d)}.`);
  candidates.sort((a, b) => a.d.getTime() - b.d.getTime());
  let bind = candidates[0];
  if (candidates.length === 2) notes.push(candidates[0].d.getTime() === candidates[1].d.getTime() ? 'Both limits give the same date.' : `The ${bind.kind} gives the earlier date and binds.${!own && !p.total ? ' The label lists the two limits separately; the earlier date is shown.' : ''}`);
  if (room !== null && inUse !== null && out.d && first.d && first.d.getTime() > addCalendarDaysUtc(out.d, room).getTime()) notes.push('The date of first use is after the unopened room-temperature limit had already passed.');
  if (exp.d) {
    if (exp.d.getTime() < bind.d.getTime()) { bind = { d: exp.d, kind: 'expiration date', why: '' }; notes.push(`The expiration date, ${say(exp.d)}, is earlier and binds: a discard date is never later than the expiration date.`); }
    else notes.push(`The expiration date, ${say(exp.d)}, is not earlier, so it does not bind.`);
  } else notes.push('No expiration date was entered; the discard date is never later than the expiration date on the product.');
  res.discardDate = iso(bind.d); res.bindingLimit = bind.kind;
  let past = false;
  if (asOf.d) {
    const left = Math.round((bind.d.getTime() - asOf.d.getTime()) / 86400000);
    res.daysLeft = left; past = left < 0;
    notes.push(left < 0 ? `As of ${say(asOf.d)} the discard date passed ${-left} day${left === -1 ? '' : 's'} ago.` : `As of ${say(asOf.d)}: ${left} day${left === 1 ? '' : 's'} left.`);
  }
  if (!own) { notes.push(`The limit assumes storage at ${p.range}.`); notes.push(`Label: ${lr.edition}.`); }
  notes.push(POSTURE);
  return { ...res, flag: past ? 'past-the-discard-date' : 'discard-date', abnormal: past, band: `Discard on ${say(bind.d)} (${bind.kind}).`, bandLabel: past ? 'Past the discard date' : res.daysLeft !== undefined ? `${res.daysLeft} day${res.daysLeft === 1 ? '' : 's'} left` : iso(bind.d), notes, note: notes.join(' ') };
}
