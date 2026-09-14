# spec-v1258 — King’s College measurement context stays explicit

The acetaminophen King’s College criteria use different lactate thresholds for
an early sample and one taken after fluid resuscitation, and different numeric
creatinine thresholds for mg/dL and µmol/L. The browser exposes both choices as
select controls, but direct and MCP callers could omit them. The core then
silently assumed “after resuscitation” and “mg/dL,” allowing an unspecified
measurement to satisfy a transplant-referral limb.

The core now evaluates either measurement only when its context is explicit. A
lactate without timing leaves the modified lactate limb incomplete; a
creatinine without a unit leaves the three-part limb incomplete. Another
complete positive limb can still satisfy the criteria independently. Browser
behavior is unchanged because its selects always submit their visible values,
and the MCP field labels now state each conditional requirement.

Unit tests pin both omission cases. No threshold, citation, or catalog count
changed.
