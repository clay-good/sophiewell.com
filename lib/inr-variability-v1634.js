// spec-v1634 tool 27: INR variability, the variance growth rate of Fihn (method A).
//
// Source: Fihn SD et al. Risk factors for complications of chronic anticoagulation. Ann Intern Med.
// 1993;118:511-520 (not open). Built on the owner's rule of October 17, 2026 that a verified reprint is a source.
// The formula is printed in Ibrahim S, Jespersen J, Poller L. J Thromb Haemost. 2013;11:1540-1546, Figure 1
// (Free Access on the publisher's site, read October 18, 2026; its 2014 corrigendum, 10.1111/jth.12441, changes two
// results sentences, not the figure): "Variance growth rate Fihn (method A)", sigma^2 = (1/n) x sum over i = 1..n of
// (INR_i - target_i)^2 / tau_i, where n is the number of INR measurements and tau is "the time in weeks between the
// present and previous INR measurement." Limdi NA et al. (PMC2757655, 2008) prints the same terms, squared
// deviation from the target over weeks since the preceding INR, in a form it calls modified (n - 1); not followed.
// Each INR is entered with its own weeks since the previous INR, so no interval is assumed for the first one.
// No interpretation band ships: the papers grade VGR by quintiles of their own patients.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'Fihn variance growth rate (method A, as printed by Ibrahim 2013): the average over the INRs entered of the squared distance from the target INR divided by the weeks since the previous INR. Higher means less stable control. No cutoff is published for it: studies compare quintiles of their own patients.';

export function inrVariability(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ft = inputFault([['the target INR', o.target, 1.5, 4.5, '']]);
  const lines = String(o.series ?? '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return { valid: false, message: 'Enter each INR with the weeks since the previous INR, one per line.' };
  if (ft) return { valid: false, message: ft };
  const target = Number(o.target);
  const rows = [];
  for (const [k, line] of lines.entries()) {
    const parts = line.split(/[\s,;]+/).filter(Boolean);
    if (parts.length !== 2) return { valid: false, message: `Line ${k + 1} needs two numbers, the INR and the weeks since the previous INR.` };
    const f = inputFault([[`the INR on line ${k + 1}`, parts[0], 0.5, 20, ''], [`the weeks on line ${k + 1}`, parts[1], 0.1, 52, '']]);
    if (f) return { valid: false, message: f };
    rows.push([Number(parts[0]), Number(parts[1])]);
  }
  const n = rows.length;
  const sum = rows.reduce((s, [inr, tau]) => s + ((inr - target) ** 2) / tau, 0);
  const vgr = sum / n;
  const terms = rows.map(([inr, tau]) => `(${inr} - ${target})^2 / ${tau}`).join(' + ');
  return {
    valid: true, vgr: Number(vgr.toFixed(4)), n,
    band: `Fihn variance growth rate ${vgr.toFixed(2)} over ${n} INR${n === 1 ? '' : 's'} (target ${target}).`,
    bandLabel: vgr.toFixed(2), abnormal: false,
    notes: [`[${terms}] / ${n} = ${vgr.toFixed(4)}.`, ...(n < 3 ? ['With so few INRs the figure says little about stability.'] : [])],
    note: NOTE,
  };
}
