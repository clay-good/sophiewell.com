# spec-v242.md — Environmental heat / cold exposure indices: the NWS heat index, the Canadian humidex, the 2001 wind-chill index, and the wet-bulb globe temperature (+4 tiles → 1050)

> Status: **SHIPPED (2026-07-04).** An environmental / occupational-medicine slice.
> Adds **4** well-established deterministic indices. **Each id was verified absent by
> a fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2). These complement the existing heat-illness / hypothermia /
> frostbite / altitude tiles with the underlying apparent-temperature calculators.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1046 → 1050) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v242 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). All are Class A with no staleness rows.

## 2. What v242 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `heat-index` | Heat index | air temp (F) + RH → apparent temp | Rothfusz / NOAA. 1990 |
| `humidex` | Humidex | air temp + dewpoint (C) → comfort index | Masterton & Richardson. 1979 |
| `wind-chill` | Wind-chill index | air temp (C) + wind (km/h) → perceived temp | JAG/TI. 2001 |
| `wbgt` | Wet-bulb globe temperature | wet-bulb + globe + dry-bulb → heat-stress | Yaglou & Minard. 1957 |

## 3. Source cross-verification (spec-v97)

- **Heat index:** the NWS algorithm — simple Steadman formula averaged with the
  temperature, then the full Rothfusz regression plus low-RH / high-RH adjustments
  when ≥ 80 °F. Reproduced from NOAA WPC and the NWS.
- **Humidex:** air temp + 0.5555·(e − 10), e from the dewpoint. Reproduced from
  Environment Canada and Wikipedia.
- **Wind chill:** 13.12 + 0.6215·Ta − 11.37·V^0.16 + 0.3965·Ta·V^0.16 (C, km/h).
  Reproduced from the 2001 JAG/TI standard and the NWS.
- **WBGT:** outdoor 0.7·NWB + 0.2·globe + 0.1·dry; indoor 0.7·NWB + 0.3·dry.
  Reproduced from Yaglou & Minard 1957 / ISO 7243.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Temperature,
  humidity, and wind inputs coerce to bounded values; the humidex guards a dewpoint
  above the air temperature; a blank field yields a "complete the fields" message,
  never a `NaN`.
- **Each tile reports its value, the exposure band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All compute an apparent-temperature / heat-stress value, none diagnose or order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v242.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v242 RV242 into RENDERERS)
lib/environ-v242.js                      (new: heatIndex, humidex, windChill, wbgt)
lib/meta.js                              (+4 META entries)
views/group-v242.js                      (new renderer module: 4 renderers)
test/unit/environ-v242.test.js           (new: worked examples)
test/unit/fuzz-tools.test.js             (register environ-v242.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1046 → 1050)
```
