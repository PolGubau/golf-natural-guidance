import { describe, expect, it } from "vitest";
import { BookingError, createBooking } from "~/application/create-booking";
import {
  availablePlaces,
  getAvailableSlots,
  getAvailableTeacherSlots,
  overlaps,
  resolveCustomerPrice,
} from "~/domain/booking";
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

  it("groups available teachers by time for schedule-first booking", () => {
    const data = createSeed();
    const slots = getAvailableTeacherSlots(data, nextWeekday(1));

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].startsAt.slice(11, 16)).toBe("08:00");
    expect(slots[0].teachers.length).toBeGreaterThan(1);
    expect(slots[0].teachers.every((teacher) => teacher.active)).toBe(true);
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
      customer: {
        name: "Ana Demo",
        email: "ana@example.com",
        fiscalId: "12345678Z",
        fiscalAddress: "C/ Demo, 1 · 07001 Palma",
      },
    });
    const booking = result.bookings.at(-1);
    expect(booking).toBeDefined();
    if (!booking) throw new Error("Expected booking to be created");
    expect(booking.status).toBe("confirmed");
    expect(booking.customerPrice).toBe(150);
    expect(booking.paymentStatus).toBe("pending");
    expect(result.compensationLines.at(-1)?.bookingId).toBe(booking.id);
    expect(result.customerInvoices.at(-1)).toMatchObject({
      bookingId: booking.id,
      total: booking.customerPrice,
      vatRate: 21,
      delivery: { status: "sent" },
    });
  });

  it("derives private lesson prices from the teacher category", () => {
    const teacher = createSeed().teachers.find(
      (item) => item.id === "teacher-toni",
    );
    if (!teacher) throw new Error("Expected a seeded teacher");

    expect(resolveCustomerPrice(undefined, teacher, "unknown")).toBe(150);
    expect(
      resolveCustomerPrice(
        undefined,
        { ...teacher, category: "teacher" },
        "unknown",
      ),
    ).toBe(85);
  });

  it("links an authenticated account and refreshes its saved profile", () => {
    const data = createSeed();
    const slot = getAvailableSlots(data, "teacher-toni", nextWeekday(1))[0];
    const result = createBooking(data, {
      type: "private_lesson",
      authUserId: "google-lucia",
      teacherId: "teacher-toni",
      productId: "product-private",
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      playerCount: 1,
      memberType: "unknown",
      paymentMethod: "online",
      customer: {
        name: "Lucía Actualizada",
        email: "lucia@example.com",
        phone: "+34 611 111 111",
        fiscalId: "12345678Z",
        fiscalAddress: "C/ Actualizada, 1 · 07001 Palma",
      },
    });

    expect(result.bookings.at(-1)?.studentId).toBe("student-lucia");
    expect(
      result.students.find((student) => student.id === "student-lucia"),
    ).toMatchObject({
      authUserId: "google-lucia",
      name: "Lucía Actualizada",
      phone: "+34 611 111 111",
    });
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
        customer: {
          name: "Ana Demo",
          email: "ana@example.com",
          fiscalId: "12345678Z",
          fiscalAddress: "C/ Demo, 1 · 07001 Palma",
        },
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
