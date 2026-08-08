import { describe, expect, it } from "vitest";
import { BookingError, createBooking } from "~/application/create-booking";
import { availablePlaces, getAvailableSlots, overlaps } from "~/domain/booking";
import { createSeed } from "~/infrastructure/seed";
import { addDays, localDateKey } from "~/lib/dates";

describe("booking domain", () => {
  it("detects actual overlaps but allows adjacent ranges", () => {
    expect(
      overlaps(
        "2026-08-10T10:00:00",
        "2026-08-10T10:50:00",
        "2026-08-10T10:30:00",
        "2026-08-10T11:20:00",
      ),
    ).toBe(true);
    expect(
      overlaps(
        "2026-08-10T10:00:00",
        "2026-08-10T10:50:00",
        "2026-08-10T10:50:00",
        "2026-08-10T11:40:00",
      ),
    ).toBe(false);
  });

  it("exposes teacher slots and frees cancelled bookings", () => {
    const data = createSeed();
    const monday = nextWeekday(1);
    const slots = getAvailableSlots(data, "teacher-toni", monday);
    expect(slots.length).toBeGreaterThan(0);
    const first = slots[0];
    const occupied = {
      ...data,
      bookings: [
        {
          ...data.bookings[0],
          teacherId: "teacher-toni",
          startsAt: first.startsAt,
          endsAt: first.endsAt,
        },
      ],
    };
    expect(
      getAvailableSlots(occupied, "teacher-toni", monday)[0].available,
    ).toBe(false);
    occupied.bookings[0].status = "cancelled";
    expect(
      getAvailableSlots(occupied, "teacher-toni", monday)[0].available,
    ).toBe(true);
  });

  it("creates a confirmed booking with payment and compensation snapshots", () => {
    const data = createSeed();
    const date = nextWeekday(1);
    const slot = getAvailableSlots(data, "teacher-toni", date)[0];
    const result = createBooking(data, {
      type: "private_lesson",
      teacherId: "teacher-toni",
      productId: "product-private",
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      playerCount: 2,
      memberType: "unknown",
      paymentMethod: "in_person",
      customer: { name: "Ana Demo", email: "ana@example.com" },
    });
    const booking = result.bookings.at(-1);
    expect(booking).toBeDefined();
    if (!booking) throw new Error("Expected booking to be created");
    expect(booking.status).toBe("confirmed");
    expect(booking.customerPrice).toBe(150);
    expect(booking.paymentStatus).toBe("pending");
    expect(result.compensationLines.at(-1)?.bookingId).toBe(booking.id);
  });

  it("requires online payment and respects group capacity", () => {
    const data = createSeed();
    const activity = data.activities[0];
    expect(() =>
      createBooking(data, {
        type: "group_activity",
        teacherId: activity.teacherId,
        productId: activity.productId,
        activityId: activity.id,
        startsAt: activity.startsAt,
        endsAt: activity.endsAt,
        playerCount: 1,
        memberType: "unknown",
        paymentMethod: "in_person",
        customer: { name: "Ana Demo", email: "ana@example.com" },
      }),
    ).toThrow(BookingError);
    expect(availablePlaces(activity, data.bookings)).toBe(
      activity.capacity - 1,
    );
  });
});

function nextWeekday(weekday: number) {
  let date = addDays(new Date(), 1);
  while (date.getDay() !== weekday) date = addDays(date, 1);
  return localDateKey(date);
}
