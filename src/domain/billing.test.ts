import { describe, expect, it } from "vitest";
import { generateMonthlyInvoices, isBookingBillable } from "~/domain/billing";
import { createSeed } from "~/infrastructure/seed";

describe("mock billing", () => {
  it("applies the configurable billable status rule", () => {
    const booking = createSeed().bookings[0];
    expect(isBookingBillable({ ...booking, status: "confirmed" }, false)).toBe(
      true,
    );
    expect(isBookingBillable({ ...booking, status: "cancelled" }, true)).toBe(
      false,
    );
    expect(isBookingBillable({ ...booking, status: "no_show" }, false)).toBe(
      false,
    );
    expect(isBookingBillable({ ...booking, status: "no_show" }, true)).toBe(
      true,
    );
  });

  it("groups lines by teacher and is idempotent per period", () => {
    const data = createSeed();
    const period = data.bookings[0].startsAt.slice(0, 7);
    const first = generateMonthlyInvoices(data, period, "2026-08-31T20:00:00");
    expect(first.invoices.length).toBe(2);
    expect(
      first.compensationLines.every((line) => line.status === "generated"),
    ).toBe(true);
    const second = generateMonthlyInvoices(
      first,
      period,
      "2026-08-31T20:01:00",
    );
    expect(second.invoices).toHaveLength(first.invoices.length);
  });

  it("adds late reservations to the generated invoice for the same teacher and period", () => {
    const data = createSeed();
    const period = data.bookings[0].startsAt.slice(0, 7);
    const first = generateMonthlyInvoices(data, period, "2026-08-31T20:00:00");
    const booking = {
      ...data.bookings[0],
      id: "booking-late",
      teacherId: "teacher-nico",
    };
    const line = {
      ...data.compensationLines[0],
      id: "line-late",
      bookingId: booking.id,
      teacherId: booking.teacherId,
      status: "pending" as const,
    };

    const result = generateMonthlyInvoices(
      {
        ...first,
        bookings: [...first.bookings, booking],
        compensationLines: [...first.compensationLines, line],
      },
      period,
      "2026-08-31T20:01:00",
    );
    const nicoInvoice = result.invoices.find(
      (invoice) =>
        invoice.teacherId === "teacher-nico" && invoice.period === period,
    );

    expect(result.invoices).toHaveLength(first.invoices.length);
    expect(nicoInvoice?.bookingIds).toContain(booking.id);
    expect(
      result.compensationLines.find((item) => item.id === line.id)?.status,
    ).toBe("generated");
  });
});
