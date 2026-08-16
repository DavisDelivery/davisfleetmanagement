// Realistic worst-case seed data for the shop portal UX/accessibility review.
// "now" pinned to the session's current date so age-chip thresholds land where intended.
const NOW = new Date("2026-08-06T18:00:00.000Z");
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString();

export const DEVICE_USER = "Christopher Alexander Montgomery-Whitfield Jr.";

export const LONG_WRITEUP_ITEM = "Driver states air leak under the cab when brakes are applied. Verified complaint, built up air, cracked governor, heard leak at the steer axle control valve mounting flange. Inspected all chambers, all good. Leak isolated to the control valve gasket. Ordered replacement valve and gasket kit, truck waiting on parts.";

export const SUBNOTE_LONG = "Pulled radiator, confirmed core damage from road debris impact, lower tank cracked at seam. Cross-referenced part number with OEM catalog, confirmed fitment for 2015 Cascadia, ordered from Freightliner of Atlanta. Installed new core, pressure tested system to 15 PSI for 20 minutes, no drop, topped off coolant with 50/50 mix, bled air from system, verified fan clutch engagement at operating temp.";

export const PARTNUM_NOSPACE = "PN4471029384756XJRADIATORCOREASSYOEMFREIGHTLINERCASCADIA2015NOTAFTERMARKETWARRANTYCLAIM8842REQUIRESINVOICEATTACHEDSEESHOPFOLDERBINC14";
export const VIN_NOSPACE = "VIN1FUJGLDR6CLBP88347CHASSISNUMBERSTAMPEDONFRAMERAILVERIFIEDMATCHESTITLECERT";
export const MIRROR_PARTNUM_NOSPACE = "MIRRORBRACKETASSYRHPN88342091837465KITINCLUDESHARDWARENOTINSTOCKORDEREDFROMFREIGHTLINEROFATLANTAETA5TO7BUSINESSDAYS";
export const ALTERNATOR_NOSPACE = "ALTERNATORCONNECTORPINOUTMISWIREDDURINGLASTREPLACEMENTREWIREDTOOEMSPECPERWIRINGDIAGRAMWD4471CONFIRMEDWITHMULTIMETERCONTINUITYTESTALLPINSPASSNOFAULTCODESRETURNED";

export const trucks = [
  { id: "8842", mk: "FRTLN", type: "tractor", tr: "A", year: 2015 },
  { id: "0608", mk: "INTL", type: "straight", tr: "M", year: 2018 },
  { id: "12", mk: "Freightliner", type: "tractor", tr: "A", year: 2011 },
  { id: "7", mk: "Isuzu", type: "straight", tr: "A", year: 2022 },
];

