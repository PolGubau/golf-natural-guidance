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
});
