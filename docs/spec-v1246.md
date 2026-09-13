# spec-v1246 — an entered renal measurement was called incomplete

The FENa/FEUrea suite is deliberately partial: the sodium pair and the urea pair
are optional alternatives, while both share the two creatinine measurements. A
reader can therefore calculate FENa without FEUrea, or FEUrea without FENa.

That correct partial behavior concealed an invalid-input path. A negative urine
or plasma urea value made `feUrea()` return `null`, exactly as an omitted urea
value does. The page printed "FEUrea: (incomplete inputs)," and the MCP result
returned a null FEUrea beside the valid FENa. The reader had entered the value;
the suite silently treated it as absent.

Both fractional-excretion functions now inspect entered values before their
existing incomplete branch. A negative sodium, urea, or creatinine measurement
is rejected by name. Blank values still return `null`, and the established
zero-as-missing library contract remains unchanged. The browser now passes a
blank as `null` rather than converting it to 0 with `Number('')`, preserving
that distinction through the page boundary.

No upper bound was added to a urine measurement. The catalog's shared sodium,
urea, and creatinine envelopes describe serum or plasma quantities and must not
be applied to urine concentrations. The existing plasma-only plausibility checks
remain in place.

## Proof

- `test/unit/fraction-and-clamp-envelope.test.js` pins negative-value refusals,
  omitted-value behavior, and the existing plasma/urine envelope distinction.
- `test/integration/fena-feurea-inputs.spec.js` verifies the refusal and blank
  partial-result paths on the rendered page.
- `node scripts/probe-impossible-reads-as-absent.mjs` drops from 7 silent fields
  to 5, removing both remaining `fena-feurea` rows.
- Catalog count remains 1,722.