export const repairs = [
  {
    id: "r1", truckId: "8842", reason: "Mechanical Repair",
    shop: "Peach State Truck Center — Doraville Diesel & Collision Division, Bay 12 (Ask for Marcus)",
    dateIn: daysAgo(22), status: "open", openedBy: DEVICE_USER,
    notesLog: [
      {
        ts: daysAgo(19), text: "Radiator Replacement", by: DEVICE_USER,
        done: true, doneAt: daysAgo(18), doneBy: DEVICE_USER,
        notes: [
          { ts: daysAgo(19), text: SUBNOTE_LONG, by: DEVICE_USER },
          { ts: daysAgo(18), text: PARTNUM_NOSPACE, by: "TW" },
          { ts: daysAgo(18), text: "Confirmed no coolant leaks after 200 mi road test.", by: DEVICE_USER },
        ],
      },
      {
        ts: daysAgo(20), text: LONG_WRITEUP_ITEM, by: "RJ",
        notes: [
          { ts: daysAgo(20), text: VIN_NOSPACE, by: "RJ" },
          { ts: daysAgo(15), text: "Still waiting on the control valve, supplier backordered, ETA pushed twice.", by: DEVICE_USER },
        ],
      },
      {
        ts: daysAgo(14), text: "Injector replacement — cylinders 3 and 5, torque to spec 89 Nm", by: "TW",
        done: true, doneAt: daysAgo(10), doneBy: "TW",
        notes: [{ ts: daysAgo(10), text: "Road tested 15 miles, no misfire, no codes.", by: "TW" }],
      },
      {
        ts: daysAgo(12), text: "DOT annual inspection sticker renewal — expired 6/30", by: DEVICE_USER,
        notes: [],
      },
      {
        ts: daysAgo(17), text: "Brake chamber replacement — passenger rear, spring brake", by: DEVICE_USER,
        notes: [
          { ts: daysAgo(17), text: "Ordered chamber + hardware kit from Peach State.", by: DEVICE_USER },
          { ts: daysAgo(14), text: "Parts arrived, backordered clevis pin, waiting.", by: "RJ" },
          { ts: daysAgo(9), text: "Clevis pin arrived, scheduling install.", by: DEVICE_USER },
          { ts: daysAgo(3), text: "Installed chamber, adjusted slack adjuster, tested with gauge — holds at 100 PSI for 5 min, no drop.", by: DEVICE_USER },
        ],
      },
      {
        ts: daysAgo(12), text: "Body damage — RH mirror bracket cracked, step bent", by: "RJ",
        notes: [{ ts: daysAgo(12), text: MIRROR_PARTNUM_NOSPACE, by: "RJ" }],
      },
    ],
  },
  {
    id: "r2", truckId: "0608", reason: "Waiting Parts",
    shop: "TA — Truck Stop #4417 (I-285 Exit 12, Diesel Bay 3)",
    dateIn: daysAgo(9), status: "open", openedBy: "RJ",
    notesLog: [
      {
        ts: daysAgo(8), text: "Replace fuel filters (primary + secondary), water in fuel", by: "RJ",
        done: true, doneAt: daysAgo(8), doneBy: "RJ",
        notes: [{ ts: daysAgo(8), text: "Drained water separator, replaced both filters, primed system, no air in lines.", by: "RJ" }],
      },
      {
        ts: daysAgo(6), text: "Check engine light — code P0299 (turbo underboost)", by: DEVICE_USER,
        notes: [{ ts: daysAgo(6), text: "Scanned, cleared code, monitoring. Suspect boost leak at charge pipe clamp.", by: DEVICE_USER }],
      },
    ],
  },
  {
    id: "r3", truckId: "51197-RENTAL", reason: "DOT Inspection",
    shop: "", dateIn: daysAgo(2), status: "open",
    notesLog: [],
  },
  {
    id: "r4", truckId: "12", reason: "Electrical", shop: "In-house",
    dateIn: daysAgo(0), status: "open", openedBy: DEVICE_USER,
    notesLog: [
      { ts: daysAgo(0), text: ALTERNATOR_NOSPACE, by: DEVICE_USER, notes: [] },
      { ts: daysAgo(0), text: "Headlight — driver side out, replaced bulb", by: DEVICE_USER, done: true, doneAt: daysAgo(0), doneBy: DEVICE_USER, notes: [] },
      { ts: daysAgo(0), text: "Dash camera mount loose, re-secured with new bracket", by: DEVICE_USER, notes: [{ ts: daysAgo(0), text: "Zip-tied temporarily, permanent bracket on order.", by: DEVICE_USER }] },
    ],
  },
  {
    id: "r5", truckId: "7", reason: "Tires", shop: "Peach State",
    dateIn: daysAgo(25), status: "closed", dateClosed: daysAgo(2), closedBy: DEVICE_USER, openedBy: "RJ",
    notesLog: [
      { ts: daysAgo(25), text: "Replace all 6 tires — steer + drive, uneven wear pattern noted", by: "RJ" },
      { ts: daysAgo(24), text: "Alignment check after tire replacement, within spec.", by: DEVICE_USER },
    ],
  },
];
