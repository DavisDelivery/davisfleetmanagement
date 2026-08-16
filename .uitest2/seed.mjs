// Seed data shared by the harness generator and the verification script.
// One realistic, long (300+ word) mechanic sub-note is the whole point of the
// test: it is what used to render as a ~100px vertical ribbon of one word per
// line before the fix.

export const LONG_NOTE = "Driver called in stating a loud hissing sound from under the passenger side of the cab whenever the brakes were applied, along with a noticeably longer stopping distance than normal on the interstate this morning. Pulled the unit into bay 3 and did a full walk-around before touching anything else. Started the engine and let air build to governor cut-out, which took about four minutes and seemed slower than it should for a compressor this size. Once the system reached full pressure and the governor popped off, applied the brakes and held them down to listen for the leak with the engine still running and the shop bay relatively quiet. Confirmed an audible air leak coming from the area of the steer axle brake chamber on the passenger side, not from the trailer gladhands or the tractor protection valve like the driver had guessed over the radio. Sprayed soapy water around the chamber clamp band, the quick release valve, and both brake lines feeding that wheel end to pinpoint the exact source rather than just guessing and throwing parts at it. Bubbles formed steadily at the diaphragm clamp band on the chamber itself, so the leak is internal to the chamber and not a loose fitting or a cracked line. Caged the spring per the safety procedure, pulled the chamber off, and inspected the diaphragm, which was cracked and dry-rotted along almost the entire circumference, consistent with ordinary age rather than any single event or impact. The mounting bracket and pushrod were both in good shape with no bending, rust-through, or corrosion, and the slack adjuster on that wheel was still within spec at roughly nine degrees of travel, so no further brake adjustment was needed right now. Ordered a replacement chamber, part number FTC-2200XL-REMAN-CORE-EXCHANGE-9847216, from Peach State since we did not have a direct match in the shop stock room, and they quoted next-day delivery before 10am. Also checked the other three chambers on this unit while it was apart and none of them showed any of the same cracking or dry rot, so this looks like an isolated failure rather than a bad batch across the whole truck. Truck is not safe to release until the new chamber is installed and the entire system is retested for leaks at full governor cut-out pressure, so it needs to stay down overnight rather than go back out on a route. Will torque the new chamber to spec, re-verify pushrod travel, and bleed the system once the part arrives tomorrow morning, then road test it before calling this done and releasing the unit back to dispatch for its regular route.";

export const ITEM_TEXT = "Driver reports loud air leak under the cab when brakes are applied, plus longer stopping distance on I-85 this morning";
export const ITEM_AUTHOR = "Chad";
export const NOTE_AUTHOR = "Ryan";
export const TRUCK_ID = "5042";
export const REPAIR_ID = "r-test-1";

export const TRUCKS = [
  { id: "5042", mk: "FRTLN", tr: "A", ax: "Single", type: "straight", year: 2016 },
  { id: "1368", mk: "Tractor", tr: "A", ax: "Single", type: "tractor", year: 2019 },
];

export const REPAIRS = [
  {
    id: REPAIR_ID,
    truckId: TRUCK_ID,
    reason: "Mechanical Repair",
    status: "open",
    dateIn: "2026-08-05T13:10:00.000Z",
    openedBy: ITEM_AUTHOR,
    shop: "Peach State Truck Center",
    notesLog: [
      {
        ts: "2026-08-05T13:12:00.000Z",
        text: ITEM_TEXT,
        by: ITEM_AUTHOR,
        notes: [
          { ts: "2026-08-06T08:40:00.000Z", by: NOTE_AUTHOR, text: LONG_NOTE },
        ],
      },
    ],
  },
];

export function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
